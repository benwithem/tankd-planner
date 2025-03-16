import React, { useMemo } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { FishData } from './types';

interface EnhancedCompatibilityAnalysisProps {
  selectedFish: FishData[];
  tankParameters: {
    size: number;
    temperature: number;
    ph: number;
  };
}

export function EnhancedCompatibilityAnalysis({ selectedFish, tankParameters }: EnhancedCompatibilityAnalysisProps) {
  const compatibilityIssues = useMemo(() => {
    const issues: { type: string; message: string }[] = [];

    const validTempRanges = selectedFish
      .filter(fish => fish.temperatureRange)
      .map(fish => [fish.temperatureRange.min, fish.temperatureRange.max]);

    if (validTempRanges.length) {
      const minTemp = Math.max(...validTempRanges.map(range => range[0]));
      const maxTemp = Math.min(...validTempRanges.map(range => range[1]));
      if (tankParameters.temperature < minTemp || tankParameters.temperature > maxTemp) {
        issues.push({
          type: 'Temperature Issue',
          message: `Temperature ${tankParameters.temperature}°C is incompatible with selected fish (${minTemp}-${maxTemp}°C).`
        });
      }
    }

    const validPhRanges = selectedFish
      .filter(fish => fish.phRange)
      .map(fish => [fish.phRange.min, fish.phRange.max]);

    if (validPhRanges.length) {
      const minPh = Math.max(...validPhRanges.map(range => range[0]));
      const maxPh = Math.min(...validPhRanges.map(range => range[1]));

      if (tankParameters.ph < minPh || tankParameters.ph > maxPh) {
        issues.push({
          type: 'pH Issue',
          message: `Tank pH (${tankParameters.ph}) is incompatible with selected fish (${minPh}-${maxPh}).`
        });
      }
    }

    return issues;
  }, [selectedFish, tankParameters]);

  return (
    <div className="space-y-4">
      {compatibilityIssues.length === 0 ? (
        <Alert variant="default">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>All Good!</AlertTitle>
          <AlertDescription>Your selected fish are compatible with the current tank parameters.</AlertDescription>
        </Alert>
      ) : (
        compatibilityIssues.map((issue, i) => (
          <Alert key={i} variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{issue.type}</AlertTitle>
            <AlertDescription>{issue.message}</AlertDescription>
          </Alert>
        ))
      )}
    </div>
  );
}
