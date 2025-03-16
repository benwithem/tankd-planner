import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface CustomTankControlsProps {
  width: number;
  height: number;
  depth: number;
  onDimensionsChange: (dimensions: { width: number; height: number; depth: number }) => void;
}

export function CustomTankControls({
  width,
  height,
  depth,
  onDimensionsChange,
}: CustomTankControlsProps) {
  const handleInputChange = (dimension: 'width' | 'height' | 'depth', value: string) => {
    const numValue = parseInt(value) || 0;
    onDimensionsChange({
      width: dimension === 'width' ? numValue : width,
      height: dimension === 'height' ? numValue : height,
      depth: dimension === 'depth' ? numValue : depth,
    });
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="width">Width (cm)</Label>
          <Input
            id="width"
            type="number"
            value={width}
            onChange={(e) => handleInputChange('width', e.target.value)}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            value={height}
            onChange={(e) => handleInputChange('height', e.target.value)}
            min={0}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="depth">Depth (cm)</Label>
          <Input
            id="depth"
            type="number"
            value={depth}
            onChange={(e) => handleInputChange('depth', e.target.value)}
            min={0}
          />
        </div>
      </CardContent>
    </Card>
  );
}
