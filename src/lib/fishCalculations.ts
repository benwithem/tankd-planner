import type { FishData } from '@/components/TankPlanner/types';

export function calculateBioload(fish: FishData, quantity: number = 1): number {
  // Calculate bioload based on fish size and quantity
  const baseLoad = fish.data.tankSize.minimum / 10;
  return baseLoad * quantity;
}

export function calculateTotalBioload(fishGroups: Record<string, { fish: FishData; count: number }>): number {
  return Object.values(fishGroups)
    .reduce((total, { fish, count }) => total + calculateBioload(fish, count), 0);
}

export function estimateWaterChangeSchedule(
  totalBioload: number,
  tankVolume: number
): { frequencyDays: number; percentageChange: number } {
  const bioloadRatio = totalBioload / tankVolume;
  
  if (bioloadRatio > 0.8) {
    return { frequencyDays: 3, percentageChange: 50 };
  } else if (bioloadRatio > 0.5) {
    return { frequencyDays: 7, percentageChange: 30 };
  }
  return { frequencyDays: 14, percentageChange: 25 };
}