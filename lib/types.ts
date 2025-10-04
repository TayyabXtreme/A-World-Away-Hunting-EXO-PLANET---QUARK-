export interface StarProperties {
  spectral_type: string;
  temperature_K: number;
  radius_solar: number;
  mass_solar: number;
  metallicity: number;
  ra_deg: number;
  dec_deg: number;
  distance_pc: number;
}

export interface Planet {
  pl_name: string;
  pl_rade: number;
  planet_name: string;
  orbital_period_days: number;
  radius_earth: number;
  mass_earth: number;
  equilibrium_temp_K: number;
  insolation_earth: number;
  eccentricity: number;
  discovery_method: string;
  discovery_year: number;
}

export interface StarSystem {
  hostname: string;
  star_properties: StarProperties;
  planets: Planet[];
}

export interface Filters {
  search: string;
  temperatureRange: [number, number];
  planetRadiusRange: [number, number];
  orbitalPeriodRange: [number, number];
  discoveryYearRange: [number, number];
  discoveryMethod: string;
  habitableZoneOnly: boolean;
  maxStarSystems: number;
  currentStarSystemIndex: number;
}

export interface ViewControls {
  orbitSpeed: unknown;
  showOrbits: boolean;
  scalePlanetSizes: boolean;
  starBrightness: number;
  starSpacing: number;
}

export interface CameraPreset {
  name: string;
  position: [number, number, number];
  target: [number, number, number];
}

export interface AppState {
  actions: Record<string, (...args: unknown[]) => unknown>;
  selectedStar: StarSystem | null;
  selectedPlanet: Planet | null;
  selectedStarSystem: StarSystem | null;
  multiSelectedPlanets: Planet[];
  favorites: (StarSystem | Planet)[];
  filters: Filters;
  viewControls: ViewControls;
  cameraPreset: string;
  isLoading: boolean;
}

export type PlanetCategory = 'cold' | 'hot' | 'habitable' | 'gas-giant';