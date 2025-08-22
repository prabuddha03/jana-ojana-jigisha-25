'use client';

import { useState, useEffect } from 'react';
import { Users, School, GraduationCap, TrendingUp, RefreshCw } from 'lucide-react';

interface StatsData {
  totalSchools: number;
  totalParticipants: number;
  classCounts: { [key: string]: number };
  attendanceStats: {
    attended: number;
    notAttended: number;
    attendanceRate: number;
  };
  certificateStats: {
    issued: number;
    notIssued: number;
    issuanceRate: number;
  };
}

export default function AdminStats() {
  const [stats, setStats] = useState<StatsData>({
    totalSchools: 0,
    totalParticipants: 0,
    classCounts: {},
    attendanceStats: {
      attended: 0,
      notAttended: 0,
      attendanceRate: 0
    },
    certificateStats: {
      issued: 0,
      notIssued: 0,
      issuanceRate: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchStats(true);
  };

  const classes = ['VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

  if (loading) {
    return (
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-300 rounded w-1/2"></div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 shadow-lg animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#72388f]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Schools</p>
              <p className="text-3xl font-bold text-[#361152]">{stats.totalSchools}</p>
            </div>
            <div className="bg-[#72388f] bg-opacity-10 p-3 rounded-full">
              <School className="h-6 w-6 text-[#72388f]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#72388f]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-3xl font-bold text-[#361152]">{stats.totalParticipants}</p>
            </div>
            <div className="bg-[#72388f] bg-opacity-10 p-3 rounded-full">
              <Users className="h-6 w-6 text-[#72388f]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#72388f]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg per School</p>
              <p className="text-3xl font-bold text-[#361152]">
                {stats.totalSchools > 0 ? Math.round(stats.totalParticipants / stats.totalSchools * 10) / 10 : 0}
              </p>
            </div>
            <div className="bg-[#72388f] bg-opacity-10 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-[#72388f]" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-[#72388f]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Most Popular Class</p>
              <p className="text-3xl font-bold text-[#361152]">
                {Object.entries(stats.classCounts).length > 0 
                  ? Object.entries(stats.classCounts).reduce((a, b) => 
                      stats.classCounts[a[0]] > stats.classCounts[b[0]] ? a : b
                    )[0]
                  : 'N/A'
                }
              </p>
            </div>
            <div className="bg-[#72388f] bg-opacity-10 p-3 rounded-full">
              <GraduationCap className="h-6 w-6 text-[#72388f]" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance and Certificate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Attendance Overview</h3>
            <div className="bg-green-500 bg-opacity-10 p-3 rounded-full">
              <Users className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.attendanceStats.attended}</p>
              <p className="text-sm text-gray-600">Attended</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.attendanceStats.notAttended}</p>
              <p className="text-sm text-gray-600">Not Attended</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.attendanceStats.attendanceRate}%</p>
              <p className="text-sm text-gray-600">Rate</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Certificate Status</h3>
            <div className="bg-blue-500 bg-opacity-10 p-3 rounded-full">
              <GraduationCap className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.certificateStats.issued}</p>
              <p className="text-sm text-gray-600">Issued</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.certificateStats.notIssued}</p>
              <p className="text-sm text-gray-600">Not Issued</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.certificateStats.issuanceRate}%</p>
              <p className="text-sm text-gray-600">Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* Class-wise Stats */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[#361152]">Class-wise Registration Data</h3>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[#72388f] text-white rounded-lg hover:bg-[#361152] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {classes.map((className) => (
            <div
              key={className}
              className="bg-gradient-to-br from-[#72388f] to-[#361152] text-white p-4 rounded-lg text-center"
            >
              <div className="text-lg font-semibold mb-1">Class {className}</div>
              <div className="text-3xl font-bold">
                {stats.classCounts[className] || 0}
              </div>
              <div className="text-sm opacity-80">participants</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 