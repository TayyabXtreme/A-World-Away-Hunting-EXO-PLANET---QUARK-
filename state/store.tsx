"use client";

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { StarSystem, Planet, Filters, ViewControls, AppState, PlanetCategory } from '@/lib/types';
import exoplanetData from '@/data/exoplanets.json';

// Action types
type Action =
  | { type: 'SET_SELECTED_STAR'; payload: StarSystem | null }
  | { type: 'SET_SELECTED_PLANET'; payload: Planet | null }
  | { type: 'SET_SELECTED_STAR_SYSTEM'; payload: StarSystem | null }
  | { type: 'ADD_TO_MULTI_SELECTION'; payload: Planet }
  | { type: 'REMOVE_FROM_MULTI_SELECTION'; payload: Planet }
  | { type: 'CLEAR_MULTI_SELECTION' }
  | { type: 'ADD_TO_FAVORITES'; payload: StarSystem | Planet }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: StarSystem | Planet }
  | { type: 'UPDATE_FILTERS'; payload: Partial<Filters> }
  | { type: 'UPDATE_VIEW_CONTROLS'; payload: Partial<ViewControls> }
  | { type: 'SET_CAMERA_PRESET'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'NEXT_STAR_SYSTEM_BATCH' }
  | { type: 'PREVIOUS_STAR_SYSTEM_BATCH' }
  | { type: 'SET_STAR_SYSTEM_INDEX'; payload: number }
  | { type: 'RESET_FILTERS' };

// Initial state
const initialFilters: Filters = {
  search: '',
  temperatureRange: [2000, 10000],
  planetRadiusRange: [0.1, 30],
  orbitalPeriodRange: [0.1, 5000],
  discoveryYearRange: [1995, 2025],
  discoveryMethod: 'all',
  habitableZoneOnly: false,
  maxStarSystems: 5,
  currentStarSystemIndex: 0,
};

const initialViewControls: ViewControls = {
  showOrbits: true,
  scalePlanetSizes: true,
  starBrightness: 1.0,
  starSpacing: 50,
};

const initialState: AppState = {
  selectedStar: null,
  selectedPlanet: null,
  selectedStarSystem: null,
  multiSelectedPlanets: [],
  favorites: [],
  filters: initialFilters,
  viewControls: initialViewControls,
  cameraPreset: 'galaxy',
  isLoading: true,
  actions: undefined
};

// Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SELECTED_STAR':
      return {
        ...state,
        selectedStar: action.payload,
        selectedPlanet: null,
        selectedStarSystem: action.payload,
      };
    
    case 'SET_SELECTED_PLANET':
      return {
        ...state,
        selectedPlanet: action.payload,
        selectedStar: null,
      };
    
    case 'SET_SELECTED_STAR_SYSTEM':
      return {
        ...state,
        selectedStarSystem: action.payload,
        selectedStar: action.payload,
        selectedPlanet: null,
      };
    
    case 'ADD_TO_MULTI_SELECTION':
      if (state.multiSelectedPlanets.find(p => p.planet_name === action.payload.planet_name)) {
        return state;
      }
      return {
        ...state,
        multiSelectedPlanets: [...state.multiSelectedPlanets, action.payload],
      };
    
    case 'REMOVE_FROM_MULTI_SELECTION':
      return {
        ...state,
        multiSelectedPlanets: state.multiSelectedPlanets.filter(
          p => p.planet_name !== action.payload.planet_name
        ),
      };
    
    case 'CLEAR_MULTI_SELECTION':
      return {
        ...state,
        multiSelectedPlanets: [],
      };
    
    case 'ADD_TO_FAVORITES':
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      };
    
    case 'REMOVE_FROM_FAVORITES':
      return {
        ...state,
        favorites: state.favorites.filter(fav => {
          if ('hostname' in fav && 'hostname' in action.payload) {
            return fav.hostname !== action.payload.hostname;
          }
          if ('planet_name' in fav && 'planet_name' in action.payload) {
            return fav.planet_name !== action.payload.planet_name;
          }
          return true;
        }),
      };
    
    case 'UPDATE_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'UPDATE_VIEW_CONTROLS':
      return {
        ...state,
        viewControls: { ...state.viewControls, ...action.payload },
      };
    
    case 'SET_CAMERA_PRESET':
      return {
        ...state,
        cameraPreset: action.payload,
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    
    case 'NEXT_STAR_SYSTEM_BATCH':
      return {
        ...state,
        filters: {
          ...state.filters,
          currentStarSystemIndex: state.filters.currentStarSystemIndex + state.filters.maxStarSystems,
        },
      };
    
    case 'PREVIOUS_STAR_SYSTEM_BATCH':
      return {
        ...state,
        filters: {
          ...state.filters,
          currentStarSystemIndex: Math.max(0, state.filters.currentStarSystemIndex - state.filters.maxStarSystems),
        },
      };
    
    case 'SET_STAR_SYSTEM_INDEX':
      return {
        ...state,
        filters: {
          ...state.filters,
          currentStarSystemIndex: action.payload,
        },
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialFilters,
      };
    
    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  starSystems: StarSystem[];
  filteredStarSystems: StarSystem[];
  filteredPlanets: Planet[];
  statistics: {
    totalStars: number;
    totalPlanets: number;
    filteredPlanets: number;
  };
  actions: {
    selectStar: (star: StarSystem | null) => void;
    selectPlanet: (planet: Planet | null) => void;
    selectStarSystem: (system: StarSystem | null) => void;
    toggleMultiSelect: (planet: Planet) => void;
    clearMultiSelection: () => void;
    toggleFavorite: (item: StarSystem | Planet) => void;
    updateFilters: (filters: Partial<Filters>) => void;
    updateViewControls: (controls: Partial<ViewControls>) => void;
    setCameraPreset: (preset: string) => void;
    resetFilters: () => void;
    nextStarSystemBatch: () => void;
    previousStarSystemBatch: () => void;
    setStarSystemIndex: (index: number) => void;
  };
  utils: {
    getPlanetCategory: (planet: Planet) => PlanetCategory;
    getStarColor: (temperature: number) => string;
    isInHabitableZone: (planet: Planet) => boolean;
    isFavorite: (item: StarSystem | Planet) => boolean;
  };
}

const AppContext = createContext<AppContextType | null>(null);

// Provider
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const starSystems = exoplanetData as StarSystem[];

  // Filter star systems based on current filters and limit to maxStarSystems
  const filteredStarSystems = React.useMemo(() => {
    const allFilteredSystems = starSystems.filter(system => {
      const { filters } = state;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const hostnameMatch = system.hostname.toLowerCase().includes(searchLower);
        const planetMatch = system.planets.some(planet => 
          planet.planet_name.toLowerCase().includes(searchLower)
        );
        if (!hostnameMatch && !planetMatch) return false;
      }

      // Temperature filter
      const temp = system.star_properties.temperature_K;
      if (temp < filters.temperatureRange[0] || temp > filters.temperatureRange[1]) {
        return false;
      }

      // Check if system has planets matching other filters
      const hasMatchingPlanets = system.planets.some(planet => {
        // Planet radius filter
        if (planet.radius_earth < filters.planetRadiusRange[0] || 
            planet.radius_earth > filters.planetRadiusRange[1]) {
          return false;
        }

        // Orbital period filter
        if (planet.orbital_period_days < filters.orbitalPeriodRange[0] || 
            planet.orbital_period_days > filters.orbitalPeriodRange[1]) {
          return false;
        }

        // Discovery year filter
        if (planet.discovery_year < filters.discoveryYearRange[0] || 
            planet.discovery_year > filters.discoveryYearRange[1]) {
          return false;
        }

        // Discovery method filter
        if (filters.discoveryMethod !== 'all' && 
            planet.discovery_method !== filters.discoveryMethod) {
          return false;
        }

        // Habitable zone filter
        if (filters.habitableZoneOnly && !isInHabitableZone(planet)) {
          return false;
        }

        return true;
      });

      return hasMatchingPlanets;
    });

    // Limit to maxStarSystems and apply current index
    const { currentStarSystemIndex, maxStarSystems } = state.filters;
    const startIndex = currentStarSystemIndex;
    const endIndex = startIndex + maxStarSystems;
    
    return allFilteredSystems.slice(startIndex, endIndex);
  }, [starSystems, state.filters]);

  // Get all filtered planets
  const filteredPlanets = React.useMemo(() => {
    return filteredStarSystems.flatMap(system => system.planets);
  }, [filteredStarSystems]);

  // Statistics
  const statistics = React.useMemo(() => {
    const totalPlanets = starSystems.reduce((acc, system) => acc + system.planets.length, 0);
    return {
      totalStars: starSystems.length,
      totalPlanets,
      filteredPlanets: filteredPlanets.length,
    };
  }, [starSystems, filteredPlanets]);

  // Utility functions
  const getPlanetCategory = (planet: Planet): PlanetCategory => {
    if (planet.radius_earth > 4) return 'gas-giant';
    if (isInHabitableZone(planet)) return 'habitable';
    if (planet.equilibrium_temp_K < 200) return 'cold';
    return 'hot';
  };

  const getStarColor = (temperature: number): string => {
    if (temperature < 3700) return '#ff6b35'; // Red
    if (temperature < 5200) return '#ffa500'; // Orange
    if (temperature < 6000) return '#ffff00'; // Yellow
    if (temperature < 7500) return '#ffffff'; // White
    if (temperature < 10000) return '#add8e6'; // Light blue
    return '#0066ff'; // Blue
  };

  const isInHabitableZone = (planet: Planet): boolean => {
    return planet.equilibrium_temp_K >= 200 && planet.equilibrium_temp_K <= 320;
  };

  const isFavorite = (item: StarSystem | Planet): boolean => {
    return state.favorites.some(fav => {
      if ('hostname' in item && 'hostname' in fav) {
        return item.hostname === fav.hostname;
      }
      if ('planet_name' in item && 'planet_name' in fav) {
        return item.planet_name === fav.planet_name;
      }
      return false;
    });
  };

  // Actions
  const actions = {
    selectStar: (star: StarSystem | null) => dispatch({ type: 'SET_SELECTED_STAR', payload: star }),
    selectPlanet: (planet: Planet | null) => dispatch({ type: 'SET_SELECTED_PLANET', payload: planet }),
    selectStarSystem: (system: StarSystem | null) => dispatch({ type: 'SET_SELECTED_STAR_SYSTEM', payload: system }),
    toggleMultiSelect: (planet: Planet) => {
      if (state.multiSelectedPlanets.find(p => p.planet_name === planet.planet_name)) {
        dispatch({ type: 'REMOVE_FROM_MULTI_SELECTION', payload: planet });
      } else {
        dispatch({ type: 'ADD_TO_MULTI_SELECTION', payload: planet });
      }
    },
    clearMultiSelection: () => dispatch({ type: 'CLEAR_MULTI_SELECTION' }),
    toggleFavorite: (item: StarSystem | Planet) => {
      if (isFavorite(item)) {
        dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: item });
      } else {
        dispatch({ type: 'ADD_TO_FAVORITES', payload: item });
      }
    },
    updateFilters: (filters: Partial<Filters>) => dispatch({ type: 'UPDATE_FILTERS', payload: filters }),
    updateViewControls: (controls: Partial<ViewControls>) => dispatch({ type: 'UPDATE_VIEW_CONTROLS', payload: controls }),
    setCameraPreset: (preset: string) => dispatch({ type: 'SET_CAMERA_PRESET', payload: preset }),
    resetFilters: () => dispatch({ type: 'RESET_FILTERS' }),
    nextStarSystemBatch: () => dispatch({ type: 'NEXT_STAR_SYSTEM_BATCH' }),
    previousStarSystemBatch: () => dispatch({ type: 'PREVIOUS_STAR_SYSTEM_BATCH' }),
    setStarSystemIndex: (index: number) => dispatch({ type: 'SET_STAR_SYSTEM_INDEX', payload: index }),
  };

  // Load data and set loading to false
  useEffect(() => {
    if (starSystems.length > 0) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [starSystems]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    starSystems,
    filteredStarSystems,
    filteredPlanets,
    statistics,
    actions,
    utils: {
      getPlanetCategory,
      getStarColor,
      isInHabitableZone,
      isFavorite,
    },
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}