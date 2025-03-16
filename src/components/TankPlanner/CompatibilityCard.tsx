import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronUp, ChevronDown, Trash, Fish, Leaf, ThermometerSnowflake, Droplets } from 'lucide-react';
import type { TankItem, PlantItem, TankParameters } from './types';
import { cn } from '@/lib/utils';

export interface CompatibilityCardProps {
  item: TankItem | PlantItem;
  selectedItems: TankItem[];
  selectedPlants: PlantItem[];
  parameters: TankParameters;
  onRemove: () => void;
  onUpdateQuantity: (quantity: number) => void;
}

export function CompatibilityCard({
  item,
  selectedItems,
  selectedPlants,
  parameters,
  onRemove,
  onUpdateQuantity
}: CompatibilityCardProps) {
  const isPlant = 'scientificName' in item;
  const Icon = isPlant ? Leaf : Fish;
  const displayName = isPlant ? item.commonName : item.name;
  const quantity = item.quantity || 0;
  const itemType = isPlant ? 'Plant' : 'Fish';

  // Calculate compatibility score
  const getCompatibilityScore = (item: TankItem | PlantItem): number => {
    if (!item.waterParameters) return 0;
    
    const tempRange = item.waterParameters.temperature;
    if (!tempRange) return 0;

    const phRange = item.waterParameters.pH;
    if (!phRange) return 0;

    const tempScore = isInRange(parameters.temperature, tempRange) ? 1 : 0;
    const phScore = isInRange(parameters.ph, phRange) ? 1 : 0;

    return (tempScore + phScore) / 2;
  };

  const score = getCompatibilityScore(item);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className={cn(
                "h-10 w-10 rounded-md flex items-center justify-center",
                isPlant ? "bg-green-600" : "bg-blue-600"
              )}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="font-medium">{displayName}</div>
              <div className="text-sm text-muted-foreground">
                {quantity} {quantity === 1 ? itemType : `${itemType}s`}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={score === 1 ? "default" : score >= 0.75 ? "secondary" : "destructive"}
              className="mr-2"
            >
              {(score * 100).toFixed(0)}% Compatible
            </Badge>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(quantity - 1)}
              disabled={quantity <= 1}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(quantity + 1)}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={onRemove}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Parameters */}
        <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThermometerSnowflake className="h-3 w-3" />
            <span>
              {item.waterParameters?.temperature?.[0]}-{item.waterParameters?.temperature?.[1]}°C
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Droplets className="h-3 w-3" />
            <span>pH {item.waterParameters?.pH?.[0]}-{item.waterParameters?.pH?.[1]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function isInRange(value: number, range: [number, number]): boolean {
  return value >= range[0] && value <= range[1];
}
