import { useState, useCallback, useMemo } from "react";
import type {
  BaseTankItemData,
  FishData,
  PlantData,
  TankParameters,
} from "@/components/TankPlanner/types";
import { isFishData, isPlantData } from "@/components/TankPlanner/types";
import {
  checkFishCompatibility,
  checkPlantCompatibility,
} from "@/utils/compatibility-utils";

export type SortOption = "name" | "scientificName" | "care" | "size";

export interface FilterConfig<T extends BaseTankItemData> {
  // Basic filter options
  searchFields?: Array<keyof T>;
  sortOptions?: Record<string, (a: T, b: T) => number>;

  // Category filters - each entry is a filter name and the property to filter on
  categoryFilters?: Record<
    string,
    {
      property: keyof T;
      options: string[];
      label: string;
      description?: string;
    }
  >;

  // Range filters - each entry is a filter name and the min/max values
  rangeFilters?: Record<
    string,
    {
      property: keyof T | string;
      min: number;
      max: number;
      step: number;
      label: string;
      description?: string;
      valueFormatter?: (value: number) => string;
      getValue: (item: T) => { min: number; max: number } | number;
    }
  >;

  // Toggle filters
  toggleFilters?: Record<
    string,
    {
      label: string;
      description?: string;
      isActive: (
        item: T,
        parameters?: TankParameters,
        selectedItems?: BaseTankItemData[]
      ) => boolean;
    }
  >;
}

export interface UseCollectionFilterProps<T extends BaseTankItemData> {
  items: T[];
  filterConfig: FilterConfig<T>;
  tankParameters?: TankParameters;
  selectedItems?: BaseTankItemData[];
}

export interface UseCollectionFilterResult<T extends BaseTankItemData> {
  filteredItems: T[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: string | null;
  setSortOption: (option: string | null) => void;
  categoryFilters: Record<string, string[]>;
  setCategoryFilter: (name: string, values: string[]) => void;
  rangeFilters: Record<string, [number, number]>;
  setRangeFilter: (name: string, values: [number, number]) => void;
  toggleFilters: Record<string, boolean>;
  setToggleFilter: (name: string, value: boolean) => void;
  resetFilters: () => void;
  activeFilterCount: number;
}

/**
 * A hook for filtering and sorting collections of tank items
 */
export function useCollectionFilter<T extends BaseTankItemData>(
  items: T[],
  filterConfig: FilterConfig<T>,
  tankParameters?: TankParameters,
  selectedItems?: BaseTankItemData[]
): UseCollectionFilterResult<T> {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<string | null>(null);

  // Initialize category filters
  const [categoryFilters, setCategoryFiltersState] = useState<
    Record<string, string[]>
  >(() => {
    const initialFilters: Record<string, string[]> = {};
    if (filterConfig.categoryFilters) {
      Object.keys(filterConfig.categoryFilters).forEach((name) => {
        initialFilters[name] = [];
      });
    }
    return initialFilters;
  });

  // Initialize range filters
  const [rangeFilters, setRangeFiltersState] = useState<
    Record<string, [number, number]>
  >(() => {
    const initialFilters: Record<string, [number, number]> = {};
    if (filterConfig.rangeFilters) {
      Object.keys(filterConfig.rangeFilters).forEach((name) => {
        const filter = filterConfig.rangeFilters![name];
        initialFilters[name] = [filter.min, filter.max];
      });
    }
    return initialFilters;
  });

  // Initialize toggle filters
  const [toggleFilters, setToggleFiltersState] = useState<
    Record<string, boolean>
  >(() => {
    const initialFilters: Record<string, boolean> = {};
    if (filterConfig.toggleFilters) {
      Object.keys(filterConfig.toggleFilters).forEach((name) => {
        initialFilters[name] = false;
      });
    }
    return initialFilters;
  });

  // Set category filter
  const setCategoryFilter = useCallback((name: string, values: string[]) => {
    setCategoryFiltersState((prev) => ({
      ...prev,
      [name]: values,
    }));
  }, []);

  // Set range filter
  const setRangeFilter = useCallback(
    (name: string, values: [number, number]) => {
      setRangeFiltersState((prev) => ({
        ...prev,
        [name]: values,
      }));
    },
    []
  );

  // Set toggle filter
  const setToggleFilter = useCallback((name: string, value: boolean) => {
    setToggleFiltersState((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setSortOption(null);

    // Reset category filters
    setCategoryFiltersState((prev) => {
      const reset: Record<string, string[]> = {};
      Object.keys(prev).forEach((key) => {
        reset[key] = [];
      });
      return reset;
    });

    // Reset range filters
    setRangeFiltersState(() => {
      const reset: Record<string, [number, number]> = {};
      if (filterConfig.rangeFilters) {
        Object.keys(filterConfig.rangeFilters).forEach((name) => {
          const filter = filterConfig.rangeFilters![name];
          reset[name] = [filter.min, filter.max];
        });
      }
      return reset;
    });

    // Reset toggle filters
    setToggleFiltersState((prev) => {
      const reset: Record<string, boolean> = {};
      Object.keys(prev).forEach((key) => {
        reset[key] = false;
      });
      return reset;
    });
  }, [filterConfig.rangeFilters]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;

    // Count active category filters
    Object.values(categoryFilters).forEach((values) => {
      if (values.length > 0) count++;
    });

    // Count active range filters
    if (filterConfig.rangeFilters) {
      Object.keys(rangeFilters).forEach((name) => {
        const [min, max] = rangeFilters[name];
        const filter = filterConfig.rangeFilters![name];
        if (min > filter.min || max < filter.max) count++;
      });
    }

    // Count active toggle filters
    Object.values(toggleFilters).forEach((value) => {
      if (value) count++;
    });

    // Count search query
    if (searchQuery.trim() !== "") count++;

    // Don't count sort option as an active filter
    // if (sortOption !== null) count++;

    return count;
  }, [
    categoryFilters,
    rangeFilters,
    toggleFilters,
    searchQuery,
    // sortOption, // Remove from dependencies
    filterConfig.rangeFilters,
  ]);

  // Filter items based on all active filters
  const getFilteredItems = useCallback(() => {
    // If no filters are active, return all items
    const hasActiveFilters =
      searchQuery.trim() !== "" ||
      Object.values(categoryFilters).some((values) => values.length > 0) ||
      Object.values(toggleFilters).some((value) => value) ||
      (filterConfig.rangeFilters &&
        Object.keys(rangeFilters).some((name) => {
          const [min, max] = rangeFilters[name];
          const filter = filterConfig.rangeFilters![name];
          return min > filter.min || max < filter.max;
        }));

    if (!hasActiveFilters && sortOption === null) {
      return items;
    }

    return items.filter((item) => {
      // Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const searchFields = filterConfig.searchFields || [
          "name",
          "scientificName",
        ];
        const matchesSearch = searchFields.some((field) => {
          const value = item[field as keyof T];
          return (
            typeof value === "string" && value.toLowerCase().includes(query)
          );
        });

        if (!matchesSearch) return false;
      }

      // Filter by category filters
      if (filterConfig.categoryFilters) {
        for (const [name, filter] of Object.entries(
          filterConfig.categoryFilters
        )) {
          const selectedValues = categoryFilters[name];
          if (selectedValues.length > 0) {
            const itemValue = String(item[filter.property]);
            if (!selectedValues.includes(itemValue)) {
              return false;
            }
          }
        }
      }

      // Filter by range filters
      if (filterConfig.rangeFilters) {
        for (const [name, filter] of Object.entries(
          filterConfig.rangeFilters
        )) {
          const [minValue, maxValue] = rangeFilters[name];
          const itemValue = filter.getValue(item);

          if (typeof itemValue === "number") {
            if (itemValue < minValue || itemValue > maxValue) {
              return false;
            }
          } else {
            // Handle range object (min/max)
            if (itemValue.max < minValue || itemValue.min > maxValue) {
              return false;
            }
          }
        }
      }

      // Filter by toggle filters
      if (filterConfig.toggleFilters) {
        for (const [name, filter] of Object.entries(
          filterConfig.toggleFilters
        )) {
          if (toggleFilters[name]) {
            if (!filter.isActive(item, tankParameters, selectedItems)) {
              return false;
            }
          }
        }
      }

      return true;
    });
  }, [
    items,
    searchQuery,
    categoryFilters,
    rangeFilters,
    toggleFilters,
    filterConfig,
    tankParameters,
    selectedItems,
    sortOption,
  ]);

  // Apply sorting to filtered items
  const filteredItems = useMemo(() => {
    const filtered = getFilteredItems();

    if (
      sortOption &&
      filterConfig.sortOptions
    ) {
      // Extract the base sort option and direction
      const baseSortOption = sortOption.replace(/-asc$|-desc$/, '');
      const direction = sortOption.endsWith('-desc') ? 'desc' : 'asc';
      
      // Find the base sort comparator
      const baseComparator = filterConfig.sortOptions[baseSortOption] ||
                             filterConfig.sortOptions[`${baseSortOption}-asc`] ||
                             filterConfig.sortOptions[`${baseSortOption}-desc`];
      
      if (baseComparator) {
        return [...filtered].sort((a, b) => {
          // Apply the comparator with direction
          const result = baseComparator(a, b);
          return direction === 'asc' ? result : -result;
        });
      }
    }

    return filtered;
  }, [getFilteredItems, sortOption, filterConfig.sortOptions]);

  return {
    filteredItems,
    searchQuery,
    setSearchQuery,
    sortOption,
    setSortOption,
    categoryFilters,
    setCategoryFilter,
    rangeFilters,
    setRangeFilter,
    toggleFilters,
    setToggleFilter,
    resetFilters,
    activeFilterCount,
  };
}
