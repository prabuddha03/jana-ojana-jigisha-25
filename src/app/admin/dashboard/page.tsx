'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import AdminStats from '@/components/AdminStats';
import AdminTable from '@/components/AdminTable';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    } else {
      router.push('/admin');
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    toast.success('Logged out successfully');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcf7e3]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#72388f]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#fcf7e3] text-[#361152]">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Header */}
      <div className="bg-white shadow-lg border-b-2 border-[#72388f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-[#361152]">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Jigisha 2025 Registration Management
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-[#72388f] text-white px-4 py-2 rounded-lg hover:bg-[#361152] transition-colors duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminStats />
        <AdminTable />
      </div>
    </main>
  );
} 