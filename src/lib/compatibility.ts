import { TANK_PARAMETERS } from './constants';
import type { FishData } from '@/components/TankPlanner/types';

export interface TankParameters {
  size: number;
  temperature: number;
  ph: number;
}

// Define the CompatibilityIssue interface
export interface CompatibilityIssue {
  type: string;
  message: string;
  severity: 'warning' | 'danger';
}

// Update CompatibilityResult to match what's used in the components
export interface CompatibilityResult {
  compatible: boolean;
  issues: {
    tankSize: string[];
    waterParameters: string[];
    compatibility: string[];
  };
  summary: {
    total: number;
    critical: number;
  };
}

interface FishGroup {
  data: FishData;
  quantity: number;
}

export function checkTankCompatibility(
  selectedFish: FishData[],
  tankParameters: TankParameters
): CompatibilityResult {
  const issues = {
    tankSize: [],
    waterParameters: [],
    compatibility: []
  };

  // Fix empty array handling
  if (!selectedFish || selectedFish.length === 0) {
    return { compatible: true, issues, summary: { total: 0, critical: 0 } };
  }

  // Group fish by species
  const fishGroups = groupFishBySpecies(selectedFish);
  
  checkTankSize(fishGroups, tankParameters, issues);
  checkWaterParameters(fishGroups, tankParameters, issues);
  checkFishCompatibility(fishGroups, issues);

  const totalIssues = Object.values(issues).flat().length;
  const criticalIssues = issues.tankSize.length + issues.waterParameters.length;
  const compatible = totalIssues === 0;

  return { compatible, issues, summary: { total: totalIssues, critical: criticalIssues } };
}

// Fix the function signatures to match the expected parameters
const groupFishBySpecies = (fish: FishData[]): FishGroup[] => {
  const groups: FishGroup[] = [];
  
  fish.forEach(fishData => {
    const key = fishData.scientificName || fishData.commonName;
    const existingGroup = groups.find(g => g.data.commonName === key);
    if (existingGroup) {
      existingGroup.quantity += 1;
    } else {
      groups.push({ data: fishData, quantity: 1 });
    }
  });
  
  return groups;
};

function hasTankSize(fish: FishData): boolean {
  return 'tankSize' in fish && fish.tankSize?.minimum !== undefined;
}

const checkTankSize = (
  fishGroups: FishGroup[],
  tankParameters: TankParameters,
  issues: { tankSize: string[], waterParameters: string[], compatibility: string[] }
): void => {
  fishGroups.forEach(group => {
    if (hasTankSize(group.data) && group.data.tankSize.minimum > tankParameters.size) {
      issues.tankSize.push(
        `${group.data.commonName} requires a minimum tank size of ${group.data.tankSize.minimum}L, but your tank is only ${tankParameters.size}L.`
      );
    }
  });
};

// Check water parameters compatibility
const checkWaterParameters = (
  fishGroups: FishGroup[],
  tankParameters: TankParameters,
  issues: { tankSize: string[], waterParameters: string[], compatibility: string[] }
): void => {
  fishGroups.forEach(group => {
    // Check temperature compatibility
    if (
      tankParameters.temperature < group.data.waterParameters.temperature[0] ||
      tankParameters.temperature > group.data.waterParameters.temperature[1]
    ) {
      issues.waterParameters.push(
        `${group.data.commonName} requires temperature between ${group.data.waterParameters.temperature[0]}°C and ${group.data.waterParameters.temperature[1]}°C`
      );
    }

    // Check pH compatibility
    if (
      tankParameters.ph < group.data.waterParameters.pH[0] ||
      tankParameters.ph > group.data.waterParameters.pH[1]
    ) {
      issues.waterParameters.push(
        `${group.data.commonName} requires pH between ${group.data.waterParameters.pH[0]} and ${group.data.waterParameters.pH[1]}`
      );
    }
  });
};

// Check fish compatibility with each other
const checkFishCompatibility = (
  fishGroups: FishGroup[],
  issues: { tankSize: string[], waterParameters: string[], compatibility: string[] }
): void => {
  fishGroups.forEach((group1, i) => {
    fishGroups.slice(i + 1).forEach(group2 => {
      if (
        group1.data.incompatibleWith?.includes(group2.data.commonName) ||
        group2.data.incompatibleWith?.includes(group1.data.commonName)
      ) {
        issues.compatibility.push(
          `${group1.data.commonName} is incompatible with ${group2.data.commonName}`
        );
      }
    });
  });
};
