'use client';

import { useState, useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowLeft, CheckCircle, Award, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';

interface Registration {
  _id: string;
  studentName: string;
  schoolName: string;
  class: string;
  isAttended: boolean;
  certificateIssued: boolean;
  idCardUrl: string;
}

export default function AdminCertificate() {
  const [pendingRegistrations, setPendingRegistrations] = useState<Registration[]>([]);
  const [completedRegistrations, setCompletedRegistrations] = useState<Registration[]>([]);
  const [allPendingRegistrations, setAllPendingRegistrations] = useState<Registration[]>([]);
  const [allCompletedRegistrations, setAllCompletedRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const fetchRegistrations = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Fetch pending certifications (attended but no certificate)
      const pendingResponse = await fetch('/api/admin/registrations?isAttended=true&certificateIssued=false&limit=1000');
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json();
        const pendingRegs = pendingData.registrations || [];
        setAllPendingRegistrations(pendingRegs);
        setPendingRegistrations(pendingRegs);
      }

      // Fetch completed certifications (attended and certificate issued)
      const completedResponse = await fetch('/api/admin/registrations?isAttended=true&certificateIssued=true&limit=1000');
      if (completedResponse.ok) {
        const completedData = await completedResponse.json();
        const completedRegs = completedData.registrations || [];
        setAllCompletedRegistrations(completedRegs);
        setCompletedRegistrations(completedRegs);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleRefresh = () => {
    fetchRegistrations(true);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setPendingRegistrations(allPendingRegistrations);
      setCompletedRegistrations(allCompletedRegistrations);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    
    const filteredPending = allPendingRegistrations.filter(reg =>
      reg.studentName.toLowerCase().includes(searchLower)
    );
    
    const filteredCompleted = allCompletedRegistrations.filter(reg =>
      reg.studentName.toLowerCase().includes(searchLower)
    );

    setPendingRegistrations(filteredPending);
    setCompletedRegistrations(filteredCompleted);
  };

  const issueCertificate = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/registrations/${id}/certificate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificateIssued: true }),
      });

      if (response.ok) {
        // Move registration from pending to completed
        const registration = pendingRegistrations.find(reg => reg._id === id);
        if (registration) {
          const updatedRegistration = { ...registration, certificateIssued: true };
          setPendingRegistrations(prev => prev.filter(reg => reg._id !== id));
          setCompletedRegistrations(prev => [updatedRegistration, ...prev]);
          
          // Update the all registrations arrays
          setAllPendingRegistrations(prev => prev.filter(reg => reg._id !== id));
          setAllCompletedRegistrations(prev => [updatedRegistration, ...prev]);
          
          // Show success toast
          toast.success(`Certificate issued for ${registration.studentName}`);
        }
      } else {
        console.error('Failed to issue certificate');
        toast.error('Failed to issue certificate');
      }
    } catch (error) {
      console.error('Error issuing certificate:', error);
      toast.error('Error issuing certificate');
    }
  };
              
  const closeModal = () => {
    setModalOpen(false);
    setCurrentImageUrl('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-[#72388f] to-[#361152] text-white p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold">Certificate Management</h1>
          </div>
        </div>
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#72388f] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading certificate data...</p>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold">Certificate Management</h1>
          <p className="text-gray-200 mt-2">Issue certificates to attended participants</p>
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
              className="px-4 py-2 text-gray-600 hover:text-[#72388f] transition-colors"
            >
              Central Registration
            </Link>
            <Link 
              href="/admin/certificate" 
              className="px-4 py-2 bg-[#72388f] text-white rounded-lg"
            >
              Certificates
            </Link>
          </nav>
        </div>

        {/* Common Search and Refresh */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-[#72388f] focus:ring-1 focus:ring-[#72388f] outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-[#72388f] text-white rounded-lg hover:bg-[#361152] transition-colors"
            >
              Search
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 inline mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Two Lists Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Certifications */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-semibold text-orange-800">
                  Pending Certifications ({pendingRegistrations.length})
                </h2>
              </div>
              <p className="text-orange-700 text-sm mt-1">
                Participants who attended but have not received certificates yet
              </p>
            </div>
            
            {pendingRegistrations.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {pendingRegistrations.map((registration) => (
                  <div key={registration._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{registration.studentName}</p>
                        <p className="text-sm text-gray-500">Class {registration.class}</p>
                      </div>
                      
                      <button
                        onClick={() => issueCertificate(registration._id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors"
                      >
                        <Award className="h-4 w-4" />
                        Certify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Award className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No pending certifications</p>
                <p className="text-gray-400 text-sm">All attended participants have received their certificates</p>
              </div>
            )}
          </div>

          {/* Completed Certifications */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-semibold text-green-800">
                  Completed Certifications ({completedRegistrations.length})
                </h2>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Participants who have received their certificates
              </p>
            </div>
            
            {completedRegistrations.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {completedRegistrations.map((registration) => (
                  <div key={registration._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{registration.studentName}</p>
                        <p className="text-sm text-gray-500">Class {registration.class}</p>
                      </div>
                      
                      <span className="inline-flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-sm">
                        <CheckCircle className="h-4 w-4" />
                        Completed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <CheckCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No completed certifications</p>
                <p className="text-gray-400 text-sm">Certificates will appear here once issued</p>
              </div>
            )}
          </div>
        </div>
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
    </div>
  );
}
