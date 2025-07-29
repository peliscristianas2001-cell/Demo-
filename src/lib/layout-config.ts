

import type { LayoutCategory, LayoutItemType, CustomLayoutConfig } from './types';

export const defaultLayoutConfig: Record<LayoutCategory, Record<LayoutItemType, CustomLayoutConfig>> = {
  vehicles: {
      doble_piso: { 
        name: 'Doble piso', 
        capacity: 60,
        layout: {
          floors: [
            {
              name: "Planta Baja",
              grid: [
                [{type: 'chofer'}, {type: 'pasillo'}, {type: 'seat', number: 59}, {type: 'seat', number: 60}],
                [{type: 'escalera'}, {type: 'pasillo'}, {type: 'seat', number: 57}, {type: 'seat', number: 58}],
                [{type: 'empty'}, {type: 'pasillo'}, {type: 'seat', number: 55}, {type: 'seat', number: 56}],
                [{type: 'empty'}, {type: 'pasillo'}, {type: 'seat', number: 53}, {type: 'seat', number: 54}],
                [{type: 'empty'}, {type: 'pasillo'}, {type: 'seat', number: 51}, {type: 'seat', number: 52}],
                [{type: 'baño'}, {type: 'pasillo'}, {type: 'seat', number: 49}, {type: 'seat', number: 50}],
              ]
            },
            {
              name: "Planta Alta",
              grid: [
                 [{type: 'seat', number: 1}, {type: 'seat', number: 2}, {type: 'pasillo'}, {type: 'seat', number: 3}, {type: 'seat', number: 4}],
                 [{type: 'seat', number: 5}, {type: 'seat', number: 6}, {type: 'pasillo'}, {type: 'seat', number: 7}, {type: 'seat', number: 8}],
                 [{type: 'seat', number: 9}, {type: 'seat', number: 10}, {type: 'pasillo'}, {type: 'seat', number: 11}, {type: 'seat', number: 12}],
                 [{type: 'seat', number: 13}, {type: 'seat', number: 14}, {type: 'pasillo'}, {type: 'seat', number: 15}, {type: 'seat', number: 16}],
                 [{type: 'seat', number: 17}, {type: 'seat', number: 18}, {type: 'pasillo'}, {type: 'seat', number: 19}, {type: 'seat', number: 20}],
                 [{type: 'empty'}, {type: 'empty'}, {type: 'pasillo'}, {type: 'empty'}, {type: 'empty'}],
                 [{type: 'seat', number: 21}, {type: 'seat', number: 22}, {type: 'pasillo'}, {type: 'seat', number: 23}, {type: 'seat', number: 24}],
                 [{type: 'seat', number: 25}, {type: 'seat', number: 26}, {type: 'pasillo'}, {type: 'seat', number: 27}, {type: 'seat', number: 28}],
                 [{type: 'seat', number: 29}, {type: 'seat', number: 30}, {type: 'pasillo'}, {type: 'seat', number: 31}, {type: 'seat', number: 32}],
                 [{type: 'seat', number: 33}, {type: 'seat', number: 34}, {type: 'pasillo'}, {type: 'seat', number: 35}, {type: 'seat', number: 36}],
                 [{type: 'seat', number: 37}, {type: 'seat', number: 38}, {type: 'pasillo'}, {type: 'seat', number: 39}, {type: 'seat', number: 40}],
                 [{type: 'seat', number: 41}, {type: 'seat', number: 42}, {type: 'pasillo'}, {type: 'seat', number: 43}, {type: 'seat', number: 44}],
                 [{type: 'escalera'}, {type: 'cafetera'}, {type: 'pasillo'}, {type: 'seat', number: 45}, {type: 'seat', number: 46}, {type: 'seat', number: 47}, {type: 'seat', number: 48}],
              ]
            }
          ]
        }
      },
      micro_largo: { 
        name: 'Micro largo', 
        capacity: 58,
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
              [{type: 'seat', number: 57}, {type: 'seat', number: 58}, {type: 'pasillo'}, {type: 'baño'}, {type: 'empty'}]
            ]
          }]
        }
      },
      micro_bajo: { 
        name: 'Micro bajo', 
        capacity: 46,
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
              [{type: 'seat', number: 45}, {type: 'seat', number: 46}, {type: 'pasillo'}, {type: 'baño'}, {type: 'empty'}]
            ]
          }]
        }
      },
      combi: { 
        name: 'Combi', 
        capacity: 19,
        layout: {
          floors: [{
            name: "Planta Única",
            grid: [
                [{ type: 'chofer' }, { type: 'pasillo' }, { type: 'seat', number: 1 }, { type: 'empty' }],
                [{ type: 'seat', number: 2 }, { type: 'pasillo' }, { type: 'seat', number: 3 }, { type: 'seat', number: 4 }],
                [{ type: 'seat', number: 5 }, { type: 'pasillo' }, { type: 'seat', number: 6 }, { type: 'seat', number: 7 }],
                [{ type: 'seat', number: 8 }, { type: 'pasillo' }, { type: 'seat', number: 9 }, { type: 'seat', number: 10 }],
                [{ type: 'seat', number: 11 }, { type: 'seat', number: 12 }, { type: 'pasillo' }, { type: 'seat', number: 13 }],
                [{ type: 'seat', number: 14 }, { type: 'seat', number: 15 }, { type: 'pasillo' }, { type: 'seat', number: 16 }],
                [{ type: 'seat', number: 17 }, { type: 'seat', number: 18 }, { type: 'seat', number: 19 }, { type: 'empty' }],
            ]
          }]
        }
      },
  },
  airplanes: {},
  cruises: {
     gran_crucero: {
        name: 'Gran Crucero',
        capacity: 200,
        layout: {
          floors: [
            {
              name: "Cubierta 1",
              grid: [
                 [{type: 'cabin', number: "C101", cabinType: 'Interior', capacity: 2}, {type: 'cabin', number: "C102", cabinType: 'Interior', capacity: 2}, {type: 'pasillo'}, {type: 'cabin', number: "C103", cabinType: 'Exterior', capacity: 2}, {type: 'cabin', number: "C104", cabinType: 'Exterior', capacity: 2}],
                 [{type: 'cabin', number: "C105", cabinType: 'Interior', capacity: 4}, {type: 'cabin', number: "C106", cabinType: 'Interior', capacity: 4}, {type: 'pasillo'}, {type: 'cabin', number: "C107", cabinType: 'Exterior', capacity: 3}, {type: 'cabin', number: "C108", cabinType: 'Exterior', capacity: 3}],
                 [{type: 'escalera'}, {type: 'baño'}, {type: 'pasillo'}, {type: 'anchor'}, {type: 'waves'}],
              ]
            }
          ]
        }
     }
  },
};

export function getLayoutConfig(forceNew = false): Record<LayoutCategory, Record<LayoutItemType, CustomLayoutConfig>> {
  if (typeof window === 'undefined') {
    return defaultLayoutConfig;
  }

  if (forceNew) {
      localStorage.removeItem('ytl_layout_config');
  }

  const storedConfig = localStorage.getItem('ytl_layout_config');
  
  try {
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      // Basic validation to ensure the parsed object is in a usable state
      if (typeof parsed === 'object' && parsed !== null && ('vehicles' in parsed) && ('airplanes' in parsed) && ('cruises' in parsed)) {
         return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse layout config from localStorage", e);
  }
  
  // If parsing fails or config is not there, set default and return it
  localStorage.setItem('ytl_layout_config', JSON.stringify(defaultLayoutConfig));
  return defaultLayoutConfig;
}

export function saveLayoutConfig(newConfig: Record<LayoutCategory, Record<LayoutItemType, CustomLayoutConfig>>) {
   if (typeof window !== 'undefined') {
     localStorage.setItem('ytl_layout_config', JSON.stringify(newConfig));
     // Dispatches an event to notify other tabs/components of the change
     window.dispatchEvent(new Event('storage'));
   }
}
