"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { AnimatePresence } from 'framer-motion';
import Star from './Star';
import Planet from './Planet';
import AnalysisPanel from './AnalysisPanel';

export interface PlanetData {
  id: string;
  position: [number, number, number];
  color: string;
  size: number;
  orbitRadius: number;
  speed: number;
  koi_score: number;
  koi_period: number;
  koi_time0bk: number;
  koi_impact: number;
  koi_duration: number;
  koi_depth: number;
  koi_prad: number;
  koi_teq: number;
  koi_insol: number;
  koi_steff: number;
  koi_slogg: number;
  koi_srad: number;
  koi_model_snr: number;
  koi_srho: number;
  prediction?: 'confirmed' | 'false-positive' | 'candidate' | null;
  isAnalyzing?: boolean;
  flaskResponse?: {
    is_exoplanet: boolean;
    koi_pdisposition: string;
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

const initialPlanets: PlanetData[] = [
  {
    id: 'Kepler-442b',
    position: [12, 0, 0],
    color: '#4299E1',
    size: 0.8,
    orbitRadius: 12,
    speed: 0.003,
    koi_score: 0.95,
    koi_period: 112.3,
    koi_time0bk: 131.5100,
    koi_impact: 0.15,
    koi_duration: 4.2,
    koi_depth: 320,
    koi_prad: 1.34,
    koi_teq: 233,
    koi_insol: 0.7,
    koi_steff: 4402,
    koi_slogg: 4.58,
    koi_srad: 0.6,
    koi_model_snr: 85.2,
    koi_srho: 2.1,
  },
  {
    id: 'Kepler-186f',
    position: [18, 0, 0],
    color: '#48BB78',
    size: 0.7,
    orbitRadius: 18,
    speed: 0.002,
    koi_score: 0.88,
    koi_period: 129.9,
    koi_time0bk: 142.3200,
    koi_impact: 0.25,
    koi_duration: 5.8,
    koi_depth: 180,
    koi_prad: 1.11,
    koi_teq: 188,
    koi_insol: 0.32,
    koi_steff: 3788,
    koi_slogg: 4.74,
    koi_srad: 0.47,
    koi_model_snr: 64.5,
    koi_srho: 3.8,
  },
  {
    id: 'Kepler-452b',
    position: [24, 0, 0],
    color: '#F59E0B',
    size: 0.9,
    orbitRadius: 24,
    speed: 0.0015,
    koi_score: 0.76,
    koi_period: 384.8,
    koi_time0bk: 156.7800,
    koi_impact: 0.08,
    koi_duration: 10.8,
    koi_depth: 150,
    koi_prad: 1.63,
    koi_teq: 265,
    koi_insol: 1.04,
    koi_steff: 5757,
    koi_slogg: 4.32,
    koi_srad: 1.11,
    koi_model_snr: 42.3,
    koi_srho: 0.98,
  },
  {
    id: 'TOI-715b',
    position: [30, 0, 0],
    color: '#EF4444',
    size: 0.75,
    orbitRadius: 30,
    speed: 0.001,
    koi_score: 0.63,
    koi_period: 19.3,
    koi_time0bk: 167.2100,
    koi_impact: 0.42,
    koi_duration: 2.1,
    koi_depth: 890,
    koi_prad: 1.55,
    koi_teq: 374,
    koi_insol: 1.37,
    koi_steff: 3341,
    koi_slogg: 4.81,
    koi_srad: 0.374,
    koi_model_snr: 27.8,
    koi_srho: 4.2,
  },
  {
    id: 'Proxima-Cen-b',
    position: [9, 0, 0],
    color: '#9F7AEA',
    size: 0.6,
    orbitRadius: 9,
    speed: 0.004,
    koi_score: 0.82,
    koi_period: 11.2,
    koi_time0bk: 125.9900,
    koi_impact: 0.35,
    koi_duration: 1.8,
    koi_depth: 1200,
    koi_prad: 1.07,
    koi_teq: 234,
    koi_insol: 1.64,
    koi_steff: 3042,
    koi_slogg: 5.2,
    koi_srad: 0.14,
    koi_model_snr: 38.9,
    koi_srho: 5.6,
  },
  {
    id: 'TRAPPIST-1e',
    position: [15, 0, 0],
    color: '#06B6D4',
    size: 0.65,
    orbitRadius: 15,
    speed: 0.0025,
    koi_score: 0.91,
    koi_period: 6.1,
    koi_time0bk: 138.4500,
    koi_impact: 0.18,
    koi_duration: 0.8,
    koi_depth: 740,
    koi_prad: 0.92,
    koi_teq: 251,
    koi_insol: 0.66,
    koi_steff: 2559,
    koi_slogg: 5.04,
    koi_srad: 0.121,
    koi_model_snr: 56.7,
    koi_srho: 8.2,
  },
];

export default function KeplerVisualizer() {
  const [planets, setPlanets] = useState<PlanetData[]>(initialPlanets);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const controlsRef = useRef(null);

  const handlePlanetClick = useCallback((planet: PlanetData) => {
    setSelectedPlanet(planet);
    setIsPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedPlanet(null), 300);
  }, []);

  const handleUpdatePlanet = useCallback((updatedData: Partial<PlanetData>) => {
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
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-400/30 backdrop-blur-sm">
              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Kepler Exoplanet Analyzer
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