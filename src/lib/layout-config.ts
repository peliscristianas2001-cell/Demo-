
import type { LayoutCategory, LayoutItemType, CustomLayoutConfig } from './types';

export const defaultLayoutConfig: Record<LayoutCategory, Record<LayoutItemType, CustomLayoutConfig>> = {
  vehicles: {
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
      localStorage.removeItem('app_layout_config');
  }

  const storedConfig = localStorage.getItem('app_layout_config');
  
  try {
    if (storedConfig) {
      const parsed = JSON.parse(storedConfig);
      if (typeof parsed === 'object' && parsed !== null && ('vehicles' in parsed) && ('airplanes' in parsed) && ('cruises' in parsed)) {
         return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to parse layout config from localStorage", e);
  }
  
  localStorage.setItem('app_layout_config', JSON.stringify(defaultLayoutConfig));
  return defaultLayoutConfig;
}

export function saveLayoutConfig(newConfig: Record<LayoutCategory, Record<LayoutItemType, CustomLayoutConfig>>) {
   if (typeof window !== 'undefined') {
     localStorage.setItem('app_layout_config', JSON.stringify(newConfig));
     window.dispatchEvent(new Event('storage'));
   }
}
