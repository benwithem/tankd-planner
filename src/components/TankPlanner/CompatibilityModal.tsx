/** @jsxImportSource react */
import React from 'react';
import type { FishData, PlantData, TankParameters } from './types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Fish, Leaf } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getConsistentColor, getContrastColor } from '@/lib/colors';
import { ScrollArea } from '@/components/ui/scroll-area';
import { checkFishCompatibility, checkPlantCompatibility } from '@/utils/compatibility-utils';

interface CompatibilityModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: FishData | PlantData;
  parameters: TankParameters;
  selectedFish: FishData[];
  selectedPlants: PlantData[];
}

export function CompatibilityModal({
  open,
  onOpenChange,
  item,
  parameters,
  selectedFish,
  selectedPlants,
}: CompatibilityModalProps) {
  const isPlant = 'growthRate' in item;
  const bgColor = getConsistentColor(item.scientificName, !isPlant);
  const textColor = getContrastColor(bgColor);

  // Get compatibility issues
  const issues = isPlant
    ? checkPlantCompatibility(item as PlantData, parameters, selectedFish)
    : checkFishCompatibility(item as FishData, parameters, selectedFish);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Item Details</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[600px] pr-4">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <Avatar color={bgColor}>
                <AvatarFallback textColor={textColor}>
                  {isPlant ? <Leaf className="h-6 w-6" /> : <Fish className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h2 className="text-2xl font-semibold">{item.name}</h2>
                <p className="text-lg text-muted-foreground italic">
                  {item.scientificName}
                </p>
              </div>
            </div>

            {isPlant ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Plant Requirements</h3>
                  <div className="grid gap-2">
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
                    <p><strong>Temperature:</strong> {(item as PlantData).temperature.min}°C - {(item as PlantData).temperature.max}°C</p>
                    <p><strong>pH:</strong> {(item as PlantData).pH.min} - {(item as PlantData).pH.max}</p>
                    <p><strong>Care Level:</strong> {(item as PlantData).careLevel}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{(item as PlantData).description}</p>
                </div>

                {(item as PlantData).propagation && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Propagation</h3>
                    <p className="text-muted-foreground">{(item as PlantData).propagation}</p>
                  </div>
                )}

                {(item as PlantData).placement && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Placement</h3>
                    <p className="text-muted-foreground">{(item as PlantData).placement}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Fish Requirements</h3>
                  <div className="grid gap-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={(item as FishData).temperament === 'peaceful' ? 'default' : 'destructive'}>
                        {(item as FishData).temperament}
                      </Badge>
                      <Badge variant="outline">{(item as FishData).location}</Badge>
                      <Badge variant="outline">{(item as FishData).size}</Badge>
                    </div>
                    <p><strong>Temperature:</strong> {(item as FishData).temperature.min}°C - {(item as FishData).temperature.max}°C</p>
                    <p><strong>pH:</strong> {(item as FishData).pH.min} - {(item as FishData).pH.max}</p>
                    <p><strong>Care Level:</strong> {(item as FishData).careLevel}</p>
                    <p><strong>Diet:</strong> {(item as FishData).diet}</p>
                    <p><strong>Minimum Tank Size:</strong> {(item as FishData).minTankSize}L</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground">{(item as FishData).description}</p>
                </div>

                {(item as FishData).behavior && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Behavior</h3>
                    <p className="text-muted-foreground">{(item as FishData).behavior}</p>
                  </div>
                )}

                {(item as FishData).breeding && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Breeding</h3>
                    <p className="text-muted-foreground">{(item as FishData).breeding}</p>
                  </div>
                )}
              </div>
            )}

            {issues.length > 0 && (
              <Card className="p-4 border-destructive">
                <h3 className="text-lg font-medium mb-2 text-destructive">Compatibility Issues</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {issues.map((issue, index) => (
                    <li key={index} className="text-muted-foreground">
                      {issue}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
