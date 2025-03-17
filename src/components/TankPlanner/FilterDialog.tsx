import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { 
  Fish, 
  Waves, 
  Thermometer,
  Ruler,
  Heart,
  Scale,
  Droplets,
  X,
  Check,
  RefreshCw,
  Leaf
} from "lucide-react";

interface FilterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onReset: () => void;
  isPlant?: boolean;
}

interface FilterState {
  careLevel: string[];
  temperament: string[];
  swimLevel: string[];
  minTemp: number;
  maxTemp: number;
  minPh: number;
  maxPh: number;
  minSize: number;
  maxSize: number;
  showCompatibleOnly: boolean;
  showInTankOnly: boolean;
  showFavoritesOnly: boolean;
}

type FilterCategory = keyof Pick<FilterState, 'careLevel' | 'temperament' | 'swimLevel'>;

export function FilterDialog({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
  onReset,
  isPlant = false,
}: FilterDialogProps) {
  const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

  const handleReset = () => {
    onReset();
    onOpenChange(false);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const toggleFilter = (category: FilterCategory, value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const isFilterActive = (category: FilterCategory, value: string): boolean => {
    return localFilters[category].includes(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isPlant ? 'Filter Plants' : 'Filter Fish'}</DialogTitle>
          <DialogDescription>
            Customize your view with advanced filtering options
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Filters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {/* Quick Filters */}
                <div className="space-y-2">
                  <Label>Quick Filters</Label>
                  <div className="flex flex-wrap gap-2">
                    <Switch
                      checked={localFilters.showCompatibleOnly}
                      onCheckedChange={(checked) => 
                        setLocalFilters(prev => ({ ...prev, showCompatibleOnly: checked }))
                      }
                      id="compatible"
                    />
                    <Label htmlFor="compatible">Show Compatible Only</Label>

                    <Switch
                      checked={localFilters.showInTankOnly}
                      onCheckedChange={(checked) => 
                        setLocalFilters(prev => ({ ...prev, showInTankOnly: checked }))
                      }
                      id="intank"
                    />
                    <Label htmlFor="intank">Show In Tank Only</Label>

                    <Switch
                      checked={localFilters.showFavoritesOnly}
                      onCheckedChange={(checked) => 
                        setLocalFilters(prev => ({ ...prev, showFavoritesOnly: checked }))
                      }
                      id="favorites"
                    />
                    <Label htmlFor="favorites">Show Favorites Only</Label>
                  </div>
                </div>

                {/* Care Level */}
                <div className="space-y-2">
                  <Label>Care Level</Label>
                  <div className="flex flex-wrap gap-2">
                    {['beginner', 'intermediate', 'advanced'].map(level => (
                      <Badge
                        key={level}
                        variant={isFilterActive('careLevel', level) ? 'default' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleFilter('careLevel', level)}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Temperament */}
                <div className="space-y-2">
                  <Label>Temperament</Label>
                  <div className="flex flex-wrap gap-2">
                    {['peaceful', 'semi-aggressive', 'aggressive'].map(temp => (
                      <Badge
                        key={temp}
                        variant={isFilterActive('temperament', temp) ? 'default' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleFilter('temperament', temp)}
                      >
                        {temp}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Swim Level */}
                <div className="space-y-2">
                  <Label>Swim Level</Label>
                  <div className="flex flex-wrap gap-2">
                    {['top', 'middle', 'bottom'].map(level => (
                      <Badge
                        key={level}
                        variant={isFilterActive('swimLevel', level) ? 'default' : 'outline'}
                        className="cursor-pointer capitalize"
                        onClick={() => toggleFilter('swimLevel', level)}
                      >
                        {level}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="advanced" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {/* Temperature Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Temperature Range (°C)</Label>
                    <div className="text-sm text-muted-foreground">
                      {localFilters.minTemp}°C - {localFilters.maxTemp}°C
                    </div>
                  </div>
                  <div className="pt-2">
                    <Slider
                      min={18}
                      max={32}
                      step={0.5}
                      value={[localFilters.minTemp, localFilters.maxTemp]}
                      onValueChange={([min, max]) => 
                        setLocalFilters(prev => ({ ...prev, minTemp: min, maxTemp: max }))
                      }
                    />
                  </div>
                </div>

                {/* pH Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>pH Range</Label>
                    <div className="text-sm text-muted-foreground">
                      {localFilters.minPh} - {localFilters.maxPh}
                    </div>
                  </div>
                  <div className="pt-2">
                    <Slider
                      min={6.0}
                      max={8.0}
                      step={0.1}
                      value={[localFilters.minPh, localFilters.maxPh]}
                      onValueChange={([min, max]) => 
                        setLocalFilters(prev => ({ ...prev, minPh: min, maxPh: max }))
                      }
                    />
                  </div>
                </div>

                {/* Size Range */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Size Range (cm)</Label>
                    <div className="text-sm text-muted-foreground">
                      {localFilters.minSize}cm - {localFilters.maxSize}cm
                    </div>
                  </div>
                  <div className="pt-2">
                    <Slider
                      min={1}
                      max={30}
                      step={0.5}
                      value={[localFilters.minSize, localFilters.maxSize]}
                      onValueChange={([min, max]) => 
                        setLocalFilters(prev => ({ ...prev, minSize: min, maxSize: max }))
                      }
                    />
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
