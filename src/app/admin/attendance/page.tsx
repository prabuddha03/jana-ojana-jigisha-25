'use client';

import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { Search, User, Phone, School, Eye, CheckCircle, ArrowLeft, Edit } from 'lucide-react';
import Link from 'next/link';

interface Registration {
  _id: string;
  studentName: string;
  schoolName: string;
  class: string;
  mobileNumber: string;
  altMobileNumber: string;
  idCardUrl: string;
  isAttended: boolean;
}

export default function AdminAttendance() {
  const [searchTerm, setSearchTerm] = useState('');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [editFormData, setEditFormData] = useState({
    studentName: '',
    mobileNumber: '',
    altMobileNumber: ''
  });

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setRegistrations([]);
      return;
    }

    console.log('Searching for:', searchTerm);
    setLoading(true);
    try {
      const url = `/api/admin/registrations/search?q=${encodeURIComponent(searchTerm)}`;
      console.log('Fetching from:', url);
      
      const response = await fetch(url);
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Search response data:', data);
        setRegistrations(data.registrations || []);
      } else {
        console.error('Search failed with status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        setRegistrations([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  const markAttended = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/registrations/${id}/attendance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAttended: true }),
      });

      if (response.ok) {
        // Update local state
        setRegistrations(prev => 
          prev.map(reg => 
            reg._id === id ? { ...reg, isAttended: true } : reg
          )
        );
      } else {
        console.error('Failed to mark as attended');
      }
    } catch (error) {
      console.error('Error marking as attended:', error);
    }
  };

  const openModal = (imageUrl: string) => {
    setCurrentImageUrl(imageUrl);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentImageUrl('');
  };

  const openEditModal = (registration: Registration) => {
    setEditingRegistration(registration);
    setEditFormData({
      studentName: registration.studentName,
      mobileNumber: registration.mobileNumber.replace('+91 ', ''),
      altMobileNumber: registration.altMobileNumber ? registration.altMobileNumber.replace('+91 ', '') : ''
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingRegistration(null);
    setEditFormData({
      studentName: '',
      mobileNumber: '',
      altMobileNumber: ''
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'mobileNumber' || name === 'altMobileNumber') {
      const digits = value.replace(/\D/g, '');
      setEditFormData(prev => ({ ...prev, [name]: digits }));
    } else {
      setEditFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegistration) return;

    try {
      const response = await fetch(`/api/admin/registrations/${editingRegistration._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentName: editFormData.studentName,
          mobileNumber: `+91 ${editFormData.mobileNumber}`,
          altMobileNumber: editFormData.altMobileNumber ? `+91 ${editFormData.altMobileNumber}` : ''
        }),
      });

      if (response.ok) {
        // Update local state
        setRegistrations(prev => 
          prev.map(reg => 
            reg._id === editingRegistration._id 
              ? { 
                  ...reg, 
                  studentName: editFormData.studentName,
                  mobileNumber: `+91 ${editFormData.mobileNumber}`,
                  altMobileNumber: editFormData.altMobileNumber ? `+91 ${editFormData.altMobileNumber}` : ''
                }
              : reg
          )
        );
        
        toast.success('Registration updated successfully!');
        closeEditModal();
      } else {
        toast.error('Failed to update registration');
      }
    } catch (error) {
      console.error('Error updating registration:', error);
      toast.error('Error updating registration');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

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
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-gray-200 mt-2">Search and mark participants as attended</p>
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
              className="px-4 py-2 bg-[#72388f] text-white rounded-lg"
            >
              Attendance
            </Link>
            <Link 
              href="/admin/central-registration" 
              className="px-4 py-2 text-gray-600 hover:text-[#72388f] transition-colors"
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

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, contact number, or school name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#72388f] focus:ring-1 focus:ring-[#72388f] outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchTerm.trim()}
              className="px-6 py-3 bg-[#72388f] text-white rounded-lg hover:bg-[#361152] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Results Section */}
        {registrations.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-800">
                Search Results ({registrations.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {registrations.map((registration) => (
                <div key={registration._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-gray-400" />
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{registration.studentName}</p>
                            <button
                              onClick={() => openEditModal(registration)}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors text-xs"
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </button>
                          </div>
                          <p className="text-sm text-gray-500">Class {registration.class}</p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{registration.mobileNumber}</p>
                            {registration.altMobileNumber && (
                              <p className="text-sm text-gray-500">{registration.altMobileNumber}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <School className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900 max-w-xs truncate">{registration.schoolName}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 ml-4">
                      <button
                        onClick={() => openModal(registration.idCardUrl)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        View ID
                      </button>
                      
                      {!registration.isAttended ? (
                        <button
                          onClick={() => markAttended(registration._id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Mark Attended
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg">
                          <CheckCircle className="h-4 w-4" />
                          Attended
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchTerm && registrations.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">No registrations found matching your search.</p>
          </div>
        )}
      </div>

      {/* ID Card Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">ID Card Document</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 p-4 overflow-auto">
              <div className="flex justify-center">
                {currentImageUrl ? (
                  <div className="w-full">
                    {(() => {
                      const url = currentImageUrl.toLowerCase();
                      if (url.endsWith('.pdf')) {
                        return (
                          <div className="w-full h-[70vh] border border-gray-300 rounded-lg">
                            <iframe
                              src={currentImageUrl}
                              className="w-full h-full"
                              title="ID Card PDF"
                            />
                          </div>
                        );
                      } else if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif') || url.endsWith('.webp')) {
                        return (
                          <img
                            src={currentImageUrl}
                            alt="ID Card"
                            className="w-full h-full object-contain border border-gray-300 rounded-lg"
                          />
                        );
                      } else {
                        return (
                          <div className="w-full h-[70vh] border border-gray-300 rounded-lg flex items-center justify-center">
                            <div className="text-center text-gray-500">
                              <div className="text-6xl mb-4">📎</div>
                              <p className="text-lg">Document Preview Not Available</p>
                              <p className="text-sm">This file type cannot be previewed in the browser</p>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-lg">No document available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Registration Modal */}
      {editModalOpen && editingRegistration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Registration</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label htmlFor="editStudentName" className="block text-sm font-medium text-gray-700 mb-1">
                  Student Name
                </label>
                <input
                  type="text"
                  id="editStudentName"
                  name="studentName"
                  value={editFormData.studentName}
                  onChange={handleEditChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[#72388f] focus:ring-1 focus:ring-[#72388f] outline-none"
                />
              </div>
              
              <div>
                <label htmlFor="editMobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number
                </label>
                <div className="flex items-center border rounded-lg">
                  <span className="px-3 text-gray-500 border-r">+91</span>
                  <input
                    type="tel"
                    id="editMobileNumber"
                    name="mobileNumber"
                    value={editFormData.mobileNumber}
                    onChange={handleEditChange}
                    required
                    maxLength={10}
                    className="w-full px-3 py-2 border-none outline-none"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="editAltMobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Alternate Mobile Number (Optional)
                </label>
                <div className="flex items-center border rounded-lg">
                  <span className="px-3 text-gray-500 border-r">+91</span>
                  <input
                    type="tel"
                    id="editAltMobileNumber"
                    name="altMobileNumber"
                    value={editFormData.altMobileNumber}
                    onChange={handleEditChange}
                    maxLength={10}
                    className="w-full px-3 py-2 border-none outline-none"
                    placeholder="Enter alternate number"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#72388f] text-white rounded-lg hover:bg-[#361152] transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
