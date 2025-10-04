"use client";

import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Text, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useApp } from '@/state/store';
import { StarSystem, Planet, PlanetCategory } from '@/lib/types';
import { createPlanetTexture } from '@/lib/planet-textures';

// Camera presets for smooth transitions (optimized for single star system)
const CAMERA_PRESETS = {
  galaxy: {
    position: new THREE.Vector3(25, 20, 25),
    target: new THREE.Vector3(0, 0, 0),
  },
  system: {
    position: new THREE.Vector3(15, 12, 15),
    target: new THREE.Vector3(0, 0, 0),
  },
  closeup: {
    position: new THREE.Vector3(8, 6, 8),
    target: new THREE.Vector3(0, 0, 0),
  },
  planet: {
    position: new THREE.Vector3(3, 2, 3),
    target: new THREE.Vector3(0, 0, 0),
  },
};

// Planet color mapping
const PLANET_COLORS: Record<PlanetCategory, string> = {
  'cold': '#4a90e2',      // Blue
  'hot': '#e74c3c',       // Red
  'habitable': '#27ae60', // Green
  'gas-giant': '#9b59b6', // Purple
};

// Star component
function Star({ 
  system, 
  position, 
  onClick, 
  onHover,
  isSelected 
}: { 
  system: StarSystem;
  position: [number, number, number];
  onClick: (system: StarSystem) => void;
  onHover: (system: StarSystem | null) => void;
  isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { utils, state } = useApp();
  const [hovered, setHovered] = useState(false);

  const starColor = utils.getStarColor(system.star_properties.temperature_K);
  const starSize = Math.max(0.1, Math.min(2, system.star_properties.radius_solar * 0.5));
  const brightness = state.viewControls.starBrightness;

  useFrame((state) => {
    if (meshRef.current) {
      // Realistic star rotation and pulsing
      const time = state.clock.elapsedTime;
      
      // Star rotation (slower than planets)
      meshRef.current.rotation.y += 0.001;
      
      // Gentle pulsing animation like a real star
      const pulse = 1 + Math.sin(time * 1.5) * 0.05;
      const selectedScale = isSelected ? 1.3 : hovered ? 1.15 : 1;
      meshRef.current.scale.setScalar(pulse * selectedScale);
    }
  });

  return (
    <group position={position}>
      {/* Enhanced star point light to illuminate planets realistically */}
      <pointLight 
        position={[0, 0, 0]} 
        intensity={brightness * 3} 
        color={starColor}
        distance={60}
        decay={1.8}
        castShadow
      />
      
      {/* Main star body */}
      <mesh
        ref={meshRef}
        onClick={() => onClick(system)}
        onPointerOver={() => {
          setHovered(true);
          onHover(system);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
        }}
      >
        <sphereGeometry args={[starSize, 32, 32]} />
        <meshBasicMaterial 
          color={starColor}
          transparent={false}
        />
      </mesh>
      
      {/* Star corona/glow effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[starSize * 1.8, 16, 16]} />
        <meshBasicMaterial
          color={starColor}
          transparent
          opacity={brightness * 0.2}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer star glow */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[starSize * 2.5, 12, 12]} />
        <meshBasicMaterial
          color={starColor}
          transparent
          opacity={brightness * 0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Star label */}
      {(isSelected || hovered) && (
        <Text
          position={[0, starSize + 1, 0]}
          fontSize={0.5}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {system.hostname}
        </Text>
      )}
    </group>
  );
}

// Planet component
function PlanetComponent({ 
  planet, 
  starSystem,
  starPosition,
  planetIndex,
  onClick, 
  onHover,
  isSelected,
  isMultiSelected
}: { 
  planet: Planet;
  starSystem: StarSystem;
  starPosition: [number, number, number];
  planetIndex: number;
  onClick: (planet: Planet, starSystem: StarSystem) => void;
  onHover: (planet: Planet | null) => void;
  isSelected: boolean;
  isMultiSelected: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const orbitRef = useRef<THREE.Group>(null);
  const { utils, state } = useApp();
  const [hovered, setHovered] = useState(false);

  const category = utils.getPlanetCategory(planet);
  const planetColor = PLANET_COLORS[category];
  
  // Enhanced planet sizing for single system view
  const planetSize = useMemo(() => {
    if (state.viewControls.scalePlanetSizes) {
      // More realistic size scaling with better range
      const radius = planet.radius_earth || 1;
      const scaledSize = Math.max(0.03, Math.min(0.4, radius * 0.08));
      return scaledSize;
    } else {
      // Fixed size mode with slight variation based on type
      const baseSize = 0.08;
      const variation = category === 'gas-giant' ? 1.5 : 
                      category === 'habitable' ? 1.2 : 1;
      return baseSize * variation;
    }
  }, [planet.radius_earth, state.viewControls.scalePlanetSizes, category]);
  
  // Calculate orbital radius ensuring each planet has its own distinct ring
  const orbitalRadius = useMemo(() => {
    // Use the passed planetIndex for guaranteed unique spacing
    const baseRadius = 1.5; // Start closer to star
    const ringSpacing = 1.2; // Distance between each ring
    
    // Primary radius based on planet position (guarantees no overlap)
    const primaryRadius = baseRadius + (planetIndex * ringSpacing);
    
    // Optional: Add small variation based on orbital period for realism
    const periodRatio = planet.orbital_period_days / 365.25;
    const periodVariation = Math.pow(Math.max(0.1, periodRatio), 1/4) * 0.2; // Smaller variation
    
    // Combine base spacing with small period-based variation
    const finalRadius = primaryRadius + periodVariation;
    
    // Ensure reasonable range for visualization
    return Math.max(1.5, Math.min(15, finalRadius));
  }, [planetIndex, planet.orbital_period_days]);

  // Create random starting position for each planet (memoized so it stays consistent)
  const planetStartingAngle = useMemo(() => {
    // Use planet name as seed for consistent but random starting positions
    const seed = planet.planet_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (seed * 0.1) % (Math.PI * 2); // Random angle between 0 and 2π
  }, [planet.planet_name]);

  // Add random orbital inclination for more natural 3D distribution
  const orbitalInclination = useMemo(() => {
    // Use planet properties as seed for consistent inclination
    const seed = (planet.planet_name.charCodeAt(0) + planet.orbital_period_days) * 0.001;
    return (seed % 1) * 0.3 - 0.15; // Random inclination between -0.15 and 0.15 radians (~8.6°)
  }, [planet.planet_name, planet.orbital_period_days]);

  // Random orbital direction (some planets go clockwise, others counterclockwise)
  const orbitalDirection = useMemo(() => {
    const seed = planet.planet_name.charCodeAt(planet.planet_name.length - 1);
    return seed % 2 === 0 ? 1 : -1; // 50% chance of reverse direction
  }, [planet.planet_name]);

  // Create planet texture (memoized for performance)
  const planetTexture = useMemo(() => {
    return createPlanetTexture(category, planet.equilibrium_temp_K, planet.radius_earth);
  }, [category, planet.equilibrium_temp_K, planet.radius_earth]);

  useFrame((frameState) => {
    if (orbitRef.current) {
      // Enhanced orbital mechanics for single system view
      const time = frameState.clock.elapsedTime * (state.viewControls.orbitSpeed as number || 1);
      
      // Better orbital speed calculation for single system visualization
      const baseSpeed = 0.02; // Faster base speed for better observation
      const periodScale = Math.max(0.5, Math.sqrt(planet.orbital_period_days * 0.001)); // Less extreme scaling
      const orbitalSpeed = baseSpeed / periodScale;
      
      // Use the random starting angle and direction so planets start in different positions
      const angle = (time * orbitalSpeed * orbitalDirection) + planetStartingAngle;
      
      // Calculate elliptical orbit position
      const eccentricity = Math.min(0.8, planet.eccentricity || 0); // Limit eccentricity for stability
      const a = orbitalRadius; // Semi-major axis
      const b = orbitalRadius * Math.sqrt(1 - eccentricity * eccentricity); // Semi-minor axis
      
      // True elliptical orbit calculation with 3D inclination
      const x = a * Math.cos(angle) * (1 - eccentricity * Math.cos(angle));
      const z = b * Math.sin(angle);
      const y = Math.sin(angle) * orbitalInclination * orbitalRadius; // Add vertical component for inclination
      
      // Position planet relative to star center (star is at the center of the ring)
      orbitRef.current.position.set(
        starPosition[0] + x,
        starPosition[1] + y,
        starPosition[2] + z
      );
    }

    if (meshRef.current) {
      // Realistic planet self-rotation (day/night cycle)
      const rotationSpeed = 0.01 / Math.max(1, planet.radius_earth * 0.5);
      meshRef.current.rotation.y += rotationSpeed;
      
      // Gentle scaling effect for selection
      const targetScale = isSelected ? 1.4 : isMultiSelected ? 1.25 : hovered ? 1.15 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08);
    }
  });

  return (
    <>
      {/* Orbit path - perfectly centered on star position with inclination */}
      {state.viewControls.showOrbits && (
        <group position={starPosition}>
          {/* Main orbital ring with inclination */}
          <mesh rotation={[-Math.PI / 2 + orbitalInclination, 0, 0]}>
            <ringGeometry args={[orbitalRadius - 0.02, orbitalRadius + 0.02, 128]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Orbital path accent ring with inclination */}
          <mesh rotation={[-Math.PI / 2 + orbitalInclination, 0, 0]}>
            <ringGeometry args={[orbitalRadius - 0.005, orbitalRadius + 0.005, 64]} />
            <meshBasicMaterial
              color={planetColor}
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Direction indicator - shows orbital direction */}
          <mesh 
            position={[orbitalRadius * 0.8, orbitalInclination * orbitalRadius * 0.8, 0]}
            rotation={[-Math.PI / 2 + orbitalInclination, 0, orbitalDirection > 0 ? 0 : Math.PI]}
          >
            <coneGeometry args={[0.1, 0.2, 4]} />
            <meshBasicMaterial
              color={orbitalDirection > 0 ? "#00ff00" : "#ff0000"}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      )}
      
      {/* Planet group that moves along the orbit */}
      <group ref={orbitRef} position={[0, 0, 0]}>
        {/* Planet mesh */}
        <mesh
          ref={meshRef}
          position={[0, 0, 0]}
          onClick={(e) => {
            e.stopPropagation();
            onClick(planet, starSystem);
          }}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            onHover(planet);
          }}
          onPointerOut={() => {
            setHovered(false);
            onHover(null);
          }}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[planetSize, 32, 32]} />
          <meshStandardMaterial 
            map={planetTexture}
            roughness={category === 'gas-giant' ? 0.1 : 0.8}
            metalness={category === 'gas-giant' ? 0.3 : 0.1}
            emissive={category === 'hot' ? new THREE.Color(planetColor).multiplyScalar(0.1) : new THREE.Color(0x000000)}
          />
        </mesh>

        {/* Atmosphere effect for gas giants */}
        {category === 'gas-giant' && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[planetSize * 1.2, 16, 16]} />
            <meshBasicMaterial
              color={planetColor}
              transparent
              opacity={0.3}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Ring system for gas giants */}
        {category === 'gas-giant' && planet.radius_earth > 8 && (
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2 + (Math.random() - 0.5) * 0.5, 0, 0]}>
            <ringGeometry args={[planetSize * 1.5, planetSize * 2.2, 32]} />
            <meshBasicMaterial
              color={new THREE.Color(planetColor).multiplyScalar(0.7)}
              transparent
              opacity={0.6}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Planet glow for selection */}
        {(isSelected || isMultiSelected || hovered) && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[planetSize * 2, 16, 16]} />
            <meshBasicMaterial
              color={isSelected ? '#ffff00' : isMultiSelected ? '#ff8800' : planetColor}
              transparent
              opacity={0.2}
            />
          </mesh>
        )}

        {/* Planet trail effect - shows orbital path */}
        {isSelected && (
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial
              color="#ffff00"
              transparent
              opacity={0.8}
            />
          </mesh>
        )}

        {/* Planet label follows the planet */}
        {(isSelected || hovered) && (
          <Text
            position={[0, planetSize + 0.5, 0]}
            fontSize={0.3}
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {planet.planet_name}
          </Text>
        )}
      </group>
    </>
  );
}

// Smooth Camera Controller with preset transitions
function CameraController() {
  const { camera } = useThree();
  const { state } = useApp();
  const transitionRef = useRef({
    isTransitioning: false,
    startPosition: new THREE.Vector3(),
    targetPosition: new THREE.Vector3(),
    startTarget: new THREE.Vector3(),
    targetTarget: new THREE.Vector3(),
    progress: 0,
    duration: 2, // seconds
  });

  // Handle camera preset changes
  useEffect(() => {
    const preset = CAMERA_PRESETS[state.cameraPreset as keyof typeof CAMERA_PRESETS];
    if (preset) {
      transitionRef.current.isTransitioning = true;
      transitionRef.current.startPosition.copy(camera.position);
      transitionRef.current.targetPosition.copy(preset.position);
      transitionRef.current.startTarget.copy(new THREE.Vector3(0, 0, 0));
      transitionRef.current.targetTarget.copy(preset.target);
      transitionRef.current.progress = 0;
    }
  }, [state.cameraPreset, camera]);

  // Handle focused planet changes (updated for centered star system)
  useEffect(() => {
    if (state.selectedPlanet && state.selectedStarSystem) {
      // Since star is now at origin (0,0,0), calculate planet position directly
      const planetIndex = state.selectedStarSystem.planets.findIndex(p => p.pl_name === state.selectedPlanet?.pl_name);
      const time = Date.now() * 0.001 * (state.viewControls.orbitSpeed as number || 1);
      
      // Get deterministic random values for this planet (same as render logic)
      const seed = state.selectedPlanet.planet_name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomAngle = (seed * 0.1) % (Math.PI * 2);
      const inclination = ((seed + state.selectedPlanet.orbital_period_days) * 0.001 % 1) * 0.3 - 0.15;
      const orbitDirection = seed % 2 === 0 ? 1 : -1;
      
      // Calculate orbital radius (same as planet component for consistency)
      const baseRadius = 1.5;
      const ringSpacing = 1.2;
      const primaryRadius = baseRadius + (planetIndex * ringSpacing);
      const periodRatio = state.selectedPlanet.orbital_period_days / 365.25;
      const periodVariation = Math.pow(Math.max(0.1, periodRatio), 1/4) * 0.3;
      const radius = Math.max(1.5, Math.min(15, primaryRadius + periodVariation));
      
      // Calculate orbital speed and current angle
      const baseSpeed = 0.02;
      const periodScale = Math.max(0.5, Math.sqrt(state.selectedPlanet.orbital_period_days * 0.001));
      const orbitalSpeed = baseSpeed / periodScale;
      const currentAngle = (time * orbitalSpeed * orbitDirection) + randomAngle;
      
      // Calculate planet position with inclination
      const eccentricity = Math.min(0.8, state.selectedPlanet.eccentricity || 0);
      const a = radius;
      const b = radius * Math.sqrt(1 - eccentricity * eccentricity);
      
      const planetX = a * Math.cos(currentAngle) * (1 - eccentricity * Math.cos(currentAngle));
      const planetZ = b * Math.sin(currentAngle);
      const planetY = Math.sin(currentAngle) * inclination * radius;
      
      const planetPosition = new THREE.Vector3(planetX, planetY, planetZ);
      
      // Calculate optimal camera position for planet viewing
      const planetRadius = Math.max(0.03, (state.selectedPlanet.radius_earth || 1) * 0.08);
      const optimalDistance = Math.max(1.0, planetRadius * 10);
      
      // Position camera at an angle that provides good view of planet and its orbit
      const cameraAngle = currentAngle + Math.PI * 0.75; // 135 degrees offset
      const cameraHeight = optimalDistance * 0.7;
      const cameraDistance = optimalDistance * 1.5;
      
      const newCameraPosition = new THREE.Vector3(
        planetX + Math.cos(cameraAngle) * cameraDistance,
        planetY + cameraHeight,
        planetZ + Math.sin(cameraAngle) * cameraDistance
      );

      transitionRef.current.isTransitioning = true;
      transitionRef.current.startPosition.copy(camera.position);
      transitionRef.current.targetPosition.copy(newCameraPosition);
      transitionRef.current.startTarget.copy(new THREE.Vector3(0, 0, 0));
      transitionRef.current.targetTarget.copy(planetPosition);
      transitionRef.current.progress = 0;
      transitionRef.current.duration = 1.5;
    }
  }, [state.selectedPlanet, state.selectedStarSystem, camera, state.viewControls.orbitSpeed]);

  // Handle focused star system changes (updated for centered star system)
  useEffect(() => {
    if (state.selectedStarSystem && !state.selectedPlanet) {
      // Star is now at origin, so focus on the system overview
      const starPosition = new THREE.Vector3(0, 0, 0);
      
      // Calculate optimal viewing distance based on system size
      const systemRadius = Math.max(3, state.selectedStarSystem.planets.length * 1.2);
      const optimalDistance = systemRadius * 2;
      
      // Position camera to show the entire star system with good perspective
      const cameraAngle = Math.PI * 0.25; // 45 degrees
      const cameraHeight = optimalDistance * 0.8;
      
      const newCameraPosition = new THREE.Vector3(
        Math.cos(cameraAngle) * optimalDistance,
        cameraHeight,
        Math.sin(cameraAngle) * optimalDistance
      );

      transitionRef.current.isTransitioning = true;
      transitionRef.current.startPosition.copy(camera.position);
      transitionRef.current.targetPosition.copy(newCameraPosition);
      transitionRef.current.startTarget.copy(new THREE.Vector3(0, 0, 0));
      transitionRef.current.targetTarget.copy(starPosition);
      transitionRef.current.progress = 0;
      transitionRef.current.duration = 2;
    }
  }, [state.selectedStarSystem, state.selectedPlanet, camera]);

  // Animation loop with smooth transitions
  useFrame((state, delta) => {
    const transition = transitionRef.current;
    
    if (transition.isTransitioning) {
      transition.progress += delta / transition.duration;
      
      if (transition.progress >= 1) {
        transition.progress = 1;
        transition.isTransitioning = false;
      }

      // Smooth interpolation using easeInOutCubic
      const t = transition.progress;
      const smoothT = t < 0.5 
        ? 4 * t * t * t 
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

      // Interpolate camera position
      camera.position.lerpVectors(
        transition.startPosition,
        transition.targetPosition,
        smoothT
      );

      // Update camera to look at target
      const currentTarget = new THREE.Vector3().lerpVectors(
        transition.startTarget,
        transition.targetTarget,
        smoothT
      );
      camera.lookAt(currentTarget);
    }
  });

  return null;
}

// Main galaxy scene
function GalaxyScene() {
  const { filteredStarSystems, state, actions } = useApp();
  const [hoveredStar, setHoveredStar] = useState<StarSystem | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<Planet | null>(null);

  // Get current star system to display
  const currentStarSystem = useMemo(() => {
    if (filteredStarSystems.length === 0) return null;
    const index = state.filters.currentStarSystemIndex % filteredStarSystems.length;
    return filteredStarSystems[index];
  }, [filteredStarSystems, state.filters.currentStarSystemIndex]);

  // Center the star at origin for better visualization
  const starPosition: [number, number, number] = [0, 0, 0];

  // Auto-select current star system when it changes
  useEffect(() => {
    if (currentStarSystem && state.selectedStarSystem?.hostname !== currentStarSystem.hostname) {
      actions.selectStarSystem(currentStarSystem);
    }
  }, [currentStarSystem, state.selectedStarSystem, actions]);

  const handleStarClick = useCallback((system: StarSystem) => {
    actions.selectStarSystem(system);
  }, [actions]);

  const handlePlanetClick = useCallback((planet: Planet, starSystem: StarSystem, event?: React.MouseEvent) => {
    if (event?.ctrlKey || event?.metaKey) {
      actions.toggleMultiSelect(planet);
    } else {
      actions.selectPlanet(planet);
      // Don't call selectStarSystem as it would override the planet selection
    }
  }, [actions]);

  return (
    <>
      <CameraController />
      
      {/* OrbitControls for manual navigation */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        zoomSpeed={0.6}
        panSpeed={0.8}
        rotateSpeed={0.4}
        minDistance={1}
        maxDistance={200}
        autoRotate={false}
        screenSpacePanning={true}
      />
      
      {/* Enhanced Lighting for better planet visibility */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4A90E2" />
      
      {/* Additional directional lights for better planet illumination */}
      <directionalLight position={[-10, 5, -5]} intensity={0.6} />
      <directionalLight position={[0, -10, 0]} intensity={0.4} />

      {/* Background stars */}
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Reference Grid (optional) */}
      {state.viewControls.showOrbits && (
        <Grid
          args={[100, 100]}
          cellSize={5}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={25}
          sectionThickness={1}
          sectionColor="#334155"
          fadeDistance={50}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      {/* Render current star system */}
      {currentStarSystem && (
        <group key={currentStarSystem.hostname}>
          {/* Star */}
          <Star
            system={currentStarSystem}
            position={starPosition}
            onClick={handleStarClick}
            onHover={setHoveredStar}
            isSelected={state.selectedStarSystem?.hostname === currentStarSystem.hostname}
          />
          
          {/* Orbital Rings - show planet orbits when enabled */}
          {state.viewControls.showOrbits && currentStarSystem.planets.map((planet, planetIndex) => {
            // Calculate same orbital radius as planets use
            const baseRadius = 1.5;
            const ringSpacing = 1.2;
            const primaryRadius = baseRadius + (planetIndex * ringSpacing);
            const periodRatio = planet.orbital_period_days / 365.25;
            const periodVariation = Math.pow(Math.max(0.1, periodRatio), 1/4) * 0.2;
            const radius = Math.max(1.5, Math.min(15, primaryRadius + periodVariation));
            
            return (
              <group key={`orbit-${currentStarSystem.hostname}-${planetIndex}-${planet.planet_name}`}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[radius - 0.02, radius + 0.02, 64]} />
                  <meshBasicMaterial 
                    color="#ffffff" 
                    transparent 
                    opacity={0.15}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>
            );
          })}
          
          {/* Planets */}
          {currentStarSystem.planets.map((planet, planetIndex) => {
            const isSelectedPlanet = state.selectedPlanet?.planet_name === planet.planet_name;
            const isMultiSelected = state.multiSelectedPlanets.some(
              p => p.planet_name === planet.planet_name
            );
            
            return (
              <PlanetComponent
                key={`${currentStarSystem.hostname}-${planet.planet_name}-${planetIndex}`}
                planet={planet}
                starSystem={currentStarSystem}
                starPosition={starPosition}
                planetIndex={planetIndex}
                onClick={handlePlanetClick}
                onHover={setHoveredPlanet}
                isSelected={isSelectedPlanet}
                isMultiSelected={isMultiSelected}
              />
            );
          })}
        </group>
      )}

      {/* Tooltip for hovered objects */}
      {(hoveredStar || hoveredPlanet) && (
        <Text
          position={[0, 30, 0]}
          fontSize={1}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {hoveredStar ? hoveredStar.hostname : hoveredPlanet?.planet_name}
        </Text>
      )}
    </>
  );
}

// Controls instructions component
function ControlsInstructions() {
  const [showInstructions, setShowInstructions] = useState(true);

  if (!showInstructions) {
    return (
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowInstructions(true)}
          className="bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg backdrop-blur-sm border border-white/20 transition-all"
        >
          Show Controls
        </button>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-xl border border-white/20 rounded-lg p-4 text-white text-sm max-w-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold">Smooth Camera Controls</h3>
        <button
          onClick={() => setShowInstructions(false)}
          className="text-white/60 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-2 text-xs">
        <div><strong>🖱️ Mouse Navigation:</strong></div>
        <div>• Left click + drag: Rotate view</div>
        <div>• Right click + drag: Pan camera</div>
        <div>• Scroll wheel: Zoom in/out</div>
        <div>• Middle click + drag: Dolly zoom</div>
        
        <div className="mt-3"><strong>🎯 Smart Focus:</strong></div>
        <div>• Click planets: Smooth focus transition</div>
        <div>• Click stars: Focus on star system</div>
        <div>• Ctrl+Click: Multi-select planets</div>
        <div>• Camera presets: Auto transitions</div>
        
        <div className="mt-3"><strong>📱 Touch Support:</strong></div>
        <div>• One finger: Rotate view</div>
        <div>• Two fingers: Pinch zoom + pan</div>
        
        <div className="mt-3"><strong>✨ Features:</strong></div>
        <div>• Smooth transitions between views</div>
        <div>• Auto-focus on selected objects</div>
        <div>• Cubic easing animations</div>
      </div>
    </div>
  );
}

// Main component
export function GalaxyCanvas() {
  const { state } = useApp();

  if (state.isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#040711]">
        <div className="text-white text-xl">Loading galaxy...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full relative bg-[#040711]">
      <Canvas
        camera={{ 
          position: [10, 10, 10], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        style={{ background: '#040711' }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: "high-performance"
        }}
      >
        <React.Suspense fallback={null}>
          <GalaxyScene />
        </React.Suspense>
      </Canvas>
      
      {/* Enhanced Controls Instructions */}
      <ControlsInstructions />

      {/* Selection info */}
      {state.multiSelectedPlanets.length > 0 && (
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md rounded-lg p-4 text-white">
          <div className="font-semibold mb-2 text-blue-400">
            Selected: {state.multiSelectedPlanets.length} planet{state.multiSelectedPlanets.length > 1 ? 's' : ''}
          </div>
          <div className="max-w-xs">
            {state.multiSelectedPlanets.slice(0, 3).map(planet => (
              <div key={planet.planet_name} className="text-xs text-slate-400 truncate">
                {planet.planet_name}
              </div>
            ))}
            {state.multiSelectedPlanets.length > 3 && (
              <div className="text-xs text-slate-500">
                +{state.multiSelectedPlanets.length - 3} more...
              </div>
            )}
          </div>
          <button
            onClick={() => state.actions?.clearMultiSelection()}
            className="text-orange-400 hover:text-orange-300 text-sm mt-2"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Canvas Info Overlay */}
      <div className="absolute bottom-4 left-4 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 text-xs text-slate-300">
        <div className="space-y-1">
          <div>🖱️ Left click: Select & focus</div>
          <div>🖱️ Ctrl+click: Multi-select</div>
          <div>🖱️ Right drag: Rotate view</div>
          <div>🖱️ Scroll: Zoom in/out</div>
          <div>🖱️ Middle drag: Pan camera</div>
          <div>✨ Smooth transitions enabled</div>
        </div>
      </div>

      {/* Performance indicator */}
      <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-sm rounded-lg px-3 py-1 text-white/60 text-xs">
        🎥 Smooth Camera System
      </div>
    </div>
  );
}