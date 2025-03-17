/**
 * Utilities for checking compatibility between fish and tank parameters
 */
import type { FishData, PlantData, TankParameters } from '@/components/TankPlanner/types';

export interface CompatibilityIssue {
  type: 'temperature' | 'pH' | 'tankSize' | 'temperament' | 'co2' | 'lighting';
  message: string;
}

/**
 * Check if all fish in the tank are compatible with each other
 */
export function checkFishCompatibility(
  fish: FishData,
  parameters?: TankParameters,
  selectedFish: FishData[] = []
): string[] {
  const issues: string[] = [];

  if (!parameters) {
    return ["Tank parameters not set"];
  }

  // Check temperature compatibility
  if (fish.waterParameters.temperature.min > parameters.temperature.max ||
      fish.waterParameters.temperature.max < parameters.temperature.min) {
    issues.push(`${fish.name} prefers ${fish.waterParameters.temperature.min}°C - ${fish.waterParameters.temperature.max}°C, tank is ${parameters.temperature.min}°C - ${parameters.temperature.max}°C`);
  }

  // Check pH compatibility
  if (fish.waterParameters.pH.min > parameters.pH.max ||
      fish.waterParameters.pH.max < parameters.pH.min) {
    issues.push(`${fish.name} prefers pH ${fish.waterParameters.pH.min} - ${fish.waterParameters.pH.max}, tank is ${parameters.pH.min} - ${parameters.pH.max}`);
  }

  // Check tank size
  if (parameters.size < fish.tankSize.minimum) {
    issues.push(`Tank size (${parameters.size}L) is too small for ${fish.name}. Minimum: ${fish.tankSize.minimum}L`);
  }

  // Check temperament compatibility
  if (fish.temperament !== 'peaceful') {
    const peacefulFish = selectedFish.filter(f => f.temperament === 'peaceful');
    if (peacefulFish.length > 0) {
      const peacefulNames = peacefulFish.map(f => f.name).join(', ');
      issues.push(`${fish.name} (${fish.temperament}) may be aggressive towards ${peacefulNames}`);
    }
  }

  // Check schooling requirements
  if (fish.schooling && (!fish.quantity || fish.quantity < 6)) {
    issues.push(`${fish.name} is a schooling fish and needs at least 6 individuals`);
  }

  return issues;
}

/**
 * Check if the plant is compatible with the tank parameters and fish
 */
export function checkPlantCompatibility(
  plant: PlantData,
  parameters?: TankParameters,
  selectedFish: FishData[] = []
): string[] {
  const issues: string[] = [];

  if (!parameters) {
    return ["Tank parameters not set"];
  }

  // Check temperature compatibility
  if (plant.waterParameters.temperature.min > parameters.temperature.max ||
      plant.waterParameters.temperature.max < parameters.temperature.min) {
    issues.push(`${plant.name} prefers ${plant.waterParameters.temperature.min}°C - ${plant.waterParameters.temperature.max}°C, tank is ${parameters.temperature.min}°C - ${parameters.temperature.max}°C`);
  }

  // Check pH compatibility
  if (plant.waterParameters.pH.min > parameters.pH.max ||
      plant.waterParameters.pH.max < parameters.pH.min) {
    issues.push(`${plant.name} prefers pH ${plant.waterParameters.pH.min} - ${plant.waterParameters.pH.max}, tank is ${parameters.pH.min} - ${parameters.pH.max}`);
  }

  // Check CO2 requirements
  if (plant.co2 === 'required' && (!parameters.co2 || parameters.co2 === 'none')) {
    issues.push(`${plant.name} requires CO2 supplementation for optimal growth`);
  }

  // Check lighting compatibility with tank depth
  if (plant.lighting === 'high' && parameters.size > 200) {
    issues.push(`${plant.name} needs high light which may be difficult in a ${parameters.size}L tank`);
  } else if (plant.lighting === 'low' && parameters.size < 50) {
    issues.push(`${plant.name} prefers low light but may grow too fast in a small ${parameters.size}L tank`);
  }

  // Check fish compatibility
  const plantEatingFish = selectedFish.filter(fish => !fish.isPlantSafe);
  if (plantEatingFish.length > 0) {
    const eaterNames = plantEatingFish.map(f => f.name).join(', ');
    issues.push(`${eaterNames} may damage or eat ${plant.name}`);
  }

  return issues;
}

/**
 * Get appropriate water color based on parameters and fish compatibility
 */
export function getWaterColor(
  parameters?: TankParameters,
  fish: FishData[] = [],
  plants: PlantData[] = []
): string {
  // Check if any fish or plants have compatibility issues
  const hasCompatibilityIssues = fish.some(f => 
    checkFishCompatibility(f, parameters, fish).length > 0
  ) || plants.some(p =>
    checkPlantCompatibility(p, parameters, fish).length > 0
  );
  
  if (hasCompatibilityIssues) {
    return 'linear-gradient(180deg, rgba(255,100,100,0.1) 0%, rgba(255,50,50,0.2) 100%)';
  }
  
  if (parameters && parameters.pH.min < 6.5) {
    return 'linear-gradient(180deg, rgba(255,200,100,0.1) 0%, rgba(255,150,50,0.2) 100%)';
  }
  
  if (parameters && parameters.pH.max > 7.5) {
    return 'linear-gradient(180deg, rgba(100,100,255,0.1) 0%, rgba(50,50,255,0.2) 100%)';
  }
  
  return 'linear-gradient(180deg, rgba(0,150,255,0.1) 0%, rgba(0,100,255,0.2) 100%)';
}
