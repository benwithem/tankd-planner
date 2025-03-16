/** @jsxImportSource react */
import * as React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TankItem } from './types';

interface SelectedItemsListProps {
  items: TankItem[];
  onRemove: (slug: string) => void;
  onUpdateQuantity: (slug: string, quantity: number) => void;
}

export function SelectedItemsList({
  items,
  onRemove,
  onUpdateQuantity,
}: SelectedItemsListProps): React.ReactElement {
  const handleQuantityChange = (slug: string, newQuantity: number) => {
    if (newQuantity > 0) {
      onUpdateQuantity(slug, newQuantity);
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No items selected. Start adding items to your tank!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Selected Items</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.slug}
            className="flex items-center justify-between p-2 border rounded-lg"
          >
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-muted-foreground">
                Size: {item.size}cm | Tank Size: {item.tankSize}L
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(item.slug, parseInt(e.target.value, 10))
                }
                className="w-16 px-2 py-1 border rounded"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(item.slug)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
