import React, { useState } from 'react';
import type { TankItem, FishData, FishCategory } from './types';
import { useFishFilter } from '@/hooks/useFishFilter';
import type { SortOption } from '@/hooks/useFishFilter';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Heart, 
  ThermometerSnowflake, 
  Leaf, 
  Droplets, 
  Fish, 
  Star,
  X,
  Home,
  Thermometer,
  Ruler
} from 'lucide-react';
import { SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { getConsistentColor } from '@/utils/color-utils';

interface FishSelectorProps {
  allFish?: TankItem[];
  selectedFish?: TankItem[];
  onAddFish: (fish: TankItem) => void;
  tankSize: number;
  currentParameters: {
    temperature: number;
    ph: number;
  };
}

// Fish card component for better visualization
const FishCard: React.FC<{
  fish: TankItem;
  onAddFish: (fish: TankItem) => void;
  toggleFavorite: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  isCompatible?: boolean;
  isAdded?: boolean;
  currentParameters: { temperature: number; ph: number };
}> = ({ 
  fish, 
  onAddFish, 
  toggleFavorite, 
  isFavorite, 
  isCompatible = true,
  isAdded = false,
  currentParameters
}) => {
  // Check if fish is compatible with current tank parameters
  const isTemperatureCompatible = 
    currentParameters.temperature >= fish.waterParameters.temperature[0] && 
    currentParameters.temperature <= fish.waterParameters.temperature[1];
  
  const isPHCompatible = 
    currentParameters.ph >= fish.waterParameters.pH[0] && 
    currentParameters.ph <= fish.waterParameters.pH[1];

  const iconColor = getConsistentColor(fish.name, false);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-colors hover:bg-accent/5",
      !isCompatible && "opacity-80"
    )}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-md shrink-0"
              style={{
                backgroundColor: `${iconColor}15`,
                color: iconColor
              }}
            >
              <Fish className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="font-medium flex items-center gap-2">
                {fish.name}
                {isAdded && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    In Tank
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground italic">
                {fish.scientificName}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    fish.careLevel === 'easy' ? "text-green-500 border-green-500" : 
                    fish.careLevel === 'moderate' ? "text-amber-500 border-amber-500" : 
                    "text-red-500 border-red-500"
                  )}
                >
                  {fish.careLevel}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  Min. {fish.tankSize?.minimum}L
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => toggleFavorite(fish.slug)}
          >
            {isFavorite(fish.slug) ? (
              <Heart className="h-4 w-4 fill-primary text-primary" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3 w-3" />
            <span className={cn(
              !isTemperatureCompatible && "text-amber-500"
            )}>
              {fish.waterParameters.temperature[0]}-{fish.waterParameters.temperature[1]}°C
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            <span className={cn(
              !isPHCompatible && "text-amber-500"
            )}>
              pH {fish.waterParameters.pH[0]}-{fish.waterParameters.pH[1]}
            </span>
          </div>
        </div>

        <Button 
          variant={isCompatible ? "default" : "secondary"}
          className={cn(
            "w-full",
            !isCompatible && "bg-amber-500 hover:bg-amber-600 text-white"
          )}
          onClick={() => onAddFish(fish)}
          disabled={isAdded}
        >
          {isAdded ? "Added to Tank" : isCompatible ? "Add to Tank" : "Add with Caution"}
        </Button>
      </CardContent>
    </Card>
  );
};

export const FishSelector: React.FC<FishSelectorProps> = ({ 
  allFish = [], 
  selectedFish = [],
  onAddFish, 
  tankSize,
  currentParameters
}: FishSelectorProps) => {
  const [activeTab, setActiveTab] = useState<'all' | 'favorites' | 'compatible'>('all');
  
  const { 
    searchTerm, 
    setSearchTerm, 
    plantSafeOnly,
    setPlantSafeOnly,
    sizeCompatibleOnly,
    setSizeCompatibleOnly,
    filteredFish,
    totalCount,
    filteredCount,
    activeFishCategories,
    setActiveFishCategories,
    availableCategories,
    favoritesOnly, 
    setFavoritesOnly,
    toggleFavorite,
    isFavorite,
    sortOption,
    setSortOption,
    sortDirection,
    setSortDirection,
    setTankSize
  } = useFishFilter(allFish);

  // Initialize immediately with useLayoutEffect
  React.useLayoutEffect(() => {
    setTankSize(tankSize);
  }, [tankSize, setTankSize]);

  // Handle tab change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as 'all' | 'favorites' | 'compatible');
    
    if (tab === 'favorites') {
      setFavoritesOnly(true);
      setSizeCompatibleOnly(false);
    } else if (tab === 'compatible') {
      setFavoritesOnly(false);
      setSizeCompatibleOnly(true);
    } else {
      setFavoritesOnly(false);
      setSizeCompatibleOnly(false);
    }
  };

  // Toggle sort direction
  const toggleSortDirection = () => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // Toggle category filter
  const toggleCategory = (category: FishCategory) => {
    setActiveFishCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Check if fish is compatible with current tank parameters
  const isCompatible = (fish: TankItem): boolean => {
    // If no fish in tank yet, only check tank size compatibility
    if (!allFish || allFish.length === 0) {
      return tankSize >= (fish.tankSize?.minimum || 0);
    }

    const isTemperatureCompatible = 
      currentParameters.temperature >= fish.waterParameters.temperature[0] && 
      currentParameters.temperature <= fish.waterParameters.temperature[1];
    
    const isPHCompatible = 
      currentParameters.ph >= fish.waterParameters.pH[0] && 
      currentParameters.ph <= fish.waterParameters.pH[1];

    const isSizeCompatible = tankSize >= (fish.tankSize?.minimum || 0);
    
    return isTemperatureCompatible && isPHCompatible && isSizeCompatible;
  };

  // Filter fish based on active tab and compatibility
  const displayedFish = activeTab === 'compatible' 
    ? filteredFish.filter(isCompatible)
    : filteredFish;

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <Tabs defaultValue="all" className="w-full" onValueChange={handleTabChange}>
          <div className="px-3 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="all">
                All Fish
                <Badge variant="secondary" className="ml-2">
                  {filteredFish.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="favorites">
                Favorites
                <Badge variant="secondary" className="ml-2">
                  {filteredFish.filter(fish => isFavorite(fish.slug)).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="compatible">
                Compatible
                <Badge variant="secondary" className="ml-2">
                  {filteredFish.filter(fish => isCompatible(fish)).length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        <div className="p-3 space-y-2">
          {/* Search and count header */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">
              Showing {displayedFish.length} of {allFish.length} fish
              {selectedFish.length > 0 && ` • ${selectedFish.length} added`}
            </span>
          </div>
          
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search fish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <ToggleGroup type="multiple" variant="outline" className="flex flex-wrap gap-1">
              <ToggleGroupItem
                value="compatible"
                aria-label="Toggle size compatible"
                onClick={() => setSizeCompatibleOnly(!sizeCompatibleOnly)}
                data-state={sizeCompatibleOnly ? 'on' : 'off'}
              >
                <Ruler className="h-4 w-4 mr-1" />
                Size Compatible
              </ToggleGroupItem>
              <ToggleGroupItem
                value="plantSafe"
                aria-label="Toggle plant safe"
                onClick={() => setPlantSafeOnly(!plantSafeOnly)}
                data-state={plantSafeOnly ? 'on' : 'off'}
              >
                <Leaf className="h-4 w-4 mr-1" />
                Plant Safe
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3">
          {displayedFish.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedFish.map((fish) => (
                <FishCard
                  key={fish.name}
                  fish={fish}
                  onAddFish={onAddFish}
                  toggleFavorite={toggleFavorite}
                  isFavorite={isFavorite}
                  currentParameters={currentParameters}
                  isCompatible={isCompatible(fish)}
                  isAdded={selectedFish.some(f => f.scientificName === fish.scientificName)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
                <Fish className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No fish found</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
