
import { VehicleType } from './types';

type Cell = { type: 'seat', number: number } | { type: 'pasillo' | 'escalera' | 'baño' | 'cafetera' | 'chofer' } | null;
type Floor = {
    name: string;
    grid: Cell[][];
};
type Layout = {
    floors: Floor[];
};

const layouts: Record<VehicleType, Layout> = {
    combi: {
        floors: [{
            name: "Planta Única",
            grid: [
                [{type: 'chofer'}, {type: 'seat', number: 1}, null, null],
                [{type: 'seat', number: 2}, {type: 'pasillo'}, {type: 'seat', number: 3}, {type: 'seat', number: 4}],
                [{type: 'seat', number: 5}, {type: 'pasillo'}, {type: 'seat', number: 6}, {type: 'seat', number: 7}],
                [{type: 'seat', number: 8}, {type: 'pasillo'}, {type: 'seat', number: 9}, {type: 'seat', number: 10}],
                [{type: 'seat', number: 11}, {type: 'pasillo'}, {type: 'seat', number: 12}, {type: 'seat', number: 13}],
                [{type: 'seat', number: 14}, {type: 'pasillo'}, {type: 'seat', number: 15}, {type: 'seat', number: 16}],
                [{type: 'seat', number: 17}, {type: 'seat', number: 18}, {type: 'seat', number: 19}, null],
            ],
        }],
    },
    micro_bajo: {
        floors: [{
            name: "Planta Única",
            grid: ((): Cell[][] => {
                const grid: Cell[][] = [];
                let seat = 1;
                // Fila 1 a 11
                for(let i=0; i<11; i++) {
                    grid.push([
                        { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ },
                        { type: 'pasillo' },
                        { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ }
                    ]);
                }
                // Fila 12
                grid.push([ { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ }, { type: 'pasillo' }, { type: 'baño' }, { type: 'baño' } ]);
                return grid;
            })(),
        }]
    },
    micro_largo: {
         floors: [{
            name: "Planta Única",
            grid: ((): Cell[][] => {
                const grid: Cell[][] = [];
                let seat = 1;
                // Fila 1 a 14
                for(let i=0; i<14; i++) {
                    grid.push([
                        { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ },
                        { type: 'pasillo' },
                        { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ }
                    ]);
                }
                // Últimos asientos
                grid.push([ { type: 'baño' }, { type: 'pasillo' }, { type: 'seat', number: 57 }, { type: 'seat', number: 58 } ]);
                return grid;
            })(),
        }]
    },
    doble_piso: {
        floors: [
            { // Planta Baja
                name: "Planta Baja",
                grid: [
                    [ {type: 'seat', number: 1}, {type: 'seat', number: 2}, {type: 'pasillo'}, {type: 'seat', number: 3}, {type: 'seat', number: 4}],
                    [ {type: 'seat', number: 5}, {type: 'seat', number: 6}, {type: 'pasillo'}, {type: 'seat', number: 7}, {type: 'seat', number: 8}],
                    [ {type: 'seat', number: 9}, {type: 'seat', number: 10}, {type: 'pasillo'}, {type: 'escalera'}, {type: 'escalera'}],
                    [ null, null, {type: 'pasillo'}, {type: 'baño'}, {type: 'baño'} ],
                    [ {type: 'seat', number: 11}, {type: 'seat', number: 12}, {type: 'pasillo'}, null, null]
                ]
            },
            { // Planta Alta
                name: "Planta Alta",
                grid: ((): Cell[][] => {
                    const grid: Cell[][] = [];
                    let seat = 13;
                     for(let i=0; i<12; i++) {
                        grid.push([
                            { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ },
                            { type: 'pasillo' },
                            { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ }
                        ]);
                    }
                    return grid;
                })()
            }
        ]
    }
}


export const getLayoutForVehicle = (type: VehicleType): Layout => {
    return layouts[type] || layouts.micro_largo; // Default a un layout común
}
