import React from 'react';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '@radix-ui/react-tabs';
import { CompatibilityAnalysis } from './CompatibilityAnalysis';
import type { FishData, TankParameters } from './types';

interface PlannerTabsProps {
  selectedFish: FishData[];
  tankParameters: TankParameters;
}

export function PlannerTabs({ selectedFish, tankParameters }: PlannerTabsProps) {
  return (
    <Tabs defaultValue="setup" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="setup">Tank Setup</TabsTrigger>
        <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
      </TabsList>

      <TabsContent value="setup" className="mt-4">
        {/* Tank setup content */}
      </TabsContent>
      <TabsContent value="compatibility" className="mt-4">
        <CompatibilityAnalysis 
          selectedFish={selectedFish} 
          tankParameters={tankParameters} 
        />
      </TabsContent>
    </Tabs>
  );
}
