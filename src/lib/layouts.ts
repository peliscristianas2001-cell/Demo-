
"use client"

import type { LayoutItemType, CustomLayoutConfig, LayoutCategory } from './types';
import { getLayoutConfig } from './layout-config';

export type Cell = 
    | { type: 'seat', number: number | '' } 
    | { type: 'cabin', number: string, cabinType: 'Interior' | 'Exterior' | 'Balcón' | 'Suite', capacity: number | '' }
    | { type: 'pasillo' | 'escalera' | 'baño' | 'cafetera' | 'chofer' | 'cabina' | 'empty' | 'anchor' | 'waves' };

export type Floor = {
    name: string;
    grid: Cell[][];
};
export type Layout = {
    floors: Floor[];
};

export const getLayoutForType = (category: LayoutCategory, type: LayoutItemType): Layout => {
    const allConfigs = getLayoutConfig();
    const categoryConfigs = allConfigs[category];
    const config = categoryConfigs?.[type];

    if (config && config.layout) {
        return config.layout;
    }

    // Return a very basic default layout if nothing is found
    return {
        floors: [{
            name: "Planta Única (Default)",
            grid: [
                [{ type: 'seat', number: 1 }, { type: 'pasillo' }, { type: 'seat', number: 2 }],
                [{ type: 'seat', number: 3 }, { type: 'pasillo' }, { type: 'seat', number: 4 }],
            ],
        }],
    };
}
