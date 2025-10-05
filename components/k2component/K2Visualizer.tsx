"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';
import Star from './Star';
import Planet from './Planet';
import AnalysisPanel from './AnalysisPanel';

export interface K2PlanetData {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  orbitRadius: number;
  speed: number;
  pl_orbper: number;
  pl_trandep: number;
  pl_trandur: number;
  pl_imppar: number;
  pl_rade: number;
  pl_massj: number;
  pl_dens: number;
  pl_insol: number;
  pl_eqt: number;
  st_teff: number;
  st_rad: number;
  st_mass: number;
  st_logg: number;
  ra: number;
  dec: number;
  sy_dist: number;
  prediction?: 'confirmed' | 'false-positive' | 'candidate' | null;
  isAnalyzing?: boolean;
  flaskResponse?: {
    archive_disposition: string;
    planet_type: string;
    probability: number;
    status: string;
    timestamp: string;
  };
  claudeResponse?: {
    disposition: string;
    confidence: number;
    reasoning: string;
    habitability_assessment?: string;
    planet_type?: string;
  };
}

const initialPlanets: K2PlanetData[] = [
  {
    id: 'K2-18b',
    position: [12, 0, 0],
    color: '#4299E1',
    size: 0.8,
    orbitRadius: 12,
    speed: 0.003,
    pl_orbper: 33.0,
    pl_trandep: 0.000817,
    pl_trandur: 3.2,
    pl_imppar: 0.4,
    pl_rade: 2.24,
    pl_massj: 0.025,
    pl_dens: 2.3,
    pl_insol: 1.34,
    pl_eqt: 234,
    st_teff: 3457,
    st_rad: 0.44,
    st_mass: 0.36,
    st_logg: 4.59,
    ra: 332.0976,
    dec: 7.5897,
    sy_dist: 34.4,
  },
  {
    id: 'K2-3b',
    position: [18, 0, 0],
    color: '#48BB78',
    size: 0.7,
    orbitRadius: 18,
    speed: 0.002,
    pl_orbper: 10.1,
    pl_trandep: 0.001245,
    pl_trandur: 2.8,
    pl_imppar: 0.2,
    pl_rade: 1.51,
    pl_massj: 0.019,
    pl_dens: 3.1,
    pl_insol: 6.7,
    pl_eqt: 440,
    st_teff: 3896,
    st_rad: 0.56,
    st_mass: 0.58,
    st_logg: 4.72,
    ra: 344.8453,
    dec: -6.0567,
    sy_dist: 45.1,
  },
  {
    id: 'K2-155b',
    position: [24, 0, 0],
    color: '#F59E0B',
    size: 0.9,
    orbitRadius: 24,
    speed: 0.0015,
    pl_orbper: 5.9,
    pl_trandep: 0.000923,
    pl_trandur: 1.7,
    pl_imppar: 0.15,
    pl_rade: 1.55,
    pl_massj: 0.014,
    pl_dens: 2.8,
    pl_insol: 12.4,
    pl_eqt: 558,
    st_teff: 4134,
    st_rad: 0.61,
    st_mass: 0.64,
    st_logg: 4.68,
    ra: 225.4782,
    dec: 16.7834,
    sy_dist: 67.2,
  },
  {
    id: 'K2-33b',
    position: [30, 0, 0],
    color: '#EF4444',
    size: 0.75,
    orbitRadius: 30,
    speed: 0.001,
    pl_orbper: 5.4,
    pl_trandep: 0.002134,
    pl_trandur: 2.3,
    pl_imppar: 0.35,
    pl_rade: 5.04,
    pl_massj: 0.127,
    pl_dens: 0.9,
    pl_insol: 23.1,
    pl_eqt: 850,
    st_teff: 4360,
    st_rad: 0.87,
    st_mass: 0.95,
    st_logg: 4.45,
    ra: 244.9167,
    dec: -2.8453,
    sy_dist: 160.0,
  },
  {
    id: 'K2-138b',
    position: [9, 0, 0],
    color: '#9F7AEA',
    size: 0.6,
    orbitRadius: 9,
    speed: 0.004,
    pl_orbper: 2.35,
    pl_trandep: 0.001567,
    pl_trandur: 1.4,
    pl_imppar: 0.28,
    pl_rade: 1.21,
    pl_massj: 0.008,
    pl_dens: 4.2,
    pl_insol: 45.3,
    pl_eqt: 1024,
    st_teff: 5594,
    st_rad: 0.93,
    st_mass: 1.01,
    st_logg: 4.48,
    ra: 205.1234,
    dec: -11.2341,
    sy_dist: 203.5,
  },
  {
    id: 'K2-72e',
    position: [15, 0, 0],
    color: '#06B6D4',
    size: 0.65,
    orbitRadius: 15,
    speed: 0.0025,
    pl_orbper: 24.2,
    pl_trandep: 0.000445,
    pl_trandur: 3.8,
    pl_imppar: 0.18,
    pl_rade: 1.29,
    pl_massj: 0.011,
    pl_dens: 3.7,
    pl_insol: 2.1,
    pl_eqt: 269,
    st_teff: 4122,
    st_rad: 0.53,
    st_mass: 0.56,
    st_logg: 4.71,
    ra: 98.7653,
    dec: 21.4567,
    sy_dist: 67.8,
  },
];

export default function K2Visualizer() {
  const [planets, setPlanets] = useState<K2PlanetData[]>(initialPlanets);
  const [selectedPlanet, setSelectedPlanet] = useState<K2PlanetData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const controlsRef = useRef(null);

  const handlePlanetClick = useCallback((planet: K2PlanetData) => {
    setSelectedPlanet(planet);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedPlanet(null), 300);
  }, []);

  const handleUpdatePlanet = useCallback((updatedData: Partial<K2PlanetData>) => {
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
            <div className="p-3 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-400/30 backdrop-blur-sm">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                K2 Exoplanet Analyzer
              </h1>
              <p className="text-orange-300 text-sm">
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
            <p>• <span className="text-orange-300">Click</span> planets to analyze</p>
            <p>• <span className="text-orange-300">Drag</span> to rotate view</p>
            <p>• <span className="text-orange-300">Scroll</span> to zoom</p>
            <p>• <span className="text-orange-300">Hover</span> to see orbit paths</p>
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