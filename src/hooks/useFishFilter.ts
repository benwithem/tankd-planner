import { useState, useCallback } from 'react';
import type { FishData, TankParameters, isFishData } from '@/components/TankPlanner/types';

export type SortOption = 'name' | 'size' | 'care';

interface UseFishFilterProps {
  allFish: FishData[];
  tankParameters?: TankParameters;
}

export const useFishFilter = ({ allFish, tankParameters }: UseFishFilterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [filterCareLevel, setFilterCareLevel] = useState<string[]>([]);
  const [filterSize, setFilterSize] = useState<string[]>([]);
  const [filterTemperament, setFilterTemperament] = useState<string[]>([]);
  const [filterLocation, setFilterLocation] = useState<string[]>([]);
  const [showCompatibleOnly, setShowCompatibleOnly] = useState(false);

  const isCompatible = useCallback((fish: FishData): boolean => {
    if (!tankParameters) return true;

    // Check tank size compatibility
    if (fish.tankSize.minimum > tankParameters.size) {
      return false;
    }

    // Check water parameter compatibility
    const { temperature, pH } = tankParameters.waterParameters;
    if (
      temperature.min > fish.waterParameters.temperature.min ||
      temperature.max < fish.waterParameters.temperature.max ||
      pH.min > fish.waterParameters.pH.min ||
      pH.max < fish.waterParameters.pH.max
    ) {
      return false;
    }

    return true;
  }, [tankParameters]);

  const getFilteredFish = useCallback(() => {
    let filtered = [...allFish];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(fish =>
        fish.name.toLowerCase().includes(query) ||
        fish.scientificName.toLowerCase().includes(query) ||
        fish.description.toLowerCase().includes(query)
      );
    }

    // Apply care level filter
    if (filterCareLevel.length > 0) {
      filtered = filtered.filter(fish => filterCareLevel.includes(fish.careLevel));
    }

    // Apply size filter
    if (filterSize.length > 0) {
      filtered = filtered.filter(fish => filterSize.includes(fish.size));
    }

    // Apply temperament filter
    if (filterTemperament.length > 0) {
      filtered = filtered.filter(fish => filterTemperament.includes(fish.temperament));
    }

    // Apply location filter
    if (filterLocation.length > 0) {
      filtered = filtered.filter(fish => filterLocation.includes(fish.location));
    }

    // Apply compatibility filter
    if (showCompatibleOnly) {
      filtered = filtered.filter(fish => isCompatible(fish));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortOption) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'size':
          return (a.tankSize.minimum || 0) - (b.tankSize.minimum || 0);
        case 'care':
          const careLevelOrder = { beginner: 0, intermediate: 1, advanced: 2 };
          return careLevelOrder[a.careLevel] - careLevelOrder[b.careLevel];
        default:
          return 0;
      }
    });

    return filtered;
  }, [
    allFish,
    searchQuery,
    filterCareLevel,
    filterSize,
    filterTemperament,
    filterLocation,
    showCompatibleOnly,
    sortOption,
    isCompatible
  ]);

  return {
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    filterCareLevel,
    setFilterCareLevel,
    filterSize,
    setFilterSize,
    filterTemperament,
    setFilterTemperament,
    filterLocation,
    setFilterLocation,
    showCompatibleOnly,
    setShowCompatibleOnly,
    getFilteredFish,
    isCompatible
  };
};