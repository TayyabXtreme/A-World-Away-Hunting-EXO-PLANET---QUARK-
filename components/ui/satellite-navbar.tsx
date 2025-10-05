'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Home, ArrowLeft, Satellite, Telescope, Activity } from 'lucide-react';

const satellites = [
  {
    name: 'Kepler',
    path: '/kepler',
    icon: <Telescope className="h-4 w-4" />,
    color: 'from-green-400 to-emerald-500'
  },
  {
    name: 'K2',
    path: '/k2',
    icon: <Activity className="h-4 w-4" />,
    color: 'from-blue-400 to-cyan-500'
  },
  {
    name: 'TESS',
    path: '/tess',
    icon: <Satellite className="h-4 w-4" />,
    color: 'from-purple-400 to-violet-500'
  }
];

export default function SatelliteNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-slate-800/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left: Back to Home */}
          <div className="flex items-center gap-4">
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              className="text-slate-400 hover:text-white hover:bg-slate-800/50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              EXOQUARK
            </h1>
          </div>

          {/* Right: Satellite Navigation */}
          <div className="flex items-center gap-2">
            {satellites.map((satellite) => (
              <Button
                key={satellite.path}
                variant={pathname === satellite.path ? "default" : "outline"}
                size="sm"
                onClick={() => router.push(satellite.path)}
                className={`
                  ${pathname === satellite.path 
                    ? `bg-gradient-to-r ${satellite.color} text-white border-none` 
                    : 'bg-black/40 border-slate-700/50 hover:bg-slate-800/50 text-slate-300 hover:text-white'
                  } 
                  backdrop-blur-sm transition-all duration-300
                `}
              >
                {satellite.icon}
                <span className="ml-2 text-sm">{satellite.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}