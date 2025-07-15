'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, Toaster } from 'react-hot-toast';
import Image from 'next/image';
import janaOjanaBg from '../../../public/JanaOjana.webp';

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (credentials.username === 'arunavoo21' && credentials.password === 'arunavoo21') {
      // Set a simple session indicator
      localStorage.setItem('adminAuth', 'true');
      toast.success('Login successful!');
      router.push('/admin/dashboard');
    } else {
      toast.error('Invalid credentials');
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen relative">
      <Image
        src={janaOjanaBg}
        alt="Jana Ojana Quiz Competition Background"
        placeholder="blur"
        quality={100}
        fill
        sizes="100vw"
        style={{
          objectFit: 'cover',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#3611524c] to-[#72388f] opacity-95" />
      
      <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12 min-h-screen flex items-center justify-center">
        <Toaster position="top-center" reverseOrder={false} />
        
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#361152] mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600">
              Access the registration dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#72388f] focus:ring-1 focus:ring-[#72388f] outline-none transition-colors"
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#72388f] focus:ring-1 focus:ring-[#72388f] outline-none transition-colors"
                placeholder="Enter password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#72388f] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#361152] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
} 