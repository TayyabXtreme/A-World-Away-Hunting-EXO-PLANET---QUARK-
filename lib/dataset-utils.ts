import { K2Planet, KeplerPlanet, TessPlanet, UnifiedPlanet } from './dataset-types';

// Convert RA/Dec to 3D Cartesian coordinates
function sphericalToCartesian(ra: number, dec: number, distance: number = 100): [number, number, number] {
  const raRad = (ra * Math.PI) / 180;
  const decRad = (dec * Math.PI) / 180;
  
  const x = distance * Math.cos(decRad) * Math.cos(raRad);
  const y = distance * Math.sin(decRad);
  const z = distance * Math.cos(decRad) * Math.sin(raRad);
  
  return [x, y, z];
}

// Normalize data across different telescopes
function normalizeK2Planet(planet: K2Planet, index: number): UnifiedPlanet {
  const [x, y, z] = sphericalToCartesian(planet.ra, planet.dec, planet.sy_dist / 10);
  
  return {
    id: `k2-${index}`,
    name: planet.pl_name,
    hostname: planet.hostname,
    telescope: 'K2',
    disposition: planet.disposition,
    period: planet.pl_orbper,
    radius: planet.pl_rade,
    temperature: planet.pl_eqt,
    insolation: planet.pl_insol,
    starTemp: planet.st_teff,
    starRadius: planet.st_rad,
    starMass: planet.st_mass,
    ra: planet.ra,
    dec: planet.dec,
    distance: planet.sy_dist,
    x,
    y,
    z
  };
}

function normalizeKeplerPlanet(planet: KeplerPlanet, index: number): UnifiedPlanet {
  // Estimate distance for 3D positioning (Kepler doesn't have distance data)
  const estimatedDistance = 100 + (index % 200); // Spread planets in layers
  const [x, y, z] = sphericalToCartesian(planet.ra, planet.dec, estimatedDistance);
  
  return {
    id: `kepler-${index}`,
    name: planet.kepler_name || planet.kepoi_name,
    hostname: planet.kepler_name?.split(' ')[0] || 'Unknown',
    telescope: 'Kepler',
    disposition: planet.koi_disposition,
    period: planet.koi_period,
    radius: planet.koi_prad,
    temperature: planet.koi_teq,
    insolation: planet.koi_insol,
    starTemp: planet.koi_steff,
    starRadius: planet.koi_srad,
    ra: planet.ra,
    dec: planet.dec,
    distance: estimatedDistance,
    x,
    y,
    z
  };
}

function normalizeTessPlanet(planet: TessPlanet, index: number): UnifiedPlanet {
  const [x, y, z] = sphericalToCartesian(planet.ra, planet.dec, planet.st_dist / 10);
  
  return {
    id: `tess-${index}`,
    name: `TOI-${planet.toi}`,
    hostname: `TOI-${Math.floor(planet.toi)}`,
    telescope: 'TESS',
    disposition: planet.tfopwg_disp,
    period: planet.pl_orbper,
    radius: planet.pl_rade,
    temperature: planet.pl_eqt,
    insolation: planet.pl_insol,
    starTemp: planet.st_teff,
    starRadius: planet.st_rad,
    ra: planet.ra,
    dec: planet.dec,
    distance: planet.st_dist,
    x,
    y,
    z
  };
}

export async function loadAndUnifyDatasets(): Promise<UnifiedPlanet[]> {
  const allPlanets: UnifiedPlanet[] = [];
  
  try {
    console.log('Loading datasets...');
    
    // Load datasets with error handling
    const [k2Response, keplerResponse, tessResponse] = await Promise.allSettled([
      fetch('/k2.json').then(res => {
        if (!res.ok) {
          throw new Error(`K2 fetch failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      }),
      fetch('/kepler.json').then(res => {
        if (!res.ok) {
          throw new Error(`Kepler fetch failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      }),
      fetch('/tess.json').then(res => {
        if (!res.ok) {
          throw new Error(`TESS fetch failed: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
    ]);

    // Process K2 data
    if (k2Response.status === 'fulfilled') {
      const k2Data: K2Planet[] = k2Response.value;
      if (Array.isArray(k2Data)) {
        // Limit to first 500 for performance
        const k2Planets = k2Data.slice(0, 500).map(normalizeK2Planet);
        allPlanets.push(...k2Planets);
        console.log(`Loaded ${k2Planets.length} K2 planets`);
      } else {
        console.error('K2 data is not an array:', typeof k2Data);
      }
    } else {
      console.error('Failed to load K2 data:', k2Response.reason);
    }

    // Process Kepler data
    if (keplerResponse.status === 'fulfilled') {
      const keplerData: KeplerPlanet[] = keplerResponse.value;
      if (Array.isArray(keplerData)) {
        // Limit to first 500 for performance
        const keplerPlanets = keplerData.slice(0, 500).map(normalizeKeplerPlanet);
        allPlanets.push(...keplerPlanets);
        console.log(`Loaded ${keplerPlanets.length} Kepler planets`);
      } else {
        console.error('Kepler data is not an array:', typeof keplerData);
      }
    } else {
      console.error('Failed to load Kepler data:', keplerResponse.reason);
    }

    // Process TESS data
    if (tessResponse.status === 'fulfilled') {
      const tessData: TessPlanet[] = tessResponse.value;
      if (Array.isArray(tessData)) {
        // Limit to first 500 for performance
        const tessPlanets = tessData.slice(0, 500).map(normalizeTessPlanet);
        allPlanets.push(...tessPlanets);
        console.log(`Loaded ${tessPlanets.length} TESS planets`);
      } else {
        console.error('TESS data is not an array:', typeof tessData);
      }
    } else {
      console.error('Failed to load TESS data:', tessResponse.reason);
    }

    // If no data loaded, create some sample data for testing
    if (allPlanets.length === 0) {
      console.warn('No real data loaded, creating sample planets for testing...');
      allPlanets.push(...createSamplePlanets());
    }

    console.log(`Total planets loaded: ${allPlanets.length}`);
    return allPlanets;
    
  } catch (error) {
    console.error('Error loading datasets:', error);
    // Return sample data as fallback
    console.log('Using sample data as fallback...');
    return createSamplePlanets();
  }
}

// Create sample planets for testing
function createSamplePlanets(): UnifiedPlanet[] {
  const samplePlanets: UnifiedPlanet[] = [];
  
  // Create some sample planets from each telescope
  const telescopes: Array<'K2' | 'Kepler' | 'TESS'> = ['K2', 'Kepler', 'TESS'];
  
  for (let i = 0; i < 50; i++) {
    const telescope = telescopes[i % 3];
    const angle = (i / 50) * Math.PI * 2;
    const radius = 50 + (i % 3) * 20;
    
    samplePlanets.push({
      id: `sample-${telescope.toLowerCase()}-${i}`,
      name: `${telescope} Sample ${i + 1}`,
      hostname: `Sample Star ${i + 1}`,
      telescope,
      disposition: i % 2 === 0 ? 'CONFIRMED' : 'CANDIDATE',
      period: 10 + Math.random() * 365,
      radius: 0.5 + Math.random() * 3,
      temperature: 200 + Math.random() * 1500,
      insolation: Math.random() * 100,
      starTemp: 3000 + Math.random() * 4000,
      starRadius: 0.5 + Math.random() * 2,
      starMass: 0.5 + Math.random() * 1.5,
      ra: Math.random() * 360,
      dec: (Math.random() - 0.5) * 180,
      distance: 10 + Math.random() * 500,
      x: Math.cos(angle) * radius,
      y: (Math.random() - 0.5) * 20,
      z: Math.sin(angle) * radius
    });
  }
  
  return samplePlanets;
}

// Get planet color based on temperature
export function getPlanetColor(temperature: number): string {
  if (temperature < 300) return '#6366f1'; // Cool - blue
  if (temperature < 600) return '#10b981'; // Temperate - green  
  if (temperature < 1000) return '#f59e0b'; // Warm - yellow
  if (temperature < 1500) return '#ef4444'; // Hot - red
  return '#ec4899'; // Very hot - pink
}

// Get planet size based on radius (clamped for visualization)
export function getPlanetSize(radius: number): number {
  // Clamp radius between 0.1 and 3.0 for reasonable visualization
  const clampedRadius = Math.max(0.1, Math.min(radius, 5.0));
  return 0.5 + (clampedRadius * 0.3); // Scale to reasonable 3D sizes
}

// Get telescope-specific styling
export function getTelescopeStyle(telescope: 'K2' | 'Kepler' | 'TESS') {
  switch (telescope) {
    case 'K2':
      return {
        primaryColor: '#3b82f6', // Blue
        secondaryColor: '#1d4ed8',
        glowColor: '#60a5fa'
      };
    case 'Kepler':
      return {
        primaryColor: '#10b981', // Green
        secondaryColor: '#047857',
        glowColor: '#34d399'
      };
    case 'TESS':
      return {
        primaryColor: '#ef4444', // Red
        secondaryColor: '#dc2626',
        glowColor: '#f87171'
      };
    default:
      return {
        primaryColor: '#6b7280',
        secondaryColor: '#374151',
        glowColor: '#9ca3af'
      };
  }
}