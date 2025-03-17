import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Fish, Leaf } from 'lucide-react';
import { getConsistentColor } from '@/utils/color-utils';
import { cn } from '@/lib/utils';
import type { BaseTankItem } from './types';

interface SelectedFishListProps {
  selectedFish: (BaseTankItem & { quantity: number })[];
  onRemoveFish: (name: string) => void;
}

export function SelectedFishList({ selectedFish, onRemoveFish }: SelectedFishListProps) {
  if (selectedFish.length === 0) {
    return (
      <div className="text-center text-muted-foreground italic p-4 border rounded-md">
        No fish selected. Start adding fish to your tank!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {selectedFish.map((fish) => {
        const iconColor = getConsistentColor(fish.name);
        return (
          <div 
            key={fish.slug}
            className="flex justify-between items-center p-2 border rounded-md bg-background hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-md"
                style={{
                  backgroundColor: `${iconColor}15`,
                  color: iconColor
                }}
              >
                <Fish className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium flex items-center gap-2">
                  {fish.name}
                  <span className="text-sm text-muted-foreground font-normal">
                    ×{fish.quantity}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {fish.description}
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onRemoveFish(fish.name)}
              className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}