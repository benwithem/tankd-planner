import type { BaseTankItemData, FishData, PlantData } from "@/components/TankPlanner/types";

export const isFishData = (item: BaseTankItemData): item is FishData => {
  return 'temperament' in item && 'location' in item;
};

export const isPlantData = (item: BaseTankItemData): item is PlantData => {
  return 'growthRate' in item && 'lighting' in item;
};
