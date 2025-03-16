import { useMemo } from 'react';
import { calculateTankVolume, calculateGlassThickness, calculateWaterWeight } from '@/lib/tankCalculations';
import type { TankDimensions } from '@/components/TankPlanner/types';

export function useTankCalculations(dimensions: TankDimensions) {
  return useMemo(() => {
    const volume = calculateTankVolume(dimensions);
    const glassThickness = calculateGlassThickness(
      dimensions.lengthInches,
      dimensions.heightInches,
      volume
    );
    const waterWeight = calculateWaterWeight(volume);

    return {
      volume,
      glassThickness,
      waterWeight,
      dimensions
    };
  }, [dimensions]);
}