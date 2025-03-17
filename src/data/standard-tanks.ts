import type { TankData } from '@/components/TankPlanner/types';

const standardTanks: TankData[] = [
  {
    name: '5 Gallon',
    dimensions: {
      lengthCm: 40.64,
      widthCm: 20.32,
      heightCm: 25.4
    },
    parameters: {
      size: 18.9,
      waterParameters: {
        temperature: {
          min: 22,
          max: 28
        },
        pH: {
          min: 6.5,
          max: 7.5
        }
      },
      temperature: 25,
      ph: 7.0
    },
    profile: 'rectangular',
    volumeGallons: 5,
    volumeLiters: 18.9
  },
  {
    name: '10 Gallon',
    dimensions: {
      lengthCm: 50.8,
      widthCm: 25.4,
      heightCm: 30.48
    },
    parameters: {
      size: 37.8,
      waterParameters: {
        temperature: {
          min: 22,
          max: 28
        },
        pH: {
          min: 6.5,
          max: 7.5
        }
      },
      temperature: 25,
      ph: 7.0
    },
    profile: 'rectangular',
    volumeGallons: 10,
    volumeLiters: 37.8
  },
  {
    name: '20 Gallon',
    dimensions: {
      lengthCm: 61,
      widthCm: 30.5,
      heightCm: 40.6
    },
    parameters: {
      size: 75.7,
      waterParameters: {
        temperature: {
          min: 22,
          max: 28
        },
        pH: {
          min: 6.5,
          max: 7.5
        }
      },
      temperature: 25,
      ph: 7.0
    },
    profile: 'rectangular',
    volumeGallons: 20,
    volumeLiters: 75.7
  }
];

export function getStandardTanks(): TankData[] {
  return standardTanks;
}
