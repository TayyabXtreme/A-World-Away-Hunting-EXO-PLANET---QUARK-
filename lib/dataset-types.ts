export interface K2Planet {
  pl_name: string;
  hostname: string;
  disposition: string;
  pl_orbper: number;
  pl_rade: number;
  pl_insol: number;
  pl_eqt: number;
  st_teff: number;
  st_rad: number;
  st_mass: number;
  st_logg: number;
  ra: number;
  dec: number;
  sy_dist: number;
}

export interface KeplerPlanet {
  kepid: number;
  kepoi_name: string;
  kepler_name: string;
  koi_disposition: string;
  koi_pdisposition: string;
  koi_score: number;
  koi_period: number;
  koi_time0bk: number;
  koi_impact: number;
  koi_duration: number;
  koi_depth: number;
  koi_prad: number;
  koi_teq: number;
  koi_insol: number;
  koi_steff: number;
  koi_slogg: number;
  koi_srad: number;
  ra: number;
  dec: number;
  koi_dor?: number;
  koi_eccen?: number;
}

export interface TessPlanet {
  toi: number;
  tfopwg_disp: string;
  pl_orbper: number;
  pl_trandurh: number;
  pl_trandep: number;
  pl_rade: number;
  pl_insol: number;
  pl_eqt: number;
  st_teff: number;
  st_logg: number;
  st_rad: number;
  st_tmag: number;
  st_dist: number;
  ra: number;
  dec: number;
}

export interface UnifiedPlanet {
  id: string;
  name: string;
  hostname?: string;
  telescope: 'K2' | 'Kepler' | 'TESS';
  disposition: string;
  
  period: number;
  radius: number;
  temperature: number;
  insolation: number;
  
  starTemp: number;
  starRadius: number;
  starMass?: number;
  
  ra: number;
  dec: number;
  distance: number;
  
  x?: number;
  y?: number;
  z?: number;
  
  selected?: boolean;
  highlighted?: boolean;
}

export type TelescopeFilter = 'All' | 'K2' | 'Kepler' | 'TESS';

export interface DatasetState {
  planets: UnifiedPlanet[];
  selectedPlanet: UnifiedPlanet | null;
  filter: TelescopeFilter;
  loading: boolean;
  searchQuery: string;
}

export interface CameraPosition {
  x: number;
  y: number;
  z: number;
  targetX: number;
  targetY: number;
  targetZ: number;
}