"use client";

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Ring,  Html } from '@react-three/drei';
import * as THREE from 'three';
import { PlanetData } from './KeplerVisualizer';

interface PlanetProps {
  data: PlanetData;
  onClick: () => void;
  isSelected: boolean;
}

export default function Planet({ data, onClick, isSelected }: PlanetProps) {
  const planetRef = useRef<THREE.Mesh>(null!);
  const orbitRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [orbitProgress, setOrbitProgress] = useState(Math.random() * Math.PI * 2);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    const newProgress = orbitProgress + data.speed;
    setOrbitProgress(newProgress);

    const x = Math.cos(newProgress) * data.orbitRadius;
    const z = Math.sin(newProgress) * data.orbitRadius;
    const y = Math.sin(newProgress * 0.5) * 0.5; 

    if (planetRef.current) {
      planetRef.current.position.set(x, y, z);
      planetRef.current.rotation.y = time * 0.5;
      planetRef.current.rotation.x = time * 0.2;

      const targetScale = isSelected ? 2.2 : (hovered ? 1.8 : 1);
      planetRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    }

    if (glowRef.current) {
      const glowScale = isSelected ? 3 : (hovered ? 2.5 : 1.2);
      const pulseFactor = 1 + Math.sin(time * 3) * 0.15;
      glowRef.current.scale.setScalar(glowScale * pulseFactor);
      glowRef.current.position.copy(planetRef.current.position);

      if (data.isAnalyzing) {
        const analyzeGlow = 1 + Math.sin(time * 8) * 0.4;
        glowRef.current.scale.setScalar(analyzeGlow * 3);
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.9;
      } else {
        (glowRef.current.material as THREE.MeshBasicMaterial).opacity = hovered || isSelected ? 0.6 : 0.3;
      }
    }

    if (orbitRef.current) {
      orbitRef.current.visible = hovered || isSelected;
      if (orbitRef.current.visible) {
        orbitRef.current.rotation.x = -Math.PI / 2;
        const material = orbitRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = isSelected ? 0.6 : 0.3;
      }
    }
  });

  const getPredictionColor = () => {
    if (data.prediction === 'confirmed') return '#10B981'; // Green
    if (data.prediction === 'false-positive') return '#EF4444'; // Red
    if (data.prediction === 'candidate') return '#F59E0B'; // Yellow
    return data.color;
  };

  const getPredictionLabel = () => {
    if (data.prediction === 'confirmed') return '🟢 Exoplanet';
    if (data.prediction === 'false-positive') return '🔴 False Positive';
    if (data.prediction === 'candidate') return '🟡 Candidate';
    return null;
  };

  return (
    <group>
      {/* Orbit Ring */}
      <Ring
        ref={orbitRef}
        args={[data.orbitRadius - 0.1, data.orbitRadius + 0.1, 64]}
        visible={false}
      >
        <meshBasicMaterial
          color={isSelected ? "#4A90E2" : "#6B7280"}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </Ring>

      {/* Planet Glow */}
      <Sphere
        ref={glowRef}
        args={[data.size * 2, 16, 16]}
        position={data.position}
      >
        <meshBasicMaterial
          color={data.isAnalyzing ? "#60A5FA" : getPredictionColor()}
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Main Planet */}
      <Sphere
        ref={planetRef}
        args={[data.size, 32, 32]}
        position={data.position}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          color={getPredictionColor()}
          emissive={data.isAnalyzing ? "#1E40AF" : (hovered ? "#1E3A8A" : "#000000")}
          emissiveIntensity={data.isAnalyzing ? 0.4 : (hovered ? 0.2 : 0.1)}
          roughness={0.7}
          metalness={0.3}
        />
      </Sphere>

      {/* Analysis Sparkles */}
      {data.isAnalyzing && (
        <group position={planetRef.current?.position}>
          {[...Array(12)].map((_, i) => (
            <Sphere key={i} args={[0.04, 8, 8]} position={[
              Math.cos(i * Math.PI / 6) * (data.size + 0.8),
              Math.sin(i * Math.PI / 6) * 0.3,
              Math.sin(i * Math.PI / 6) * (data.size + 0.8)
            ]}>
              <meshBasicMaterial color="#60A5FA" transparent opacity={0.9} />
            </Sphere>
          ))}
        </group>
      )}

      {/* Prediction Label */}
      {data.prediction && !data.isAnalyzing && (
        <Html
          position={[
            planetRef.current?.position.x || 0,
            (planetRef.current?.position.y || 0) + data.size + 1.5,
            planetRef.current?.position.z || 0
          ]}
          center
          distanceFactor={8}
          occlude
        >
          <div className="bg-black/90 backdrop-blur-sm border border-gray-700/50 rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap pointer-events-none shadow-2xl">
            <span className="text-white">{getPredictionLabel()}</span>
          </div>
        </Html>
      )}

      {/* Analyzing Label */}
      {data.isAnalyzing && (
        <Html
          position={[
            planetRef.current?.position.x || 0,
            (planetRef.current?.position.y || 0) + data.size + 1.5,
            planetRef.current?.position.z || 0
          ]}
          center
          distanceFactor={8}
          occlude
        >
          <div className="bg-blue-600/95 backdrop-blur-sm border border-blue-400/50 rounded-lg px-4 py-2 text-sm font-bold whitespace-nowrap pointer-events-none animate-pulse shadow-2xl">
            <span className="text-white">🔄 Analyzing...</span>
          </div>
        </Html>
      )}

      {/* Planet Info on Hover */}
      {hovered && !isSelected && (
        <Html
          position={[
            planetRef.current?.position.x || 0,
            (planetRef.current?.position.y || 0) - data.size - 4,
            planetRef.current?.position.z || 0
          ]}
          center
          distanceFactor={4}
          occlude
        >
          <div className="bg-black/98 backdrop-blur-lg border-2 border-blue-400/60 rounded-2xl p-8 text-gray-200 pointer-events-none shadow-2xl min-w-[500px] min-h-[450px]">
            <div className="font-bold text-white mb-6 text-center text-3xl border-b-2 border-gray-600 pb-4">
              {data.id}
            </div>
            <div className="space-y-5">
              <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                <span className="font-semibold text-xl">Orbital Period:</span> 
                <span className="text-blue-300 font-bold text-2xl">{data.koi_period.toFixed(1)} days</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                <span className="font-semibold text-xl">Planet Radius:</span> 
                <span className="text-green-300 font-bold text-2xl">{data.koi_prad.toFixed(2)} R⊕</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                <span className="font-semibold text-xl">Detection Score:</span> 
                <span className="text-yellow-300 font-bold text-2xl">{data.koi_score.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                <span className="font-semibold text-xl">Temperature:</span> 
                <span className="text-red-300 font-bold text-2xl">{data.koi_teq.toFixed(0)} K</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                <span className="font-semibold text-xl">Star Temperature:</span> 
                <span className="text-orange-300 font-bold text-2xl">{data.koi_steff.toFixed(0)} K</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-700/50">
                <span className="font-semibold text-xl">Insolation:</span> 
                <span className="text-purple-300 font-bold text-2xl">{data.koi_insol.toFixed(2)} S⊕</span>
              </div>
            </div>
            <div className="text-center mt-6 pt-5 border-t-2 border-gray-600">
              <div className="text-blue-400 font-bold text-2xl animate-pulse bg-blue-500/30 rounded-xl py-4 px-6 border border-blue-400/50">
                🔍 Click to Analyze Planet
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}