/** @jsxImportSource react */
import React, { useState, useEffect } from 'react';
import type { TankItem, TankParameters, TankDimensions, TankData, PlantItem, Tank } from './types';
import { TankPlannerLayout } from './TankPlannerLayout';
import { convertTankData } from '@/lib/tanks';

interface TankPlannerPageProps {
  allFish: TankItem[];
  allPlants: PlantItem[];
  allTanks: Array<{
    name: string;
    profile: string;
    lengthInches: number;
    widthInches: number;
    heightInches: number;
    glassThicknessMM: number;
    volumeGallons: number;
  }>;
}

// Main entry point for the Tank Planner application
export const TankPlannerPage: React.FC<TankPlannerPageProps> = ({ allFish, allPlants, allTanks }) => {
  // Default tank parameters
  const [parameters, setParameters] = useState<TankParameters>({
    temperature: 25, // Celsius
    ph: 7.0,
    size: 60, // Default size in liters
  });

  // Selected fish and plants
  const [selectedItems, setSelectedItems] = useState<TankItem[]>([]);
  const [selectedPlants, setSelectedPlants] = useState<PlantItem[]>([]);

  // Convert tank data to our internal format
  const tanks: Tank[] = allTanks.map(convertTankData);

  const handleParameterChange = (key: keyof TankParameters, value: number) => {
    setParameters(prev => ({ ...prev, [key]: value }));
  };

  const handleAddItem = (item: TankItem) => {
    // Check if the item is already in the list
    const isExisting = selectedItems.some(existingItem => existingItem.slug === item.slug);
    
    if (!isExisting) {
      setSelectedItems(prev => [...prev, { ...item, quantity: 1 }]);
    } else {
      // If the item is already in the list, increase its quantity
      setSelectedItems(prev => 
        prev.map(existingItem => 
          existingItem.slug === item.slug
            ? { ...existingItem, quantity: (existingItem.quantity || 1) + 1 }
            : existingItem
        )
      );
    }
  };

  const handleRemoveItem = (slug: string) => {
    setSelectedItems(prev => prev.filter(item => item.slug !== slug));
  };

  const handleUpdateQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(slug);
      return;
    }
    
    setSelectedItems(prev => 
      prev.map(item => 
        item.slug === slug
          ? { ...item, quantity }
          : item
      )
    );
  };

  const handleAddPlant = (plant: PlantItem) => {
    // Check if the plant is already in the list
    const isExisting = selectedPlants.some(existingPlant => existingPlant.scientificName === plant.scientificName);
    
    if (!isExisting) {
      setSelectedPlants(prev => [...prev, { ...plant, quantity: 1 }]);
    } else {
      // If the plant is already in the list, increase its quantity
      setSelectedPlants(prev => 
        prev.map(existingPlant => 
          existingPlant.scientificName === plant.scientificName
            ? { ...existingPlant, quantity: (existingPlant.quantity || 1) + 1 }
            : existingPlant
        )
      );
    }
  };

  const handleRemovePlant = (scientificName: string) => {
    setSelectedPlants(prev => prev.filter(plant => plant.scientificName !== scientificName));
  };

  const handleUpdatePlantQuantity = (scientificName: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemovePlant(scientificName);
      return;
    }
    
    setSelectedPlants(prev => 
      prev.map(plant => 
        plant.scientificName === scientificName
          ? { ...plant, quantity }
          : plant
      )
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 text-gray-800 dark:text-white">
      <div className="container mx-auto py-8">
        <TankPlannerLayout
          allFish={allFish}
          allPlants={allPlants}
          tanks={tanks}
          selectedItems={selectedItems}
          selectedPlants={selectedPlants}
          parameters={parameters}
          onParameterChange={handleParameterChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
          onUpdateQuantity={handleUpdateQuantity}
          onAddPlant={handleAddPlant}
          onRemovePlant={handleRemovePlant}
          onUpdatePlantQuantity={handleUpdatePlantQuantity}
        />
      </div>
    </div>
  );
};
