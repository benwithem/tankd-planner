import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import type { TankItem, PlantItem, TankParameters, FishData, PlantData } from './types';
import { cn } from '@/lib/utils';

export interface CompatibilityModalProps {
  selectedFish: TankItem[];
  selectedPlants: PlantItem[];
  parameters: TankParameters;
  onClose: () => void;
}

export function CompatibilityModal({
  selectedFish,
  selectedPlants,
  parameters,
  onClose
}: CompatibilityModalProps) {
  const allItems = [...selectedFish, ...selectedPlants];

  const getItemKey = (item: TankItem | PlantItem): string => {
    return 'scientificName' in item ? item.scientificName : item.slug;
  };

  const getItemDisplayName = (item: TankItem | PlantItem): string => {
    return 'commonName' in item ? item.commonName : item.name;
  };

  const getCompatibilityStatus = (rowItem: TankItem | PlantItem, colItem: TankItem | PlantItem): {
    status: 'compatible' | 'incompatible';
    message: string;
  } => {
    // Fish-Fish Compatibility
    if (!('scientificName' in rowItem) && !('scientificName' in colItem)) {
      const fishRow = rowItem as FishData;
      const fishCol = colItem as FishData;
      if (!fishRow.compatibility?.otherFish?.[fishCol.slug]) {
        return {
          status: 'incompatible',
          message: 'May be aggressive'
        };
      }
    }
    // Fish-Plant Compatibility
    else if (!('scientificName' in rowItem) && 'scientificName' in colItem) {
      const fish = rowItem as FishData;
      if (fish.compatibility?.plants === false) {
        return {
          status: 'incompatible',
          message: 'May damage plant'
        };
      }
    }
    // Plant-Fish Compatibility
    else if ('scientificName' in rowItem && !('scientificName' in colItem)) {
      const fish = colItem as FishData;
      if (fish.compatibility?.plants === false) {
        return {
          status: 'incompatible',
          message: 'Fish may damage plant'
        };
      }
    }

    return {
      status: 'compatible',
      message: ''
    };
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Compatibility Matrix</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[600px]">
          <div className="p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Species</TableHead>
                  {allItems.map((item) => (
                    <TableHead key={getItemKey(item)} className="text-center">
                      {getItemDisplayName(item)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {allItems.map((rowItem) => (
                  <TableRow key={getItemKey(rowItem)}>
                    <TableCell className="font-medium">
                      <div>
                        {getItemDisplayName(rowItem)}
                        {'scientificName' in rowItem && (
                          <div className="text-xs text-muted-foreground">
                            {rowItem.scientificName}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    {allItems.map((colItem) => {
                      // Skip self-comparison
                      if (getItemKey(rowItem) === getItemKey(colItem)) {
                        return <TableCell key={getItemKey(colItem)} className="text-center">-</TableCell>;
                      }

                      const { status, message } = getCompatibilityStatus(rowItem, colItem);

                      return (
                        <TableCell key={getItemKey(colItem)} className="text-center">
                          <Badge
                            variant={status === 'compatible' ? 'default' : 'destructive'}
                            className="cursor-help"
                          >
                            {status === 'compatible' ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <XCircle className="h-4 w-4" />
                            )}
                          </Badge>
                          {message && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {message}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
