import React from 'react';
import type { PlantItem, TankItem } from './types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ThermometerSnowflake,
  Droplets,
  Leaf,
  Star
} from 'lucide-react';

interface PlantCompatibilityProps {
  selectedPlants: PlantItem[];
  selectedFish: TankItem[];
  parameters: {
    temperature: number;
    ph: number;
    size: number;
  };
}

interface CompatibilityIssue {
  type: 'error' | 'warning';
  message: string;
}

export function PlantCompatibility({
  selectedPlants,
  selectedFish,
  parameters
}: PlantCompatibilityProps) {
  // Check plant-fish compatibility
  const getPlantFishIssues = (plant: PlantItem, fish: TankItem[]): CompatibilityIssue[] => {
    const issues: CompatibilityIssue[] = [];

    // Check fish that might eat or damage plants
    const plantEaters = fish.filter(f => f.compatibility?.plants === false);
    if (plantEaters.length > 0) {
      issues.push({
        type: 'error',
        message: `${plantEaters.map(f => f.commonName).join(', ')} may damage this plant`
      });
    }

    return issues;
  };

  // Check plant-parameter compatibility
  const getPlantParameterIssues = (plant: PlantItem): CompatibilityIssue[] => {
    const issues: CompatibilityIssue[] = [];

    // Temperature check
    if (parameters.temperature < plant.waterParameters.temperature[0] ||
        parameters.temperature > plant.waterParameters.temperature[1]) {
      issues.push({
        type: 'error',
        message: `Temperature ${parameters.temperature}°C is outside plant's range (${plant.waterParameters.temperature[0]}-${plant.waterParameters.temperature[1]}°C)`
      });
    }

    // pH check
    if (parameters.ph < plant.waterParameters.pH[0] ||
        parameters.ph > plant.waterParameters.pH[1]) {
      issues.push({
        type: 'error',
        message: `pH ${parameters.ph} is outside plant's range (${plant.waterParameters.pH[0]}-${plant.waterParameters.pH[1]})`
      });
    }

    // Tank size check
    if (parameters.size < plant.tankSize.minimum) {
      issues.push({
        type: 'error',
        message: `Tank size ${parameters.size}L is too small (minimum ${plant.tankSize.minimum}L)`
      });
    } else if (parameters.size < plant.tankSize.recommended) {
      issues.push({
        type: 'warning',
        message: `Tank size ${parameters.size}L is below recommended ${plant.tankSize.recommended}L`
      });
    }

    return issues;
  };

  // Calculate overall compatibility score
  const calculateCompatibilityScore = (issues: CompatibilityIssue[]): number => {
    const errorCount = issues.filter(i => i.type === 'error').length;
    const warningCount = issues.filter(i => i.type === 'warning').length;
    
    if (errorCount > 0) return 0;
    if (warningCount > 0) return 50 + (50 / (warningCount + 1));
    return 100;
  };

  // Get all compatibility issues for each plant
  const plantAnalysis = selectedPlants.map(plant => {
    const fishIssues = getPlantFishIssues(plant, selectedFish);
    const parameterIssues = getPlantParameterIssues(plant);
    const allIssues = [...fishIssues, ...parameterIssues];
    const score = calculateCompatibilityScore(allIssues);

    return {
      plant,
      issues: allIssues,
      score
    };
  });

  // Calculate overall tank compatibility
  const overallScore = plantAnalysis.length > 0
    ? Math.round(plantAnalysis.reduce((sum, analysis) => sum + analysis.score, 0) / plantAnalysis.length)
    : 100;

  return (
    <div className="space-y-4">
      {/* Overall Compatibility Score */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Overall Plant Compatibility</span>
          <span className="text-sm text-muted-foreground">{overallScore}%</span>
        </div>
        <Progress value={overallScore} className="h-2" />
      </div>

      {/* Individual Plant Analysis */}
      {plantAnalysis.map(({ plant, issues, score }) => (
        <Card key={plant.scientificName} className="p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium">{plant.commonName}</h3>
              <p className="text-sm text-muted-foreground">{plant.scientificName}</p>
            </div>
            <Badge 
              variant={score === 100 ? "default" : score > 50 ? "outline" : "destructive"}
              className="ml-2"
            >
              {score === 100 ? (
                <CheckCircle2 className="h-4 w-4 mr-1" />
              ) : score > 50 ? (
                <AlertTriangle className="h-4 w-4 mr-1" />
              ) : (
                <XCircle className="h-4 w-4 mr-1" />
              )}
              {score}%
            </Badge>
          </div>

          {/* Plant Requirements */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <ThermometerSnowflake className="h-3 w-3" />
              <span>{plant.waterParameters.temperature[0]}-{plant.waterParameters.temperature[1]}°C</span>
            </div>
            <div className="flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              <span>pH {plant.waterParameters.pH[0]}-{plant.waterParameters.pH[1]}</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span>{plant.lighting}</span>
            </div>
            <div className="flex items-center gap-1">
              <Leaf className="h-3 w-3" />
              <span>{plant.co2}</span>
            </div>
          </div>

          {/* Compatibility Issues */}
          {issues.length > 0 && (
            <div className="space-y-1">
              {issues.map((issue, index) => (
                <div 
                  key={index}
                  className={`text-sm flex items-center gap-1 ${
                    issue.type === 'error' ? 'text-red-500' : 'text-yellow-500'
                  }`}
                >
                  {issue.type === 'error' ? (
                    <XCircle className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      {selectedPlants.length === 0 && (
        <div className="text-center text-muted-foreground py-4">
          Add plants to see compatibility analysis
        </div>
      )}
    </div>
  );
}
