"use client";

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import SatelliteNavbar from '@/components/ui/satellite-navbar';


const K2Visualizer = dynamic(
  () => import('@/components/k2component/K2Visualizer'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#1a2034] to-[#0b0f19] flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-16 h-16 mx-auto">
              <div className="absolute inset-0 bg-orange-500/30 rounded-full animate-ping" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">
            Initializing K2 Mission System
          </h2>
          <p className="text-gray-400 text-lg">
            Loading 3D exoplanet visualization...
          </p>
          <div className="mt-6 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }
);

export default function K2Page() {
  return (
    <div className="w-full h-screen overflow-hidden relative">
      <SatelliteNavbar />
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#0b0f19] via-[#1a2034] to-[#0b0f19] flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4">Loading...</div>
            <div className="text-gray-400">Preparing K2 3D visualization</div>
          </div>
        </div>
      }>
        <K2Visualizer />
      </Suspense>
    </div>
  );
}