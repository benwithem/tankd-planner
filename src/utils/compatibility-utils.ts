/**
 * Utilities for checking compatibility between fish and tank parameters
 */
import type { TankItem, TankParameters } from '@/components/TankPlanner/types';

/**
 * Check if all fish in the tank are compatible with each other
 * @param selectedItems Array of selected fish items
 * @returns Object with compatibility status and issues
 */
export function checkFishCompatibility(
  selectedItems: TankItem[]
): { isCompatible: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check fish-to-fish compatibility based on temperament
  const temperaments = selectedItems.map(item => ({
    name: item.name,
    temperament: item.temperament || 'peaceful' // Default to peaceful if not defined
  }));

  // Simple temperament checks
  const hasAggressive = temperaments.some(t => t.temperament === 'aggressive');
  const hasPeaceful = temperaments.some(t => t.temperament === 'peaceful');

  if (hasAggressive && hasPeaceful) {
    issues.push('Mixing aggressive and peaceful fish may cause stress or aggression');
  }

  // Check incompatible species combinations
  for (let i = 0; i < selectedItems.length; i++) {
    const currentFish = selectedItems[i];
    
    // Skip if this fish doesn't have incompatibility data
    if (!currentFish.incompatibleWith || !Array.isArray(currentFish.incompatibleWith)) {
      continue;
    }
    
    for (let j = 0; j < selectedItems.length; j++) {
      if (i === j) continue; // Skip comparing fish to itself
      
      const otherFish = selectedItems[j];
      
      // Check if the scientific name matches any of the incompatible species
      const isIncompatible = currentFish.incompatibleWith.some(
        scientificName => scientificName === otherFish.scientificName
      );
      
      if (isIncompatible) {
        issues.push(`${currentFish.name} is not compatible with ${otherFish.name}`);
      }
    }
  }

  return {
    isCompatible: issues.length === 0,
    issues
  };
}

/**
 * Check if the tank parameters are suitable for all selected fish
 * @param selectedItems Array of selected fish items
 * @param parameters Current tank parameters
 * @returns Object with compatibility status and issues
 */
export function checkTankParameters(
  selectedItems: TankItem[],
  parameters: TankParameters
): { isCompatible: boolean; issues: string[] } {
  const issues: string[] = [];

  // Skip checks if no items
  if (selectedItems.length === 0) {
    return { isCompatible: true, issues: [] };
  }

  // Check total tank size required
  const totalRequiredVolume = selectedItems.reduce(
    (acc, item) => acc + (item.tankSize * (item.quantity || 1)),
    0
  );
  
  if (totalRequiredVolume > parameters.size) {
    issues.push(`Tank is too small: needs ${totalRequiredVolume}L but only has ${parameters.size}L`);
  }

  // Check temperature compatibility
  if (selectedItems.some(item => item.temperatureRange)) {
    const temperatureRanges = selectedItems
      .filter(item => item.temperatureRange)
      .map(item => item.temperatureRange);
    
    if (temperatureRanges.length > 0) {
      const maxMin = Math.max(...temperatureRanges.map(r => r.min));
      const minMax = Math.min(...temperatureRanges.map(r => r.max));
      
      if (maxMin > minMax) {
        issues.push('Fish have incompatible temperature requirements');
      } else if (parameters.temperature < maxMin) {
        issues.push(`Tank temperature too low: needs at least ${maxMin}°C`);
      } else if (parameters.temperature > minMax) {
        issues.push(`Tank temperature too high: needs at most ${minMax}°C`);
      }
    }
  }

  // Check pH compatibility
  if (selectedItems.some(item => item.phRange)) {
    const phRanges = selectedItems
      .filter(item => item.phRange)
      .map(item => item.phRange);
    
    if (phRanges.length > 0) {
      const maxMin = Math.max(...phRanges.map(r => r.min));
      const minMax = Math.min(...phRanges.map(r => r.max));
      
      if (maxMin > minMax) {
        issues.push('Fish have incompatible pH requirements');
      } else if (parameters.ph < maxMin) {
        issues.push(`Tank pH too low: needs at least ${maxMin}`);
      } else if (parameters.ph > minMax) {
        issues.push(`Tank pH too high: needs at most ${minMax}`);
      }
    }
  }

  return {
    isCompatible: issues.length === 0,
    issues
  };
}

/**
 * Get appropriate water color based on parameters and compatibility
 * @param parameters Tank parameters
 * @param hasCompatibilityIssues Whether there are compatibility issues
 * @returns CSS gradient for water color
 */
export function getWaterColor(
  parameters: TankParameters,
  hasCompatibilityIssues: boolean
): string {
  if (hasCompatibilityIssues) {
    return 'linear-gradient(180deg, rgba(255,100,100,0.1) 0%, rgba(255,50,50,0.2) 100%)';
  }
  
  if (parameters.ph < 6.5) {
    return 'linear-gradient(180deg, rgba(255,200,100,0.1) 0%, rgba(255,150,50,0.2) 100%)';
  }
  
  if (parameters.ph > 7.5) {
    return 'linear-gradient(180deg, rgba(100,100,255,0.1) 0%, rgba(50,50,255,0.2) 100%)';
  }
  
  return 'linear-gradient(180deg, rgba(0,150,255,0.1) 0%, rgba(0,100,255,0.2) 100%)';
}
