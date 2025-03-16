/** @jsxImportSource react */
import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
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
  ArrowRightLeft
} from 'lucide-react';
import type { TankItem, PlantItem, TankParameters, CompatibilityLevel } from './types';

interface CompatibilityAnalysisProps {
  selectedItems: TankItem[];
  selectedPlants: PlantItem[];
  parameters: TankParameters;
}

type CompatibilityResult = {
  isCompatible: boolean;
  warnings: string[];
  errors: string[];
  tankUsage: number;
  temperatureCompatibility: {
    isCompatible: boolean;
    idealRange: [number, number] | null;
    description: string;
  };
  phCompatibility: {
    isCompatible: boolean;
    idealRange: [number, number] | null;
    description: string;
  };
  fishCompatibility: {
    isCompatible: boolean;
    incompatiblePairs: Array<{
      fish1: string;
      fish2: string;
      reason: string;
    }>;
  };
  plantCompatibility: {
    isCompatible: boolean;
    incompatiblePairs: Array<{
      plant1: string;
      plant2: string;
      reason: string;
    }>;
  };
};

export function CompatibilityAnalysis({
  selectedItems,
  selectedPlants,
  parameters,
}: CompatibilityAnalysisProps): React.ReactElement {
  const [activeTab, setActiveTab] = React.useState('overview');

  const compatibilityResult = React.useMemo<CompatibilityResult>(() => {
    const result: CompatibilityResult = {
      isCompatible: true,
      warnings: [],
      errors: [],
      tankUsage: 0,
      temperatureCompatibility: {
        isCompatible: true,
        idealRange: null,
        description: 'No items selected',
      },
      phCompatibility: {
        isCompatible: true,
        idealRange: null,
        description: 'No items selected',
      },
      fishCompatibility: {
        isCompatible: true,
        incompatiblePairs: [],
      },
      plantCompatibility: {
        isCompatible: true,
        incompatiblePairs: [],
      },
    };

    // No items selected case
    if (selectedItems.length === 0 && selectedPlants.length === 0) {
      return result;
    }

    // Check tank size
    const totalRequiredVolume = selectedItems.reduce(
      (acc, item) => acc + (item.tankSize.recommended * item.quantity),
      0
    );
    
    result.tankUsage = Math.round((totalRequiredVolume / parameters.size) * 100);
    
    if (result.tankUsage > 100) {
      result.isCompatible = false;
      result.errors.push(`Tank is overcrowded (${result.tankUsage}% capacity)`);
    } else if (result.tankUsage > 85) {
      result.warnings.push(`Tank is approaching maximum capacity (${result.tankUsage}%)`);
    }

    // Filter fish items for temperature and pH checks
    const fishItems = selectedItems.filter((item): item is TankItem => 'temperament' in item);
    const plantItems = selectedPlants.filter((item): item is PlantItem => !('temperament' in item));

    // Check plant lighting requirements
    if (plantItems.length > 0) {
      const lightingLevels = new Set(plantItems.map(plant => plant.lighting));
      if (lightingLevels.size > 1) {
        result.warnings.push('Plants with different lighting requirements may not thrive in the same conditions');
      }
    }

    // Check plant CO2 requirements
    if (plantItems.length > 0) {
      const co2Requirements = new Set(plantItems.map(plant => plant.co2));
      if (co2Requirements.has('required')) {
        result.warnings.push('Some plants require CO2 supplementation for optimal growth');
      }
    }

    // Check plant substrate compatibility
    if (plantItems.length > 0) {
      const substrates = new Set(plantItems.flatMap(plant => plant.substrate));
      if (substrates.size > 1) {
        result.warnings.push('Plants with different substrate preferences are mixed - ensure proper substrate zones');
      }
    }

    // Check fish-plant compatibility
    if (fishItems.length > 0 && plantItems.length > 0) {
      const plantEaters = fishItems.filter(fish => fish.compatibility?.plants === false);

      if (plantEaters.length > 0) {
        result.warnings.push('Some fish may eat or damage plants - monitor plant health');
        plantEaters.forEach(fish => {
          plantItems.forEach(plant => {
            result.fishCompatibility.incompatiblePairs.push({
              fish1: fish.name,
              fish2: plant.commonName,
              reason: 'This fish may eat or damage plants',
            });
          });
        });
      }
    }

    // Get min/max values across all items
    const minTemps = selectedItems
      .filter(item => item.waterParameters?.temperature)
      .map(item => item.waterParameters.temperature[0]);
    const maxTemps = selectedItems
      .filter(item => item.waterParameters?.temperature)
      .map(item => item.waterParameters.temperature[1]);
    const minPHs = selectedItems
      .filter(item => item.waterParameters?.pH)
      .map(item => item.waterParameters.pH[0]);
    const maxPHs = selectedItems
      .filter(item => item.waterParameters?.pH)
      .map(item => item.waterParameters.pH[1]);

    // Add plant parameters if available
    if (selectedPlants.length > 0) {
      const plantMinTemps = selectedPlants
        .filter(plant => plant.waterParameters?.temperature)
        .map(plant => plant.waterParameters.temperature[0]);
      const plantMaxTemps = selectedPlants
        .filter(plant => plant.waterParameters?.temperature)
        .map(plant => plant.waterParameters.temperature[1]);
      const plantMinPHs = selectedPlants
        .filter(plant => plant.waterParameters?.pH)
        .map(plant => plant.waterParameters.pH[0]);
      const plantMaxPHs = selectedPlants
        .filter(plant => plant.waterParameters?.pH)
        .map(plant => plant.waterParameters.pH[1]);

      minTemps.push(...plantMinTemps);
      maxTemps.push(...plantMaxTemps);
      minPHs.push(...plantMinPHs);
      maxPHs.push(...plantMaxPHs);
    }

    if (minTemps.length === 0 || maxTemps.length === 0 || minPHs.length === 0 || maxPHs.length === 0) {
      return {
        isCompatible: true,
        warnings: [],
        errors: [],
        tankUsage: 0,
        temperatureCompatibility: {
          isCompatible: true,
          idealRange: null,
          description: 'No valid temperature parameters',
        },
        phCompatibility: {
          isCompatible: true,
          idealRange: null,
          description: 'No valid pH parameters',
        },
        fishCompatibility: {
          isCompatible: true,
          incompatiblePairs: [],
        },
        plantCompatibility: {
          isCompatible: true,
          incompatiblePairs: [],
        },
      };
    }

    // Find the overlapping ranges
    const idealTemp: [number, number] = [Math.max(...minTemps), Math.min(...maxTemps)];
    const idealPH: [number, number] = [Math.max(...minPHs), Math.min(...maxPHs)];

    // Check if ranges overlap
    const tempCompatible = idealTemp[0] <= idealTemp[1];
    const phCompatible = idealPH[0] <= idealPH[1];

    const warnings: string[] = [];
    if (!tempCompatible) {
      warnings.push('Temperature ranges do not overlap between selected species');
    }
    if (!phCompatible) {
      warnings.push('pH ranges do not overlap between selected species');
    }

    result.temperatureCompatibility.isCompatible = tempCompatible;
    result.temperatureCompatibility.idealRange = tempCompatible ? idealTemp : null;
    result.phCompatibility.isCompatible = phCompatible;
    result.phCompatibility.idealRange = phCompatible ? idealPH : null;
    result.warnings = warnings;

    if (!tempCompatible || !phCompatible) {
      result.isCompatible = false;
    }

    // Check temperature compatibility for fish
    if (fishItems.length > 0) {
      if (parameters.temperature < idealTemp[0]) {
        result.isCompatible = false;
        result.temperatureCompatibility.isCompatible = false;
        result.errors.push(`Temperature is too low (${parameters.temperature}°C < ${idealTemp[0]}°C)`);
        result.temperatureCompatibility.description = 'Current temperature is too low';
      } else if (parameters.temperature > idealTemp[1]) {
        result.isCompatible = false;
        result.temperatureCompatibility.isCompatible = false;
        result.errors.push(`Temperature is too high (${parameters.temperature}°C > ${idealTemp[1]}°C)`);
        result.temperatureCompatibility.description = 'Current temperature is too high';
      } else {
        // Check if we're near the edge of the compatible range
        const margin = 1.5; // 1.5°C margin
        if (
          parameters.temperature < idealTemp[0] + margin ||
          parameters.temperature > idealTemp[1] - margin
        ) {
          result.warnings.push(`Temperature (${parameters.temperature}°C) is close to the edge of the safe range`);
          result.temperatureCompatibility.description = 'Temperature is near the edge of safe range';
        } else {
          result.temperatureCompatibility.description = 'Temperature is ideal for all fish';
        }
      }
    }

    // Check pH compatibility for fish
    if (fishItems.length > 0) {
      if (parameters.ph < idealPH[0]) {
        result.isCompatible = false;
        result.phCompatibility.isCompatible = false;
        result.errors.push(`pH is too low (${parameters.ph} < ${idealPH[0]})`);
        result.phCompatibility.description = 'Current pH is too low';
      } else if (parameters.ph > idealPH[1]) {
        result.isCompatible = false;
        result.phCompatibility.isCompatible = false;
        result.errors.push(`pH is too high (${parameters.ph} > ${idealPH[1]})`);
        result.phCompatibility.description = 'Current pH is too high';
      } else {
        // Check if we're near the edge of the compatible range
        const margin = 0.3; // 0.3 pH margin
        if (
          parameters.ph < idealPH[0] + margin ||
          parameters.ph > idealPH[1] - margin
        ) {
          result.warnings.push(`pH (${parameters.ph}) is close to the edge of the safe range`);
          result.phCompatibility.description = 'pH is near the edge of safe range';
        } else {
          result.phCompatibility.description = 'pH is ideal for all fish';
        }
      }
    }

    // Check fish temperament compatibility
    if (fishItems.length > 1) {
      // Look for aggressive and peaceful fish combinations
      const aggressiveFish = fishItems.filter(fish => fish.temperament === 'aggressive');
      const peacefulFish = fishItems.filter(fish => fish.temperament === 'peaceful');
      
      if (aggressiveFish.length > 0 && peacefulFish.length > 0) {
        aggressiveFish.forEach(aggFish => {
          peacefulFish.forEach(peaceFish => {
            result.fishCompatibility.incompatiblePairs.push({
              fish1: aggFish.name,
              fish2: peaceFish.name,
              reason: 'Aggressive fish may harm peaceful fish',
            });
          });
        });
        
        result.isCompatible = false;
        result.fishCompatibility.isCompatible = false;
        result.errors.push('Incompatible fish temperaments detected');
      }
    }

    // Check plant compatibility
    if (plantItems.length > 1) {
      // Look for incompatible plant combinations
      const incompatiblePlants = plantItems.filter(plant => plant.compatibility?.plants === false);
      
      if (incompatiblePlants.length > 0) {
        incompatiblePlants.forEach(incompatiblePlant => {
          plantItems.forEach(plant => {
            if (incompatiblePlant.commonName !== plant.commonName) {
              result.plantCompatibility.incompatiblePairs.push({
                plant1: incompatiblePlant.commonName,
                plant2: plant.commonName,
                reason: 'Incompatible plant combination',
              });
            }
          });
        });
        
        result.isCompatible = false;
        result.plantCompatibility.isCompatible = false;
        result.errors.push('Incompatible plant combinations detected');
      }
    }

    return result;
  }, [selectedItems, selectedPlants, parameters]);

  // Determine loading shade for progress bar
  const getProgressColor = (value: number) => {
    if (value > 100) return 'bg-red-500';
    if (value > 85) return 'bg-yellow-500';
    if (value > 70) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // No items selected - show placeholder
  if (selectedItems.length === 0 && selectedPlants.length === 0) {
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

  // Overall status badge for header
  const StatusBadge = () => (
    compatibilityResult.isCompatible ? (
      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-1 rounded-full text-sm">
        <ShieldCheck className="h-4 w-4" />
        <span>Compatible</span>
      </div>
    ) : (
      <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-1 rounded-full text-sm">
        <ShieldAlert className="h-4 w-4" />
        <span>Issues Found</span>
      </div>
    )
  );

  return (
    <div className="space-y-6">
      {/* Header with status badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-medium dark:text-white">Compatibility Analysis</h3>
        </div>
        <StatusBadge />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="w-full grid grid-cols-3 dark:bg-gray-800">
          <TabsTrigger value="overview" className="dark:data-[state=active]:bg-gray-700">
            <ShieldCheck className="h-4 w-4 mr-1.5" /> 
            Overview
          </TabsTrigger>
          <TabsTrigger value="parameters" className="dark:data-[state=active]:bg-gray-700">
            <ThermometerSnowflake className="h-4 w-4 mr-1.5" /> 
            Parameters
          </TabsTrigger>
          <TabsTrigger value="items" className="dark:data-[state=active]:bg-gray-700">
            <Fish className="h-4 w-4 mr-1.5" /> 
            Items
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4 pt-2">
          {/* Tank usage progress */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-1.5 dark:text-gray-200">
                <Fish className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                Tank Capacity
              </span>
              <span 
                className={`font-medium ${
                  compatibilityResult.tankUsage > 100 ? 'text-red-500 dark:text-red-400' : 
                  compatibilityResult.tankUsage > 85 ? 'text-yellow-500 dark:text-yellow-400' : 
                  'text-green-600 dark:text-green-400'
                }`}
              >
                {compatibilityResult.tankUsage}%
              </span>
            </div>
            <Progress 
              value={Math.min(compatibilityResult.tankUsage, 100)} 
              className={`h-2 ${getProgressColor(compatibilityResult.tankUsage)}`} 
            />
            <p className="text-xs text-muted-foreground dark:text-gray-400 mt-1">
              {compatibilityResult.tankUsage > 100 ? (
                "Your tank is overcrowded. Consider removing some items or upgrading to a larger tank."
              ) : compatibilityResult.tankUsage > 85 ? (
                "Your tank is nearing maximum capacity. Be cautious about adding more items."
              ) : (
                "Your tank has adequate space for the current items."
              )}
            </p>
          </div>
          
          {/* Error and warning alerts */}
          {compatibilityResult.errors.length > 0 && (
            <Alert variant="destructive" className="py-3 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Compatibility Issues</AlertTitle>
              <AlertDescription>
                <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
                  {compatibilityResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {compatibilityResult.warnings.length > 0 && (
            <Alert variant="default" className="bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 py-3">
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertTitle>Warnings</AlertTitle>
              <AlertDescription>
                <ul className="text-sm list-disc pl-5 mt-2 space-y-1">
                  {compatibilityResult.warnings.map((warning, index) => (
                    <li key={index}>{warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Success feedback when everything is compatible */}
          {compatibilityResult.isCompatible && (
            <Alert variant="default" className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 py-3">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertTitle>Good Compatibility</AlertTitle>
              <AlertDescription>
                Your item selection appears to be compatible with the current tank parameters.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
        
        <TabsContent value="parameters" className="space-y-4 pt-2">
          {/* Temperature compatibility */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <ThermometerSnowflake className="h-5 w-5 text-orange-500 dark:text-orange-400" />
              <h4 className="font-medium dark:text-white">Temperature Compatibility</h4>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium mb-1 dark:text-gray-200">Current: {parameters.temperature}°C</div>
                {compatibilityResult.temperatureCompatibility.idealRange && (
                  <div className="text-xs text-muted-foreground dark:text-gray-400">
                    Ideal range: {compatibilityResult.temperatureCompatibility.idealRange[0]}°C - {compatibilityResult.temperatureCompatibility.idealRange[1]}°C
                  </div>
                )}
              </div>
              
              <Badge
                className={
                  compatibilityResult.temperatureCompatibility.isCompatible
                    ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
                    : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                }
              >
                {compatibilityResult.temperatureCompatibility.isCompatible ? "Compatible" : "Issue"}
              </Badge>
            </div>
            
            <p className="text-sm dark:text-gray-300">
              {compatibilityResult.temperatureCompatibility.description}
            </p>
          </div>
          
          {/* pH compatibility */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Droplets className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              <h4 className="font-medium dark:text-white">pH Compatibility</h4>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium mb-1 dark:text-gray-200">Current: {parameters.ph}</div>
                {compatibilityResult.phCompatibility.idealRange && (
                  <div className="text-xs text-muted-foreground dark:text-gray-400">
                    Ideal range: {compatibilityResult.phCompatibility.idealRange[0]} - {compatibilityResult.phCompatibility.idealRange[1]}
                  </div>
                )}
              </div>
              
              <Badge
                className={
                  compatibilityResult.phCompatibility.isCompatible
                    ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
                    : "bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                }
              >
                {compatibilityResult.phCompatibility.isCompatible ? "Compatible" : "Issue"}
              </Badge>
            </div>
            
            <p className="text-sm dark:text-gray-300">
              {compatibilityResult.phCompatibility.description}
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="items" className="space-y-4 pt-2">
          {/* Item compatibility matrix */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              <h4 className="font-medium dark:text-white">Item Compatibility Matrix</h4>
            </div>
            
            <div className="w-full rounded-lg relative overflow-hidden border dark:border-gray-700">
              <ScrollArea className="h-[220px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-750">
                      <th className="p-3 border-b border-r dark:border-gray-700 text-sm font-semibold text-left">Item</th>
                      {selectedItems.map(item => (
                        <th key={item.slug} className="p-3 border-b dark:border-gray-700 text-sm font-medium text-center whitespace-nowrap">
                          <span className="text-xs">{item.name}</span>
                        </th>
                      ))}
                      {selectedPlants.map(plant => (
                        <th key={plant.slug} className="p-3 border-b dark:border-gray-700 text-sm font-medium text-center whitespace-nowrap">
                          <span className="text-xs">{plant.commonName}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedItems.map(row => (
                      <tr key={row.slug}>
                        <td className="p-3 border-b border-r dark:border-gray-700 font-medium">
                          <span>{row.name}</span>
                        </td>
                        {selectedItems.map(col => {
                          // For fish-fish combinations, check compatibility
                          const pairConflict = compatibilityResult.fishCompatibility.incompatiblePairs.find(
                            pair => 
                              (pair.fish1 === row.name && pair.fish2 === col.name) ||
                              (pair.fish1 === col.name && pair.fish2 === row.name)
                          );

                          // If same item, show a dash
                          if (row.slug === col.slug) {
                            return (
                              <td key={col.slug} className="p-3 border-b dark:border-gray-700 text-center bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                                —
                              </td>
                            );
                          }

                          return (
                            <td 
                              key={col.slug} 
                              className={`p-3 border-b dark:border-gray-700 text-center ${
                                pairConflict ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                              }`}
                            >
                              {pairConflict ? (
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <ShieldAlert className="h-4 w-4 text-red-500 dark:text-red-400 mx-auto" />
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80">
                                    <div className="flex justify-between space-x-4">
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">Compatibility Warning</h4>
                                        <p className="text-sm">{pairConflict.reason}</p>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              ) : (
                                <ShieldCheck className="h-4 w-4 text-green-500 dark:text-green-400 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                        {selectedPlants.map(plant => (
                          <td 
                            key={plant.slug} 
                            className="p-3 border-b dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/50"
                          >
                            <Info className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-auto" />
                          </td>
                        ))}
                      </tr>
                    ))}
                    {selectedPlants.map(row => (
                      <tr key={row.slug}>
                        <td className="p-3 border-b border-r dark:border-gray-700 font-medium">
                          <span>{row.commonName}</span>
                        </td>
                        {selectedItems.map(fish => (
                          <td 
                            key={fish.slug} 
                            className="p-3 border-b dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-800/50"
                          >
                            <Info className="h-4 w-4 text-gray-400 dark:text-gray-500 mx-auto" />
                          </td>
                        ))}
                        {selectedPlants.map(col => {
                          // For plant-plant combinations, check compatibility
                          if (row.slug === col.slug) {
                            return (
                              <td key={col.slug} className="p-3 border-b dark:border-gray-700 text-center bg-gray-100/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400">
                                —
                              </td>
                            );
                          }

                          const pairConflict = compatibilityResult.plantCompatibility.incompatiblePairs.find(
                            pair => 
                              (pair.plant1 === row.commonName && pair.plant2 === col.commonName) ||
                              (pair.plant1 === col.commonName && pair.plant2 === row.commonName)
                          );

                          return (
                            <td 
                              key={col.slug} 
                              className={`p-3 border-b dark:border-gray-700 text-center ${
                                pairConflict ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'
                              }`}
                            >
                              {pairConflict ? (
                                <HoverCard>
                                  <HoverCardTrigger>
                                    <ShieldAlert className="h-4 w-4 text-red-500 dark:text-red-400 mx-auto" />
                                  </HoverCardTrigger>
                                  <HoverCardContent className="w-80">
                                    <div className="flex justify-between space-x-4">
                                      <div className="space-y-1">
                                        <h4 className="text-sm font-semibold text-red-600 dark:text-red-400">Compatibility Warning</h4>
                                        <p className="text-sm">{pairConflict.reason}</p>
                                      </div>
                                    </div>
                                  </HoverCardContent>
                                </HoverCard>
                              ) : (
                                <ShieldCheck className="h-4 w-4 text-green-500 dark:text-green-400 mx-auto" />
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
            
            {/* Show incompatible pairs */}
            {compatibilityResult.fishCompatibility.incompatiblePairs.length > 0 ? (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-red-500 dark:text-red-400" />
                  <h4 className="font-medium text-red-800 dark:text-red-300">Incompatible Item Pairs</h4>
                </div>
                
                <ul className="space-y-2">
                  {compatibilityResult.fishCompatibility.incompatiblePairs.map((pair, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRightLeft className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>{pair.fish1}</strong> and <strong>{pair.fish2}</strong>: {pair.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-500 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Great selection! All items appear to be compatible with each other.
                  </p>
                </div>
              </div>
            )}
            
            {compatibilityResult.plantCompatibility.incompatiblePairs.length > 0 ? (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="h-5 w-5 text-red-500 dark:text-red-400" />
                  <h4 className="font-medium text-red-800 dark:text-red-300">Incompatible Plant Pairs</h4>
                </div>
                
                <ul className="space-y-2">
                  {compatibilityResult.plantCompatibility.incompatiblePairs.map((pair, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <ArrowRightLeft className="h-4 w-4 text-red-500 dark:text-red-400 mt-0.5" />
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>{pair.plant1}</strong> and <strong>{pair.plant2}</strong>: {pair.reason}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-500 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-300">
                    Great selection! All plants appear to be compatible with each other.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
