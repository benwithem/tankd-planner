import { TANK_CATEGORIES, TANK_PROFILES } from './constants';

export function getTankCategory(gallons: number): keyof typeof TANK_CATEGORIES {
  if (gallons <= TANK_CATEGORIES.NANO.maxGallons) return 'NANO';
  if (gallons <= TANK_CATEGORIES.SMALL.maxGallons) return 'SMALL';
  if (gallons <= TANK_CATEGORIES.MEDIUM.maxGallons) return 'MEDIUM';
  if (gallons <= TANK_CATEGORIES.LARGE.maxGallons) return 'LARGE';
  return 'EXTRA_LARGE';
}

export function calculateIdealDimensions(
  gallons: number,
  profile: keyof typeof TANK_PROFILES.SHAPES
): { length: number; width: number; height: number } {
  const ratio = TANK_PROFILES.RATIOS[profile as keyof typeof TANK_PROFILES.RATIOS] || TANK_PROFILES.RATIOS.STANDARD;
  const cubicInches = gallons * 231; // 1 gallon = 231 cubic inches
  
  const multiplier = Math.pow(
    cubicInches / (ratio.length * ratio.width * ratio.height),
    1/3
  );
  
  return {
    length: Math.round(ratio.length * multiplier),
    width: Math.round(ratio.width * multiplier),
    height: Math.round(ratio.height * multiplier)
  };
}