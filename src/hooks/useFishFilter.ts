import { useState, useMemo, useEffect } from 'react';
import type { TankItem, FishData, FishCategory } from '@/components/TankPlanner/types';

// Sorting options
export type SortOption = 
  | 'name' 
  | 'size' 
  | 'compatibility' 
  | 'temperature'
  | 'careLevel';

export function useFishFilter(allFish: TankItem[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [plantSafeOnly, setPlantSafeOnly] = useState(false);
  const [sizeCompatibleOnly, setSizeCompatibleOnly] = useState(false);
  const [tankSize, setTankSize] = useState<number | undefined>(undefined);
  const [activeFishCategories, setActiveFishCategories] = useState<FishCategory[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Local storage for favorites
  const [favoriteFish, setFavoriteFish] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('favoriteFish');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('favoriteFish', JSON.stringify(favoriteFish));
    }
  }, [favoriteFish]);

  // Toggle a fish as favorite
  const toggleFavorite = (fishSlug: string) => {
    setFavoriteFish(prev => 
      prev.includes(fishSlug)
        ? prev.filter(slug => slug !== fishSlug)
        : [...prev, fishSlug]
    );
  };

  // Check if a fish is favorite
  const isFavorite = (fishSlug: string) => {
    return favoriteFish.includes(fishSlug);
  };

  const filteredFish = useMemo(() => {
    if (!allFish) return [];
    
    let result = allFish.filter(fish => {
      if (!fish) return false;

      // Search filter - always applied when there's a search term
      const hasSearchMatch = searchTerm === '' || 
        [fish.name, fish.description]
          .filter(Boolean)
          .some(text => text?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Plant safety filter - only applied when toggle is ON
      const hasPlantSafety = !plantSafeOnly || 
        (fish.compatibility?.plants === true);
        
      // Size compatibility filter - only applied when toggle is ON
      const hasSizeCompatibility = !sizeCompatibleOnly || 
        !tankSize || 
        (fish.tankSize?.minimum !== undefined && fish.tankSize.minimum <= tankSize);
        
      // Category filter - only applied when categories are selected
      const matchesCategories = activeFishCategories.length === 0 ||
        (fish.categories && 
         fish.categories.some(category => activeFishCategories.includes(category)));
         
      // Favorites filter - only applied when favorites toggle is ON
      const matchesFavorites = !favoritesOnly || isFavorite(fish.slug);

      return hasSearchMatch && hasPlantSafety && hasSizeCompatibility && 
             matchesCategories && matchesFavorites;
    });
    
    // Apply sorting
    result = [...result].sort((a, b) => {
      if (!a || !b) return 0;
      
      let comparison = 0;
      
      switch (sortOption) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'size':
          comparison = (a.tankSize?.minimum || 0) - (b.tankSize?.minimum || 0);
          break;
        case 'compatibility':
          // Sort by number of compatible fish
          const aCompatibility = Object.values(a.compatibility?.otherFish || {})
            .filter(level => level === 'compatible' || level === 'highly-compatible').length;
          const bCompatibility = Object.values(b.compatibility?.otherFish || {})
            .filter(level => level === 'compatible' || level === 'highly-compatible').length;
          comparison = aCompatibility - bCompatibility;
          break;
        case 'temperature':
          comparison = (a.waterParameters?.temperature[0] || 0) - (b.waterParameters?.temperature[0] || 0);
          break;
        case 'careLevel':
          const careLevelRank = {
            'easy': 1,
            'moderate': 2,
            'difficult': 3
          };
          comparison = 
            (careLevelRank[a.careLevel || 'moderate'] || 2) - 
            (careLevelRank[b.careLevel || 'moderate'] || 2);
          break;
        default:
          comparison = 0;
          break;
      }
      
      // Apply sort direction
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [
    allFish, 
    searchTerm, 
    plantSafeOnly, 
    sizeCompatibleOnly, 
    tankSize, 
    activeFishCategories, 
    favoritesOnly, 
    sortOption, 
    sortDirection, 
    favoriteFish
  ]);

  // Calculate total and filtered counts
  const totalCount = allFish.length;
  const filteredCount = filteredFish.length;

  // Get all available categories from the fish data
  const availableCategories = useMemo(() => {
    const categories = new Set<FishCategory>();
    allFish.forEach(fish => {
      fish.categories?.forEach(category => {
        categories.add(category);
      });
    });
    return Array.from(categories);
  }, [allFish]);

  return {
    searchTerm,
    setSearchTerm,
    plantSafeOnly,
    setPlantSafeOnly,
    sizeCompatibleOnly,
    setSizeCompatibleOnly,
    tankSize,
    setTankSize,
    filteredFish,
    totalCount,
    filteredCount,
    activeFishCategories,
    setActiveFishCategories,
    availableCategories,
    favoritesOnly, 
    setFavoritesOnly,
    favoriteFish,
    toggleFavorite,
    isFavorite,
    sortOption,
    setSortOption,
    sortDirection,
    setSortDirection
  };
}