/** @jsxImportSource react */
import React, { useState, useEffect } from 'react';
import type { FishData, PlantData, TankParameters, TankDimensions, TankData } from './types';
import { TankPlannerLayout } from './TankPlannerLayout';
import { getDefaultTankParameters } from '@/services/collections';

interface TankPlannerPageProps {
  fish: FishData[];
  plants: PlantData[];
  tanks: TankData[];
}

// Main entry point for the Tank Planner application
export const TankPlannerPage: React.FC<TankPlannerPageProps> = ({ fish, plants, tanks }) => {
  // Default tank parameters
  const [parameters, setParameters] = useState<TankParameters>(getDefaultTankParameters(60));

  // Selected fish and plants
  const [selectedFish, setSelectedFish] = useState<FishData[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<PlantData[]>([]);

  const handleParameterChange = (key: keyof TankParameters, value: any) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddFish = (item: FishData) => {
    // Check if the fish is already in the list
    const isExisting = selectedFish.some(existingFish => existingFish.slug === item.slug);
    
    if (!isExisting) {
      setSelectedFish(prev => [...prev, { ...item, quantity: 1 }]);
    } else {
      // If the fish is already in the list, increase its quantity
      setSelectedFish(prev => 
        prev.map(existingFish => 
          existingFish.slug === item.slug
            ? { ...existingFish, quantity: (existingFish.quantity || 1) + 1 }
            : existingFish
        )
      );
    }
  };

  const handleRemoveFish = (slug: string) => {
    setSelectedFish(prev => prev.filter(fish => fish.slug !== slug));
  };

  const handleUpdateFishQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFish(slug);
      return;
    }
    
    setSelectedFish(prev => 
      prev.map(fish => 
        fish.slug === slug
          ? { ...fish, quantity }
          : fish
      )
    );
  };

  const handleAddPlant = (plant: PlantData) => {
    // Check if the plant is already in the list
    const isExisting = selectedPlants.some(existingPlant => existingPlant.slug === plant.slug);
    
    if (!isExisting) {
      setSelectedPlants(prev => [...prev, { ...plant, quantity: 1 }]);
    } else {
      // If the plant is already in the list, increase its quantity
      setSelectedPlants(prev => 
        prev.map(existingPlant => 
          existingPlant.slug === plant.slug
            ? { ...existingPlant, quantity: (existingPlant.quantity || 1) + 1 }
            : existingPlant
        )
      );
    }
  };

  const handleRemovePlant = (slug: string) => {
    setSelectedPlants(prev => prev.filter(plant => plant.slug !== slug));
  };

  const handleUpdatePlantQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemovePlant(slug);
      return;
    }
    
    setSelectedPlants(prev => 
      prev.map(plant => 
        plant.slug === slug
          ? { ...plant, quantity }
          : plant
      )
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="container mx-auto py-8">
        <TankPlannerLayout
          allFish={fish}
          allPlants={plants}
          tanks={tanks}
          selectedFish={selectedFish}
          selectedPlants={selectedPlants}
          parameters={parameters}
          onParameterChange={handleParameterChange}
          onAddFish={handleAddFish}
          onRemoveFish={handleRemoveFish}
          onUpdateFishQuantity={handleUpdateFishQuantity}
          onAddPlant={handleAddPlant}
          onRemovePlant={handleRemovePlant}
          onUpdatePlantQuantity={handleUpdatePlantQuantity}
        />
      </div>
    </div>
  );
};
