import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { 
  AlertCircle, 
  Check,
  ThermometerSnowflake,
  Droplets,
  Users,
  Fish, 
  Heart,
  ShieldAlert,
  ShieldCheck,
  Info,
  ArrowRightLeft,
  AlertTriangle
} from 'lucide-react';
import type { BaseTankItemData, FishData, PlantData, TankParameters, WaterParameters } from "./types";
import { isFishData, isPlantData } from '../../utils/type-guards';
import { checkFishCompatibility, checkPlantCompatibility, getWaterColor } from '@/utils/compatibility-utils';

interface CompatibilityResult {
  temperatureCompatibility: {
    isCompatible: boolean;
    idealRange: { min: number; max: number };
    issues: string[];
  };
  phCompatibility: {
    isCompatible: boolean;
    idealRange: { min: number; max: number };
    issues: string[];
  };
  fishCompatibility: {
    isCompatible: boolean;
    issues: string[];
  };
  plantCompatibility: {
    isCompatible: boolean;
    issues: string[];
  };
}

export interface CompatibilityAnalysisProps {
  parameters: TankParameters;
  selectedFish: FishData[];
  selectedPlants: PlantData[];
  onViewDetails: (item: FishData | PlantData) => void;
}

export const CompatibilityAnalysis: React.FC<CompatibilityAnalysisProps> = ({
  parameters,
  selectedFish,
  selectedPlants,
  onViewDetails
}) => {
  const [activeTab, setActiveTab] = React.useState('overview');

  const fishCompatibilityResults = selectedFish.map(fish => {
    const issues = checkFishCompatibility(fish, parameters, selectedFish);
    return {
      fish,
      issues,
      isCompatible: issues.length === 0
    };
  });

  const plantCompatibilityResults = selectedPlants.map(plant => {
    const issues = checkPlantCompatibility(plant, parameters, selectedFish);
    return {
      plant,
      issues,
      isCompatible: issues.length === 0
    };
  });

  const totalBioload = fishCompatibilityResults.reduce((acc, { fish, isCompatible }) => {
    return acc + (isCompatible ? (fish.quantity || 0) : 0);
  }, 0);

  const totalPlants = plantCompatibilityResults.reduce((acc, { plant, isCompatible }) => {
    return acc + (isCompatible ? (plant.quantity || 0) : 0);
  }, 0);

  const checkTemperatureCompatibility = (params: WaterParameters) => {
    const tankTemp = parameters.temperature;
    return params.temperature.min <= tankTemp.max && params.temperature.max >= tankTemp.min;
  };

  const checkPHCompatibility = (params: WaterParameters) => {
    const tankPH = parameters.pH;
    return params.pH.min <= tankPH.max && params.pH.max >= tankPH.min;
  };

  const formatRange = (range: { min: number; max: number }) => {
    return `${range.min} - ${range.max}`;
  };

  const renderTemperature = (temp: { min: number; max: number }) => {
    return formatRange(temp) + '°C';
  };

  const renderPH = (ph: { min: number; max: number }) => {
    return formatRange(ph);
  };

  const getCompatibilityResult = (): CompatibilityResult => {
    const result: CompatibilityResult = {
      temperatureCompatibility: {
        isCompatible: true,
        idealRange: parameters.temperature,
        issues: []
      },
      phCompatibility: {
        isCompatible: true,
        idealRange: parameters.pH,
        issues: []
      },
      fishCompatibility: {
        isCompatible: fishCompatibilityResults.every(r => r.isCompatible),
        issues: fishCompatibilityResults.flatMap(({ fish, issues }) => 
          issues.map(issue => `${fish.name}: ${issue}`)
        )
      },
      plantCompatibility: {
        isCompatible: plantCompatibilityResults.every(r => r.isCompatible),
        issues: plantCompatibilityResults.flatMap(({ plant, issues }) => 
          issues.map(issue => `${plant.name}: ${issue}`)
        )
      }
    };

    return result;
  };

  const compatibilityResult = React.useMemo(() => getCompatibilityResult(), [
    parameters, 
    fishCompatibilityResults, 
    plantCompatibilityResults
  ]);

  const hasIncompatibilities = !compatibilityResult.fishCompatibility.isCompatible || 
    !compatibilityResult.plantCompatibility.isCompatible;

  const getProgressColor = (value: number) => {
    if (value > 100) return 'bg-red-500';
    if (value > 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const waterColor = React.useMemo(() => getWaterColor(parameters, selectedFish), [parameters, selectedFish]);

  // No items selected - show placeholder
  if (selectedFish.length === 0 && selectedPlants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Fish className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-3" />
        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">Add Items to See Compatibility</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          The compatibility analysis will help you check if your selected items 
          can live together in the current tank parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tank Status Overview */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tank Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Bioload */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Bioload</span>
                  <span 
                    className={`font-medium ${
                      totalBioload > 100 ? 'text-red-500 dark:text-red-400' : 
                      totalBioload > 80 ? 'text-yellow-500 dark:text-yellow-400' : 
                      'text-green-600 dark:text-green-400'
                    }`}
                  >
                    {totalBioload}%
                  </span>
                </div>
                <Progress value={totalBioload} className={getProgressColor(totalBioload)} />
                <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
                  {totalBioload > 100 ? (
                    "Your tank is overcrowded. Consider removing some items or upgrading to a larger tank."
                  ) : totalBioload > 80 ? (
                    "Your tank is nearing maximum capacity. Be cautious about adding more items."
                  ) : (
                    "Your tank has adequate space for the current items."
                  )}
                </p>
              </div>

              {/* Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Temperature</h4>
                  <p className="text-2xl font-bold">
                    {renderTemperature(parameters.temperature)}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">pH Level</h4>
                  <p className="text-2xl font-bold">
                    {renderPH(parameters.pH)}
                  </p>
                </div>
              </div>

              {/* Compatibility Summary */}
              <div>
                <h4 className="text-sm font-medium mb-2">Compatibility</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Fish</span>
                    <Badge variant={compatibilityResult.fishCompatibility.isCompatible ? "default" : "destructive"}>
                      {compatibilityResult.fishCompatibility.isCompatible ? "Compatible" : "Issues Found"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Plants</span>
                    <Badge variant={compatibilityResult.plantCompatibility.isCompatible ? "default" : "destructive"}>
                      {compatibilityResult.plantCompatibility.isCompatible ? "Compatible" : "Issues Found"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Water Parameters */}
        <Card style={{ background: waterColor }}>
          <CardHeader>
            <CardTitle>Water Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Temperature Range</h4>
                <div className="flex items-center justify-between">
                  <span>{renderTemperature(parameters.temperature)}</span>
                  <Badge variant={compatibilityResult.temperatureCompatibility.isCompatible ? "default" : "destructive"}>
                    {compatibilityResult.temperatureCompatibility.isCompatible ? "Optimal" : "Suboptimal"}
                  </Badge>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">pH Range</h4>
                <div className="flex items-center justify-between">
                  <span>{renderPH(parameters.pH)}</span>
                  <Badge variant={compatibilityResult.phCompatibility.isCompatible ? "default" : "destructive"}>
                    {compatibilityResult.phCompatibility.isCompatible ? "Optimal" : "Suboptimal"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Show compatibility issues */}
      {compatibilityResult.fishCompatibility.issues.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Fish Compatibility Issues</h3>
          </div>
          
          <ul className="space-y-2">
            {compatibilityResult.fishCompatibility.issues.map((issue, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{issue}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {compatibilityResult.plantCompatibility.issues.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Plant Compatibility Issues</h3>
          </div>
          
          <ul className="space-y-2">
            {compatibilityResult.plantCompatibility.issues.map((issue, index) => (
              <li key={index} className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5" />
                <p className="text-sm text-red-800 dark:text-red-200">{issue}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
