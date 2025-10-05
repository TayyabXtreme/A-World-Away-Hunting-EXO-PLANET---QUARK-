'use client';

import React from 'react';
import { 
  HeroSection, 
  SatelliteSection, 
  DatasetSection, 
  Footer 
} from '@/components/landing';
import SmoothScroll from '@/components/landing/SmoothScroll';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
    
      <SmoothScroll />
      
     
      <HeroSection />
      
    
      <SatelliteSection />
      
    
      <DatasetSection />
      
   
      
    
      <Footer />
    </div>
  );
}