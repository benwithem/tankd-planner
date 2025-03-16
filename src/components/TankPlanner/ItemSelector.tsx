import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { TankItem } from './types';

const categories = ['fish', 'plant', 'decor', 'equipment', 'shrimp', 'snail'] as const;
type Category = typeof categories[number];

interface ItemSelectorProps {
  allItems: TankItem[];
  onAddItem: (item: TankItem) => void;
}

export function ItemSelector({ allItems, onAddItem }: ItemSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('fish');
  const [searchTerm, setSearchTerm] = useState('');

  const getDisplayName = useCallback((item: TankItem): string => {
    if ('commonName' in item.data) return item.data.commonName;
    if ('name' in item.data) return item.data.name;
    return 'Unknown Item';
  }, []);

  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      if (item.slug.split('/')[0] !== selectedCategory) return false;
      return getDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [allItems, selectedCategory, searchTerm, getDisplayName]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {categories.map(cat => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </Button>
        ))}
      </div>
      <Input
        placeholder={`Search ${selectedCategory}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full"
      />
      <ScrollArea className="h-64 w-full rounded-md border">
        <div className="p-4">
          {filteredItems.map(item => (
            <div
              key={item.slug}
              className="flex justify-between items-center py-2 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
            >
              <div>
                <div className="font-medium">
                  {getDisplayName(item)}
                </div>
                {'scientificName' in item.data && item.data.scientificName && (
                  <div className="text-xs text-muted-foreground italic">
                    {item.data.scientificName}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAddItem(item)}
              >
                Add
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
