'use client';

import React, { useRef, useMemo, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { InstancedMesh, Object3D, Vector3 } from 'three';
import { UnifiedPlanet } from '@/lib/dataset-types';
import { getPlanetColor, getPlanetSize } from '@/lib/dataset-utils';

interface PlanetFieldProps {
  planets: UnifiedPlanet[];
  selectedPlanet: UnifiedPlanet | null;
  onPlanetSelect: (planet: UnifiedPlanet | null) => void;
}

export default function PlanetField({ planets, selectedPlanet, onPlanetSelect }: PlanetFieldProps) {
  const meshRef = useRef<InstancedMesh>(null);
  const glowMeshRef = useRef<InstancedMesh>(null);
  const { raycaster, mouse, camera } = useThree();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  
  const { positions,  scales, planetMap } = useMemo(() => {
    const tempObject = new Object3D();
    const positionsArray: Vector3[] = [];
    const colorsArray: number[][] = [];
    const scalesArray: number[] = [];
    const planetMapArray: UnifiedPlanet[] = [];

    planets.forEach((planet) => {
      if (planet.x !== undefined && planet.y !== undefined && planet.z !== undefined) {
        tempObject.position.set(planet.x, planet.y, planet.z);
        tempObject.updateMatrix();
        positionsArray.push(new Vector3(planet.x, planet.y, planet.z));

        const color = getPlanetColor(planet.temperature);
        const colorValues = [
          parseInt(color.slice(1, 3), 16) / 255,
          parseInt(color.slice(3, 5), 16) / 255,
          parseInt(color.slice(5, 7), 16) / 255
        ];
        colorsArray.push(colorValues);

        const scale = getPlanetSize(planet.radius);
        scalesArray.push(scale);

        planetMapArray.push(planet);
      }
    });

    return {
      positions: positionsArray,
      colors: colorsArray,
      scales: scalesArray,
      planetMap: planetMapArray
    };
  }, [planets]);

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (!meshRef.current) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(meshRef.current);

    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId;
      if (instanceId !== undefined && planetMap[instanceId]) {
        const planet = planetMap[instanceId];
        onPlanetSelect(planet === selectedPlanet ? null : planet);
      }
    } else {
      onPlanetSelect(null);
    }
  };

  
  const handlePointerMove = (event: React.PointerEvent) => {
    event.stopPropagation();
    
    if (!meshRef.current) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(meshRef.current);

    if (intersects.length > 0) {
      const instanceId = intersects[0].instanceId;
      setHoveredIndex(instanceId !== undefined ? instanceId : null);
      document.body.style.cursor = 'pointer';
    } else {
      setHoveredIndex(null);
      document.body.style.cursor = 'default';
    }
  };

  useFrame((state) => {
    if (!meshRef.current || !glowMeshRef.current) return;

    const time = state.clock.getElapsedTime();
    const tempObject = new Object3D();

  
    positions.forEach((position, index) => {
      const planet = planetMap[index];
      const isSelected = selectedPlanet?.id === planet.id;
      const isHovered = hoveredIndex === index;


      let scale = scales[index];

      if (isSelected) {
        scale *= 1.5 + Math.sin(time * 3) * 0.2; 
      } else if (isHovered) {
        scale *= 1.2;
      }

      const floatOffset = Math.sin(time * 0.5 + index * 0.1) * 0.1;
      
      tempObject.position.set(
        position.x,
        position.y + floatOffset,
        position.z
      );
      tempObject.scale.setScalar(scale);
      tempObject.updateMatrix();
      
      meshRef.current!.setMatrixAt(index, tempObject.matrix);
      const glowScale = scale * (isSelected ? 2.5 : isHovered ? 2.0 : 1.8);
      tempObject.scale.setScalar(glowScale);
      tempObject.updateMatrix();
      glowMeshRef.current!.setMatrixAt(index, tempObject.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    glowMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (positions.length === 0) return null;

  return (
    <group>
      {/* Glow effect (rendered first, behind planets) */}
     

      {/* Main planet spheres */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, positions.length]}
        onClick={handleClick}
        onPointerMove={handlePointerMove}
      >
        <sphereGeometry args={[1, 32, 24]} />
        <meshStandardMaterial
          roughness={0.4}
          metalness={0.1}
          emissive="#111111"
          emissiveIntensity={0.1}
        />
      </instancedMesh>

      {/* Individual colored spheres for each planet */}
      {positions.map((position, index) => {
        const planet = planetMap[index];
        const isSelected = selectedPlanet?.id === planet.id;
        const isHovered = hoveredIndex === index;
        const color = getPlanetColor(planet.temperature);
        
        let scale = scales[index];
        if (isSelected) {
          scale *= 1.5;
        } else if (isHovered) {
          scale *= 1.2;
        }
        
        return (
          <group key={planet.id} position={[position.x, position.y, position.z]}>
            {/* Main planet sphere with color */}
            <mesh 
              scale={[scale, scale, scale]}
              onClick={(event) => {
                event.stopPropagation();
                onPlanetSelect(planet === selectedPlanet ? null : planet);
              }}
              onPointerEnter={(event) => {
                event.stopPropagation();
                setHoveredIndex(index);
                document.body.style.cursor = 'pointer';
              }}
              onPointerLeave={() => {
                setHoveredIndex(null);
                document.body.style.cursor = 'default';
              }}
            >
              <sphereGeometry args={[1, 32, 24]} />
              <meshStandardMaterial
                color={color}
                roughness={0.4}
                metalness={0.1}
                emissive={color}
                emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.2 : 0.1}
              />
            </mesh>
            
            {/* Selection ring */}
            {isSelected && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[scale * 2, scale * 2.5, 32]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.6}
                  side={2}
                />
              </mesh>
            )}
            
            {/* Orbit trail for selected planet */}
            {isSelected && (
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[scale * 3, scale * 3.1, 64]} />
                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.3}
                  side={2}
                />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}