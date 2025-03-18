// Common types
export interface WaterParameters {
  temperature: {
    min: number;
    max: number;
  };
  pH: {
    min: number;
    max: number;
  };
  hardness?: {
    min: number;
    max: number;
  };
}

export interface TankDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface TankSize {
  minimum: number;
  recommended: number;
}

export type CareLevel = 'beginner' | 'intermediate' | 'advanced';
export type FishSize = 'small' | 'medium' | 'large';
export type FishTemperament = 'peaceful' | 'semi-aggressive' | 'aggressive';
export type FishLocation = 'top' | 'middle' | 'bottom';
export type GrowthRate = 'slow' | 'medium' | 'fast';
export type LightingLevel = 'low' | 'medium' | 'high';
export type SubstrateType = 'sand' | 'gravel' | 'soil' | 'aqua soil' | 'none';
export type CO2Requirement = 'none' | 'recommended' | 'required';
export type CompatibilityLevel = 'compatible' | 'caution' | 'incompatible';

// Base interface for tank items
export interface BaseTankItemData {
  slug: string;
  name: string;
  scientificName: string;
  description: string;
  careLevel: CareLevel;
  quantity?: number;
  waterParameters: WaterParameters;
  image?: string;
  thumbnail?: string;
  tankSize: TankSize;
  categories: string[];
}

// Fish-specific interface
export interface FishData extends BaseTankItemData {
  temperament: FishTemperament;
  location: FishLocation;
  size: FishSize;
  isPlantSafe: boolean;
  schooling?: boolean;
  minSchoolSize?: number;
  compatibility?: {
    otherFish?: Record<string, CompatibilityLevel>;
    plants?: boolean;
    shrimp?: boolean | 'caution';
  };
  incompatibleWith?: string[];
  diet?: string;
  behavior?: string;
  breeding?: string;
}

// Plant-specific interface
export interface PlantData extends BaseTankItemData {
  height: number;
  width: number;
  growthRate: GrowthRate;
  lighting: LightingLevel;
  co2: CO2Requirement;
  substrate: SubstrateType[];
  compatibility?: {
    otherPlants?: Record<string, CompatibilityLevel>;
    fish?: boolean;
  };
  propagation?: string;
  placement?: string;
}

// Tank interfaces
export interface TankParameters {
  temperature: {
    min: number;
    max: number;
  };
  pH: {
    min: number;
    max: number;
  };
  hardness?: {
    min: number;
    max: number;
  };
  size: number;
  co2: CO2Requirement;
}

export interface Tank {
  name: string;
  size: number;
  dimensions: TankDimensions;
  defaultParameters: TankParameters;
  profile?: string;
  description?: string;
  volumeGallons?: number;
  volumeLiters?: number;
}

export interface TankData extends Tank {
  profile: string;
  description: string;
  volumeGallons: number;
  volumeLiters: number;
}

// Compatibility interfaces
export interface CompatibilityAnalysisProps {
  parameters: TankParameters;
  selectedFish: FishData[];
  selectedPlants: PlantData[];
  onViewDetails: (item: FishData | PlantData) => void;
}

export interface CompatibilityCardProps {
  item: FishData | PlantData;
  parameters: TankParameters;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onViewDetails: () => void;
}

export interface CompatibilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FishData | PlantData;
  parameters: TankParameters;
  selectedFish: FishData[];
  selectedPlants: PlantData[];
}

// Type guards
export const isFishData = (item: BaseTankItemData): item is FishData => {
  return 'temperament' in item && 'location' in item;
};

export const isPlantData = (item: BaseTankItemData): item is PlantData => {
  return 'growthRate' in item && 'lighting' in item;
};

// Alias types for backward compatibility
export type TankItem = FishData;
export type PlantItem = PlantData;