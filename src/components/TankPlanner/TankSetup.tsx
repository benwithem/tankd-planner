import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Tank, TankDimensions, TankParameters } from './types';

interface TankSetupProps {
  dimensions: TankDimensions;
  onDimensionsChange: (dimensions: TankDimensions) => void;
  onParameterChange: (key: keyof TankParameters, value: any) => void;
  tanks: Tank[];
}

export function TankSetup({
  dimensions,
  onDimensionsChange,
  onParameterChange,
  tanks,
}: TankSetupProps) {
  const [selectedTankId, setSelectedTankId] = useState<string>('custom');
  const [customDimensions, setCustomDimensions] = useState<TankDimensions>(dimensions);
  const [showCustomControls, setShowCustomControls] = useState(false);

  // Update tank dimensions when a preset is selected
  useEffect(() => {
    if (selectedTankId === 'custom') {
      setShowCustomControls(true);
    } else {
      setShowCustomControls(false);
      const selectedTank = tanks.find(tank => tank.name === selectedTankId);
      if (selectedTank) {
        onDimensionsChange(selectedTank.dimensions);
        // Update all tank parameters
        onParameterChange('size', selectedTank.size);
        if (selectedTank.defaultParameters) {
          onParameterChange('temperature', selectedTank.defaultParameters.temperature);
          onParameterChange('pH', selectedTank.defaultParameters.pH);
          onParameterChange('co2', selectedTank.defaultParameters.co2);
        }
      }
    }
  }, [selectedTankId, tanks, onDimensionsChange, onParameterChange]);

  // Update dimensions when custom values change
  const handleCustomDimensionChange = (key: keyof TankDimensions, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newDimensions = { ...customDimensions, [key]: numValue };
    setCustomDimensions(newDimensions);
    
    // Calculate volume in liters
    const volumeLiters = (newDimensions.lengthCm * newDimensions.widthCm * newDimensions.heightCm) / 1000;
    
    onDimensionsChange(newDimensions);
    onParameterChange('size', volumeLiters);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tank Setup</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Tank Size</Label>
          <Select
            value={selectedTankId}
            onValueChange={setSelectedTankId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a tank size" />
            </SelectTrigger>
            <SelectContent>
              {tanks.map((tank) => (
                <SelectItem key={tank.name} value={tank.name}>
                  {tank.name} ({Math.floor(tank.size)}L / {Math.floor(tank.size * 0.264172)}gal)
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showCustomControls && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>Length (cm)</Label>
              <Input
                type="number"
                value={customDimensions.lengthCm}
                onChange={(e) => handleCustomDimensionChange('lengthCm', e.target.value)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Width (cm)</Label>
              <Input
                type="number"
                value={customDimensions.widthCm}
                onChange={(e) => handleCustomDimensionChange('widthCm', e.target.value)}
                min={0}
              />
            </div>
            <div className="space-y-2">
              <Label>Height (cm)</Label>
              <Input
                type="number"
                value={customDimensions.heightCm}
                onChange={(e) => handleCustomDimensionChange('heightCm', e.target.value)}
                min={0}
              />
            </div>
            <div className="pt-2 text-sm text-muted-foreground">
              Volume: {Math.floor((customDimensions.lengthCm * customDimensions.widthCm * customDimensions.heightCm) / 1000)}L / {Math.floor((customDimensions.lengthCm * customDimensions.widthCm * customDimensions.heightCm) / 1000 * 0.264172)}gal
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
