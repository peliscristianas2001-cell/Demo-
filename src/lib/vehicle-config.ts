
import type { VehicleType } from './types';

export const defaultVehicleConfig: Record<VehicleType, { name: string; seats: number }> = {
  doble_piso: { name: 'Doble piso', seats: 60 },
  micro_largo: { name: 'Micro largo', seats: 58 },
  micro_bajo: { name: 'Micro bajo', seats: 46 },
  combi: { name: 'Combi', seats: 19 },
};

export function getVehicleConfig(forceNew = false) {
  if (typeof window === 'undefined') {
    return defaultVehicleConfig;
  }

  if (forceNew) {
     const storedConfig = localStorage.getItem('ytl_vehicle_config');
      try {
        if (storedConfig) {
          const parsed = JSON.parse(storedConfig);
          // Basic validation to ensure it has the expected structure
          if (Object.keys(parsed).every(key => key in defaultVehicleConfig)) {
             return parsed;
          }
        }
      } catch (e) {
        console.error("Failed to parse vehicle config from localStorage", e);
      }
  }


  const storedConfig = localStorage.getItem('ytl_vehicle_config');
  try {
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
       if (Object.keys(parsed).every(key => key in defaultVehicleConfig)) {
          return parsed;
       }
    }
  } catch (e) {
    console.error("Failed to parse vehicle config from localStorage", e);
  }
  
  return defaultVehicleConfig;
}

    