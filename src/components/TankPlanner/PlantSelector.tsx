/** @jsxImportSource react */
import React, { useState, useMemo } from 'react';
import type { PlantData, TankParameters, FishData } from './types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Leaf, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getConsistentColor, getContrastColor } from '@/lib/colors';
import { checkPlantCompatibility } from '@/utils/compatibility-utils';

interface PlantSelectorProps {
  allPlants: PlantData[];
  selectedPlants: PlantData[];
  selectedFish: FishData[];
  onAddPlant: (plant: PlantData) => void;
  currentParameters?: TankParameters;
}

export function PlantSelector({
  allPlants,
  selectedPlants,
  selectedFish,
  onAddPlant,
  currentParameters,
}: PlantSelectorProps) {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredPlants = useMemo(() => {
    return allPlants.filter((plant) =>
      plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allPlants, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search plants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4">
        {filteredPlants.map((plant) => {
          const isSelected = selectedPlants.some(p => p.slug === plant.slug);
          const issues = checkPlantCompatibility(plant, currentParameters, selectedFish);
          const hasIssues = issues.length > 0;
          const bgColor = getConsistentColor(plant.scientificName, false);
          const textColor = getContrastColor(bgColor);

          return (
            <Card key={plant.slug} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar color={bgColor}>
                    <AvatarFallback textColor={textColor}>
                      <Leaf className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium leading-none flex items-center gap-2">
                          {plant.name}
                          {hasIssues && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground italic">
                          {plant.scientificName}
                        </p>
                      </div>
                      <Button
                        variant={isSelected ? "secondary" : "default"}
                        onClick={() => !isSelected && onAddPlant(plant)}
                        disabled={isSelected}
                        size="sm"
                      >
                        {isSelected ? "Added" : "Add"}
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className={
                        plant.lighting === 'high' ? 'bg-yellow-100 dark:bg-yellow-900' :
                        plant.lighting === 'low' ? 'bg-blue-100 dark:bg-blue-900' :
                        'bg-green-100 dark:bg-green-900'
                      }>
                        {plant.lighting} light
                      </Badge>
                      <Badge variant={plant.co2 === 'required' ? 'destructive' : 'secondary'}>
                        CO2: {plant.co2}
                      </Badge>
                      <Badge variant="outline">
                        Growth: {plant.growthRate}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Height:</span>
                        <br />{plant.height}cm
                      </div>
                      <div>
                        <span className="text-muted-foreground">Width:</span>
                        <br />{plant.width}cm
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {plant.substrate.map((sub) => (
                        <Badge key={sub} variant="outline" className="text-xs">
                          {sub}
                        </Badge>
                      ))}
                    </div>

                    {hasIssues && (
                      <div className="text-sm text-yellow-500">
                        {issues[0]}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredPlants.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No plants found matching your search
          </div>
        )}
      </div>
    </div>
  );
}
