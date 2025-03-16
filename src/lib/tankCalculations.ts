import { TANK_PARAMETERS, CONVERSION_FACTORS } from './constants';

interface TankDimensions {
  lengthInches: number;
  widthInches: number;
  heightInches: number;
}

export function calculateTankVolume(dimensions: TankDimensions): number {
  const volumeCubicInches = dimensions.lengthInches * dimensions.widthInches * dimensions.heightInches;
  return Number((volumeCubicInches / CONVERSION_FACTORS.CUBIC_INCHES_TO_GALLONS).toFixed(2));
}

export function calculateGlassThickness(
  lengthInches: number,
  heightInches: number,
  volumeGallons: number
): number {
  // Enhanced glass thickness calculation using industry standards
  const pressure = (heightInches * 0.036127) * 1.25; // PSI with 25% safety margin
  const baseThickness = Math.sqrt(
    (pressure * Math.pow(Math.max(lengthInches, heightInches), 2)) / 
    (470 * TANK_PARAMETERS.DIMENSIONS.GLASS_THICKNESS.SAFETY_FACTOR)
  );
  
  return Math.min(
    Math.max(
      Math.ceil(baseThickness * 2) / 2, // Round up to nearest 0.5mm
      TANK_PARAMETERS.DIMENSIONS.GLASS_THICKNESS.MIN
    ),
    TANK_PARAMETERS.DIMENSIONS.GLASS_THICKNESS.MAX
  );
}

export function gallonsToLiters(gallons: number): number {
  return Number((gallons * CONVERSION_FACTORS.GALLONS_TO_LITERS).toFixed(1));
}

export function calculateStockingLevel(
  totalFishLength: number,
  tankVolume: number
): number {
  // Using the inch-per-gallon rule with adjustments
  const recommendedGallons = totalFishLength / 2;
  return Math.min(100, Math.round((recommendedGallons / tankVolume) * 100));
}

export function calculateSurfaceArea(dimensions: TankDimensions): number {
  return dimensions.lengthInches * dimensions.widthInches;
}

export function calculateWaterWeight(volumeGallons: number): number {
  return Number((volumeGallons * 8.34).toFixed(1)); // 8.34 lbs per gallon of water
}