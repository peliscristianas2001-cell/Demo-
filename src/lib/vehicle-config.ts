
import type { VehicleType, CustomVehicleConfig } from './types';

export const defaultVehicleConfig: Record<VehicleType, CustomVehicleConfig> = {
  doble_piso: { 
    name: 'Doble piso', 
    seats: 60,
    layout: {
      floors: [
        {
          name: "Planta Baja",
          grid: [
            [{type: 'baño'}, {type: 'pasillo'}, {type: 'chofer'}, {type: 'chofer'}],
            [{type: 'escalera'}, {type: 'pasillo'}, {type: 'empty'}, {type: 'empty'}],
            [{type: 'seat', number: 49}, {type: 'pasillo'}, {type: 'seat', number: 50}, {type: 'seat', number: 51}],
            [{type: 'seat', number: 52}, {type: 'pasillo'}, {type: 'seat', number: 53}, {type: 'seat', number: 54}],
            [{type: 'seat', number: 55}, {type: 'pasillo'}, {type: 'seat', number: 56}, {type: 'seat', number: 57}],
            [{type: 'seat', number: 58}, {type: 'pasillo'}, {type: 'seat', number: 59}, {type: 'seat', number: 60}],
          ]
        },
        {
          name: "Planta Alta",
          grid: [
            [{type: 'seat', number: 1}, {type: 'seat', number: 2}, {type: 'pasillo'}, {type: 'seat', number: 3}, {type: 'seat', number: 4}],
            [{type: 'seat', number: 5}, {type: 'seat', number: 6}, {type: 'pasillo'}, {type: 'escalera'}, {type: 'escalera'}],
            [{type: 'seat', number: 7}, {type: 'seat', number: 8}, {type: 'pasillo'}, {type: 'cafetera'}, {type: 'cafetera'}],
            ...Array.from({ length: 10 }, (_, i) => {
              const startNum = 9 + i * 4;
              return [
                { type: 'seat', number: startNum }, { type: 'seat', number: startNum + 1 },
                { type: 'pasillo' },
                { type: 'seat', number: startNum + 2 }, { type: 'seat', number: startNum + 3 }
              ] as any[];
            })
          ]
        }
      ]
    }
  },
  micro_largo: { 
    name: 'Micro largo', 
    seats: 58,
    layout: {
      floors: [{
        name: "Planta Única",
        grid: [
          ...Array.from({ length: 14 }, (_, i) => {
            const startNum = 1 + i * 4;
            return [
              { type: 'seat', number: startNum }, { type: 'seat', number: startNum + 1 },
              { type: 'pasillo' },
              { type: 'seat', number: startNum + 2 }, { type: 'seat', number: startNum + 3 }
            ] as any[];
          }),
          [{type: 'seat', number: 57}, {type: 'seat', number: 58}, {type: 'pasillo'}, {type: 'baño'}, {type: 'baño'}]
        ]
      }]
    }
  },
  micro_bajo: { 
    name: 'Micro bajo', 
    seats: 46,
    layout: {
      floors: [{
        name: "Planta Única",
        grid: [
          ...Array.from({ length: 11 }, (_, i) => {
            const startNum = 1 + i * 4;
            return [
              { type: 'seat', number: startNum }, { type: 'seat', number: startNum + 1 },
              { type: 'pasillo' },
              { type: 'seat', number: startNum + 2 }, { type: 'seat', number: startNum + 3 }
            ] as any[];
          }),
          [{type: 'seat', number: 45}, {type: 'seat', number: 46}, {type: 'pasillo'}, {type: 'baño'}, {type: 'baño'}]
        ]
      }]
    }
  },
  combi: { 
    name: 'Combi', 
    seats: 19,
    layout: {
      floors: [{
        name: "Planta Única",
        grid: [
          [{type: 'chofer'}, {type: 'pasillo'}, {type: 'seat', number: 1}, {type: 'empty'}],
          [{type: 'seat', number: 2}, {type: 'pasillo'}, {type: 'seat', number: 3}, {type: 'seat', number: 4}],
          [{type: 'seat', number: 5}, {type: 'pasillo'}, {type: 'seat', number: 6}, {type: 'seat', number: 7}],
          [{type: 'seat', number: 8}, {type: 'pasillo'}, {type: 'seat', number: 9}, {type: 'seat', number: 10}],
          [{type: 'seat', number: 11}, {type: 'pasillo'}, {type: 'seat', number: 12}, {type: 'seat', number: 13}],
          [{type: 'seat', number: 14}, {type: 'pasillo'}, {type: 'seat', number: 15}, {type: 'seat', number: 16}],
          [{type: 'seat', number: 17}, {type: 'seat', number: 18}, {type: 'seat', number: 19}, {type: 'empty'}],
        ]
      }]
    }
  },
};

export function getVehicleConfig(forceNew = false): Record<string, CustomVehicleConfig> {
  if (typeof window === 'undefined') {
    return defaultVehicleConfig;
  }

  // forceNew can be used to bypass cache if needed, for now it's true to always get fresh data
  const storedConfig = localStorage.getItem('ytl_vehicle_config');
  try {
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      // Basic validation to ensure it's a non-empty object
      if (typeof parsed === 'object' && parsed !== null && Object.keys(parsed).length > 0) {
         return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse vehicle config from localStorage", e);
  }
  
  // If nothing is in localStorage, set it with the defaults
  localStorage.setItem('ytl_vehicle_config', JSON.stringify(defaultVehicleConfig));
  return defaultVehicleConfig;
}

export function saveVehicleConfig(newConfig: Record<string, CustomVehicleConfig>) {
   if (typeof window !== 'undefined') {
     localStorage.setItem('ytl_vehicle_config', JSON.stringify(newConfig));
     window.dispatchEvent(new Event('storage')); // Notify other components of the change
   }
}
