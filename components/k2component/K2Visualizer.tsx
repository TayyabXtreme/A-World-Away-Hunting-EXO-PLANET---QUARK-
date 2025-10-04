"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
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
  pl_orbper: number;    // Orbital Period (Days)
  pl_trandep: number;   // Transit Depth (Fraction or ppm)
  pl_trandur: number;   // Transit Duration (Hours)
  pl_imppar: number;    // Impact Parameter (Unitless)
  pl_rade: number;      // Planet Radius (Earth Radii)
  pl_massj: number;     // Planet Mass (Jupiter Masses)
  pl_dens: number;      // Planet Density (g/cm³)
  pl_insol: number;     // Incident Stellar Flux (Earth Flux)
  pl_eqt: number;       // Equilibrium Temperature (K)
  st_teff: number;      // Star's Effective Temperature (K)
  st_rad: number;       // Star's Radius (Solar Radii)
  st_mass: number;      // Star's Mass (Solar Mass)
  st_logg: number;      // Star's Surface Gravity (log cm/s²)
  ra: number;           // Right Ascension (Degrees)
  dec: number;          // Declination (Degrees)
  sy_dist: number;      // System Distance (Parsecs)
  prediction?: 'confirmed' | 'false-positive' | 'candidate' | null;
  isAnalyzing?: boolean;
  // Flask API response data
  flaskResponse?: {
    koi_pdisposition: string;
    prediction: string;
    probability: number;
    status: string;
    timestamp: string;
    is_exoplanet?: boolean;
  };
  // Claude AI response data  
  claudeResponse?: {
    disposition: string;
    confidence: number;
    reasoning: string;
    habitability_assessment?: string;
    planet_type?: string;
  };
}

const initialK2Planets: K2PlanetData[] = [
  {
    id: 'K2-18b',
    position: [8, 2, -6], // Different 3D position
    color: '#4299E1',
    size: 0.8,
    orbitRadius: 12,
    speed: 0.003,
    pl_orbper: 32.9,
    pl_trandep: 0.00087,
    pl_trandur: 3.14,
    pl_imppar: 0.23,
    pl_rade: 2.61,
    pl_massj: 0.025,
    pl_dens: 2.3,
    pl_insol: 2.38,
    pl_eqt: 255,
    st_teff: 3457,
    st_rad: 0.411,
    st_mass: 0.36,
    st_logg: 4.59,
    ra: 201.912,
    dec: 7.588,
    sy_dist: 38.5,
  },
  {
    id: 'K2-3b',
    position: [-12, -4, 10], // Different 3D position
    color: '#48BB78',
    size: 0.7,
    orbitRadius: 18,
    speed: 0.002,
    pl_orbper: 10.07,
    pl_trandep: 0.00045,
    pl_trandur: 2.1,
    pl_imppar: 0.18,
    pl_rade: 1.51,
    pl_massj: 0.011,
    pl_dens: 4.8,
    pl_insol: 9.2,
    pl_eqt: 390,
    st_teff: 3896,
    st_rad: 0.561,
    st_mass: 0.58,
    st_logg: 4.51,
    ra: 137.135,
    dec: -1.092,
    sy_dist: 45.8,
  },
  {
    id: 'K2-138b',
    position: [15, -8, -18], // Different 3D position
    color: '#F59E0B',
    size: 0.9,
    orbitRadius: 24,
    speed: 0.0015,
    pl_orbper: 2.35,
    pl_trandep: 0.00032,
    pl_trandur: 1.8,
    pl_imppar: 0.42,
    pl_rade: 1.22,
    pl_massj: 0.0085,
    pl_dens: 6.1,
    pl_insol: 43.7,
    pl_eqt: 623,
    st_teff: 5046,
    st_rad: 0.834,
    st_mass: 0.89,
    st_logg: 4.38,
    ra: 291.93,
    dec: -20.66,
    sy_dist: 204.1,
  },
  {
    id: 'K2-229b',
    position: [-20, 6, 22], // Different 3D position
    color: '#EF4444',
    size: 0.75,
    orbitRadius: 30,
    speed: 0.001,
    pl_orbper: 14.89,
    pl_trandep: 0.00156,
    pl_trandur: 2.95,
    pl_imppar: 0.15,
    pl_rade: 2.65,
    pl_massj: 0.063,
    pl_dens: 1.8,
    pl_insol: 4.1,
    pl_eqt: 289,
    st_teff: 4595,
    st_rad: 0.755,
    st_mass: 0.79,
    st_logg: 4.46,
    ra: 347.29,
    dec: -7.78,
    sy_dist: 339.7,
  },
  {
    id: 'K2-32b',
    position: [4, 8, -5], // Different 3D position
    color: '#9F7AEA',
    size: 0.6,
    orbitRadius: 9,
    speed: 0.004,
    pl_orbper: 4.35,
    pl_trandep: 0.00098,
    pl_trandur: 1.42,
    pl_imppar: 0.28,
    pl_rade: 2.21,
    pl_massj: 0.028,
    pl_dens: 2.9,
    pl_insol: 18.5,
    pl_eqt: 491,
    st_teff: 4134,
    st_rad: 0.659,
    st_mass: 0.68,
    st_logg: 4.48,
    ra: 204.97,
    dec: -1.89,
    sy_dist: 287.5,
  },
  {
    id: 'K2-266b',
    position: [-8, -6, 12], // Different 3D position
    color: '#06B6D4',
    size: 0.65,
    orbitRadius: 15,
    speed: 0.0025,
    pl_orbper: 7.8,
    pl_trandep: 0.00067,
    pl_trandur: 2.24,
    pl_imppar: 0.31,
    pl_rade: 1.56,
    pl_massj: 0.0145,
    pl_dens: 4.2,
    pl_insol: 8.9,
    pl_eqt: 378,
    st_teff: 3721,
    st_rad: 0.523,
    st_mass: 0.52,
    st_logg: 4.53,
    ra: 123.45,
    dec: 15.67,
    sy_dist: 156.2,
  },
];

export default function K2Visualizer() {
  const [planets, setPlanets] = useState<K2PlanetData[]>(initialK2Planets);
  const [selectedPlanet, setSelectedPlanet] = useState<K2PlanetData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const controlsRef = useRef<any>(null);

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

  const handleAnalyzePlanet = useCallback(async (planetData: K2PlanetData) => {
    // Set analyzing state
    handleUpdatePlanet({ isAnalyzing: true });
    // The actual API call will be handled by the AnalysisPanel
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
        
        {/* K2 Planets */}
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
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-400/30 backdrop-blur-sm">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                K2 Exoplanet Analyzer
              </h1>
              <p className="text-blue-300 text-sm">
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
            <p>• <span className="text-blue-300">Click</span> planets to analyze</p>
            <p>• <span className="text-blue-300">Drag</span> to rotate view</p>
            <p>• <span className="text-blue-300">Scroll</span> to zoom</p>
            <p>• <span className="text-blue-300">Hover</span> to see orbit paths</p>
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