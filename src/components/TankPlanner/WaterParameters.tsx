/** @jsxImportSource react */
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Thermometer, Droplet } from 'lucide-react';
import type { TankParameters } from './types';
import { cn } from '@/lib/utils';

interface WaterParametersProps {
  parameters: TankParameters;
  onParameterChange: (key: keyof TankParameters, value: number) => void;
}

export function WaterParameters({ parameters, onParameterChange }: WaterParametersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">Water Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-blue-500" />
              Water Temperature
            </Label>
            <span className="text-sm text-muted-foreground">
              {parameters.temperature}°C / {(parameters.temperature * 9/5 + 32).toFixed(0)}°F
            </span>
          </div>
          <div className="relative">
            <Slider
              value={[parameters.temperature]}
              min={18}
              max={32}
              step={0.5}
              onValueChange={([value]) => onParameterChange('temperature', value)}
              className={cn(
                "w-full",
                "before:absolute before:inset-0 before:h-2 before:rounded-full",
                "before:bg-gradient-to-r before:from-blue-500/20 before:to-blue-500/5"
              )}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Cold (18°C)</span>
            <span>Tropical (32°C)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-500" />
              pH Level
            </Label>
            <span className="text-sm text-muted-foreground">{parameters.ph.toFixed(1)}</span>
          </div>
          <div className="relative">
            <Slider
              value={[parameters.ph]}
              min={5.5}
              max={8.5}
              step={0.1}
              onValueChange={([value]) => onParameterChange('ph', value)}
              className={cn(
                "w-full",
                "before:absolute before:inset-0 before:h-2 before:rounded-full",
                "before:bg-gradient-to-r before:from-blue-500/20 before:to-blue-500/5"
              )}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Acidic (5.5)</span>
            <span>Neutral (7.0)</span>
            <span>Alkaline (8.5)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
