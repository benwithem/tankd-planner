export type TankItemType = 'fish' | 'plant' | 'decor' | 'equipment' | 'shrimp' | 'snail';

export interface BaseTankItem {
  slug: string;
  type: TankItemType;
  data: any;
}

export interface FishContent extends BaseTankItem {
  type: 'fish';
  data: {
    commonName: string;
    scientificName: string;
    careLevel: 'beginner' | 'intermediate' | 'advanced';
    temperament: 'peaceful' | 'semi-aggressive' | 'aggressive';
    tankSize: {
      minimum: number;
      recommended: number;
    };
    waterParameters: {
      temperature: [number, number];
      pH: [number, number];
      hardness?: [number, number];
    };
    compatibility: {
      peaceful: boolean | 'caution';
      aggressive: boolean | 'caution';
      shrimp: boolean | 'caution';
      plants: boolean;
    };
    image?: string;
    thumbnail?: string;
  };
}

export interface PlantContent extends BaseTankItem {
  type: 'plant';
  data: {
    commonName: string;
    scientificName: string;
    careLevel: 'beginner' | 'intermediate' | 'advanced';
    waterParameters: {
      pH: [number, number];
    };
    lightRequirements: 'low' | 'medium' | 'high';
    image?: string;
    thumbnail?: string;
  };
}

export interface DecorContent extends BaseTankItem {
  type: 'decor';
  data: {
    name: string;
    description?: string;
    dimensions: {
      width: number;
      height: number;
      depth: number;
    };
    image?: string;
  };
}

export interface EquipmentContent extends BaseTankItem {
  type: 'equipment';
  data: {
    name: string;
    type: string;
    specifications: Record<string, any>;
    image?: string;
  };
}

export interface ShrimpContent extends BaseTankItem {
  type: 'shrimp';
  data: {
    commonName: string;
    scientificName: string;
    temperament: 'peaceful' | 'semi-aggressive' | 'aggressive';
    tankSize: {
      minimum: number;
      recommended: number;
    };
    waterParameters: {
      temperature: [number, number];
      pH: [number, number];
      hardness?: [number, number];
    };
    compatibility: {
      fish: boolean | 'caution';
      shrimp: boolean | 'caution';
      plants: boolean;
    };
    diet?: string;
    image?: string;
    thumbnail?: string;
  };
}

export interface SnailContent extends BaseTankItem {
  type: 'snail';
  data: {
    commonName: string;
    scientificName: string;
    tankSize: {
      minimum: number;
      recommended: number;
    };
    waterParameters: {
      temperature: [number, number];
      pH: [number, number];
      hardness?: [number, number];
    };
    compatibility: {
      fish: boolean | 'caution';
      shrimp: boolean | 'caution';
      plants: boolean;
    };
    diet?: string;
    image?: string;
    thumbnail?: string;
  };
}

export type TankContentItem = FishContent | PlantContent | DecorContent | EquipmentContent | ShrimpContent | SnailContent;
