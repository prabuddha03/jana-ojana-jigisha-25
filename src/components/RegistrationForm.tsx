'use client';

import { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-hot-toast';
import Fuse from 'fuse.js';
import { schools } from '@/lib/schools';

const stopWords = new Set(['the', 'for', 'of', 'and']);
const getAcronym = (schoolName: string): string => {
    if (!schoolName) return '';
    return schoolName
        .split(/\s+/)
        .filter(word => {
            const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase();
            return cleanWord.length > 0 && !stopWords.has(cleanWord);
        })
        .map(word => {
            if (word.length > 1 && word === word.toUpperCase()) {
                return word;
            }
            return word.charAt(0);
        })
        .join('')
        .toUpperCase();
};

const classes = ['VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    studentName: '',
    schoolName: '',
    mobileNumber: '',
    altMobileNumber: '',
    class: '',
  });
  const [dob, setDob] = useState<Date | null>(null);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([]);
  const [isSchoolInputFocused, setIsSchoolInputFocused] = useState(false);

  const fuse = useMemo(() => new Fuse(schools, {
    includeScore: true,
    threshold: 0.4,
    minMatchCharLength: 2,
  }), []);

  const getApproxOpenDate = (className: string): Date => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let approxAge = 0;
    switch (className) {
        case 'VII': approxAge = 12; break;
        case 'VIII': approxAge = 13; break;
        case 'IX': approxAge = 14; break;
        case 'X': approxAge = 15; break;
        case 'XI': approxAge = 16; break;
        case 'XII': approxAge = 17; break;
        default: return now;
    }
    return new Date(currentYear - approxAge, 5, 15);
  };
  
  useEffect(() => {
    const isMobileValid = formData.mobileNumber.length === 10;
    const isAltMobileValid = formData.altMobileNumber.length === 0 || formData.altMobileNumber.length === 10;

    const allValid = 
      !!formData.studentName &&
      !!formData.schoolName &&
      isMobileValid &&
      isAltMobileValid &&
      !!formData.class &&
      !!dob &&
      !!idCard;
      
    setIsFormValid(allValid);
  }, [formData, dob, idCard]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'mobileNumber' || name === 'altMobileNumber') {
      const digits = value.replace(/\D/g, '');
      
      setFormData(prev => ({...prev, [name]: digits}));

      const isOptionalAndEmpty = name === 'altMobileNumber' && digits.length === 0;

      if (digits.length > 0 && digits.length !== 10 && !isOptionalAndEmpty) {
          setErrors((prev) => ({...prev, [name]: 'Number must be 10 digits.'}));
      } else {
          setErrors((prev) => ({...prev, [name]: null}));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (name === 'schoolName') {
      if (value) {
        const suggestions: string[] = [];
        const upperCaseValue = value.toUpperCase();

        if (value.length > 1 && value === upperCaseValue) {
          const acronymSuggestions = schools.filter(school =>
            getAcronym(school).startsWith(upperCaseValue)
          );
          suggestions.push(...acronymSuggestions);
        }

        const fuseResults = fuse.search(value).map(result => result.item);
        
        const combined = [...suggestions, ...fuseResults];
        const uniqueSuggestions = [...new Set(combined)];
        
        setSchoolSuggestions(uniqueSuggestions.slice(0, 5));
      } else {
        setSchoolSuggestions([]);
      }
    }
  };

  const handleSchoolSelect = (schoolName: string) => {
    setFormData(prev => ({ ...prev, schoolName }));
    setSchoolSuggestions([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        toast.error('Please upload a JPG, PNG or PDF file');
        return;
      }
      setIdCard(file);
      toast.success('ID Card uploaded successfully!');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error('Please fill all the necessary fields.');
      return;
    }
    setSubmitting(true);
    setErrors({});

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if ((key === 'mobileNumber' || key === 'altMobileNumber') && value) {
        data.append(key, `+91 ${value}`);
      } else {
        data.append(key, value);
      }
    });
    data.append('dob', dob!.toISOString());
    if (idCard) {
      data.append('idCard', idCard);
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success(result.message || 'Registration Successful!');
        setFormData({ 
          studentName: '', 
          schoolName: '', 
          mobileNumber: '', 
          altMobileNumber: '', 
          class: ''
        });
        setDob(null);
        setIdCard(null);
        if (document.getElementById('idCard')) {
          (document.getElementById('idCard') as HTMLInputElement).value = '';
        }
      } else {
        toast.error(result.message || 'Registration failed.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-0.5 mt-2">
              Jana Ojana 2025
            </h1>
            <p className="text-lg text-black mb-6">
              The School Quiz Competition
            </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <input
            type="text"
            name="studentName"
            id="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
            className="peer w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#72388f] focus:ring-1 focus:ring-[#72388f] outline-none transition-colors placeholder-transparent"
            placeholder="Participant Name"
          />
          <label
            htmlFor="studentName"
            className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#72388f]"
          >
            Participant Name *
          </label>
        </div>

        <div className="relative">
          <input
            type="text"
            name="schoolName"
            id="schoolName"
            value={formData.schoolName}
            onChange={handleChange}
            onFocus={() => setIsSchoolInputFocused(true)}
            onBlur={() => setTimeout(() => setIsSchoolInputFocused(false), 200)}
            required
            className="peer w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#72388f] focus:ring-1 focus:ring-[#72388f] outline-none transition-colors placeholder-transparent"
            placeholder="School Name"
            autoComplete="off"
          />
          <label
            htmlFor="schoolName"
            className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#72388f]"
          >
            School Name *
          </label>
          {isSchoolInputFocused && schoolSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg">
              {schoolSuggestions.map((school, index) => (
                <li
                  key={index}
                  onMouseDown={() => handleSchoolSelect(school)}
                  className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                >
                  {school}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="relative">
            <div className={`flex items-center border rounded-lg transition-colors bg-white ${errors.mobileNumber ? 'border-red-500 ring-1 ring-red-500' : 'focus-within:border-[#72388f] focus-within:ring-1 focus-within:ring-[#72388f] border-gray-300'}`}>
                <span className="px-3 text-gray-500 rounded-l-lg border-r h-full flex items-center">
                    +91
                </span>
                <input
                    type="tel"
                    name="mobileNumber"
                    id="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    required
                    maxLength={13}
                    className="peer w-full px-4 py-3 border-none outline-none placeholder-transparent bg-transparent rounded-r-lg"
                    placeholder="WhatsApp Number"
                />
            </div>
            <label
                htmlFor="mobileNumber"
                className="absolute left-3 -top-2.5 bg-white px-1 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#72388f]"
            >
                WhatsApp Number *
            </label>
            {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber}</p>}
        </div>

        <div className="relative">
            <div className={`flex items-center border rounded-lg transition-colors bg-white ${errors.altMobileNumber ? 'border-red-500 ring-1 ring-red-500' : 'focus-within:border-[#72388f] focus-within:ring-1 focus-within:ring-[#72388f] border-gray-300'}`}>
                <span className="px-3 text-gray-500 rounded-l-lg border-r h-full flex items-center">
                    +91
                </span>
                <input
                    type="tel"
                    name="altMobileNumber"
                    id="altMobileNumber"
                    value={formData.altMobileNumber}
                    onChange={handleChange}
                    maxLength={13}
                    className="peer w-full px-4 py-3 border-none outline-none placeholder-transparent bg-transparent rounded-r-lg"
                    placeholder="Alternate Number"
                />
            </div>
            <label
                htmlFor="altMobileNumber"
                className="absolute left-3 -top-2.5 bg-white px-1 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#72388f]"
            >
                Alternate Number
            </label>
            {errors.altMobileNumber && <p className="text-red-500 text-xs mt-1">{errors.altMobileNumber}</p>}
        </div>

        <div className="md:col-span-2">
            <label className={`block text-sm font-medium text-gray-700 mb-2 transition-opacity ${formData.class ? 'opacity-70' : ''}`}>Select Class *</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {classes.map((c) => (
                <button
                    type="button"
                    key={c}
                    onClick={() => setFormData(prev => ({ ...prev, class: c }))}
                    className={`w-full text-center py-3 px-2 rounded-lg transition-all duration-200 ease-in-out font-semibold
                    ${formData.class === c
                        ? 'bg-white text-[#72388f] border-2 border-[#72388f] shadow-inner'
                        : 'bg-gray-50 text-gray-700 border border-gray-300 hover:border-[#72388f] hover:text-[#72388f]'
                    }`}
                >
                    Class {c}
                </button>
                ))}
            </div>
        </div>

        <div className="relative">
          <DatePicker
            selected={dob}
            onChange={(date: Date | null) => setDob(date)}
            dateFormat="dd/MM/yyyy"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#72388f] focus:ring-1 focus:ring-[#72388f] outline-none transition-colors"
            placeholderText="Date of Birth *"
            openToDate={formData.class ? getApproxOpenDate(formData.class) : new Date()}
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={80}
            maxDate={new Date()}
            required
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm10 5H4v8h12V7z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="idCard"
          className="group relative flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#72388f] transition-colors"
        >
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 group-hover:text-[#72388f]"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-[#72388f]">School ID Card Upload *</span>
            </div>
            <p className="text-xs text-gray-500">JPG, PNG or PDF up to 5MB</p>
          </div>
          <input
            type="file"
            id="idCard"
            name="idCard"
            className="hidden"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf"
            required
          />
        </label>
        {idCard && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {idCard.name}
          </p>
        )}
      </div>

      <div
        className="mt-8"
        onClick={() => {
          if (!isFormValid && !submitting) {
            toast.error('Please fill all the necessary fields.');
          }
        }}
      >
        <button
          type="submit"
          disabled={!isFormValid || submitting}
          className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 border-2 border-transparent disabled:bg-gray-300 disabled:cursor-not-allowed disabled:pointer-events-none bg-[#72388f] hover:bg-[#361152] hover:border-yellow-400"
        >
          {submitting ? 'Please wait...' : 'Complete Registration'}
        </button>
      </div>
    </form>
  );
} 