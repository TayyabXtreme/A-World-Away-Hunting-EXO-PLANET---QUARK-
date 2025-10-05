'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import { TelescopeFilter, UnifiedPlanet, DatasetState } from '@/lib/dataset-types';
import { loadAndUnifyDatasets } from '@/lib/dataset-utils';
import FilterSidebar from './FilterSidebar';
import PlanetDetailPanel from './PlanetDetailPanel';
import PlanetField from './PlanetField';
import LoadingOverlay from './LoadingOverlay';
import { Button } from '@/components/ui/button';
import { Search, Menu, X, Maximize2, Minimize2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function DatasetVisualizer() {
  const [state, setState] = useState<DatasetState>({
    planets: [],
    selectedPlanet: null,
    filter: 'All',
    loading: true,
    searchQuery: ''
  });
  
  const [showFilters, setShowFilters] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);


  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('DatasetVisualizer: Starting data load...');
        setState(prev => ({ ...prev, loading: true }));
        const unifiedPlanets = await loadAndUnifyDatasets();
        console.log('DatasetVisualizer: Loaded planets:', unifiedPlanets.length);
        setState(prev => ({ 
          ...prev, 
          planets: unifiedPlanets,
          loading: false 
        }));
      } catch (error) {
        console.error('DatasetVisualizer: Failed to load datasets:', error);
        setState(prev => ({ ...prev, loading: false }));
      }
    };

    loadData();
  }, []);

  const filteredPlanets = state.planets.filter(planet => {
    const matchesFilter = state.filter === 'All' || planet.telescope === state.filter;
    const matchesSearch = !state.searchQuery || 
      planet.name.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      (planet.hostname && planet.hostname.toLowerCase().includes(state.searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const handlePlanetSelect = useCallback((planet: UnifiedPlanet | null) => {
    console.log('DatasetVisualizer: Planet selected:', planet?.name || 'null');
    setState(prev => ({ ...prev, selectedPlanet: planet }));
    setShowDetails(!!planet);
    console.log('DatasetVisualizer: Details panel should be:', !!planet ? 'visible' : 'hidden');
  }, []);

  const handleFilterChange = useCallback((filter: TelescopeFilter) => {
    setState(prev => {
      const newFilteredPlanets = prev.planets.filter(planet => {
        const matchesFilter = filter === 'All' || planet.telescope === filter;
        const matchesSearch = !prev.searchQuery || 
          planet.name.toLowerCase().includes(prev.searchQuery.toLowerCase()) ||
          (planet.hostname && planet.hostname.toLowerCase().includes(prev.searchQuery.toLowerCase()));
        return matchesFilter && matchesSearch;
      });
      

      const selectedPlanetStillVisible = prev.selectedPlanet && 
        newFilteredPlanets.some(p => p.id === prev.selectedPlanet?.id);
      
      const newSelectedPlanet = selectedPlanetStillVisible ? prev.selectedPlanet : null;
      
 
      if (!newSelectedPlanet) {
        setShowDetails(false);
      }
      
      return { 
        ...prev, 
        filter,
        selectedPlanet: newSelectedPlanet
      };
    });
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setState(prev => {
      // Check if currently selected planet would still be visible with new search
      const newFilteredPlanets = prev.planets.filter(planet => {
        const matchesFilter = prev.filter === 'All' || planet.telescope === prev.filter;
        const matchesSearch = !query || 
          planet.name.toLowerCase().includes(query.toLowerCase()) ||
          (planet.hostname && planet.hostname.toLowerCase().includes(query.toLowerCase()));
        return matchesFilter && matchesSearch;
      });
      
      // Only deselect planet if it's no longer visible
      const selectedPlanetStillVisible = prev.selectedPlanet && 
        newFilteredPlanets.some(p => p.id === prev.selectedPlanet?.id);
      
      const newSelectedPlanet = selectedPlanetStillVisible ? prev.selectedPlanet : null;
      
      // Update details panel visibility
      if (!newSelectedPlanet) {
        setShowDetails(false);
      }
      
      return { 
        ...prev, 
        searchQuery: query,
        selectedPlanet: newSelectedPlanet
      };
    });
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const planetCounts = {
    All: state.planets.length,
    K2: state.planets.filter(p => p.telescope === 'K2').length,
    Kepler: state.planets.filter(p => p.telescope === 'Kepler').length,
    TESS: state.planets.filter(p => p.telescope === 'TESS').length
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Loading Overlay */}
      <AnimatePresence>
        {state.loading && (
          <LoadingOverlay 
            progress={0} 
            message="Loading exoplanet datasets..."
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        className="absolute top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-md border-b border-gray-700/30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-white hover:bg-white/10"
            >
              {showFilters ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Exoplanet Observatory
              </div>
              <div className="text-sm text-gray-400">
                {filteredPlanets.length.toLocaleString()} planets
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search planets..."
                value={state.searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 w-64 bg-black/40 border-gray-600/50 text-white placeholder-gray-400
                  focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
              />
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/10"
            >
              {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Filter Sidebar */}
      <AnimatePresence>
        {showFilters && (
          <FilterSidebar
            currentFilter={state.filter}
            planetCounts={planetCounts}
            onFilterChange={handleFilterChange}
            onClose={() => setShowFilters(false)}
          />
        )}
      </AnimatePresence>

      {/* 3D Visualization */}
      <div className="absolute inset-0 pt-16">
        <Canvas
          camera={{ position: [0, 50, 100], fov: 60 }}
          style={{ background: 'transparent' }}
          gl={{ antialias: true, alpha: true }}
        >
          {/* Camera with smooth controls */}
          <PerspectiveCamera makeDefault position={[0, 50, 100]} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={10}
            maxDistance={500}
            autoRotate={false}
            autoRotateSpeed={0.5}
          />

          {/* Lighting */}
          <ambientLight intensity={0.3} />
          <pointLight position={[100, 100, 100]} intensity={1} />
          <pointLight position={[-100, -100, -100]} intensity={0.5} color="#4338ca" />

          {/* Star field background */}
          <Stars 
            radius={300} 
            depth={50} 
            count={3000} 
            factor={6} 
            saturation={0} 
            fade 
            speed={0.5}
          />

          {/* Planet field */}
          <PlanetField
            planets={filteredPlanets}
            selectedPlanet={state.selectedPlanet}
            onPlanetSelect={handlePlanetSelect}
          />
        </Canvas>
      </div>

      {/* Planet Detail Panel */}
      <AnimatePresence>
        {showDetails && state.selectedPlanet && (
          <PlanetDetailPanel
            planet={state.selectedPlanet}
            onClose={() => {
              handlePlanetSelect(null);
              setShowDetails(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Debug info - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-20 left-4 z-50 bg-black/80 p-4 rounded text-white text-sm">
          <div>Loading: {state.loading ? 'Yes' : 'No'}</div>
          <div>Total Planets: {state.planets.length}</div>
          <div>Filtered: {filteredPlanets.length}</div>
          <div>Filter: {state.filter}</div>
          <div>Search: {state.searchQuery || 'None'}</div>
          <div>Selected Planet: {state.selectedPlanet?.name || 'None'}</div>
          <div>Show Details: {showDetails ? 'Yes' : 'No'}</div>
          <div>Panel Should Show: {(showDetails && state.selectedPlanet) ? 'Yes' : 'No'}</div>
        </div>
      )}

      {/* Stats Footer */}
      <motion.div 
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      >
        <div className="bg-black/40 backdrop-blur-md rounded-lg px-6 py-3 border border-gray-700/30">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-blue-300">K2: {planetCounts.K2.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-green-300">Kepler: {planetCounts.Kepler.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-red-300">TESS: {planetCounts.TESS.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}