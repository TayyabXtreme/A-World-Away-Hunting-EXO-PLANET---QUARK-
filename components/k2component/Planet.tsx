"use client";

import React, { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import type { K2PlanetData } from './K2Visualizer';

interface PlanetProps {
  data: K2PlanetData;
  onClick: () => void;
  isSelected: boolean;
}

export default function Planet({ data, onClick, isSelected }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

  useFrame((state) => {
    if (groupRef.current) {
      // Orbital motion
      const angle = state.clock.elapsedTime * data.speed;
      groupRef.current.position.x = Math.cos(angle) * data.orbitRadius;
      groupRef.current.position.z = Math.sin(angle) * data.orbitRadius;
    }
    
    if (meshRef.current) {
      // Planet rotation
      meshRef.current.rotation.y += 0.01;
      
      // Pulsing effect when selected
      if (isSelected) {
        const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 1;
        meshRef.current.scale.setScalar(pulse);
      } else {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  const getPlanetType = () => {
    if (data.pl_rade < 1.25) return "Rocky";
    if (data.pl_rade < 2.0) return "Super-Earth";
    if (data.pl_rade < 4.0) return "Mini-Neptune";
    if (data.pl_rade < 11.0) return "Neptune-like";
    return "Jupiter-like";
  };

  const getHabitabilityZone = () => {
    if (data.pl_eqt >= 273 && data.pl_eqt <= 373) return "Habitable Zone";
    if (data.pl_eqt < 273) return "Too Cold";
    return "Too Hot";
  };

  return (
    <group ref={groupRef}>
      {/* Orbital Path */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.orbitRadius - 0.02, data.orbitRadius + 0.02, 64]} />
        <meshBasicMaterial 
          color={isSelected ? "#FFD700" : "#444444"} 
          transparent 
          opacity={isSelected ? 0.6 : 0.2} 
        />
      </mesh>

      {/* Planet */}
      <Sphere
        ref={meshRef}
        args={[data.size, 32, 32]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          color={data.color}
          emissive={isSelected ? data.color : '#000000'}
          emissiveIntensity={isSelected ? 0.3 : 0}
          roughness={0.7}
          metalness={0.1}
        />
      </Sphere>

      {/* Planet Atmosphere */}
      <Sphere args={[data.size * 1.1, 32, 32]}>
        <meshBasicMaterial
          color={data.color}
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Enhanced Hover Tooltip */}
      {hovered && (
        <Html
          center
          distanceFactor={8}
          position={[0, data.size + 2, 0]}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            zIndex: 1000,
          }}
        >
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-black/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-600/50 shadow-2xl"
              style={{
                width: '500px',
                minHeight: '450px',
                fontSize: '16px',
                lineHeight: '1.6',
              }}
            >
              {/* Header */}
              <div className="mb-4">
                <h3 className="text-white font-bold text-2xl mb-2 flex items-center gap-2">
                  🪐 {data.id}
                  <span className="text-lg font-normal text-gray-300">
                    ({getPlanetType()})
                  </span>
                </h3>
                <div className="flex gap-2 mb-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium">
                    K2 Mission
                  </span>
                  <span 
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      getHabitabilityZone() === "Habitable Zone" 
                        ? "bg-green-500/20 text-green-300"
                        : getHabitabilityZone() === "Too Cold"
                        ? "bg-blue-500/20 text-blue-300"
                        : "bg-red-500/20 text-red-300"
                    }`}
                  >
                    {getHabitabilityZone()}
                  </span>
                </div>
              </div>

              {/* Planet Parameters Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* Physical Properties */}
                <div className="space-y-3">
                  <h4 className="text-yellow-400 font-semibold text-lg mb-2">🌍 Physical Properties</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Radius:</span>
                      <span className="text-white font-medium">{data.pl_rade.toFixed(2)} R⊕</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Mass:</span>
                      <span className="text-white font-medium">{data.pl_massj.toFixed(3)} MJ</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Density:</span>
                      <span className="text-white font-medium">{data.pl_dens.toFixed(1)} g/cm³</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Temperature:</span>
                      <span className="text-white font-medium">{data.pl_eqt.toFixed(0)} K</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Incident Flux:</span>
                      <span className="text-white font-medium">{data.pl_insol.toFixed(1)} F⊕</span>
                    </div>
                  </div>
                </div>

                {/* Orbital Properties */}
                <div className="space-y-3">
                  <h4 className="text-blue-400 font-semibold text-lg mb-2">🛸 Orbital Properties</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Period:</span>
                      <span className="text-white font-medium">{data.pl_orbper.toFixed(2)} days</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Transit Depth:</span>
                      <span className="text-white font-medium">{(data.pl_trandep * 1000).toFixed(2)} ppm</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Transit Duration:</span>
                      <span className="text-white font-medium">{data.pl_trandur.toFixed(2)} hrs</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Impact Parameter:</span>
                      <span className="text-white font-medium">{data.pl_imppar.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Star Properties */}
              <div className="mt-4 pt-4 border-t border-gray-600/50">
                <h4 className="text-orange-400 font-semibold text-lg mb-3">⭐ Host Star Properties</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Temperature:</span>
                      <span className="text-white font-medium">{data.st_teff.toFixed(0)} K</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Radius:</span>
                      <span className="text-white font-medium">{data.st_rad.toFixed(2)} R☉</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Mass:</span>
                      <span className="text-white font-medium">{data.st_mass.toFixed(2)} M☉</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-300">Distance:</span>
                      <span className="text-white font-medium">{data.sy_dist.toFixed(1)} pc</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-600/50">
                <p className="text-gray-400 text-sm text-center">
                  💫 Click to analyze with AI • 🔍 Scroll to zoom • 🖱️ Drag to explore
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </Html>
      )}

      {/* Selection Ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[data.size * 1.3, data.size * 1.4, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}