/** @jsxImportSource react */
import React from 'react';
import { CollectionSelector } from './CollectionSelector';
import type { FishData, TankParameters } from './types';
import { Fish } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollectionFilter, type FilterConfig } from '@/hooks/useCollectionFilter';
import { TankItemCard } from './TankItemCard';

interface FishCollectionSelectorProps {
  allFish: FishData[];
  selectedFish: FishData[];
  onAddFish: (fish: FishData) => void;
  currentParameters?: TankParameters;
  hideTitle?: boolean;
}

// Fish-specific filter configuration
const fishFilterConfig: FilterConfig<FishData> = {
  searchFields: ['name', 'scientificName', 'location'],
  
  sortOptions: {
    name: (a, b) => a.name.localeCompare(b.name),
    scientificName: (a, b) => a.scientificName.localeCompare(b.scientificName),
    size: (a, b) => {
      const sizeOrder = { nano: 0, small: 1, medium: 2, large: 3, jumbo: 4 };
      return sizeOrder[a.size] - sizeOrder[b.size];
    },
    temperament: (a, b) => {
      const temperamentOrder = { peaceful: 0, 'semi-aggressive': 1, aggressive: 2 };
      return temperamentOrder[a.temperament] - temperamentOrder[b.temperament];
    },
    'careLevel-asc': (a, b) => {
      const careLevelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
      return careLevelOrder[a.careLevel] - careLevelOrder[b.careLevel];
    },
    'careLevel-desc': (a, b) => {
      const careLevelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
      return careLevelOrder[b.careLevel] - careLevelOrder[a.careLevel];
    }
  },
  
  categoryFilters: {
    size: {
      property: 'size',
      options: ['nano', 'small', 'medium', 'large', 'jumbo'],
      label: 'Size',
      description: 'Filter fish by their adult size'
    },
    temperament: {
      property: 'temperament',
      options: ['peaceful', 'semi-aggressive', 'aggressive'],
      label: 'Temperament',
      description: 'Filter fish by their temperament toward other fish'
    },
    careLevel: {
      property: 'careLevel',
      options: ['beginner', 'intermediate', 'advanced'],
      label: 'Care Level',
      description: 'Filter fish by how difficult they are to care for'
    },
    schooling: {
      property: 'schooling',
      options: ['true', 'false'],
      label: 'Schooling',
      description: 'Filter by whether fish need to be kept in schools'
    }
  },
  
  rangeFilters: {
    minTemp: {
      property: 'waterParameters.temperature.min',
      min: 18,
      max: 32,
      step: 1,
      label: 'Min Temperature (°C)',
      description: 'Filter by minimum temperature requirement',
      getValue: (fish) => fish.waterParameters.temperature.min
    },
    maxTemp: {
      property: 'waterParameters.temperature.max',
      min: 18,
      max: 32,
      step: 1,
      label: 'Max Temperature (°C)',
      description: 'Filter by maximum temperature tolerance',
      getValue: (fish) => fish.waterParameters.temperature.max
    },
    minPh: {
      property: 'waterParameters.pH.min',
      min: 5.0,
      max: 9.0,
      step: 0.1,
      label: 'Min pH',
      description: 'Filter by minimum pH requirement',
      getValue: (fish) => fish.waterParameters.pH.min
    },
    maxPh: {
      property: 'waterParameters.pH.max',
      min: 5.0,
      max: 9.0,
      step: 0.1,
      label: 'Max pH',
      description: 'Filter by maximum pH tolerance',
      getValue: (fish) => fish.waterParameters.pH.max
    },
    minHardness: {
      property: 'waterParameters.hardness.min',
      min: 0,
      max: 30,
      step: 1,
      label: 'Min Hardness (dGH)',
      description: 'Filter by minimum water hardness requirement',
      getValue: (fish) => fish.waterParameters.hardness?.min || 0
    },
    maxHardness: {
      property: 'waterParameters.hardness.max',
      min: 0,
      max: 30,
      step: 1,
      label: 'Max Hardness (dGH)',
      description: 'Filter by maximum water hardness tolerance',
      getValue: (fish) => fish.waterParameters.hardness?.max || 30
    },
    minTankSize: {
      property: 'tankSize.minimum',
      min: 0,
      max: 200,
      step: 5,
      label: 'Min Tank Size (gallons)',
      description: 'Filter by minimum tank size requirement',
      getValue: (fish) => fish.tankSize.minimum
    },
    recommendedTankSize: {
      property: 'tankSize.recommended',
      min: 0,
      max: 300,
      step: 5,
      label: 'Recommended Tank Size (gallons)',
      description: 'Filter by recommended tank size',
      getValue: (fish) => fish.tankSize.recommended || 0
    }
  },
  
  toggleFilters: {
    compatibleOnly: {
      label: 'Show Compatible Only',
      description: 'Only show fish compatible with your current tank parameters',
      isActive: (fish, parameters) => {
        if (!parameters) return true;
        
        // Check water parameter compatibility
        const { temperature, pH } = parameters;
        if (
          fish.waterParameters.temperature.min > temperature.max ||
          fish.waterParameters.temperature.max < temperature.min ||
          fish.waterParameters.pH.min > pH.max ||
          fish.waterParameters.pH.max < pH.min
        ) {
          return false;
        }
        
        // Check hardness compatibility if both fish and parameters have hardness defined
        if (fish.waterParameters.hardness && parameters.hardness) {
          if (
            fish.waterParameters.hardness.min > parameters.hardness.max ||
            fish.waterParameters.hardness.max < parameters.hardness.min
          ) {
            return false;
          }
        }
        
        return true;
      }
    },
    shrimpSafe: {
      label: 'Shrimp Safe Only',
      description: 'Only show fish that are compatible with shrimp',
      isActive: (fish) => fish.compatibility?.shrimp === true
    }
  }
};

export function FishCollectionSelector({
  allFish,
  selectedFish,
  onAddFish,
  currentParameters,
  hideTitle = false,
}: FishCollectionSelectorProps) {
  // Use the collection filter hook with our fish-specific configuration
  const filterResult = useCollectionFilter(
    allFish,
    fishFilterConfig,
    currentParameters,
    selectedFish
  );

  // Custom renderer for fish items
  const renderFishItem = (fish: FishData, isSelected: boolean, compatibilityIssues: string[], onAdd: () => void) => {
    return (
      <TankItemCard
        item={fish}
        showIssues={true}
        issues={compatibilityIssues}
        onViewDetails={() => {}}
        isSheetView={true}
        isSelected={isSelected}
        onAdd={onAdd}
      />
    );
  };

  return (
    <CollectionSelector
      items={allFish}
      selectedItems={selectedFish}
      onAddItem={onAddFish}
      filterConfig={fishFilterConfig}
      filterResult={filterResult}
      currentParameters={currentParameters}
      title={hideTitle ? undefined : "Fish Collection"}
      subtitle={hideTitle ? undefined : "Browse and add fish to your aquarium"}
      itemIcon={Fish}
      renderItem={renderFishItem}
      searchPlaceholder="Search fish by name or scientific name..."
      emptyStateMessage="No fish found matching your filters."
    />
  );
}
