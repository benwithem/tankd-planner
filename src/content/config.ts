import { defineCollection, z } from 'astro:content';
import {
  CARE_LEVELS,
  TEMPERAMENTS,
  WATER_TYPES,
  LIGHT_REQUIREMENTS,
  PLANT_PLACEMENT,
  EQUIPMENT_CATEGORIES,
  CHEMICAL_CATEGORIES,
  TANK_PROFILES,
  SUBSTRATE_TYPES,
  CO2_REQUIREMENTS,
  LIGHTING_LEVELS
} from '@/lib/constants';

const equipmentCollection = defineCollection({
  schema: z.object({
    name: z.string(),
    category: z.enum(['filter', 'heater', 'lighting', 'CO2', 'other']),
    manufacturer: z.string(),
    model: z.string().optional(),
    supportedTankSize: z.tuple([z.number(), z.number()]),
    waterType: z.enum(['freshwater', 'saltwater', 'brackish']),
    specifications: z.object({
      power: z.number().optional(),
      flowRate: z.number().optional(),
      voltage: z.number().optional()
    }).optional(),
    features: z.array(z.string()).optional(),
    idealUseCase: z.enum(['beginner', 'community', 'reef', 'planted', 'high-tech']).optional(),
    isPlantedTankCompatible: z.boolean().optional(),
    supportedTankProfiles: z.array(z.enum(['Standard', 'Long', 'Tall', 'Cube', 'Rimless', 'AllInOne', 'Planted'])).optional(),
    compatibilityNotes: z.string().optional(),
    image: z.string().optional()
  })
});

const chemicalCollection = defineCollection({
  schema: z.object({
    name: z.string(),
    manufacturer: z.string(),
    category: z.enum(['water conditioner', 'fertilizer', 'medication', 'supplement', 'other']),
    dosageInstructions: z.string().optional(),
    waterType: z.enum(['freshwater', 'saltwater', 'brackish']),
    isPlantedTankCompatible: z.boolean().optional(),
    supportedTankProfiles: z.array(z.enum(['Standard', 'Long', 'Tall', 'Cube', 'Rimless', 'AllInOne', 'Planted'])).optional(),
    compatibilityNotes: z.string().optional(),
    warnings: z.string().optional(),
    image: z.string().optional()
  })
});

const fishCollection = defineCollection({
  schema: z.object({
    commonName: z.string(),
    scientificName: z.string(),
    careLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    temperament: z.enum(['peaceful', 'semi-aggressive', 'aggressive']),
    tankSize: z.object({
      minimum: z.number(),
      recommended: z.number()
    }),
    waterParameters: z.object({
      temperature: z.tuple([z.number(), z.number()]),
      pH: z.tuple([z.number(), z.number()]),
      hardness: z.tuple([z.number(), z.number()]).optional()
    }),
    waterType: z.enum(['freshwater', 'saltwater', 'brackish']),
    compatibility: z.object({
      shrimp: z.union([z.boolean(), z.literal('caution')]),
      plants: z.boolean(),
      incompatibleWith: z.array(z.string()).optional()
    }),
    image: z.string().optional(),
    thumbnail: z.string().optional()
  })
});

const plantCollection = defineCollection({
  schema: z.object({
    commonName: z.string(),
    scientificName: z.string(),
    careLevel: z.enum(['beginner', 'intermediate', 'advanced']),
    tankSize: z.object({
      minimum: z.number(),
      recommended: z.number()
    }),
    waterParameters: z.object({
      temperature: z.tuple([z.number(), z.number()]),
      pH: z.tuple([z.number(), z.number()]),
      hardness: z.tuple([z.number(), z.number()]).optional()
    }),
    lighting: z.enum(['low', 'medium', 'high']),
    substrate: z.array(z.enum(['sand', 'gravel', 'aqua soil', 'clay', 'bare bottom'])),
    co2: z.enum(['none', 'optional', 'required']),
    image: z.string(),
    thumbnail: z.string()
  }).strict()
});

const tankMatesCollection = defineCollection({
  schema: z.object({
    commonName: z.string(),
    scientificName: z.string(),
    type: z.enum(['shrimp', 'snail']),
    temperament: z.enum(['peaceful', 'semi-aggressive', 'aggressive']),
    tankSize: z.object({
      minimum: z.number(),
      recommended: z.number()
    }),
    waterParameters: z.object({
      temperature: z.tuple([z.number(), z.number()]),
      pH: z.tuple([z.number(), z.number()]),
      hardness: z.tuple([z.number(), z.number()]).optional()
    }),
    compatibility: z.object({
      fish: z.union([z.boolean(), z.literal('caution')]),
      shrimp: z.union([z.boolean(), z.literal('caution')]),
      plants: z.boolean()
    }),
    diet: z.string().optional(),
    image: z.string().optional(),
    thumbnail: z.string().optional()
  })
});

const tankCollection = defineCollection({
  schema: z.object({
    name: z.string(),
    profile: z.enum(['Standard', 'Shallow', 'Cube', 'Nano']),
    lengthInches: z.number(),
    widthInches: z.number(),
    heightInches: z.number(),
    glassThicknessMM: z.number(),
    volumeGallons: z.number(),
    image: z.string().optional(),
    thumbnail: z.string().optional()
  })
});

export const collections = {
  equipment: equipmentCollection,
  chemicals: chemicalCollection,
  fish: fishCollection,
  plants: plantCollection,
  'tank-mates': tankMatesCollection,
  tanks: tankCollection
};