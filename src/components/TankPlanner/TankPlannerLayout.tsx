/** @jsxImportSource react */
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
import { Plus, Fish, Leaf } from 'lucide-react';
import type { FishData, PlantData, TankParameters, TankDimensions, Tank } from './types';
import { CompatibilityModal } from './CompatibilityModal';

interface TankPlannerLayoutProps {
  allFish: FishData[];
  allPlants: PlantData[];
  tanks: Tank[];
  selectedFish: FishData[];
  selectedPlants: PlantData[];
  parameters: TankParameters;
  onParameterChange: (key: keyof TankParameters, value: any) => void;
  onAddFish: (fish: FishData) => void;
  onRemoveFish: (slug: string) => void;
  onUpdateFishQuantity: (slug: string, quantity: number) => void;
  onAddPlant: (plant: PlantData) => void;
  onRemovePlant: (slug: string) => void;
  onUpdatePlantQuantity: (slug: string, quantity: number) => void;
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
  selectedFish,
  selectedPlants,
  parameters,
  onParameterChange,
  onAddFish,
  onRemoveFish,
  onUpdateFishQuantity,
  onAddPlant,
  onRemovePlant,
  onUpdatePlantQuantity
}: TankPlannerLayoutProps) {
  const [dimensions, setDimensions] = useState<TankDimensions>(initialDimensions);
  const [selectedItem, setSelectedItem] = useState<FishData | PlantData | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleDimensionsChange = (newDimensions: TankDimensions) => {
    setDimensions(newDimensions);
  };

  const handleViewDetails = (item: FishData | PlantData) => {
    setSelectedItem(item);
    setShowDetails(true);
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
                    <Plus className="mr-2 h-4 w-4" />
                    <Fish className="mr-2 h-4 w-4" />
                    Add Fish
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[800px] sm:max-w-[800px] p-0">
                  <SheetHeader className="p-6">
                    <SheetTitle>Add Fish</SheetTitle>
                    <SheetDescription>
                      Browse and add fish to your aquarium
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] p-6">
                    <FishSelector
                      allFish={allFish}
                      selectedFish={selectedFish}
                      onAddFish={onAddFish}
                      currentParameters={parameters}
                    />
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {selectedFish.map((item) => (
                  <CompatibilityCard
                    key={item.slug}
                    item={item}
                    parameters={parameters}
                    selectedFish={selectedFish}
                    selectedPlants={selectedPlants}
                    onUpdateQuantity={(quantity) => onUpdateFishQuantity(item.slug, quantity)}
                    onRemove={() => onRemoveFish(item.slug)}
                    onViewDetails={() => handleViewDetails(item)}
                  />
                ))}
                {selectedFish.length === 0 && (
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
                    <Plus className="mr-2 h-4 w-4" />
                    <Leaf className="mr-2 h-4 w-4" />
                    Add Plants
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[800px] sm:max-w-[800px] p-0">
                  <SheetHeader className="p-6">
                    <SheetTitle>Add Plants</SheetTitle>
                    <SheetDescription>
                      Browse and add plants to your aquarium
                    </SheetDescription>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] p-6">
                    <PlantSelector
                      allPlants={allPlants}
                      selectedPlants={selectedPlants}
                      selectedFish={selectedFish}
                      onAddPlant={onAddPlant}
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
                    key={plant.slug}
                    item={plant}
                    parameters={parameters}
                    selectedFish={selectedFish}
                    selectedPlants={selectedPlants}
                    onUpdateQuantity={(quantity) => onUpdatePlantQuantity(plant.slug, quantity)}
                    onRemove={() => onRemovePlant(plant.slug)}
                    onViewDetails={() => handleViewDetails(plant)}
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
              selectedFish={selectedFish}
              selectedPlants={selectedPlants}
              parameters={parameters}
              onViewDetails={handleViewDetails}
            />
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <CompatibilityModal
          open={showDetails}
          onOpenChange={setShowDetails}
          item={selectedItem}
          parameters={parameters}
          selectedFish={selectedFish}
          selectedPlants={selectedPlants}
        />
      )}
    </div>
  );
}