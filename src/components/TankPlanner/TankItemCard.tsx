/** @jsxImportSource react */
import React from 'react';
import type { FishData, PlantData, WaterParameters } from './types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getConsistentColor, getContrastColor } from '@/utils/color-utils';
import { 
  Fish, 
  Leaf, 
  AlertTriangle, 
  Info, 
  Minus, 
  Plus, 
  Thermometer, 
  Waves,
  Scale,
  Droplet,
  Ruler
} from 'lucide-react';

interface TankItemCardProps {
  item: FishData | PlantData;
  showQuantityControls?: boolean;
  showIssues?: boolean;
  issues?: string[];
  onUpdateQuantity?: (quantity: number) => void;
  onViewDetails?: () => void;
  onAdd?: () => void;
  isSelected?: boolean;
  isSheetView?: boolean;
  squareAvatar?: boolean;
}

export function TankItemCard({
  item,
  showQuantityControls = false,
  showIssues = false,
  issues = [],
  onUpdateQuantity,
  onViewDetails,
  onAdd,
  isSelected = false,
  isSheetView = false,
  squareAvatar = false,
}: TankItemCardProps) {
  const isPlant = 'lighting' in item;
  const itemColor = getConsistentColor(item.scientificName, isPlant);
  const contrastColor = getContrastColor(itemColor);
  const hasIssues = issues.length > 0;

  // Helper function to get human-friendly care level label
  const getCareLevelLabel = (careLevel: string) => {
    // Map careLevel values to human-friendly labels
    const careLevelLabels: Record<string, string> = {
      'beginner': 'Beginner',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced'
    };
    
    return careLevelLabels[careLevel] || careLevel;
  };

  // Helper function to get care level badge color
  const getCareLevelColor = (careLevel: string) => {
    switch (careLevel) {
      case 'beginner':
        return 'border-green-200 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'border-amber-200 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'advanced':
        return 'border-red-200 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return '';
    }
  };

  // Helper function to safely display temperature range
  const displayTemperatureRange = (waterParams?: WaterParameters) => {
    if (!waterParams?.temperature) {
      return 'N/A';
    }
    return `${waterParams.temperature.min}-${waterParams.temperature.max}°C`;
  };

  // Helper function to safely display pH range
  const displayPHRange = (waterParams?: WaterParameters) => {
    if (!waterParams?.pH) {
      return 'N/A';
    }
    return `${waterParams.pH.min}-${waterParams.pH.max}`;
  };

  // Helper function to safely display hardness range
  const displayHardnessRange = (waterParams?: WaterParameters) => {
    if (!waterParams?.hardness) {
      return 'N/A';
    }
    return `${waterParams.hardness.min}-${waterParams.hardness.max} dGH`;
  };

  // Helper function to safely display tank size range
  const displayTankSizeRange = (item: FishData | PlantData) => {
    if (!item.tankSize) {
      return 'N/A';
    }
    
    const minSize = item.tankSize.minimum;
    const maxSize = item.tankSize.recommended;
    
    if (minSize && maxSize) {
      return `${minSize}-${maxSize} gallons`;
    } else if (minSize) {
      return `${minSize}+ gallons`;
    } else {
      return 'N/A';
    }
  };

  // Helper function to check if a fish is compatible with shrimp
  const isShrimpCompatible = (fishData: FishData) => {
    if (!fishData.compatibility) {
      return 'Unknown';
    }
    
    // Check if 'shrimp' property exists in compatibility
    if (fishData.compatibility.shrimp !== undefined) {
      if (fishData.compatibility.shrimp === 'caution') {
        return 'Caution';
      }
      return fishData.compatibility.shrimp ? 'Yes' : 'No';
    }
    
    return 'Unknown';
  };

  // Helper function to check if a fish is compatible with plants
  const isPlantCompatible = (fishData: FishData) => {
    if (!fishData.compatibility) {
      return 'Unknown';
    }
    
    if (fishData.compatibility.plants !== undefined) {
      return fishData.compatibility.plants ? 'Yes' : 'No';
    }
    
    return 'Unknown';
  };

  return (
    <Card className={`overflow-hidden mb-2 ${isSelected ? 'bg-muted/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className={`h-10 w-10 ${squareAvatar ? 'rounded-md' : 'rounded-full'}`}>
            <AvatarFallback 
              className={`${squareAvatar ? 'rounded-md' : 'rounded-full'} flex items-center justify-center`}
              style={{ backgroundColor: itemColor, color: contrastColor }}
            >
              {isPlant ? <Leaf className="h-5 w-5" /> : <Fish className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium leading-none flex items-center gap-2">
                  {item.name}
                  {hasIssues && showIssues && (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </h4>
                <p className="text-sm text-muted-foreground italic">
                  {item.scientificName}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {showQuantityControls && onUpdateQuantity && (
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
                )}
                {onViewDetails && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onViewDetails}
                    className="h-8 w-8"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {isPlant ? (
              <>
                {/* Plant Badges - Key characteristics that define the plant */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className={
                    (item as PlantData).lighting === 'high' ? 'border-yellow-200 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    (item as PlantData).lighting === 'low' ? 'border-blue-200 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    'border-green-200 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }>
                    {(item as PlantData).lighting} lighting requirements
                  </Badge>
                  <Badge variant="outline" className={
                    (item as PlantData).co2 === 'required' ? 'border-red-200 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    (item as PlantData).co2 === 'recommended' ? 'border-amber-200 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300' :
                    'border-green-200 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                  }>
                    CO2: {(item as PlantData).co2}
                  </Badge>
                  <Badge variant="outline" className={getCareLevelColor((item as PlantData).careLevel)}>
                    {getCareLevelLabel((item as PlantData).careLevel)} care difficulty
                  </Badge>
                </div>
                
                {/* Plant Details - More specific information in a grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Temperature Range:</span> 
                    {displayTemperatureRange((item as PlantData).waterParameters)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Waves className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">pH Range:</span> 
                    {displayPHRange((item as PlantData).waterParameters)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Water Hardness:</span> 
                    {displayHardnessRange((item as PlantData).waterParameters)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Tank Size:</span> 
                    {displayTankSizeRange(item as PlantData)}
                  </div>
                  {(item as PlantData).substrate && Array.isArray((item as PlantData).substrate) && (item as PlantData).substrate.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Leaf className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Substrate Types:</span> 
                      <span className="capitalize">{(item as PlantData).substrate.join(', ')}</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Fish Badges - Key characteristics that define the fish */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className={`capitalize ${
                      (item as FishData).temperament === 'aggressive' 
                        ? 'border-red-200 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' 
                        : (item as FishData).temperament === 'semi-aggressive'
                          ? 'border-amber-200 bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                          : 'border-green-200 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                    }`}
                  >
                    {(item as FishData).temperament} temperament
                  </Badge>
                  <Badge variant="outline" className={getCareLevelColor((item as FishData).careLevel)}>
                    {getCareLevelLabel((item as FishData).careLevel)} care difficulty
                  </Badge>
                </div>
                
                {/* Fish Details - More specific information in a grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex items-center gap-1">
                    <Thermometer className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Temperature Range:</span> 
                    {displayTemperatureRange((item as FishData).waterParameters)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Waves className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">pH Range:</span> 
                    {displayPHRange((item as FishData).waterParameters)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Water Hardness:</span> 
                    {displayHardnessRange((item as FishData).waterParameters)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Tank Size:</span> 
                    {displayTankSizeRange(item as FishData)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Leaf className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Plant Compatible:</span> 
                    {isPlantCompatible(item as FishData)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Droplet className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Shrimp Compatible:</span> 
                    {isShrimpCompatible(item as FishData)}
                  </div>
                </div>
              </>
            )}

            {hasIssues && showIssues && (
              <div className="text-sm text-yellow-500 flex items-start gap-1 mt-1">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{issues[0]}</span>
              </div>
            )}
            
            {/* Add button for sheet view */}
            {isSheetView && onAdd && (
              <div className="flex justify-end mt-2">
                <Button
                  size="sm"
                  variant={isSelected ? "secondary" : "default"}
                  className="shrink-0"
                  disabled={isSelected}
                  onClick={onAdd}
                >
                  {isSelected ? 'Added' : 'Add'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
