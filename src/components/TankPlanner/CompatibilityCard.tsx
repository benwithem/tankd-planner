/** @jsxImportSource react */
import React from 'react';
import type { FishData, PlantData, TankParameters } from './types';
import { checkFishCompatibility, checkPlantCompatibility } from '@/utils/compatibility-utils';
import { TankItemCard } from './TankItemCard';

interface CompatibilityCardProps {
  item: FishData | PlantData;
  parameters: TankParameters;
  selectedFish: FishData[];
  selectedPlants: PlantData[];
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
  onViewDetails: () => void;
  squareAvatar?: boolean;
}

export function CompatibilityCard({
  item,
  parameters,
  selectedFish,
  selectedPlants,
  onUpdateQuantity,
  onRemove,
  onViewDetails,
  squareAvatar = false,
}: CompatibilityCardProps) {
  const isPlant = 'lighting' in item;
  const issues = isPlant
    ? checkPlantCompatibility(item as PlantData, parameters, selectedFish)
    : checkFishCompatibility(item as FishData, parameters, selectedFish);

  return (
    <TankItemCard
      item={item}
      showQuantityControls={true}
      showIssues={true}
      issues={issues}
      onUpdateQuantity={onUpdateQuantity}
      onViewDetails={onViewDetails}
      squareAvatar={squareAvatar}
    />
  );
}
