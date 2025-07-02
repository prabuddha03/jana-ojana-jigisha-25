'use client';

import { useState, useEffect } from 'react';

interface ThankYouProps {
  studentName: string;
  schoolName: string;
  onBack: () => void;
}

export default function ThankYou({ studentName, schoolName, onBack }: ThankYouProps) {
  const [showContent, setShowContent] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 300);
    const timer2 = setTimeout(() => setShowButtons(true), 800);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const generateCalendarLink = () => {
    const eventDate = '20250823T053000Z'; // August 23, 2025, 11:00 AM IST (05:30 UTC)
    const endDate = '20250823T113000Z'; // August 23, 2025, 5:00 PM IST (11:30 UTC)
    const title = encodeURIComponent('Jana Ojana 2025 - School Quiz Competition');
    const details = encodeURIComponent('The School Quiz Competition - Jana Ojana 2025. Get ready for an exciting day of knowledge and competition!');
    const location = encodeURIComponent('Competition Venue - Details will be shared soon');
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${eventDate}/${endDate}&details=${details}&location=${location}`;
  };

  const openLocationMap = () => {
    // This will be updated with actual venue coordinates
    window.open('https://maps.app.goo.gl/9dPCqpsi43KE3XR98', '_blank');
  };

  const socialLinks = {
    instagram: 'https://www.instagram.com/pragyauemk?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    facebook: 'https://www.facebook.com/pragyauemk',
    twitter: 'https://twitter.com/janaojana2025',
    youtube: 'https://youtube.com/@janaojana2025'
  };

  return (
    <div className="min-h-2 flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-lg w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 transform transition-all duration-1000 ${showContent ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}`}>
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          
          <div className={`transform transition-all duration-700 delay-300 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Registration Confirmed
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-[#72388f] to-purple-400 mx-auto rounded-full mb-4"></div>
          </div>
        </div>

        {/* Registration Details Card */}
        <div className={`bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all duration-700 delay-400 ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <div className="text-center">
            {/* <h2 className="text-xl font-semibold text-gray-800 mb-1">
              Your registration is confirmed!
            </h2> */}
            <p className="text-gray-400 mb-4 leading-relaxed">
            You will be contacted further from our end
            </p>
            
            {/* Registration Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2 text-left">Registration Details:</h3>
              <div className="space-y-1 text-sm text-gray-600 text-left">
                <p><span className="font-medium">Name:</span> {studentName}</p>
                <p><span className="font-medium">School:</span> {schoolName}</p>
              </div>
            </div>
            
            {/* Event Date Badge */}
            {/* <div className="inline-flex items-center bg-gradient-to-r from-[#fcf5ff] to-[#f5e8fb] text-[#72388f] px-4 py-2 rounded-lg text-sm font-medium border-2 border-[#a078b48d]">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm10 5H4v8h12V7z" clipRule="evenodd" />
              </svg>
              August 23, 2025 • 11:00 AM
            </div> */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`space-y-3 transform transition-all duration-700 delay-700 ${showButtons ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Calendar Invite */}
          {/* <button
            onClick={() => window.open(generateCalendarLink(), '_blank')}
            className="w-full bg-white text-gray-700 font-medium py-3 px-4 rounded-lg transition-all cursor-pointer duration-300 transform hover:scale-102 flex items-center justify-center group border-2 border-[#fffeff] shadow-lg hover:shadow-l"
            style={{
              boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff'
            }}
          > */}
            {/* <svg className="w-5 h-5 mr-2 group-hover:animate-bounce text-[#c34cff]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm10 5H4v8h12V7z" clipRule="evenodd" />
            </svg> */}
            {/* Add to Google Calendar
          </button> */}

          {/* Location */}
          {/* <button
            onClick={openLocationMap}
            className="w-full bg-white text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center group border-2 border-[#fffeff] hover:border-green-500 shadow-lg hover:shadow-xl"
            style={{
              boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff'
            }}
          > */}
            {/* <svg className="w-5 h-5 mr-2 group-hover:animate-pulse text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg> */}
            {/* View Venue Location
          </button> */}

          {/* Social Media */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center group border-2 border-pink-400 hover:border-pink-500 shadow-lg hover:shadow-xl"
              style={{
                boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff'
              }}
            >
              <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              Instagram
            </a>
            
            <a
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center group border-2 border-blue-500 hover:border-blue-600 shadow-lg hover:shadow-xl"
              style={{
                boxShadow: '8px 8px 16px #d1d9e6, -8px -8px 16px #ffffff'
              }}
            >
              <svg className="w-5 h-5 mr-2 group-hover:-rotate-12 transition-transform text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </div>
        </div>

        {/* Back Button */}
        <div className={`mt-6 text-center transform transition-all duration-700 delay-1000 ${showButtons ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          <button
            onClick={onBack}
            className="text-[#72388f] cursor-pointer hover:text-[#361152] font-medium transition-colors duration-300 underline decoration-2 underline-offset-4 hover:decoration-yellow-400"
          >
            Register For Another Participant
          </button>
        </div>

        {/* Floating Particles Animation */}
        
      </div>

      {/* <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(100vh) rotate(0deg);
          }
          50% {
            transform: translateY(50vh) rotate(180deg);
          }
        }
        .animate-float {
          animation: float linear infinite;
        }
      `}</style> */}
    </div>
  );
} 