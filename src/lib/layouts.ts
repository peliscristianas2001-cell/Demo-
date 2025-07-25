
"use client"

import type { VehicleType, CustomVehicleConfig } from './types';
import { getVehicleConfig } from './vehicle-config';

export type Cell = { type: 'seat', number: number } | { type: 'pasillo' | 'escalera' | 'baño' | 'cafetera' | 'chofer' | 'empty' };
export type Floor = {
    name: string;
    grid: Cell[][];
};
export type Layout = {
    floors: Floor[];
};

// This function now dynamically generates the layout from the stored configuration.
export const getLayoutForVehicle = (type: VehicleType): Layout => {
    const allConfigs = getVehicleConfig();
    const config = allConfigs[type];

    if (config && config.layout) {
        // The layout is already stored in the correct format
        return config.layout;
    }

    // Fallback to a default layout if something goes wrong
    return {
        floors: [{
            name: "Planta Única",
            grid: [
                [{ type: 'chofer' }, { type: 'pasillo' }, { type: 'seat', number: 1 }, { type: 'empty' }],
                [{ type: 'seat', number: 2 }, { type: 'pasillo' }, { type: 'seat', number: 3 }, { type: 'seat', number: 4 }],
            ],
        }],
    };
}
