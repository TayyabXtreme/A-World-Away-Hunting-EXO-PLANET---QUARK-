"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';
import Star from './Star';
import Planet from './Planet';
import AnalysisPanel from './AnalysisPanel';

export interface TessPlanetData {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  orbitRadius: number;
  speed: number;
  pl_orbper: number;      
  pl_trandurh: number;   
  pl_trandep: number;     
  pl_rade: number;       
  pl_insol: number;     
  pl_eqt: number;       
  st_teff: number;       
  st_logg: number;     
  st_rad: number;      
  st_tmag: number;     
  st_dist: number;    
  ra: number;          
  dec: number;        
  prediction?: 'confirmed' | 'false-positive' | 'candidate' | null;
  isAnalyzing?: boolean;
  flaskResponse?: {
    tfopwg_disp: string;
    tfopwg_disp_explanation: string;
    planet_type: string;
    probability: number;
    status: string;
    timestamp: string;
  };
  claudeResponse?: {
    disposition: string;
    confidence: number;
    reasoning: string;
    is_exoplanet: boolean;
    planet_type?: string;
  };
}

const initialPlanets: TessPlanetData[] = [
  {
    id: 'TOI-715b',
    position: [12, 0, 0],
    color: '#4299E1',
    size: 0.8,
    orbitRadius: 12,
    speed: 0.003,
    pl_orbper: 19.3,
    pl_trandurh: 2.1,
    pl_trandep: 0.00089,
    pl_rade: 1.55,
    pl_insol: 1.37,
    pl_eqt: 374,
    st_teff: 3341,
    st_logg: 4.75,
    st_rad: 0.374,
    st_tmag: 9.2,
    st_dist: 22.2,
    ra: 145.6,
    dec: -16.7,
  },
  {
    id: 'TOI-700e',
    position: [18, 0, 0],
    color: '#48BB78',
    size: 0.7,
    orbitRadius: 18,
    speed: 0.002,
    pl_orbper: 37.4,
    pl_trandurh: 3.6,
    pl_trandep: 0.00034,
    pl_rade: 0.95,
    pl_insol: 0.43,
    pl_eqt: 269,
    st_teff: 3480,
    st_logg: 4.8,
    st_rad: 0.415,
    st_tmag: 9.8,
    st_dist: 31.1,
    ra: 106.3,
    dec: -65.4,
  },
  {
    id: 'TOI-849b',
    position: [24, 0, 0],
    color: '#F59E0B',
    size: 0.9,
    orbitRadius: 24,
    speed: 0.0015,
    pl_orbper: 0.765,
    pl_trandurh: 1.4,
    pl_trandep: 0.00156,
    pl_rade: 3.95,
    pl_insol: 2508,
    pl_eqt: 1800,
    st_teff: 5129,
    st_logg: 4.2,
    st_rad: 0.75,
    st_tmag: 8.1,
    st_dist: 226.5,
    ra: 258.7,
    dec: -40.1,
  },
  {
    id: 'TOI-1338b',
    position: [30, 0, 0],
    color: '#EF4444',
    size: 0.75,
    orbitRadius: 30,
    speed: 0.001,
    pl_orbper: 95.2,
    pl_trandurh: 6.2,
    pl_trandep: 0.00124,
    pl_rade: 6.9,
    pl_insol: 1.17,
    pl_eqt: 295,
    st_teff: 5981,
    st_logg: 4.1,
    st_rad: 1.15,
    st_tmag: 11.5,
    st_dist: 399.7,
    ra: 19.7,
    dec: 42.3,
  },
  {
    id: 'TOI-2109b',
    position: [9, 0, 0],
    color: '#9F7AEA',
    size: 0.6,
    orbitRadius: 9,
    speed: 0.004,
    pl_orbper: 0.672,
    pl_trandurh: 1.1,
    pl_trandep: 0.00215,
    pl_rade: 5.0,
    pl_insol: 7690,
    pl_eqt: 2407,
    st_teff: 6321,
    st_logg: 3.9,
    st_rad: 1.7,
    st_tmag: 10.8,
    st_dist: 855.3,
    ra: 352.1,
    dec: 12.9,
  },
  {
    id: 'TOI-1452b',
    position: [15, 0, 0],
    color: '#06B6D4',
    size: 0.65,
    orbitRadius: 15,
    speed: 0.0025,
    pl_orbper: 11.1,
    pl_trandurh: 2.9,
    pl_trandep: 0.00087,
    pl_rade: 1.67,
    pl_insol: 5.02,
    pl_eqt: 326,
    st_teff: 3915,
    st_logg: 4.9,
    st_rad: 0.55,
    st_tmag: 8.9,
    st_dist: 30.1,
    ra: 341.4,
    dec: 15.2,
  },
];

export default function TessVisualizer() {
  const [planets, setPlanets] = useState<TessPlanetData[]>(initialPlanets);
  const [selectedPlanet, setSelectedPlanet] = useState<TessPlanetData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const controlsRef = useRef(null);

  const handlePlanetClick = useCallback((planet: TessPlanetData) => {
    setSelectedPlanet(planet);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedPlanet(null), 300);
  }, []);

  const handleUpdatePlanet = useCallback((updatedData: Partial<TessPlanetData>) => {
    if (!selectedPlanet) return;
    
    const updatedPlanets = planets.map(planet =>
      planet.id === selectedPlanet.id
        ? { ...planet, ...updatedData }
        : planet
    );
    
    setPlanets(updatedPlanets);
    setSelectedPlanet(prev => prev ? { ...prev, ...updatedData } : null);
  }, [planets, selectedPlanet]);

  const handleAnalyzePlanet = useCallback(async () => {
  
    handleUpdatePlanet({ isAnalyzing: true });
   
  }, [handleUpdatePlanet]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-[#0b0f19] via-[#1a2034] to-[#0b0f19]">
      {/* Three.js Canvas */}
      <Canvas 
        camera={{ 
          position: [40, 25, 40], 
          fov: 65,
          near: 0.1,
          far: 1000
        }}
        className="absolute inset-0"
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 0]} intensity={2} color="#FFD700" />
        <pointLight position={[50, 50, 50]} intensity={0.5} color="#4A90E2" />
        
        {/* Background Stars */}
        <Stars 
          radius={300} 
          depth={60} 
          count={8000} 
          factor={6} 
          saturation={0.8} 
          fade 
        />
        
        {/* Central Star */}
        <Star />
        
        {/* Planets */}
        {planets.map((planet) => (
          <Planet
            key={planet.id}
            data={planet}
            onClick={() => handlePlanetClick(planet)}
            isSelected={selectedPlanet?.id === planet.id}
          />
        ))}
        
        {/* Camera Controls */}
        <OrbitControls
          ref={controlsRef}
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={true}
          autoRotateSpeed={0.3}
          minDistance={20}
          maxDistance={100}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6 mt-16">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-400/30 backdrop-blur-sm">
              <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-orange-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                TESS Exoplanet Explorer
              </h1>
              <p className="text-red-300 text-sm">
                Interactive 3D visualization and classification
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>System Online</span>
            </div>
            <div className="text-gray-400">
              {planets.length} Objects Tracked
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="bg-black/40 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 max-w-md">
          <h3 className="text-white font-semibold mb-2">Controls</h3>
          <div className="space-y-1 text-sm text-gray-300">
            <p>• <span className="text-red-300">Click</span> planets to analyze</p>
            <p>• <span className="text-red-300">Drag</span> to rotate view</p>
            <p>• <span className="text-red-300">Scroll</span> to zoom</p>
            <p>• <span className="text-red-300">Hover</span> to see orbit paths</p>
          </div>
        </div>
      </div>

      {/* Analysis Panel */}
      <AnimatePresence>
        {isPanelOpen && selectedPlanet && (
          <AnalysisPanel
            planet={selectedPlanet}
            isOpen={isPanelOpen}
            onClose={handleClosePanel}
            onUpdate={handleUpdatePlanet}
            onAnalyze={handleAnalyzePlanet}
          />
        )}
      </AnimatePresence>
    </div>
  );
}