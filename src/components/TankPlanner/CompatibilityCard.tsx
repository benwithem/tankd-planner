/** @jsxImportSource react */
import React from 'react';
import type { FishData, PlantData, TankParameters } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getConsistentColor, getContrastColor } from '@/lib/colors';
import { Fish, Leaf, AlertTriangle, Info, Minus, Plus } from 'lucide-react';
import { checkFishCompatibility, checkPlantCompatibility } from '@/utils/compatibility-utils';

interface CompatibilityCardProps {
  item: FishData | PlantData;
  parameters: TankParameters;
  selectedFish: FishData[];
  selectedPlants: PlantData[];
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onViewDetails: () => void;
}

export function CompatibilityCard({
  item,
  parameters,
  selectedFish,
  selectedPlants,
  onUpdateQuantity,
  onRemove,
  onViewDetails,
}: CompatibilityCardProps) {
  const isPlant = 'lighting' in item;
  const bgColor = getConsistentColor(item.scientificName, !isPlant);
  const textColor = getContrastColor(bgColor);
  const issues = isPlant
    ? checkPlantCompatibility(item as PlantData, parameters, selectedFish)
    : checkFishCompatibility(item as FishData, parameters, selectedFish);
  const hasIssues = issues.length > 0;

  return (
    <Card className="overflow-hidden mb-4">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar color={bgColor}>
            <AvatarFallback textColor={textColor}>
              {isPlant ? <Leaf className="h-6 w-6" /> : <Fish className="h-6 w-6" />}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium leading-none flex items-center gap-2">
                  {item.name}
                  {hasIssues && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  {item.scientificName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateQuantity(Math.max(0, (item.quantity || 1) - 1))}
                    className="h-8 w-8"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity || 1}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onUpdateQuantity((item.quantity || 1) + 1)}
                    className="h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onViewDetails}
                  className="h-8 w-8"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </div>
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
                <Badge variant="outline">Care: {(item as FishData).careLevel}</Badge>
              </div>
            )}

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
}
