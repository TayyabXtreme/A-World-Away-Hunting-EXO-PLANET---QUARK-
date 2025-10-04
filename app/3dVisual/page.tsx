"use client";

import { SidebarFilters } from '@/components/SidebarFilters';
import { GalaxyCanvas } from '@/components/GalaxyCanvas';
import { DetailsPanel } from '@/components/DetailsPanel';
import { AppProvider } from '@/state/store';

export default function Home() {
  return (
    <AppProvider>
      <div className="h-screen w-screen overflow-hidden bg-[#040711] flex">
        {/* Left Sidebar - Filters & Controls */}
        <SidebarFilters />
        
        {/* Main Canvas - 3D Galaxy View */}
        <GalaxyCanvas />
        
        {/* Right Panel - Details */}
        <DetailsPanel />
      </div>
    </AppProvider>
  );
}
