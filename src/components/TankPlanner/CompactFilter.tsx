/** @jsxImportSource react */
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  RefreshCw, 
  SortAsc, 
  SortDesc,
  Filter, 
  Heart,
  Ruler, 
} from 'lucide-react';
import type { FilterConfig } from '@/hooks/useCollectionFilter';
import type { BaseTankItemData } from '@/components/TankPlanner/types';

interface CompactFilterProps<T extends BaseTankItemData> {
  filterConfig: FilterConfig<T>;
  categoryFilters: Record<string, string[]>;
  rangeFilters: Record<string, [number, number]>;
  toggleFilters: Record<string, boolean>;
  setCategoryFilter: (key: string, value: string[]) => void;
  setRangeFilter: (key: string, value: [number, number]) => void;
  setToggleFilter: (key: string, value: boolean) => void;
  resetFilters: () => void;
  sortOption: string;
  setSortOption: (option: string) => void;
  /** Optional custom button variant */
  buttonVariant?: "default" | "outline" | "secondary" | "ghost";
  /** Optional custom button size */
  buttonSize?: "default" | "sm" | "lg" | "icon";
  /** Optional custom filter button label */
  filterButtonLabel?: string;
}

// Map category keys to appropriate icons
const getCategoryIcon = (key: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    size: <Ruler className="h-3.5 w-3.5" />,
    careLevel: <Heart className="h-3.5 w-3.5" />,
    temperament: <Heart className="h-3.5 w-3.5" />,
  };
  
  return iconMap[key] || <Filter className="h-3.5 w-3.5" />;
};

// Helper to format care level category filter options
const formatFilterOption = (key: string, option: string) => {
  if (key === 'careLevel') {
    // Special case for careLevel to make it more readable
    return option.charAt(0).toUpperCase() + option.slice(1);
  }
  
  return option;
};

/**
 * A compact filter component that provides a popover interface for filtering collections
 * Focuses on the most important filter options in a space-efficient layout
 */
export function CompactFilter<T extends BaseTankItemData>({
  filterConfig,
  categoryFilters,
  rangeFilters,
  toggleFilters,
  setCategoryFilter,
  setRangeFilter,
  setToggleFilter,
  resetFilters,
  sortOption,
  setSortOption,
  buttonVariant = "outline",
  buttonSize = "sm",
  filterButtonLabel = "Filters"
}: CompactFilterProps<T>) {
  const [open, setOpen] = useState(false);
  
  // Count active filters by type
  const activeCategoryFilterCount = Object.values(categoryFilters).reduce(
    (count, filters) => count + filters.length, 0
  );
  
  const activeRangeFilterCount = useMemo(() => {
    return Object.entries(rangeFilters).reduce((count, [key, [min, max]]) => {
      const config = filterConfig.rangeFilters?.[key];
      if (config && (min > config.min || max < config.max)) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [rangeFilters, filterConfig.rangeFilters]);
  
  const activeToggleFilterCount = Object.values(toggleFilters).filter(Boolean).length;
  
  // Total active filter count
  const activeFilterCount = activeCategoryFilterCount + activeRangeFilterCount + activeToggleFilterCount;
  
  // Helper to toggle category filters
  const toggleCategoryFilter = (category: string, value: string) => {
    const currentFilters = categoryFilters[category] || [];
    if (currentFilters.includes(value)) {
      setCategoryFilter(category, currentFilters.filter(v => v !== value));
    } else {
      setCategoryFilter(category, [...currentFilters, value]);
    }
  };

  // Toggle sort direction based on option
  const toggleSortOption = (option: string) => {
    const baseName = option.replace(/-asc$|-desc$/, '');
    
    // Check if already selected
    const isCurrentlySelected = sortOption && sortOption.replace(/-asc$|-desc$/, '') === baseName;
    
    if (isCurrentlySelected) {
      // Toggle direction if already selected
      const currentDirection = sortOption.endsWith('-desc') ? 'desc' : 'asc';
      const newDirection = currentDirection === 'asc' ? 'desc' : 'asc';
      setSortOption(`${baseName}-${newDirection}`);
    } else {
      // Default to ascending for new selection
      setSortOption(`${baseName}-asc`);
    }
  };

  // Helper to get a human-readable label for sort options
  const getSortOptionLabel = (option: string): string => {
    // Get the base option name without direction suffix
    const baseName = option.replace(/-asc$|-desc$/, '');
    
    // Format for display - special case for careLevel to make it more readable 
    if (baseName === 'careLevel') {
      return 'Care Level';
    }
    
    // For other options, apply standard formatting
    return baseName
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Get sort direction for an option
  const getSortDirection = (option?: string): 'asc' | 'desc' | null => {
    if (!option) return null;
    
    const baseName = option.replace(/-asc$|-desc$/, '');
    
    if (sortOption && sortOption.replace(/-asc$|-desc$/, '') === baseName) {
      return sortOption.endsWith('-desc') ? 'desc' : 'asc';
    }
    
    return null;
  };

  // Extract the most important category filters (limit to 3 most important)
  const getImportantCategoryFilters = () => {
    const priorityKeys = ['size', 'temperament', 'careLevel'];
    const categoryEntries = Object.entries(filterConfig.categoryFilters || {});
    
    // First include priority keys in the specified order
    const priorityEntries = priorityKeys
      .map(key => categoryEntries.find(([k]) => k === key))
      .filter(Boolean) as [string, any][];
    
    // Then add any remaining entries up to a limit
    const remainingEntries = categoryEntries
      .filter(([key]) => !priorityKeys.includes(key))
      .slice(0, Math.max(0, 3 - priorityEntries.length));
    
    return [...priorityEntries, ...remainingEntries];
  };

  return (
    <div className="flex items-center gap-2">
      {/* Clear Filters button to the left */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size={buttonSize}
          onClick={resetFilters}
          className="h-9 px-2.5"
        >
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Clear Filters
        </Button>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant={buttonVariant} size={buttonSize} className="relative">
            <Filter className="h-4 w-4 mr-1.5" />
            {filterButtonLabel}
            {/* Only show the counter when there are active filters */}
            {activeFilterCount > 0 && (
              <Badge variant="outline" className="ml-1.5 py-0 h-5 text-xs bg-muted">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] max-w-[95vw] p-3" align="end">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4" />
                <span className="font-medium text-sm">Filters</span>
                {/* Removed duplicate counter badge */}
              </div>
              
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            
            {/* Sort Options - Simple dropdown style */}
            {filterConfig.sortOptions && Object.keys(filterConfig.sortOptions).length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <SortAsc className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Sort By</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(() => {
                    // Group sort options by their base name (without -asc/-desc suffixes)
                    const groupedOptions = Object.keys(filterConfig.sortOptions).reduce((groups, option) => {
                      const baseName = option.replace(/-asc$|-desc$/, '');
                      if (!groups[baseName]) {
                        groups[baseName] = [];
                      }
                      groups[baseName].push(option);
                      return groups;
                    }, {} as Record<string, string[]>);
                    
                    // For each group, only show one button
                    return Object.entries(groupedOptions).map(([baseName, options]) => {
                      // For options with directional variants, use the first option as the representative
                      const option = options[0];
                      const currentDirection = options.length > 0 ? 
                        (getSortDirection(options[0]) || getSortDirection(options[1] || '')) : 
                        null;
                      const isSelected = !!currentDirection;
                      
                      return (
                        <div key={baseName} className="flex items-center">
                          <Badge
                            variant={isSelected ? "default" : "outline"}
                            className={`cursor-pointer py-0.5 px-2 text-xs ${
                              isSelected ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'hover:bg-muted'
                            }`}
                            onClick={() => {
                              // Special handling for direction-specific options
                              if (options.length > 1) {
                                // Toggle between asc and desc variants
                                const ascOption = options.find(o => o.endsWith('-asc'));
                                const descOption = options.find(o => o.endsWith('-desc'));
                                
                                if (currentDirection === 'asc' && descOption) {
                                  toggleSortOption(descOption);
                                } else if (currentDirection === 'desc' && ascOption) {
                                  toggleSortOption(ascOption);
                                } else if (ascOption) {
                                  toggleSortOption(ascOption);
                                }
                              } else if (option) {
                                // For options without direction variants
                                toggleSortOption(option);
                              }
                            }}
                          >
                            {option ? getSortOptionLabel(option) : baseName}
                            {isSelected && (
                              <span className="ml-1">
                                {currentDirection === 'asc' ? '↑' : '↓'}
                              </span>
                            )}
                          </Badge>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
            
            <Separator className="my-1" />
            
            {/* Toggle Filters - Quick access */}
            {filterConfig.toggleFilters && Object.keys(filterConfig.toggleFilters).length > 0 && (
              <div className="space-y-2">
                {Object.entries(filterConfig.toggleFilters || {}).map(([key, config]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <Label htmlFor={`toggle-${key}`} className="text-xs cursor-pointer">
                      {config.label}
                    </Label>
                    <Switch
                      id={`toggle-${key}`}
                      checked={toggleFilters[key] || false}
                      onCheckedChange={(value) => setToggleFilter(key, value)}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Category Filters - Only most important ones */}
            {getImportantCategoryFilters().length > 0 && (
              <div className="space-y-3">
                {getImportantCategoryFilters().map(([key, config]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {getCategoryIcon(key)}
                      <span className="text-xs font-medium">{config.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {config.options.map((option) => (
                        <Badge
                          key={option}
                          variant={categoryFilters[key]?.includes(option) ? "default" : "outline"}
                          className={`cursor-pointer text-xs py-0.5 px-2 ${
                            categoryFilters[key]?.includes(option) 
                              ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                              : 'hover:bg-muted'
                          }`}
                          onClick={() => toggleCategoryFilter(key, option)}
                        >
                          {formatFilterOption(key, option)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-1.5 text-xs"
                    onClick={resetFilters}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
