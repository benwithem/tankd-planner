import { useState, useMemo } from 'react';
import { filterFish } from '@/lib/searchUtils';
import type { TankItem, FishData } from '@/components/TankPlanner/types';
import type { SearchFilters } from '@/lib/searchUtils';

export function useFishSearch(allFish: TankItem<FishData>[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});

  const filteredFish = useMemo(() => 
    filterFish(allFish, searchTerm, filters),
    [allFish, searchTerm, filters]
  );

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  return {
    searchTerm,
    setSearchTerm,
    filters,
    updateFilter,
    clearFilters,
    filteredFish
  };
}