// Base interfaces
export interface WaterParameters {
  temperature: [number, number];
  pH: [number, number];
  hardness: [number, number];
}

export interface TankDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface TankParameters {
  temperature: number;
  ph: number;
  size: number;
}

export type CompatibilityLevel = 
  | 'highly-compatible'  // Fish work great together
  | 'compatible'         // Fish work well with minor considerations 
  | 'caution'            // Fish can work together with careful monitoring
  | 'incompatible'       // Fish should not be kept together
  | 'unknown';           // Not enough information

export type FishCategory = 
  | 'freshwater' 
  | 'saltwater' 
  | 'community' 
  | 'predator' 
  | 'cichlid' 
  | 'tropical' 
  | 'coldwater' 
  | 'bottom-dweller'
  | 'schooling'
  | 'centerpiece';

export type LightingLevel = 'low' | 'medium' | 'high';
export type CO2Requirement = 'none' | 'optional' | 'required';
export type SubstrateType = 'sand' | 'gravel' | 'aqua soil' | 'clay' | 'bare bottom' | 'none';

export interface BaseTankItemData {
  slug: string;
  name: string;
  description: string;
  image?: string;
  thumbnail?: string;
  waterParameters: WaterParameters;
  tankSize: {
    minimum: number;
    recommended: number;
  };
  quantity?: number;
}

export interface FishData extends BaseTankItemData {
  behavior: string[];
  size?: number;
  bioload: number;
  compatibility: {
    otherFish?: Record<string, CompatibilityLevel>;
    plants: boolean;
  };
  temperament?: 'peaceful' | 'semi-aggressive' | 'aggressive';
  careLevel?: 'easy' | 'moderate' | 'difficult';
  dimensions?: {
    length: number;
    height: number;
  };
  color?: string;
  incompatibleWith?: string[];
  swimSpeed?: 'slow' | 'medium' | 'fast';
  swimLevel?: 'top' | 'middle' | 'bottom';
  maxSize?: number;
  categories: FishCategory[];
}

export type TankItem = FishData;

export interface PlantData extends BaseTankItemData {
  scientificName: string;
  commonName: string;
  lighting: LightingLevel;
  co2: CO2Requirement;
  growth: 'slow' | 'medium' | 'fast';
  substrate: SubstrateType[];
  careLevel: 'beginner' | 'intermediate' | 'advanced';
}

export type PlantItem = PlantData;

export interface Tank {
  name: string;
  dimensions: TankDimensions;
  volumeLiters: number;
}

export interface TankData {
  name: string;
  dimensions: TankDimensions;
  parameters: TankParameters;
  profile: string;
  volumeGallons: number;
  volumeLiters: number;
}

// Popular fish combinations
export interface FishCombination {
  id: string;
  name: string;
  description: string;
  fishSlugs: string[];
}

// User preferences
export interface UserPreferences {
  favoriteFish: string[]; // Array of fish slugs
  recentSelections: string[]; // Array of recently selected fish slugs
  customCombinations: FishCombination[];
}