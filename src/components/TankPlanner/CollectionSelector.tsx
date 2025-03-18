/** @jsxImportSource react */
import React, { useState, useMemo } from 'react';
import type { BaseTankItemData, TankParameters, FishData, PlantData } from './types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, AlertTriangle, Fish, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getConsistentColor, getContrastColor } from '@/lib/colors';
import type { FilterConfig, UseCollectionFilterResult } from '@/hooks/useCollectionFilter';
import { useCollectionFilter } from '@/hooks/useCollectionFilter';
import { CompactFilter } from './CompactFilter';
import { isFishData, isPlantData } from './types';
import { checkFishCompatibility, checkPlantCompatibility } from '@/utils/compatibility-utils';
import { TankItemCard } from './TankItemCard';

/**
 * Props for the CollectionSelector component
 * @template T - Type extending BaseTankItemData (fish, plants, etc.)
 */
interface CollectionSelectorProps<T extends BaseTankItemData> {
  /** Collection items to display and filter */
  items: T[];
  /** Currently selected items */
  selectedItems: T[];
  /** Callback when an item is added to the selection */
  onAddItem: (item: T) => void;
  /** Filter configuration for this collection type */
  filterConfig: FilterConfig<T>;
  /** Optional filter result from useCollectionFilter hook */
  filterResult?: UseCollectionFilterResult<T>;
  /** Current tank parameters for compatibility checks */
  currentParameters?: TankParameters;
  /** Selected fish for cross-compatibility checks */
  selectedFish?: FishData[];
  /** Title of the collection (e.g., "Fish", "Plants") */
  title?: string;
  /** Subtitle for the collection */
  subtitle?: string;
  /** Icon to represent this collection type */
  itemIcon?: LucideIcon | string;
  /** Optional custom renderer for item details section */
  renderItemDetails?: (item: T) => React.ReactNode;
  /** Optional custom renderer for item badges */
  renderItemBadges?: (item: T) => React.ReactNode;
  /** Optional custom renderer for the entire item */
  renderItem?: (item: T, isSelected: boolean, compatibilityIssues: string[], onAdd: () => void) => React.ReactNode;
  /** Optional function to determine item color */
  getItemColor?: (item: T) => string;
  /** Optional function to check compatibility issues */
  getCompatibilityIssues?: (item: T, parameters?: TankParameters, selectedItems?: BaseTankItemData[]) => string[];
  /** Placeholder text for the search input */
  searchPlaceholder?: string;
  /** Message to display when no items match the filters */
  emptyStateMessage?: string;
  /** Whether to use square or round avatars */
  squareAvatars?: boolean;
}

/**
 * A reusable component for displaying and filtering collections of tank items
 * Can be used for fish, plants, or any other collection that extends BaseTankItemData
 */
export function CollectionSelector<T extends BaseTankItemData>({
  items,
  selectedItems,
  onAddItem,
  filterConfig,
  filterResult,
  currentParameters,
  selectedFish = [],
  title = 'Collection',
  subtitle,
  itemIcon,
  renderItemDetails,
  renderItemBadges,
  renderItem,
  getItemColor = (item) => getConsistentColor(item.scientificName, isFishData(item)),
  getCompatibilityIssues = (item, parameters, selectedItems) => {
    if (isFishData(item) && parameters) {
      return checkFishCompatibility(item as FishData, parameters, selectedItems?.filter(isFishData) as FishData[] || []);
    } else if (isPlantData(item) && parameters) {
      return checkPlantCompatibility(item as PlantData, parameters, selectedItems?.filter(isFishData) as FishData[] || []);
    }
    return [];
  },
  searchPlaceholder = 'Search...',
  emptyStateMessage = 'No items found matching your filters.',
  squareAvatars = true
}: CollectionSelectorProps<T>) {
  // Use the provided filter result or create a new one
  const {
    filteredItems,
    searchQuery,
    setSearchQuery,
    categoryFilters,
    setCategoryFilter,
    rangeFilters,
    setRangeFilter,
    toggleFilters,
    setToggleFilter,
    resetFilters,
    sortOption,
    setSortOption,
    activeFilterCount
  } = filterResult || useCollectionFilter(items, filterConfig, currentParameters, selectedItems);

  // Get the appropriate icon component based on the item type or provided icon
  const getIconForItem = (item: T): React.ReactNode => {
    // If itemIcon is a React component (LucideIcon)
    if (typeof itemIcon === 'function') {
      const IconComponent = itemIcon;
      return <IconComponent className="h-5 w-5" />;
    }
    
    // If itemIcon is a string identifier
    if (typeof itemIcon === 'string') {
      if (itemIcon === 'fish') return <Fish className="h-5 w-5" />;
      if (itemIcon === 'plant') return <Leaf className="h-5 w-5" />;
    }
    
    // Default based on item type
    if (isFishData(item)) return <Fish className="h-5 w-5" />;
    if (isPlantData(item)) return <Leaf className="h-5 w-5" />;
    
    // Fallback
    return <Fish className="h-5 w-5" />;
  };

  // Helper function to render the appropriate card based on item type
  const renderDefaultItemCard = (item: T, compatibilityIssues: string[]) => {
    if (isFishData(item) || isPlantData(item)) {
      return (
        <TankItemCard 
          item={item as (FishData | PlantData)}
          showIssues={true}
          issues={compatibilityIssues}
          onViewDetails={() => {}} // No details view in collection selector
          squareAvatar={squareAvatars}
        />
      );
    }

    // Fallback for other types (should not happen in practice)
    const itemColor = getItemColor(item);
    const contrastColor = getContrastColor(itemColor);
    const hasCompatibilityIssues = compatibilityIssues.length > 0;

    return (
      <Card className="overflow-hidden mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar className={`h-10 w-10 ${squareAvatars ? 'rounded-md' : 'rounded-full'}`}>
              <AvatarFallback 
                className={`${squareAvatars ? 'rounded-md' : 'rounded-full'} flex items-center justify-center`}
                style={{ backgroundColor: itemColor, color: contrastColor }}
              >
                {getIconForItem(item)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium leading-none flex items-center gap-2">
                    {item.name}
                    {hasCompatibilityIssues && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </h4>
                  <p className="text-sm text-muted-foreground italic">
                    {item.scientificName}
                  </p>
                </div>
              </div>

              {/* Item badges */}
              {renderItemBadges ? (
                <div className="flex flex-wrap gap-1 mt-2">
                  {renderItemBadges(item)}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="capitalize">{item.careLevel}</Badge>
                </div>
              )}

              {/* Compatibility issues */}
              {hasCompatibilityIssues && (
                <div className="text-sm text-yellow-500 flex items-start gap-1 mt-1">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{compatibilityIssues[0]}</span>
                </div>
              )}

              {/* Item details */}
              {renderItemDetails && (
                <div className="mt-3 pt-3 border-t">
                  {renderItemDetails(item)}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {title && (
        <div className="flex flex-col space-y-2 p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{title}</h2>
            <CompactFilter
              filterConfig={filterConfig}
              categoryFilters={categoryFilters}
              rangeFilters={rangeFilters}
              toggleFilters={toggleFilters}
              setCategoryFilter={setCategoryFilter}
              setRangeFilter={setRangeFilter}
              setToggleFilter={setToggleFilter}
              resetFilters={resetFilters}
              sortOption={sortOption ?? ''}
              setSortOption={setSortOption}
              filterButtonLabel={`Filters${activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}`}
            />
          </div>
          
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      )}
      
      <div className="relative p-4 border-b">
        <Search className="absolute left-6 top-6.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
        
        <div className="text-sm text-muted-foreground mt-2">
          Showing {filteredItems.length} of {items.length} items
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">{emptyStateMessage}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2 p-2">
            {filteredItems.map((item) => {
              const isSelected = selectedItems.some((selected) => selected.slug === item.slug);
              const compatibilityIssues = getCompatibilityIssues(item, currentParameters, selectedItems);
              
              return (
                <div key={item.slug} className={`transition-colors ${isSelected ? 'bg-muted/50' : ''}`}>
                  <div className="flex flex-col">
                    {renderItem ? (
                      renderItem(item, isSelected, compatibilityIssues, () => onAddItem(item))
                    ) : (
                      <>
                        {renderDefaultItemCard(item, compatibilityIssues)}
                        <div className="flex justify-end px-4 pb-3 -mt-2">
                          <Button
                            size="sm"
                            variant={isSelected ? "secondary" : "default"}
                            className="shrink-0"
                            disabled={isSelected}
                            onClick={() => onAddItem(item)}
                          >
                            {isSelected ? 'Added' : 'Add'}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
