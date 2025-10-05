"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

export default function Star() {
  const starRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (starRef.current) {
      starRef.current.rotation.y = time * 0.1;
      starRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;
    }

    if (glowRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.1;
      glowRef.current.scale.setScalar(scale);
      
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.3 + Math.sin(time * 1.5) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Main Star Body */}
      <Sphere ref={starRef} args={[3.5, 64, 64]}>
        <meshStandardMaterial
          color="#FFD700"
          emissive="#FF8C00"
          emissiveIntensity={0.8}
          roughness={0.2}
          metalness={0.1}
        />
      </Sphere>

      {/* Star Glow Effect */}
      <Sphere ref={glowRef} args={[5, 32, 32]}>
        <meshBasicMaterial
          color="#FFD700"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Outer Glow */}
      <Sphere args={[7, 32, 32]}>
        <meshBasicMaterial
          color="#FFA500"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Corona Effect */}
      <Sphere args={[9, 32, 32]}>
        <meshBasicMaterial
          color="#FFFF80"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Sparkles around star */}
      <Sparkles
        count={150}
        scale={18}
        size={3}
        speed={0.5}
        opacity={0.8}
        color="#FFD700"
      />

      {/* Additional sparkles for corona */}
      <Sparkles
        count={80}
        scale={25}
        size={2}
        speed={0.3}
        opacity={0.4}
        color="#FFA500"
      />
    </group>
  );
}