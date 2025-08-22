'use client';

import { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast, Toaster } from 'react-hot-toast';
import Fuse from 'fuse.js';
import { schools } from '@/lib/schools';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

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

const startYear = 2000;
const endYear = 2020;
const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i);
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const CustomHeader = ({
    date,
    changeYear,
    changeMonth,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
  }: {
    date: Date;
    changeYear: (year: number) => void;
    changeMonth: (month: number) => void;
    decreaseMonth: () => void;
    increaseMonth: () => void;
    prevMonthButtonDisabled: boolean;
    nextMonthButtonDisabled: boolean;
  }) => (
      <div className="flex justify-between items-center p-2 bg-gray-50 rounded-t-lg">
          <button type="button" onClick={decreaseMonth} disabled={prevMonthButtonDisabled} className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          
          <div className="flex gap-2">
              <select
                  value={date.getFullYear()}
                  onChange={({ target: { value } }) => changeYear(parseInt(value))}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#72388f] transition-colors"
              >
                  {years.map((option) => (
                      <option key={option} value={option}>
                          {option}
                      </option>
                  ))}
              </select>
              <select
                  value={months[date.getMonth()]}
                  onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#72388f] transition-colors"
              >
                  {months.map((option) => (
                      <option key={option} value={option}>
                          {option}
                      </option>
                  ))}
              </select>
          </div>

          <button type="button" onClick={increaseMonth} disabled={nextMonthButtonDisabled} className="p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
      </div>
  );

const classes = ['VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export default function AdminCentralRegistration() {
  const [formData, setFormData] = useState({
    studentName: '',
    schoolName: '',
    mobileNumber: '',
    altMobileNumber: '',
    class: '',
    email: '',
  });
  const [dob, setDob] = useState<Date | null>(null);
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
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

    const allValid = 
      !!formData.studentName &&
      !!formData.schoolName &&
      isMobileValid &&
      isAltMobileValid &&
      !!formData.class &&
      isEmailValid &&
      !!dob;
      
    setIsFormValid(allValid);
  }, [
    formData.studentName,
    formData.schoolName,
    formData.mobileNumber,
    formData.altMobileNumber,
    formData.class,
    formData.email,
    dob,
  ]);

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

    if (name === 'email') {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setErrors((prev) => ({ ...prev, email: 'Please enter a valid email.' }));
      } else {
        setErrors((prev) => ({ ...prev, email: null }));
      }
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
        
        const filteredSuggestions = uniqueSuggestions.filter(
          s => s.toLowerCase() !== value.toLowerCase()
        );
        const finalSuggestions = [value, ...filteredSuggestions];

        setSchoolSuggestions(finalSuggestions.slice(0, 5));
      } else {
        setSchoolSuggestions([]);
      }
    }
  };

  const handleSchoolSelect = (schoolName: string) => {
    setFormData(prev => ({ ...prev, schoolName }));
    setSchoolSuggestions([]);
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

    try {
      const response = await fetch('/api/admin/central-register', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();
      setSubmitting(false);

      if (response.ok) {
        toast.success('Successfully registered! Participant marked as attended.');
        
        // Reset form
        setFormData({ 
          studentName: '', 
          schoolName: '', 
          mobileNumber: '', 
          altMobileNumber: '', 
          class: '',
          email: '',
        });
        setDob(null);
      } else {
        toast.error(result.message || 'Registration failed.');
      }
    } catch (error) {
      setSubmitting(false);
      toast.error('An unexpected error occurred.');
    }
  };

  const Loader = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#72388f] mb-4"></div>
        <p className="text-gray-700 font-medium">Creating registration...</p>
        <p className="text-gray-500 text-sm mt-1">Please wait a moment</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" reverseOrder={false} />
      {/* Header */}
      <div className="bg-gradient-to-r from-[#72388f] to-[#361152] text-white p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/admin" 
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Admin
            </Link>
          </div>
          <h1 className="text-3xl font-bold">Central Registration</h1>
          <p className="text-gray-200 mt-2">Create registrations for participants (automatically marked as attended)</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <nav className="flex flex-wrap gap-4">
            <Link 
              href="/admin" 
              className="px-4 py-2 text-gray-600 hover:text-[#72388f] transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/attendance" 
              className="px-4 py-2 text-gray-600 hover:text-[#72388f] transition-colors"
            >
              Attendance
            </Link>
            <Link 
              href="/admin/central-registration" 
              className="px-4 py-2 bg-[#72388f] text-white rounded-lg"
            >
              Central Registration
            </Link>
            <Link 
              href="/admin/certificate" 
              className="px-4 py-2 text-gray-600 hover:text-[#72388f] transition-colors"
            >
              Certificates
            </Link>
          </nav>
        </div>

        {/* Info Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-green-800 font-medium">Central Registration</p>
              <p className="text-green-700 text-sm">Participants registered through this page will automatically be marked as attended.</p>
            </div>
          </div>
        </div>

        {submitting && <Loader />}
        
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Registration</h2>
          
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
                School Name*
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
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 ">
                    {classes.map((c) => (
                    <button
                        type="button"
                        key={c}
                        onClick={() => setFormData(prev => ({ ...prev, class: c }))}
                        className={`w-full text-center py-3 px-2 rounded-lg cursor-pointer transition-all duration-200 ease-in-out font-semibold
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
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`peer w-full px-4 py-3 rounded-lg border transition-colors placeholder-transparent ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#72388f] focus:ring-1 focus:ring-[#72388f]'}`}
                placeholder="Email Address"
              />
              <label
                htmlFor="email"
                className="absolute left-4 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-[#72388f]"
              >
                Email Address *
              </label>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div className="relative">
              <DatePicker
                selected={dob}
                onChange={(date: Date | null) => setDob(date)}
                dateFormat="dd/MM/yyyy"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#72388f] focus:ring-1 focus:ring-[#72388f] outline-none transition-colors"
                placeholderText="Date of Birth *"
                openToDate={formData.class ? getApproxOpenDate(formData.class) : new Date(2015, 5, 15)}
                minDate={new Date(2000, 0, 1)}
                maxDate={new Date(2020, 11, 31)}
                required
                renderCustomHeader={CustomHeader}
                calendarClassName="border-2 rounded-lg shadow-lg bg-white"
                dayClassName={(date) => {
                  const baseClasses = "text-center p-2 mx-1 rounded-full transition-colors duration-200";
                  const isInMonth = date.getMonth() === (dob || new Date()).getMonth();
                  const isSelected = dob && date.toDateString() === dob.toDateString();
                  
                  if(isSelected) return `${baseClasses} bg-[#72388f] text-white`;
                  if(isInMonth) return `${baseClasses} hover:bg-gray-100`;
                  return `${baseClasses} text-gray-400 hover:bg-gray-100`;
                }}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm10 5H4v8h12V7z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>



          <div className="mt-8 flex justify-center md:justify-end">
            <button
              type="submit"
              disabled={!isFormValid || submitting}
              className="w-fit text-white font-semibold cursor-pointer py-3 px-6 rounded-lg transition-all duration-300 border-2 border-transparent disabled:bg-gray-300 disabled:cursor-not-allowed disabled:pointer-events-none bg-[#72388f] hover:bg-[#361152] hover:border-yellow-400"
            >
              {submitting ? 'Creating Registration...' : 'Create Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
