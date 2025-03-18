// Collections service to centralize access to collections data
import type { 
  FishData, 
  PlantData,
  TankData,
  TankParameters,
  TankDimensions,
  CareLevel,
  FishSize,
  FishTemperament,
  FishLocation,
  GrowthRate,
  LightingLevel,
  SubstrateType,
  CompatibilityLevel,
  CO2Requirement
} from '@/components/TankPlanner/types';

// Conversion helpers
const inchesToCm = (inches: number): number => inches * 2.54;
const gallonsToLiters = (gallons: number): number => gallons * 3.78541;

// Helper functions for mapping legacy values
const mapCareLevel = (level: string): CareLevel => {
  if (!level) return 'intermediate';
  
  const lowercaseLevel = level.toLowerCase();
  
  // Direct mappings for our standard values
  if (lowercaseLevel === 'beginner') return 'beginner';
  if (lowercaseLevel === 'intermediate') return 'intermediate'; 
  if (lowercaseLevel === 'advanced') return 'advanced';
  
  // Legacy mappings
  if (lowercaseLevel === 'easy') return 'beginner';
  if (lowercaseLevel === 'moderate') return 'intermediate';
  if (lowercaseLevel === 'difficult') return 'advanced';
  
  // Default fallback
  return 'intermediate';
};

const mapFishSize = (size: number): FishSize => {
  if (size <= 5) return 'small';
  if (size <= 15) return 'medium';
  return 'large';
};

const mapTemperament = (temp: string): FishTemperament => {
  switch (temp.toLowerCase()) {
    case 'peaceful':
      return 'peaceful';
    case 'aggressive':
      return 'aggressive';
    default:
      return 'semi-aggressive';
  }
};

const mapLocation = (level: string | undefined): FishLocation => {
  if (!level) return 'middle';
  
  switch (level.toLowerCase()) {
    case 'top':
      return 'top';
    case 'bottom':
      return 'bottom';
    default:
      return 'middle';
  }
};

const mapGrowthRate = (rate: string): GrowthRate => {
  switch (rate.toLowerCase()) {
    case 'fast':
      return 'fast';
    case 'slow':
      return 'slow';
    default:
      return 'medium';
  }
};

const mapLightingLevel = (level: string): LightingLevel => {
  switch (level.toLowerCase()) {
    case 'high':
      return 'high';
    case 'low':
      return 'low';
    default:
      return 'medium';
  }
};

const mapSubstrateType = (type: string): SubstrateType => {
  switch (type.toLowerCase()) {
    case 'sand':
      return 'sand';
    case 'gravel':
      return 'gravel';
    case 'soil':
      return 'soil';
    case 'aqua soil':
      return 'aqua soil';
    default:
      return 'none';
  }
};

const mapCO2Requirement = (required: boolean | string): CO2Requirement => {
  if (required === true || required === 'required') return 'required';
  if (required === 'recommended') return 'recommended';
  return 'none';
};

export function getCareLevel(level: string): CareLevel {
  switch (level.toLowerCase()) {
    case 'easy':
    case 'beginner':
      return 'beginner';
    case 'medium':
    case 'intermediate':
      return 'intermediate';
    case 'hard':
    case 'advanced':
      return 'advanced';
    default:
      return 'intermediate';
  }
}

export function convertCO2Requirement(co2: any): CO2Requirement {
  if (co2 === 'required') return 'required';
  if (co2 === 'recommended') return 'recommended';
  return 'none';
}

/**
 * Retrieves all fish from the API and transforms them into the format expected by components
 */
export async function getAllFish(): Promise<FishData[]> {
  try {
    const response = await fetch('/api/collections');
    const data = await response.json();
    return data.fish.map((fish: any) => convertFishForPlannerPage(fish));
  } catch (error) {
    console.error('Error fetching fish:', error);
    return [];
  }
}

/**
 * Transforms a fish entry into the format expected by components
 */
export const transformFishEntry = (entry: any): FishData => {
  if (!entry?.data) {
    throw new Error(`Invalid fish entry: ${JSON.stringify(entry)}`);
  }

  // Process temperature array format if needed
  let tempMin = 20;
  let tempMax = 30;
  if (Array.isArray(entry.data.waterParameters?.temperature)) {
    tempMin = entry.data.waterParameters.temperature[0];
    tempMax = entry.data.waterParameters.temperature[1];
  } else {
    tempMin = entry.data.waterParameters?.temperature?.min ?? 20;
    tempMax = entry.data.waterParameters?.temperature?.max ?? 30;
  }

  // Process pH array format if needed
  let phMin = 6.5;
  let phMax = 8.5;
  if (Array.isArray(entry.data.waterParameters?.pH)) {
    phMin = entry.data.waterParameters.pH[0];
    phMax = entry.data.waterParameters.pH[1];
  } else {
    phMin = entry.data.waterParameters?.pH?.min ?? 6.5;
    phMax = entry.data.waterParameters?.pH?.max ?? 8.5;
  }

  // Process hardness array format if needed
  let hardnessMin = undefined;
  let hardnessMax = undefined;
  if (Array.isArray(entry.data.waterParameters?.hardness)) {
    hardnessMin = entry.data.waterParameters.hardness[0];
    hardnessMax = entry.data.waterParameters.hardness[1];
  } else if (entry.data.waterParameters?.hardness) {
    hardnessMin = entry.data.waterParameters.hardness.min;
    hardnessMax = entry.data.waterParameters.hardness.max;
  }

  // Ensure shrimp compatibility is properly extracted
  let shrimpCompatibility = undefined;
  if (entry.data.compatibility?.shrimp !== undefined) {
    // Handle both boolean and 'caution' values
    shrimpCompatibility = entry.data.compatibility.shrimp;
  }

  return {
    slug: entry.slug,
    name: entry.data.commonName,
    scientificName: entry.data.scientificName,
    description: entry.data.description,
    image: entry.data.image,
    thumbnail: entry.data.thumbnail,
    waterParameters: {
      temperature: {
        min: tempMin,
        max: tempMax
      },
      pH: {
        min: phMin,
        max: phMax
      },
      hardness: hardnessMin !== undefined && hardnessMax !== undefined ? {
        min: hardnessMin,
        max: hardnessMax
      } : undefined
    },
    tankSize: {
      minimum: entry.data.tankSize?.minimum ?? 10,
      recommended: entry.data.tankSize?.recommended ?? 20
    },
    careLevel: mapCareLevel(entry.data.careLevel ?? 'intermediate'),
    size: mapFishSize(entry.data.size ?? 5),
    temperament: mapTemperament(entry.data.temperament ?? 'peaceful'),
    location: mapLocation(entry.data.swimLevel),
    isPlantSafe: entry.data.isPlantSafe ?? true,
    categories: entry.data.categories || [],
    quantity: 0,
    compatibility: {
      otherFish: entry.data.compatibility?.otherFish || {},
      plants: entry.data.compatibility?.plants,
      shrimp: shrimpCompatibility
    }
  };
};

/**
 * Transforms a plant entry into the format expected by components
 */
export const transformPlantEntry = (entry: any): any => {
  if (!entry?.data) {
    console.error('Invalid plant entry:', entry);
    throw new Error('Invalid plant entry data');
  }

  // Process temperature array format if needed
  let tempMin = 20;
  let tempMax = 30;
  if (Array.isArray(entry.data.waterParameters?.temperature)) {
    tempMin = entry.data.waterParameters.temperature[0];
    tempMax = entry.data.waterParameters.temperature[1];
  } else {
    tempMin = entry.data.waterParameters?.temperature?.min ?? 20;
    tempMax = entry.data.waterParameters?.temperature?.max ?? 30;
  }

  // Process pH array format if needed
  let phMin = 6.5;
  let phMax = 8.5;
  if (Array.isArray(entry.data.waterParameters?.pH)) {
    phMin = entry.data.waterParameters.pH[0];
    phMax = entry.data.waterParameters.pH[1];
  } else {
    phMin = entry.data.waterParameters?.pH?.min ?? 6.5;
    phMax = entry.data.waterParameters?.pH?.max ?? 8.5;
  }

  // Process hardness array format if needed
  let hardnessMin = undefined;
  let hardnessMax = undefined;
  if (Array.isArray(entry.data.waterParameters?.hardness)) {
    hardnessMin = entry.data.waterParameters.hardness[0];
    hardnessMax = entry.data.waterParameters.hardness[1];
  } else if (entry.data.waterParameters?.hardness) {
    hardnessMin = entry.data.waterParameters.hardness.min;
    hardnessMax = entry.data.waterParameters.hardness.max;
  }

  return {
    slug: entry.slug,
    name: entry.data.commonName,
    scientificName: entry.data.scientificName,
    description: entry.data.description,
    image: entry.data.image,
    thumbnail: entry.data.thumbnail,
    waterParameters: {
      temperature: {
        min: tempMin,
        max: tempMax
      },
      pH: {
        min: phMin,
        max: phMax
      },
      hardness: hardnessMin !== undefined && hardnessMax !== undefined ? {
        min: hardnessMin,
        max: hardnessMax
      } : undefined
    },
    tankSize: {
      minimum: entry.data.tankSize?.minimum ?? 10,
      recommended: entry.data.tankSize?.recommended ?? 20
    },
    careLevel: mapCareLevel(entry.data.careLevel ?? 'intermediate'),
    height: entry.data.height ?? 10,
    width: entry.data.width ?? 10,
    growthRate: mapGrowthRate(entry.data.growthRate ?? 'medium'),
    lighting: mapLightingLevel(entry.data.lighting ?? 'medium'),
    co2: convertCO2Requirement(entry.data.co2),
    substrate: (entry.data.substrate || ['none']).map(mapSubstrateType),
    categories: entry.data.categories || [],
    quantity: 0,
    compatibility: {
      otherPlants: entry.data.compatibility?.otherPlants || {},
      fish: entry.data.compatibility?.fish
    }
  };
};

/**
 * Retrieves all plants from the API and transforms them into the format expected by components
 */
export async function getAllPlants(): Promise<PlantData[]> {
  try {
    const response = await fetch('/api/collections');
    const data = await response.json();
    return data.plants.map((plant: any) => convertPlantsForPlannerPage(plant));
  } catch (error) {
    console.error('Error fetching plants:', error);
    return [];
  }
}

/**
 * Retrieves all tanks from the API and transforms them into the format expected by components
 */
export async function getAllTanks(): Promise<TankData[]> {
  try {
    const response = await fetch('/api/collections');
    const data = await response.json();
    const tanks = data.tanks.map((tank: any) => convertTanksForPlannerPage(tank));
    return tanks.length > 0 ? tanks : getStandardTanks();
  } catch (error) {
    console.error('Error fetching tanks:', error);
    return getStandardTanks();
  }
}

/**
 * Provides a list of standard tanks as a fallback
 */
export function getStandardTanks(): TankData[] {
  return [
    {
      name: 'Nano Tank',
      size: 20,
      dimensions: {
        lengthCm: 30,
        widthCm: 30,
        heightCm: 30
      },
      defaultParameters: getDefaultTankParameters(20),
      profile: 'Nano',
      description: 'Perfect for small spaces and desktop aquariums',
      volumeGallons: 5,
      volumeLiters: 20
    },
    {
      name: 'Standard 10 Gallon',
      size: 40,
      dimensions: {
        lengthCm: 50,
        widthCm: 25,
        heightCm: 30
      },
      defaultParameters: getDefaultTankParameters(40),
      profile: 'Standard',
      description: 'Classic beginner tank size',
      volumeGallons: 10,
      volumeLiters: 40
    },
    {
      name: 'Medium 20 Gallon',
      size: 75,
      dimensions: {
        lengthCm: 60,
        widthCm: 30,
        heightCm: 40
      },
      defaultParameters: getDefaultTankParameters(75),
      profile: 'Standard',
      description: 'Great size for community tanks',
      volumeGallons: 20,
      volumeLiters: 75
    },
    {
      name: 'Large 40 Gallon',
      size: 150,
      dimensions: {
        lengthCm: 90,
        widthCm: 45,
        heightCm: 45
      },
      defaultParameters: getDefaultTankParameters(150),
      profile: 'Standard',
      description: 'Excellent for larger community tanks',
      volumeGallons: 40,
      volumeLiters: 150
    }
  ];
}

/**
 * Transforms a tank entry into the format expected by components
 */
export const transformTankEntry = (entry: any): any => {
  if (!entry?.data) {
    console.error('Invalid tank entry:', entry);
    throw new Error('Invalid tank entry data');
  }

  const volumeLiters = entry.data.volumeLiters ?? entry.data.volumeGallons * 3.78541;
  
  return {
    name: entry.data.name,
    size: volumeLiters,
    dimensions: {
      lengthCm: entry.data.dimensions?.lengthCm ?? 0,
      widthCm: entry.data.dimensions?.widthCm ?? 0,
      heightCm: entry.data.dimensions?.heightCm ?? 0
    },
    defaultParameters: entry.data.defaultParameters ?? getDefaultTankParameters(volumeLiters),
    profile: entry.data.profile ?? 'Standard',
    description: entry.data.description ?? '',
    volumeGallons: entry.data.volumeGallons ?? volumeLiters / 3.78541,
    volumeLiters
  };
};

export function convertTanksForPlannerPage(tank: any): TankData {
  return tank;
}

export function getDefaultTankParameters(size: number): TankParameters {
  return {
    temperature: {
      min: 22,
      max: 26
    },
    pH: {
      min: 6.5,
      max: 7.5
    },
    size,
    co2: 'none'
  };
}

// Export the collection getter functions with the correct names
export const getFishCollection = getAllFish;
export const getPlantCollection = getAllPlants;
export const getTankCollection = getAllTanks;

export function convertFishForPlannerPage(fish: any): FishData {
  return {
    ...fish,
    careLevel: getCareLevel(fish.careLevel),
    waterParameters: {
      temperature: {
        min: fish.waterParameters?.temperature?.min ?? 22,
        max: fish.waterParameters?.temperature?.max ?? 28
      },
      pH: {
        min: fish.waterParameters?.pH?.min ?? 6.5,
        max: fish.waterParameters?.pH?.max ?? 7.5
      },
      hardness: fish.waterParameters?.hardness
    },
    compatibility: {
      ...fish.compatibility,
      shrimp: fish.compatibility?.shrimp
    }
  };
}

export function convertPlantsForPlannerPage(plant: any): PlantData {
  return {
    ...plant,
    careLevel: getCareLevel(plant.careLevel),
    waterParameters: {
      temperature: {
        min: plant.waterParameters?.temperature?.min ?? 22,
        max: plant.waterParameters?.temperature?.max ?? 28
      },
      pH: {
        min: plant.waterParameters?.pH?.min ?? 6.5,
        max: plant.waterParameters?.pH?.max ?? 7.5
      },
      hardness: plant.waterParameters?.hardness
    }
  };
}
