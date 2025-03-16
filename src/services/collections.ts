// Collections service to centralize access to Astro collections
import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import type { 
  TankItem, 
  FishData, 
  TankData, 
  TankDimensions, 
  TankParameters,
  PlantItem,
  PlantData,
  LightingLevel,
  CompatibilityLevel,
  WaterParameters,
  SubstrateType,
  CO2Requirement
} from '@/components/TankPlanner/types';
import { getValidImagePath, getEntityImages } from '@/utils/image-utils';

// Conversion helpers
const inchesToCm = (inches: number): number => inches * 2.54;
const gallonsToLiters = (gallons: number): number => gallons * 3.78541;

/**
 * Retrieves all fish from the collection and transforms them into the format expected by components
 */
export async function getAllFish(): Promise<TankItem[]> {
  try {
    const fishEntries = await getCollection('fish');
    console.log('Fish entries:', fishEntries);
    return Promise.all(fishEntries.map(async (entry) => transformFishEntry(entry)));
  } catch (error) {
    console.error('Error fetching fish collection:', error);
    return []; // Return empty array on error
  }
}

/**
 * Transforms a fish collection entry into the format expected by components
 */
export function transformFishEntry(entry: CollectionEntry<'fish'>): TankItem {
  // Get validated image paths
  const image = getValidImagePath(entry.data.image, 'fish');
  const thumbnail = getValidImagePath(entry.data.thumbnail, 'fish');

  const fishData: FishData = {
    name: entry.data.commonName,
    description: entry.data.description,
    waterParameters: {
      temperature: entry.data.waterParameters.temperature,
      pH: entry.data.waterParameters.pH,
      hardness: entry.data.waterParameters.hardness
    },
    tankSize: {
      minimum: entry.data.tankSize.minimum,
      recommended: entry.data.tankSize.recommended
    },
    compatibility: {
      plants: entry.data.compatibility.plants,
      otherFish: entry.data.compatibility.otherFish
    },
    behavior: entry.data.behavior,
    categories: entry.data.categories || [],
    bioload: entry.data.bioload || 1, // Default bioload of 1 if not specified
    size: entry.data.size || 0,
    temperament: entry.data.temperament,
    swimLevel: entry.data.swimLevel,
    maxSize: entry.data.maxSize,
    image,
    thumbnail,
    slug: entry.slug,
    quantity: 0
  };

  return {
    ...fishData,
    size: entry.data.tankSize.minimum / 10 // Convert tank size to approximate fish size
  };
}

/**
 * Retrieves all plants from the collection and transforms them into the format expected by components
 */
export async function getAllPlants(): Promise<PlantItem[]> {
  try {
    console.log('Fetching plants collection...');
    const plantEntries = await getCollection('plants');
    console.log('Plant entries:', plantEntries);
    
    // Check if we have any entries
    if (!plantEntries || plantEntries.length === 0) {
      console.warn('No plant entries found in collection');
      return [];
    }

    // Log the first entry to see its structure
    if (plantEntries[0]) {
      console.log('Sample plant entry structure:', {
        id: plantEntries[0].id,
        slug: plantEntries[0].slug,
        data: plantEntries[0].data
      });
    }

    const transformedPlants = await Promise.all(
      plantEntries.map(async (entry) => {
        try {
          return transformPlantEntry(entry);
        } catch (error) {
          console.error(`Error transforming plant entry ${entry.id}:`, error);
          return null;
        }
      })
    );

    // Filter out any null entries from failed transformations
    const validPlants = transformedPlants.filter((plant): plant is PlantItem => plant !== null);
    console.log('Valid transformed plants:', validPlants);

    return validPlants;
  } catch (error) {
    console.error('Error fetching plant collection:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    return []; // Return empty array on error
  }
}

/**
 * Transforms a plant collection entry into the format expected by components
 */
export function transformPlantEntry(entry: CollectionEntry<'plants'>): PlantItem {
  try {
    console.log('Transforming plant entry:', entry.id);
    // Get validated image paths
    const image = getValidImagePath(entry.data.image, 'plant');
    const thumbnail = getValidImagePath(entry.data.thumbnail, 'plant');
    
    const plantData: PlantData = {
      name: entry.data.commonName,
      description: entry.data.description,
      scientificName: entry.data.scientificName,
      commonName: entry.data.commonName,
      careLevel: entry.data.careLevel,
      tankSize: {
        minimum: entry.data.tankSize.minimum,
        recommended: entry.data.tankSize.recommended
      },
      waterParameters: {
        temperature: entry.data.waterParameters.temperature,
        pH: entry.data.waterParameters.pH,
        hardness: entry.data.waterParameters.hardness
      },
      lighting: entry.data.lighting,
      substrate: entry.data.substrate,
      co2: entry.data.co2,
      growth: entry.data.growth,
      image,
      thumbnail,
      slug: entry.slug,
      quantity: 0
    };

    console.log('Transformed plant data:', plantData);

    return {
      ...plantData,
    };
  } catch (error) {
    console.error('Error transforming plant entry:', entry.id);
    console.error('Error details:', error instanceof Error ? error.message : error);
    throw error;
  }
}

/**
 * Retrieves all tanks from the collection and transforms them into standard tank format
 * for use in the TankPlannerPage component
 */
export async function getAllTanks(): Promise<Array<{
  name: string;
  profile: string;
  lengthInches: number;
  widthInches: number;
  heightInches: number;
  glassThicknessMM: number;
  volumeGallons: number;
}>> {
  try {
    const tankEntries = await getCollection('tanks');
    console.log('Tank entries:', tankEntries);
    
    if (!tankEntries || tankEntries.length === 0) {
      console.warn('No tank entries found, using standard tanks');
      return getStandardTanks();
    }
    
    return tankEntries.map(entry => ({
      name: entry.data.name,
      profile: entry.data.profile,
      lengthInches: entry.data.lengthInches,
      widthInches: entry.data.widthInches,
      heightInches: entry.data.heightInches,
      glassThicknessMM: entry.data.glassThicknessMM,
      volumeGallons: entry.data.volumeGallons
    }));
  } catch (error) {
    console.error('Error fetching tank collection:', error);
    return getStandardTanks();
  }
}

/**
 * Provides a list of standard tanks as a fallback
 */
function getStandardTanks(): Array<{
  name: string;
  profile: string;
  lengthInches: number;
  widthInches: number;
  heightInches: number;
  glassThicknessMM: number;
  volumeGallons: number;
}> {
  return [
    {
      name: "30C",
      profile: "Cube",
      lengthInches: 12,
      widthInches: 12,
      heightInches: 12,
      glassThicknessMM: 5,
      volumeGallons: 7.5
    },
    {
      name: "60U",
      profile: "Standard",
      lengthInches: 23.62,
      widthInches: 14.17,
      heightInches: 14.17,
      glassThicknessMM: 6,
      volumeGallons: 20
    },
    {
      name: "90U",
      profile: "Standard",
      lengthInches: 35.43,
      widthInches: 17.72,
      heightInches: 17.72,
      glassThicknessMM: 8,
      volumeGallons: 48
    },
    {
      name: "180U",
      profile: "Long",
      lengthInches: 70.87,
      widthInches: 23.62,
      heightInches: 23.62,
      glassThicknessMM: 12,
      volumeGallons: 180
    }
  ];
}

/**
 * Converts tank data into the format expected by the TankPlannerPage component
 */
export function convertTanksForPlannerPage(tanks: Array<{
  name: string;
  profile: string;
  lengthInches: number;
  widthInches: number;
  heightInches: number;
  glassThicknessMM: number;
  volumeGallons: number;
}>): TankData[] {
  return tanks.map(tank => ({
    name: tank.name,
    dimensions: {
      lengthCm: inchesToCm(tank.lengthInches),
      widthCm: inchesToCm(tank.widthInches),
      heightCm: inchesToCm(tank.heightInches)
    },
    parameters: {
      size: Math.round(gallonsToLiters(tank.volumeGallons)),
      temperature: 25, // Default temperature
      ph: 7.0 // Default pH
    },
    profile: tank.profile,
    volumeLiters: Math.round(gallonsToLiters(tank.volumeGallons)),
    volumeGallons: tank.volumeGallons
  }));
}
