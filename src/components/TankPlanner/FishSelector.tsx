/** @jsxImportSource react */
import React, { useState, useMemo } from 'react';
import type { FishData, TankParameters } from './types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Fish, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getConsistentColor, getContrastColor } from '@/lib/colors';
import { checkFishCompatibility } from '@/utils/compatibility-utils';

interface FishSelectorProps {
  allFish: FishData[];
  selectedFish: FishData[];
  onAddFish: (fish: FishData) => void;
  currentParameters?: TankParameters;
}

export const FishSelector: React.FC<FishSelectorProps> = ({
  allFish,
  selectedFish,
  onAddFish,
  currentParameters,
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredFish = useMemo(() => {
    return allFish.filter((fish) =>
      fish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fish.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allFish, searchTerm]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search fish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4">
        {filteredFish.map((fish) => {
          const isSelected = selectedFish.some(f => f.slug === fish.slug);
          const issues = checkFishCompatibility(fish, currentParameters, selectedFish);
          const hasIssues = issues.length > 0;
          const bgColor = getConsistentColor(fish.scientificName, true);
          const textColor = getContrastColor(bgColor);

          return (
            <Card key={fish.slug} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar color={bgColor}>
                    <AvatarFallback textColor={textColor}>
                      <Fish className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium leading-none flex items-center gap-2">
                          {fish.name}
                          {hasIssues && (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground italic">
                          {fish.scientificName}
                        </p>
                      </div>
                      <Button
                        variant={isSelected ? "secondary" : "default"}
                        onClick={() => !isSelected && onAddFish(fish)}
                        disabled={isSelected}
                        size="sm"
                      >
                        {isSelected ? "Added" : "Add"}
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant={fish.temperament === 'peaceful' ? 'default' : 'destructive'}>
                        {fish.temperament}
                      </Badge>
                      <Badge variant="outline">{fish.location}</Badge>
                      <Badge variant="outline">{fish.size}</Badge>
                      <Badge variant="outline">Care: {fish.careLevel}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Tank Size:</span>
                        <br />{fish.tankSize.minimum}L min
                      </div>
                      <div>
                        <span className="text-muted-foreground">Temperature:</span>
                        <br />{fish.waterParameters.temperature.min}-{fish.waterParameters.temperature.max}°C
                      </div>
                    </div>

                    {hasIssues && (
                      <div className="text-sm text-yellow-500">
                        {issues[0]}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredFish.length === 0 && (
          <div className="text-center py-6 text-muted-foreground">
            No fish found matching your search
          </div>
        )}
      </div>
    </div>
  );
};
