import type { FishData, TankItem } from '@/components/TankPlanner/types';

export interface SearchFilters {
  careLevel?: 'beginner' | 'intermediate' | 'advanced';
  temperament?: 'peaceful' | 'semi-aggressive' | 'aggressive';
  maxSize?: number;
  plantCompatible?: boolean;
}

export function filterFish(items: TankItem<FishData>[], searchTerm: string, filters: SearchFilters = {}) {
  if (!items) return [];
  
  return items.filter(item => {
    const fish = item?.data;
    if (!fish) return false;

    const hasSearchMatch = searchTerm 
      ? [fish.commonName, fish.scientificName].some(text => 
          text?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;

    const hasCareMatch = !filters.careLevel || fish.careLevel === filters.careLevel;
    const hasTempMatch = !filters.temperament || fish.temperament === filters.temperament;
    const hasPlantMatch = typeof filters.plantCompatible !== 'boolean' 
      || fish.compatibility.plants === filters.plantCompatible;

    return hasSearchMatch && hasCareMatch && hasTempMatch && hasPlantMatch;
  });
}