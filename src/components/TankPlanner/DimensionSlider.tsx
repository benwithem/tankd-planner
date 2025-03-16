import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface DimensionSliderProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  unit?: string;
  step?: number;
  disabled?: boolean;
}

export function DimensionSlider({
  label,
  min,
  max,
  value,
  onChange,
  unit = '',
  step = 1,
  disabled = false
}: DimensionSliderProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}: {value}{unit}
      </Label>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([val]) => onChange(val)}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
}
