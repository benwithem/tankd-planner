/** @jsxImportSource react */
import * as React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Thermometer, Droplets, Box, Ruler } from 'lucide-react';
import type { TankParameters, TankDimensions } from './types';

interface TankControlsProps {
  parameters: TankParameters;
  onParameterChange: (key: keyof TankParameters, value: number) => void;
  selectedTank?: string;
  onTankChange?: (tankName: string) => void;
  tanks?: Array<{
    name: string;
    dimensions: TankDimensions;
    parameters: TankParameters;
  }>;
  tankVolume?: number;
  customDimensions: TankDimensions;
  onCustomDimensionChange: (dimension: keyof TankDimensions, value: number) => void;
}

export function TankControls({
  parameters,
  onParameterChange,
  selectedTank,
  onTankChange,
  tanks,
  tankVolume,
  customDimensions,
  onCustomDimensionChange,
}: TankControlsProps): React.ReactElement {
  // Calculate volume in different units
  const volumeLiters = Math.round(parameters.size);
  const volumeGallons = Math.round(parameters.size * 0.264172);

  return (
    <div className="space-y-6">
      {/* Tank Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-4 w-4 text-blue-500 dark:text-blue-400" />
            <Label className="font-medium dark:text-white">Tank Selection</Label>
          </div>
          <div className="text-sm text-muted-foreground dark:text-gray-400">
            {volumeLiters} L / {volumeGallons} gal
          </div>
        </div>

        <Select value={selectedTank} onValueChange={onTankChange}>
          <SelectTrigger className="w-full dark:bg-gray-700 dark:border-gray-600">
            <SelectValue placeholder="Select a tank" />
          </SelectTrigger>
          <SelectContent className="dark:bg-gray-800">
            {tanks?.map(tank => (
              <SelectItem key={tank.name} value={tank.name} className="dark:text-white dark:hover:bg-gray-700">
                {tank.name} - {Math.round(tank.parameters.size)}L
              </SelectItem>
            ))}
            <SelectItem value="custom" className="dark:text-white dark:hover:bg-gray-700">Custom Tank</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Tank Dimensions - only show when custom tank is selected */}
      {selectedTank === 'custom' && (
        <div className="space-y-4 p-4 border rounded-md dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
            <Label className="font-medium dark:text-white">Custom Dimensions</Label>
          </div>

          {/* Length */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm dark:text-gray-300">Length</Label>
              <span className="text-sm dark:text-gray-400">{customDimensions.lengthCm} cm</span>
            </div>
            <Slider 
              value={[customDimensions.lengthCm]} 
              min={20} 
              max={200} 
              step={1} 
              onValueChange={([value]) => onCustomDimensionChange('lengthCm', value)}
              className="dark:bg-gray-700"
            />
          </div>

          {/* Width */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm dark:text-gray-300">Width</Label>
              <span className="text-sm dark:text-gray-400">{customDimensions.widthCm} cm</span>
            </div>
            <Slider 
              value={[customDimensions.widthCm]} 
              min={10} 
              max={100} 
              step={1} 
              onValueChange={([value]) => onCustomDimensionChange('widthCm', value)}
              className="dark:bg-gray-700"
            />
          </div>

          {/* Height */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm dark:text-gray-300">Height</Label>
              <span className="text-sm dark:text-gray-400">{customDimensions.heightCm} cm</span>
            </div>
            <Slider 
              value={[customDimensions.heightCm]} 
              min={10} 
              max={120} 
              step={1} 
              onValueChange={([value]) => onCustomDimensionChange('heightCm', value)}
              className="dark:bg-gray-700"
            />
          </div>
        </div>
      )}

      {/* Temperature Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-500 dark:text-orange-400" />
            <Label className="font-medium dark:text-white">Water Temperature</Label>
          </div>
          <span className="text-sm dark:text-gray-400">{parameters.temperature}°C / {Math.round(parameters.temperature * 9/5 + 32)}°F</span>
        </div>
        
        <Slider 
          value={[parameters.temperature]} 
          min={18} 
          max={32} 
          step={0.5} 
          onValueChange={([value]) => onParameterChange('temperature', value)}
          className="dark:bg-gray-700"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground dark:text-gray-400">
          <span>Cold (18°C)</span>
          <span>Tropical (32°C)</span>
        </div>
      </div>

      {/* pH Control */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-teal-500 dark:text-teal-400" />
            <Label className="font-medium dark:text-white">pH Level</Label>
          </div>
          <span className="text-sm dark:text-gray-400">{parameters.ph.toFixed(1)}</span>
        </div>
        
        <Slider 
          value={[parameters.ph]} 
          min={5.5} 
          max={8.5} 
          step={0.1} 
          onValueChange={([value]) => onParameterChange('ph', value)}
          className="dark:bg-gray-700"
        />
        
        <div className="flex justify-between text-xs text-muted-foreground dark:text-gray-400">
          <span>Acidic (5.5)</span>
          <span>Neutral (7.0)</span>
          <span>Alkaline (8.5)</span>
        </div>
      </div>
    </div>
  );
}
