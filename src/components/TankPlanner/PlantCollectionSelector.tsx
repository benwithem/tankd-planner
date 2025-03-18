/** @jsxImportSource react */
import React from 'react';
import { CollectionSelector } from './CollectionSelector';
import type { PlantData, TankParameters, FishData } from './types';
import { Leaf, Droplet, Heart, Ruler } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCollectionFilter, type FilterConfig } from '@/hooks/useCollectionFilter';
import { TankItemCard } from './TankItemCard';

interface PlantCollectionSelectorProps {
  allPlants: PlantData[];
  selectedPlants: PlantData[];
  selectedFish: FishData[];
  onAddPlant: (plant: PlantData) => void;
  currentParameters?: TankParameters;
  hideTitle?: boolean;
}

/**
 * A component for selecting plants from a collection
 */
export function PlantCollectionSelector({ 
  allPlants,
  selectedPlants,
  selectedFish,
  onAddPlant,
  currentParameters,
  hideTitle = false,
}: PlantCollectionSelectorProps) {
  // Define plant-specific filter configuration
  const filterConfig: FilterConfig<PlantData> = {
    searchFields: ['name', 'scientificName', 'description'],
    
    sortOptions: {
      name: (a, b) => a.name.localeCompare(b.name),
      scientificName: (a, b) => a.scientificName.localeCompare(b.scientificName),
      height: (a, b) => a.height - b.height,
      // Add explicit versions with directional suffixes for care level
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
      careLevel: {
        property: 'careLevel',
        options: ['beginner', 'intermediate', 'advanced'],
        label: 'Care Level',
        description: 'Filter plants by how difficult they are to care for'
      },
      lighting: {
        property: 'lighting',
        options: ['low', 'medium', 'high'],
        label: 'Lighting',
        description: 'Filter plants by their lighting requirements'
      },
      placement: {
        property: 'placement',
        options: ['foreground', 'midground', 'background', 'floating'],
        label: 'Placement',
        description: 'Filter plants by where they should be placed in the tank'
      },
      growthRate: {
        property: 'growthRate',
        options: ['slow', 'medium', 'fast'],
        label: 'Growth Rate',
        description: 'Filter plants by how quickly they grow'
      },
      co2: {
        property: 'co2',
        options: ['low', 'medium', 'high'],
        label: 'CO2 Requirement',
        description: 'Filter plants by their CO2 requirements'
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
        getValue: (plant) => plant.waterParameters.temperature.min
      },
      maxTemp: {
        property: 'waterParameters.temperature.max',
        min: 18,
        max: 32,
        step: 1,
        label: 'Max Temperature (°C)',
        description: 'Filter by maximum temperature tolerance',
        getValue: (plant) => plant.waterParameters.temperature.max
      },
      minPh: {
        property: 'waterParameters.pH.min',
        min: 5.0,
        max: 9.0,
        step: 0.1,
        label: 'Min pH',
        description: 'Filter by minimum pH requirement',
        getValue: (plant) => plant.waterParameters.pH.min
      },
      maxPh: {
        property: 'waterParameters.pH.max',
        min: 5.0,
        max: 9.0,
        step: 0.1,
        label: 'Max pH',
        description: 'Filter by maximum pH tolerance',
        getValue: (plant) => plant.waterParameters.pH.max
      },
      minHardness: {
        property: 'waterParameters.hardness.min',
        min: 0,
        max: 30,
        step: 1,
        label: 'Min Hardness (dGH)',
        description: 'Filter by minimum water hardness requirement',
        getValue: (plant) => plant.waterParameters.hardness?.min || 0
      },
      maxHardness: {
        property: 'waterParameters.hardness.max',
        min: 0,
        max: 30,
        step: 1,
        label: 'Max Hardness (dGH)',
        description: 'Filter by maximum water hardness tolerance',
        getValue: (plant) => plant.waterParameters.hardness?.max || 30
      },
      height: {
        property: 'height',
        min: 1,
        max: 100,
        step: 1,
        label: 'Height (cm)',
        description: 'Filter plants by their maximum height',
        getValue: (plant) => plant.height
      },
      width: {
        property: 'width',
        min: 1,
        max: 100,
        step: 1,
        label: 'Width (cm)',
        description: 'Filter plants by their maximum width/spread',
        getValue: (plant) => plant.width
      },
      minTankSize: {
        property: 'tankSize.minimum',
        min: 0,
        max: 200,
        step: 5,
        label: 'Min Tank Size (gallons)',
        description: 'Filter by minimum tank size requirement',
        getValue: (plant) => plant.tankSize.minimum
      },
      recommendedTankSize: {
        property: 'tankSize.recommended',
        min: 0,
        max: 300,
        step: 5,
        label: 'Recommended Tank Size (gallons)',
        description: 'Filter by recommended tank size',
        getValue: (plant) => plant.tankSize.recommended || 0
      }
    },
    
    toggleFilters: {
      compatibleOnly: {
        label: 'Show Compatible Only',
        description: 'Only show plants compatible with your current tank parameters and fish',
        isActive: (plant, parameters, selectedItems) => {
          if (!parameters) return true;
          
          // Check water parameter compatibility
          const { temperature, pH, hardness } = parameters;
          if (
            plant.waterParameters.temperature.min > temperature.max ||
            plant.waterParameters.temperature.max < temperature.min ||
            plant.waterParameters.pH.min > pH.max ||
            plant.waterParameters.pH.max < pH.min
          ) {
            return false;
          }
          
          // Check hardness compatibility if both plant and parameters have hardness defined
          if (plant.waterParameters.hardness && hardness) {
            if (
              plant.waterParameters.hardness.min > hardness.max ||
              plant.waterParameters.hardness.max < hardness.min
            ) {
              return false;
            }
          }
          
          return true;
        }
      }
    }
  };
  
  // Use the collection filter hook with plant-specific configuration
  const filterResult = useCollectionFilter(
    allPlants,
    filterConfig,
    currentParameters,
    [...selectedPlants, ...selectedFish]
  );

  // Custom renderer for plant items
  const renderPlantItem = (plant: PlantData, isSelected: boolean, compatibilityIssues: string[], onAdd: () => void) => {
    return (
      <TankItemCard
        item={plant}
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
    <CollectionSelector<PlantData>
      items={allPlants}
      selectedItems={selectedPlants}
      onAddItem={onAddPlant}
      filterConfig={filterConfig}
      filterResult={filterResult}
      currentParameters={currentParameters}
      searchPlaceholder="Search plants by name or scientific name..."
      emptyStateMessage="No plants found matching your filters. Try adjusting your filter criteria."
      title={hideTitle ? undefined : "Add Plants"}
      subtitle={hideTitle ? undefined : "Browse and add plants to your aquarium"}
      itemIcon="plant"
      renderItem={renderPlantItem}
    />
  );
}
