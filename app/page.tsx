'use client';

import React from 'react';
import { 
  HeroSection, 
  SatelliteSection, 
  DatasetSection, 
  FeaturesSection, 
  Footer 
} from '@/components/landing';
import SmoothScroll from '@/components/landing/SmoothScroll';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      {/* Smooth Scroll Handler */}
      <SmoothScroll />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Satellite Missions Section */}
      <SatelliteSection />
      
      {/* Dataset Visualization Section */}
      <DatasetSection />
      
      {/* Features Section */}
      <FeaturesSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}