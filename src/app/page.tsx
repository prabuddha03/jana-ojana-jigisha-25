'use client';

import { useState } from 'react';
import Image from 'next/image';
import RegistrationForm from '@/components/RegistrationForm';
import RulesModal from '@/components/RulesModal';
import { Toaster } from 'react-hot-toast';
import janaOjanaBg from '../../public/JanaOjana.webp';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      
      <div className="relative z-10 p-4 sm:p-6 md:p-8 lg:p-12">
        <Toaster position="top-center" reverseOrder={false} />
        <div className="max-w-2xl mx-auto">
          <header className="text-center text-white mb-8">
            <h1 className="text-4xl sm:text-5xl font-dynapuff font-bold tracking-tight mb-2 mt-10">
              Jigisha 2025
            </h1>
            <p className="text-lg text-white/80">
              The Annual Quiz Competition by Pragya
            </p>
          </header>

          <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
          
            <div className="p-6 sm:p-8">
              <RegistrationForm />
            </div>
            
            {/* <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:py-6 text-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center justify-center bg-[#72388f] text-white font-semibold py-2.5 px-6 rounded-full hover:bg-[#361152] transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                View Rules
              </button>
            </div> */}
          </div>
        </div>
        <RulesModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </div>
    </main>
  );
}
