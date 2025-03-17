/** @jsxImportSource react */
import React from 'react';
import type { FishData, PlantData } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getConsistentColor, getContrastColor } from '@/lib/colors';
import { Fish, Leaf } from 'lucide-react';

interface SelectedItemsListProps {
  selectedFish: FishData[];
  selectedPlants: PlantData[];
  onUpdateFishQuantity: (fish: FishData, quantity: number) => void;
  onUpdatePlantQuantity: (plant: PlantData, quantity: number) => void;
  onRemoveFish: (fish: FishData) => void;
  onRemovePlant: (plant: PlantData) => void;
}

export function SelectedItemsList({
  selectedFish,
  selectedPlants,
  onUpdateFishQuantity,
  onUpdatePlantQuantity,
  onRemoveFish,
  onRemovePlant,
}: SelectedItemsListProps) {
  const renderQuantityControls = (
    item: FishData | PlantData,
    onUpdate: (quantity: number) => void
  ) => (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onUpdate(Math.max(0, (item.quantity || 0) - 1))}
        disabled={!item.quantity}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="w-8 text-center">{item.quantity || 0}</span>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onUpdate((item.quantity || 0) + 1)}
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );

  const renderItem = (
    item: FishData | PlantData,
    isPlant: boolean,
    onUpdateQuantity: (quantity: number) => void,
    onRemove: () => void
  ) => {
    const bgColor = getConsistentColor(item.scientificName, !isPlant);
    const textColor = getContrastColor(bgColor);

    return (
      <Card key={isPlant ? item.scientificName : item.slug} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start space-x-4">
            <Avatar color={bgColor}>
              <AvatarFallback textColor={textColor}>
                {isPlant ? <Leaf className="h-6 w-6" /> : <Fish className="h-6 w-6" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium leading-none">{item.name}</h4>
                  <p className="text-sm text-muted-foreground italic">
                    {item.scientificName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemove}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {isPlant ? (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={
                    (item as PlantData).lighting === 'high' ? 'bg-yellow-100 dark:bg-yellow-900' :
                    (item as PlantData).lighting === 'low' ? 'bg-blue-100 dark:bg-blue-900' :
                    'bg-green-100 dark:bg-green-900'
                  }>
                    {(item as PlantData).lighting} light
                  </Badge>
                  <Badge variant={(item as PlantData).co2 === 'required' ? 'destructive' : 'secondary'}>
                    CO2: {(item as PlantData).co2}
                  </Badge>
                  <Badge variant="outline">
                    Growth: {(item as PlantData).growthRate}
                  </Badge>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Badge variant={(item as FishData).temperament === 'peaceful' ? 'default' : 'destructive'}>
                    {(item as FishData).temperament}
                  </Badge>
                  <Badge variant="outline">{(item as FishData).location}</Badge>
                  <Badge variant="outline">{(item as FishData).size}</Badge>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                {renderQuantityControls(item, onUpdateQuantity)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <div className="space-y-2">
        {selectedFish.map((fish) =>
          renderItem(
            fish,
            false,
            (quantity) => onUpdateFishQuantity(fish, quantity),
            () => onRemoveFish(fish)
          )
        )}
        {selectedPlants.map((plant) =>
          renderItem(
            plant,
            true,
            (quantity) => onUpdatePlantQuantity(plant, quantity),
            () => onRemovePlant(plant)
          )
        )}
      </div>
    </div>
  );
}
