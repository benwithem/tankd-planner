import type { Tank, TankDimensions } from '@/components/TankPlanner/types';

// Convert inches to centimeters
const inchesToCm = (inches: number) => inches * 2.54;

// Convert gallons to liters
const gallonsToLiters = (gallons: number) => gallons * 3.78541;

export const convertTankData = (tankData: {
  name: string;
  profile: string;
  lengthInches: number;
  widthInches: number;
  heightInches: number;
  glassThicknessMM: number;
  volumeGallons: number;
}): Tank => {
  const dimensions: TankDimensions = {
    lengthCm: inchesToCm(tankData.lengthInches),
    widthCm: inchesToCm(tankData.widthInches),
    heightCm: inchesToCm(tankData.heightInches)
  };

  return {
    name: tankData.name,
    dimensions,
    volumeLiters: gallonsToLiters(tankData.volumeGallons)
  };
};
