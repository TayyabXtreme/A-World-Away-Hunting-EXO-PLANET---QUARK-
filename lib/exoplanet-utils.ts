import { StarSystem, Planet, PlanetCategory } from '@/lib/types';

/**
 * Interface for filter criteria
 */
export interface FilterCriteria {
  temperatureRange?: {
    min: number;
    max: number;
  };
  radiusRange?: {
    min: number;
    max: number;
  };
  planetCategory?: PlanetCategory[];
  discoveryMethod?: string[];
  discoveryYear?: {
    min: number;
    max: number;
  };
  habitableOnly?: boolean;
}


export function getStarColorFromTemperature(temperature: number): string {
 
  if (temperature < 2400) return '#ff4500';
  if (temperature < 3700) return '#ff6b35'; 
  if (temperature < 5200) return '#ffa500';
  if (temperature < 6000) return '#ffff00';
  if (temperature < 7500) return '#ffffff';
  if (temperature < 10000) return '#add8e6';
  if (temperature < 30000) return '#0066ff'; 
  return '#8a2be2'; 
}


export function categorizePlanet(planet: Planet): PlanetCategory {
  const { radius_earth, equilibrium_temp_K } = planet;
  
  
  if (radius_earth > 4) {
    return 'gas-giant';
  }
  
  if (equilibrium_temp_K >= 200 && equilibrium_temp_K <= 320) {
    return 'habitable';
  }
  
  if (equilibrium_temp_K < 200) {
    return 'cold';
  }
  
  return 'hot';
}


export function isInHabitableZone(planet: Planet): boolean {
  const temp = planet.equilibrium_temp_K;
  return temp >= 200 && temp <= 320; 
}


export function calculateOrbitalRadius(orbitalPeriodDays: number, stellarMass: number = 1): number {
 
  const period = orbitalPeriodDays / 365.25; 
  const radius = Math.pow(period * period * stellarMass, 1/3);
  
  return Math.max(2, Math.min(50, radius * 5));
}


export function generateGalaxyPositions(count: number, spread: number = 100): Array<[number, number, number]> {
  const positions: Array<[number, number, number]> = [];
  
  for (let i = 0; i < count; i++) {
   
    const armIndex = i % 4; 
    const armAngle = (armIndex * Math.PI) / 2;
    const spiralAngle = (i / count) * Math.PI * 6 + armAngle;
    
    const distance = Math.sqrt(i / count) * spread;
    const randomOffset = (Math.random() - 0.5) * 10;
    
    const x = Math.cos(spiralAngle) * (distance + randomOffset);
    const z = Math.sin(spiralAngle) * (distance + randomOffset);
    const y = (Math.random() - 0.5) * 5; 
    
    positions.push([x, y, z]);
  }
  
  return positions;
}


export function calculatePlanetRenderSize(radiusEarth: number, scalingEnabled: boolean = true): number {
  if (!scalingEnabled) {
    return 0.1; 
  }
  
  const logRadius = Math.log10(radiusEarth + 1);
  return Math.max(0.05, Math.min(1.0, logRadius * 0.3));
}

export function calculateStarRenderSize(radiusSolar: number): number {

  const logRadius = Math.log10(radiusSolar + 1);
  return Math.max(0.2, Math.min(3.0, logRadius * 1.5));
}

/**
 * Format numbers with appropriate precision and units
 */
export const formatters = {
  temperature: (temp: number) => `${Math.round(temp).toLocaleString()} K`,
  radius: (radius: number) => `${radius.toFixed(2)} R⊕`,
  mass: (mass: number) => `${mass.toFixed(2)} M⊕`,
  solarRadius: (radius: number) => `${radius.toFixed(2)} R☉`,
  solarMass: (mass: number) => `${mass.toFixed(2)} M☉`,
  distance: (distance: number) => `${distance.toFixed(1)} pc`,
  period: (period: number) => `${period.toFixed(2)} days`,
  year: (year: number) => year.toString(),
  percentage: (value: number) => `${(value * 100).toFixed(1)}%`,
};

/**
 * Debounce function for search and filter inputs
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Calculate statistics for filtered data
 */
export function calculateStatistics(starSystems: StarSystem[]) {
  const stats = {
    totalStars: starSystems.length,
    totalPlanets: 0,
    habitablePlanets: 0,
    gasGiants: 0,
    rockyPlanets: 0,
    averageTemperature: 0,
    averagePlanetRadius: 0,
    discoveryMethods: new Set<string>(),
    discoveryYears: new Set<number>(),
  };

  let tempSum = 0;
  let radiusSum = 0;
  let planetCount = 0;

  starSystems.forEach(system => {
    system.planets.forEach(planet => {
      planetCount++;
      tempSum += planet.equilibrium_temp_K;
      radiusSum += planet.radius_earth;
      
      if (isInHabitableZone(planet)) {
        stats.habitablePlanets++;
      }
      
      if (planet.radius_earth > 4) {
        stats.gasGiants++;
      } else {
        stats.rockyPlanets++;
      }
      
      stats.discoveryMethods.add(planet.discovery_method);
      stats.discoveryYears.add(planet.discovery_year);
    });
  });

  stats.totalPlanets = planetCount;
  stats.averageTemperature = planetCount > 0 ? tempSum / planetCount : 0;
  stats.averagePlanetRadius = planetCount > 0 ? radiusSum / planetCount : 0;

  return stats;
}


export function filterStarSystems(
  starSystems: StarSystem[],
  searchTerm: string,
  filters?: FilterCriteria
): StarSystem[] {
  return starSystems.filter(system => {

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const hostnameMatch = system.hostname.toLowerCase().includes(searchLower);
      const planetMatch = system.planets.some(planet =>
        planet.planet_name.toLowerCase().includes(searchLower)
      );
      if (!hostnameMatch && !planetMatch) return false;
    }

    if (filters) {
   
      if (filters.temperatureRange) {
        const starTemp = system.star_properties.temperature_K;
        if (starTemp < filters.temperatureRange.min || starTemp > filters.temperatureRange.max) {
          return false;
        }
      }

     
      if (filters.habitableOnly) {
        const hasHabitablePlanet = system.planets.some(planet => isInHabitableZone(planet));
        if (!hasHabitablePlanet) return false;
      }

      if (filters.discoveryMethod && filters.discoveryMethod.length > 0) {
        const hasMatchingMethod = system.planets.some(planet =>
          filters.discoveryMethod!.includes(planet.discovery_method)
        );
        if (!hasMatchingMethod) return false;
      }

      if (filters.discoveryYear) {
        const hasMatchingYear = system.planets.some(planet =>
          planet.discovery_year >= filters.discoveryYear!.min &&
          planet.discovery_year <= filters.discoveryYear!.max
        );
        if (!hasMatchingYear) return false;
      }
    }
    
    return true;
  });
}

/**
 * Sort star systems by various criteria
 */
export function sortStarSystems(
  starSystems: StarSystem[],
  sortBy: 'name' | 'distance' | 'temperature' | 'planets',
  sortOrder: 'asc' | 'desc' = 'asc'
): StarSystem[] {
  const sorted = [...starSystems].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.hostname.localeCompare(b.hostname);
        break;
      case 'distance':
        comparison = a.star_properties.distance_pc - b.star_properties.distance_pc;
        break;
      case 'temperature':
        comparison = a.star_properties.temperature_K - b.star_properties.temperature_K;
        break;
      case 'planets':
        comparison = a.planets.length - b.planets.length;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}


export function celestialToCartesian(
  ra: number,
  dec: number,
  distance: number
): [number, number, number] {
 
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  
  const x = distance * Math.cos(decRad) * Math.cos(raRad);
  const y = distance * Math.sin(decRad);
  const z = distance * Math.cos(decRad) * Math.sin(raRad);
  
  const scale = 0.1;
  return [x * scale, y * scale, z * scale];
}


export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}


export function smoothstep(min: number, max: number, value: number): number {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}