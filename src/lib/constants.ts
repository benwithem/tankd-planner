export const TANK_PARAMETERS = {
  TEMPERATURE: {
    MIN: 18,
    MAX: 32,
    DEFAULT: 24,
    UNIT: '°C'
  },
  PH: {
    MIN: 6.0,
    MAX: 8.5,
    DEFAULT: 7.0,
    STEP: 0.1
  },
  DIMENSIONS: {
    MIN: 1,
    MAX: 72,
    GLASS_THICKNESS: {
      MIN: 4,
      MAX: 19,
      UNIT: 'mm',
      SAFETY_FACTOR: 3.8 // Industry standard safety factor
    }
  }
} as const;

export const STOCKING_LEVELS = {
  DANGER: 90,
  WARNING: 70,
  UNIT: '%'
} as const;

export const TANK_PROFILES = {
  SHAPES: {
    STANDARD: 'Standard',
    SHALLOW: 'Shallow',
    CUBE: 'Cube',
    NANO: 'Nano',
    LONG: 'Long',
    TALL: 'Tall',
    RIMLESS: 'Rimless',
    ALL_IN_ONE: 'AllInOne'
  },
  RATIOS: {
    STANDARD: { length: 4, width: 2, height: 3 },
    LONG: { length: 6, width: 2, height: 2 },
    CUBE: { length: 1, width: 1, height: 1 },
    NANO: { length: 1, width: 1, height: 1.2 }
  }
} as const;

export const TANK_CATEGORIES = {
  NANO: { maxGallons: 15 },
  SMALL: { minGallons: 15, maxGallons: 30 },
  MEDIUM: { minGallons: 30, maxGallons: 55 },
  LARGE: { minGallons: 55, maxGallons: 125 },
  EXTRA_LARGE: { minGallons: 125 }
} as const;

export const CONVERSION_FACTORS = {
  GALLONS_TO_LITERS: 3.78541,
  CUBIC_INCHES_TO_GALLONS: 231,
  WATER_WEIGHT_LBS_PER_GALLON: 8.34,
  MM_TO_INCHES: 0.03937
} as const;

export const CARE_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
} as const;

export const TEMPERAMENTS = {
  PEACEFUL: 'peaceful',
  SEMI_AGGRESSIVE: 'semi-aggressive',
  AGGRESSIVE: 'aggressive'
} as const;

export const WATER_TYPES = {
  FRESHWATER: 'freshwater',
  SALTWATER: 'saltwater',
  BRACKISH: 'brackish'
} as const;

export const LIGHT_REQUIREMENTS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const PLANT_PLACEMENT = {
  FOREGROUND: 'foreground',
  MIDGROUND: 'midground',
  BACKGROUND: 'background'
} as const;

export const EQUIPMENT_CATEGORIES = {
  FILTER: 'filter',
  HEATER: 'heater',
  LIGHTING: 'lighting',
  CO2: 'CO2',
  OTHER: 'other'
} as const;

export const CHEMICAL_CATEGORIES = {
  WATER_CONDITIONER: 'water conditioner',
  FERTILIZER: 'fertilizer',
  MEDICATION: 'medication',
  SUPPLEMENT: 'supplement',
  OTHER: 'other'
} as const;

export const COMPATIBILITY_STATUS = {
  COMPATIBLE: true,
  INCOMPATIBLE: false,
  CAUTION: 'caution'
} as const;

export const SUBSTRATE_TYPES = {
  SAND: 'sand',
  GRAVEL: 'gravel',
  AQUA_SOIL: 'aqua soil',
  CLAY: 'clay',
  BARE_BOTTOM: 'bare bottom'
} as const;

export const CO2_REQUIREMENTS = {
  NONE: 'none',
  OPTIONAL: 'optional',
  REQUIRED: 'required'
} as const;

export const LIGHTING_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;

export const PLANT_CATEGORIES = {
  FOREGROUND: 'foreground',
  MIDGROUND: 'midground',
  BACKGROUND: 'background',
  FLOATING: 'floating',
  CARPETING: 'carpeting'
} as const;

export const BIOLOAD = {
  FACTORS: {
    FISH_SIZE: 1,
    FISH_QUANTITY: 0.8,
    PLANT_DENSITY: 0.5
  },
  THRESHOLDS: {
    SAFE: 0.7,
    WARNING: 0.85,
    CRITICAL: 0.95
  },
  MAINTENANCE: {
    WATER_CHANGE_PERCENTAGE: {
      LOW: 0.25,
      MEDIUM: 0.35,
      HIGH: 0.50
    },
    FREQUENCY_DAYS: {
      LOW: 14,
      MEDIUM: 7,
      HIGH: 3
    }
  }
} as const;

export const ERROR_MESSAGES = {
  TANK: {
    INVALID_DIMENSIONS: 'Invalid tank dimensions provided',
    VOLUME_TOO_SMALL: 'Tank volume is too small for the selected fish',
    GLASS_THICKNESS: 'Unable to calculate safe glass thickness'
  },
  COMPATIBILITY: {
    TEMPERATURE_MISMATCH: 'Temperature requirements are incompatible',
    PH_MISMATCH: 'pH requirements are incompatible',
    AGGRESSION: 'Fish temperaments are incompatible',
    SPACE: 'Insufficient space for selected fish',
    LIGHTING_MISMATCH: 'Plant lighting requirements are incompatible',
    CO2_MISMATCH: 'Plant CO2 requirements are incompatible',
    SUBSTRATE_MISMATCH: 'Plant substrate requirements are incompatible'
  },
  VALIDATION: {
    MISSING_PARAMETERS: 'Required parameters are missing',
    INVALID_RANGE: 'Value is outside acceptable range'
  }
} as const;