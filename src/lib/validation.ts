import { TANK_PARAMETERS, ERROR_MESSAGES } from './constants';
import type { TankParameters } from '@/components/TankPlanner/types';

export function validateTankParameters(params: Partial<TankParameters>): string[] {
  const errors: string[] = [];
  
  if (params.temperature !== undefined) {
    if (params.temperature < TANK_PARAMETERS.TEMPERATURE.MIN || 
        params.temperature > TANK_PARAMETERS.TEMPERATURE.MAX) {
      errors.push(`Temperature must be between ${TANK_PARAMETERS.TEMPERATURE.MIN} and ${TANK_PARAMETERS.TEMPERATURE.MAX}°C`);
    }
  }
  
  if (params.ph !== undefined) {
    if (params.ph < TANK_PARAMETERS.PH.MIN || 
        params.ph > TANK_PARAMETERS.PH.MAX) {
      errors.push(`pH must be between ${TANK_PARAMETERS.PH.MIN} and ${TANK_PARAMETERS.PH.MAX}`);
    }
  }
  
  return errors;
}