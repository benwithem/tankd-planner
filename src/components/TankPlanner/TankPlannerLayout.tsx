import React, { useState } from 'react';
import { TankSetup } from './TankSetup';
import { WaterParameters } from './WaterParameters';
import { CompatibilityAnalysis } from './CompatibilityAnalysis';
import { CompatibilityCard } from './CompatibilityCard';
import { FishSelector } from './FishSelector';
import { PlantSelector } from './PlantSelector';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Fish, Leaf } from "lucide-react";
import type { TankItem, PlantItem, TankParameters, TankDimensions, Tank } from './types';

interface TankPlannerLayoutProps {
  allFish: TankItem[];
  allPlants: PlantItem[];
  tanks: Tank[];
  selectedItems: TankItem[];
  selectedPlants: PlantItem[];
  parameters: TankParameters;
  onParameterChange: (key: keyof TankParameters, value: number) => void;
  onAddItem: (item: TankItem) => void;
  onRemoveItem: (slug: string) => void;
  onUpdateQuantity: (slug: string, quantity: number) => void;
  onAddPlant: (plant: PlantItem) => void;
  onRemovePlant: (scientificName: string) => void;
  onUpdatePlantQuantity: (scientificName: string, quantity: number) => void;
}

const initialDimensions: TankDimensions = {
  lengthCm: 60,
  widthCm: 30,
  heightCm: 36
};

export function TankPlannerLayout({
  allFish,
  allPlants,
  tanks,
  selectedItems,
  selectedPlants,
  parameters,
  onParameterChange,
  onAddItem,
  onRemoveItem,
  onUpdateQuantity,
  onAddPlant,
  onRemovePlant,
  onUpdatePlantQuantity
}: TankPlannerLayoutProps) {
  const [dimensions, setDimensions] = useState<TankDimensions>(initialDimensions);

  const handleDimensionsChange = (newDimensions: TankDimensions) => {
    setDimensions(newDimensions);
  };

  return (
    <div className="w-full pb-10">
      <div className="grid grid-cols-1 gap-6">
        {/* Tank Setup and Parameters */}
        <div className="grid grid-cols-2 gap-6">
          <TankSetup
            dimensions={dimensions}
            onDimensionsChange={handleDimensionsChange}
            onParameterChange={onParameterChange}
            tanks={tanks}
          />
          <WaterParameters parameters={parameters} onParameterChange={onParameterChange} />
        </div>

        {/* Fish and Plant Lists */}
        <div className="grid grid-cols-2 gap-6">
          {/* Fish List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Fish</CardTitle>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Fish className="mr-2 h-4 w-4" />
                    Add Fish
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[800px] sm:max-w-[800px] p-0">
                  <SheetHeader>
                    <SheetTitle>Add Fish</SheetTitle>
                    <SheetDescription>
                      Browse and add fish to your aquarium
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] p-4">
                    <FishSelector
                      allFish={allFish}
                      selectedFish={selectedItems}
                      onAddFish={onAddItem}
                      tankSize={parameters.size}
                      currentParameters={parameters}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {selectedItems.map((item) => (
                  <CompatibilityCard
                    key={item.slug}
                    item={item}
                    parameters={parameters}
                    selectedItems={selectedItems}
                    selectedPlants={selectedPlants}
                    onUpdateQuantity={(quantity) => onUpdateQuantity(item.slug, quantity)}
                    onRemove={() => onRemoveItem(item.slug)}
                  />
                ))}
                {selectedItems.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No fish added yet
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Plant List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Plants</CardTitle>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Leaf className="mr-2 h-4 w-4" />
                    Add Plants
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[800px] sm:max-w-[800px] p-0">
                  <SheetHeader>
                    <SheetTitle>Add Plants</SheetTitle>
                    <SheetDescription>
                      Browse and add plants to your aquarium
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] p-4">
                    <PlantSelector
                      allPlants={allPlants}
                      selectedPlants={selectedPlants}
                      onAddPlant={onAddPlant}
                      tankSize={parameters.size}
                      currentParameters={parameters}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {selectedPlants.map((plant) => (
                  <CompatibilityCard
                    key={plant.scientificName}
                    item={plant}
                    parameters={parameters}
                    selectedItems={selectedItems}
                    selectedPlants={selectedPlants}
                    onUpdateQuantity={(quantity) => onUpdatePlantQuantity(plant.scientificName, quantity)}
                    onRemove={() => onRemovePlant(plant.scientificName)}
                  />
                ))}
                {selectedPlants.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No plants added yet
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Compatibility Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Tank Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <CompatibilityAnalysis
              selectedItems={selectedItems}
              selectedPlants={selectedPlants}
              parameters={parameters}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}