import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Search,
  Thermometer,
  Droplets,
  Star,
  CloudSun,
  Gauge,
  Droplet,
  Filter,
  AlertCircle,
  Check,
  Leaf,
  Heart,
  ThermometerSun,
  Waves,
  Sun,
  Mountain,
  CircleDot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PlantItem, SubstrateType, CO2Requirement, LightingLevel } from './types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { getConsistentColor } from '@/utils/color-utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SheetClose } from '@/components/ui/sheet';

interface PlantSelectorProps {
  allPlants: PlantItem[];
  selectedPlants: PlantItem[];
  onAddPlant: (plant: PlantItem) => void;
  tankSize: number;
  currentParameters: {
    temperature: number;
    ph: number;
  };
}

// Substrate color mapping
const substrateStyles: Record<SubstrateType, { bg: string; text: string }> = {
  'aqua soil': { bg: 'bg-amber-900', text: 'text-white' },
  'sand': { bg: 'bg-yellow-100', text: 'text-yellow-900' },
  'gravel': { bg: 'bg-stone-400', text: 'text-stone-900' },
  'clay': { bg: 'bg-red-700', text: 'text-white' },
  'bare bottom': { bg: 'bg-blue-100', text: 'text-blue-900' },
  'none': { bg: 'bg-transparent', text: 'text-gray-500' }
};

interface PlantCardProps {
  plant: PlantItem;
  onAddPlant: (plant: PlantItem) => void;
  toggleFavorite: (scientificName: string) => void;
  isFavorite: (scientificName: string) => boolean;
  isCompatible?: boolean;
  compatibilityIssues?: string[];
  isAdded?: boolean;
  currentParameters: {
    temperature: number;
    ph: number;
  };
}

const PlantCard: React.FC<PlantCardProps> = ({ 
  plant, 
  onAddPlant, 
  toggleFavorite, 
  isFavorite, 
  isCompatible = true,
  compatibilityIssues = [],
  isAdded = false,
  currentParameters
}) => {
  const hasTemperature = plant.waterParameters?.temperature?.[0] != null && plant.waterParameters.temperature[1] != null;
  const hasPH = plant.waterParameters?.pH?.[0] != null && plant.waterParameters.pH[1] != null;
  const iconColor = getConsistentColor(plant.scientificName, true);

  return (
    <Card className="h-full flex flex-col hover:bg-accent/5 transition-colors">
      <CardContent className="flex-1 flex flex-col p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div 
              className="p-2 rounded-md shrink-0"
              style={{
                backgroundColor: `${iconColor}15`,
                color: iconColor
              }}
            >
              <Leaf className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="font-medium flex items-center gap-2">
                {plant.commonName}
                {isAdded && (
                  <Badge variant="outline" className="text-[10px] font-normal">
                    In Tank
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground italic">
                {plant.scientificName}
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {compatibilityIssues.length > 0 ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="outline" className="text-amber-500 border-amber-500 flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Caution ({compatibilityIssues.length})
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <ul className="list-disc list-inside">
                          {compatibilityIssues.map((issue, index) => (
                            <li key={index} className="text-sm">{issue}</li>
                          ))}
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Badge variant="outline" className="text-green-500 border-green-500 flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Compatible
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => toggleFavorite(plant.scientificName)}
          >
            {isFavorite(plant.scientificName) ? (
              <Heart className="h-4 w-4 fill-primary text-primary" />
            ) : (
              <Heart className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-1">
              <ThermometerSun className="h-3 w-3" />
              Temperature
            </Label>
            <p>{hasTemperature ? `${plant.waterParameters.temperature[0]}-${plant.waterParameters.temperature[1]}°C` : 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-1">
              <Waves className="h-3 w-3" />
              pH
            </Label>
            <p>{hasPH ? `${plant.waterParameters.pH[0]}-${plant.waterParameters.pH[1]}` : 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-1">
              <Sun className="h-3 w-3" />
              Lighting
            </Label>
            <p className="capitalize">{plant.lighting || 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-1">
              <Mountain className="h-3 w-3" />
              Substrate
            </Label>
            <p className="capitalize">{plant.substrate?.slice(0, 2).join(', ') || 'Any'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-1">
              <CircleDot className="h-3 w-3" />
              CO2
            </Label>
            <p className="capitalize">{plant.co2 || 'Unknown'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-muted-foreground flex items-center gap-1">
              <Leaf className="h-3 w-3" />
              Growth
            </Label>
            <p className="capitalize">{plant.growth || 'Unknown'}</p>
          </div>
        </div>

        <Button 
          className="w-full mt-auto"
          variant={isCompatible ? "default" : "destructive"}
          disabled={isAdded}
          onClick={() => onAddPlant(plant)}
        >
          {isAdded ? 'Added to Tank' : 'Add to Tank'}
        </Button>
      </CardContent>
    </Card>
  );
};

export const PlantSelector: React.FC<PlantSelectorProps> = ({ 
  allPlants = [], 
  selectedPlants = [],
  onAddPlant, 
  tankSize,
  currentParameters
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('name');
  const [activeTab, setActiveTab] = useState('all');
  const [filterCareLevel, setFilterCareLevel] = useState<string[]>([]);
  const [filterLighting, setFilterLighting] = useState<string[]>([]);
  const [filterGrowth, setFilterGrowth] = useState<string[]>([]);
  const [filterSubstrate, setFilterSubstrate] = useState<SubstrateType | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  const isFavorite = useCallback((scientificName: string): boolean => {
    return favorites.has(scientificName);
  }, [favorites]);

  const isCompatible = useCallback((plant: PlantItem): boolean => {
    return plant.waterParameters.temperature[0] <= currentParameters.temperature &&
           plant.waterParameters.temperature[1] >= currentParameters.temperature &&
           plant.waterParameters.pH[0] <= currentParameters.ph &&
           plant.waterParameters.pH[1] >= currentParameters.ph;
  }, [currentParameters]);

  const getCompatibilityIssues = useCallback((plant: PlantItem): string[] => {
    const issues: string[] = [];
    if (plant.waterParameters.temperature[0] > currentParameters.temperature) {
      issues.push(`Temperature too low (min ${plant.waterParameters.temperature[0]}°C)`);
    }
    if (plant.waterParameters.temperature[1] < currentParameters.temperature) {
      issues.push(`Temperature too high (max ${plant.waterParameters.temperature[1]}°C)`);
    }
    if (plant.waterParameters.pH[0] > currentParameters.ph) {
      issues.push(`pH too low (min ${plant.waterParameters.pH[0]})`);
    }
    if (plant.waterParameters.pH[1] < currentParameters.ph) {
      issues.push(`pH too high (max ${plant.waterParameters.pH[1]})`);
    }
    return issues;
  }, [currentParameters]);

  const filteredPlants = useMemo(() => {
    return allPlants.filter(plant => {
      const matchesSearch = plant.commonName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCareLevel = filterCareLevel.length === 0 || 
                              (plant.careLevel && filterCareLevel.includes(plant.careLevel));
      
      const matchesLighting = filterLighting.length === 0 ||
                             (plant.lighting && filterLighting.includes(plant.lighting));
      
      const matchesGrowth = filterGrowth.length === 0 ||
                           (plant.growth && filterGrowth.includes(plant.growth));
      
      const matchesSubstrate = !filterSubstrate || 
                              (plant.substrate && plant.substrate.includes(filterSubstrate));
      
      if (activeTab === 'compatible') {
        return matchesSearch && matchesCareLevel && matchesLighting && matchesGrowth && matchesSubstrate && isCompatible(plant);
      } else if (activeTab === 'favorites') {
        return matchesSearch && matchesCareLevel && matchesLighting && matchesGrowth && matchesSubstrate && isFavorite(plant.scientificName);
      }
      
      return matchesSearch && matchesCareLevel && matchesLighting && matchesGrowth && matchesSubstrate;
    });
  }, [allPlants, searchQuery, activeTab, filterCareLevel, filterLighting, filterGrowth, filterSubstrate, isFavorite, isCompatible]);

  const toggleFavorite = useCallback((scientificName: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(scientificName)) {
        next.delete(scientificName);
      } else {
        next.add(scientificName);
      }
      return next;
    });
  }, []);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="space-y-6 p-6">
        {/* Search and Sort */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60" />
            <Input
              type="search"
              placeholder="Search plants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 bg-background border-muted"
            />
          </div>
          <Select value={sortOption} onValueChange={setSortOption}>
            <SelectTrigger className="w-[140px] border-muted bg-background">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="care">Care Level</SelectItem>
              <SelectItem value="growth">Growth Rate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-muted/30">
            <TabsTrigger value="all" className="flex-1 text-sm">All</TabsTrigger>
            <TabsTrigger value="compatible" className="flex-1 text-sm">Compatible</TabsTrigger>
            <TabsTrigger value="favorites" className="flex-1 text-sm">Favorites</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Collapsible Filter Panel */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full border-muted bg-background text-sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter Options
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full max-h-[70vh] sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Filter Options</DialogTitle>
              <DialogDescription>
                Filter plants by care level, lighting, growth rate, and substrate
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Care Level Filter */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Care Level</Label>
                <ToggleGroup 
                  type="multiple" 
                  value={filterCareLevel}
                  onValueChange={setFilterCareLevel}
                  className="flex flex-wrap gap-2"
                >
                  <ToggleGroupItem value="beginner" aria-label="Toggle beginner" className="bg-background data-[state=on]:bg-primary/10">
                    <Badge variant="outline" className="text-[10px] font-normal">Beginner</Badge>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="intermediate" aria-label="Toggle intermediate" className="bg-background data-[state=on]:bg-primary/10">
                    <Badge variant="outline" className="text-[10px] font-normal">Intermediate</Badge>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="advanced" aria-label="Toggle advanced" className="bg-background data-[state=on]:bg-primary/10">
                    <Badge variant="outline" className="text-[10px] font-normal">Advanced</Badge>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Lighting Filter */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Lighting</Label>
                <ToggleGroup 
                  type="multiple" 
                  value={filterLighting}
                  onValueChange={setFilterLighting}
                  className="flex flex-wrap gap-2"
                >
                  <ToggleGroupItem value="low" aria-label="Toggle low light" className="bg-background data-[state=on]:bg-primary/10">
                    <Badge variant="outline" className="text-[10px] font-normal">Low Light</Badge>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" aria-label="Toggle medium light" className="bg-background data-[state=on]:bg-primary/10">
                    <Badge variant="outline" className="text-[10px] font-normal">Medium Light</Badge>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="high" aria-label="Toggle high light" className="bg-background data-[state=on]:bg-primary/10">
                    <Badge variant="outline" className="text-[10px] font-normal">High Light</Badge>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Growth Rate Filter */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Growth Rate</Label>
                <ToggleGroup 
                  type="multiple" 
                  value={filterGrowth}
                  onValueChange={setFilterGrowth}
                  className="flex flex-wrap gap-2"
                >
                  <ToggleGroupItem value="slow" aria-label="Toggle slow growth" className="bg-background data-[state=on]:bg-primary/10">
                    <Badge variant="outline" className="text-[10px] font-normal">Slow</Badge>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="medium" aria-label="Toggle medium growth" className="bg-background data-[state=on]:bg-primary/10">
                    <Badge variant="outline" className="text-[10px] font-normal">Medium</Badge>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="fast" aria-label="Toggle fast growth" className="bg-background data-[state=on]:bg-primary/10">
                    <Badge variant="outline" className="text-[10px] font-normal">Fast</Badge>
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Substrate Filter */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Substrate</Label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(substrateStyles).map(([type, styles]) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={cn(
                        "cursor-pointer transition-colors font-normal",
                        filterSubstrate === type ? 'bg-primary/10' : 'bg-background'
                      )}
                      onClick={() => setFilterSubstrate(filterSubstrate === type ? null : type as SubstrateType)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Plant Grid */}
        <ScrollArea className="h-[calc(100vh-24rem)]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlants.map((plant) => (
              <PlantCard
                key={plant.scientificName}
                plant={plant}
                onAddPlant={onAddPlant}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite}
                isCompatible={isCompatible(plant)}
                compatibilityIssues={getCompatibilityIssues(plant)}
                isAdded={selectedPlants.some(p => p.scientificName === plant.scientificName)}
                currentParameters={currentParameters}
              />
            ))}
            {filteredPlants.length === 0 && (
              <div className="col-span-3 text-center py-8 text-muted-foreground">
                No plants found matching your criteria
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
