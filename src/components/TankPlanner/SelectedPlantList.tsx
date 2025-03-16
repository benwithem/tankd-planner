import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Leaf } from 'lucide-react';
import { getConsistentColor } from '@/utils/color-utils';
import { cn } from '@/lib/utils';
import type { PlantItem } from './types';

interface SelectedPlantListProps {
  selectedPlants: (PlantItem & { quantity: number })[];
  onRemovePlant: (scientificName: string) => void;
}

export function SelectedPlantList({ selectedPlants, onRemovePlant }: SelectedPlantListProps) {
  if (selectedPlants.length === 0) {
    return (
      <div className="text-center text-muted-foreground italic p-4 border rounded-md">
        No plants selected. Start adding plants to your tank!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selectedPlants.map((plant) => {
        const iconColor = getConsistentColor(plant.scientificName, true);
        return (
          <div 
            key={plant.scientificName}
            className="flex justify-between items-center p-2 border rounded-md bg-background hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-md"
                style={{
                  backgroundColor: `${iconColor}15`,
                  color: iconColor
                }}
              >
                <Leaf className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  {plant.commonName}
                  <span className="text-sm text-muted-foreground font-normal">
                    ×{plant.quantity}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground italic">
                  {plant.scientificName}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onRemovePlant(plant.scientificName)}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}
