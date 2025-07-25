
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
                [{type: 'chofer'}, {type: 'pasillo'}, {type: 'seat', number: 1}, null],
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
                // Filas 1 a 11 (44 asientos)
                for(let i=0; i<11; i++) {
                    grid.push([
                        { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ },
                        { type: 'pasillo' },
                        { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ }
                    ]);
                }
                // Fila 12 (asientos 45 y 46 + baño)
                grid.push([ { type: 'seat', number: 45 }, { type: 'seat', number: 46 }, { type: 'pasillo' }, { type: 'baño' }, { type: 'baño' } ]);
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
                // Fila 1 a 14 (56 asientos)
                for(let i=0; i<14; i++) {
                    grid.push([
                        { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ },
                        { type: 'pasillo' },
                        { type: 'seat', number: seat++ }, { type: 'seat', number: seat++ }
                    ]);
                }
                // Última fila (asientos 57 y 58 + baño)
                grid.push([ null, null, { type: 'pasillo' }, { type: 'baño' }, { type: 'baño' } ]);
                grid.push([ { type: 'seat', number: 57 }, { type: 'seat', number: 58 }, null, null, null ]);
                return grid;
            })(),
        }]
    },
    doble_piso: {
        floors: [
            { // Planta Baja
                name: "Planta Baja",
                grid: [
                    [ {type: 'baño'}, {type: 'pasillo'}, {type: 'chofer'}, {type: 'chofer'}],
                    [ {type: 'escalera'}, {type: 'pasillo'}, null, null],
                    [ {type: 'seat', number: 49}, {type: 'pasillo'}, {type: 'seat', number: 50}, {type: 'seat', number: 51}],
                    [ {type: 'seat', number: 52}, {type: 'pasillo'}, {type: 'seat', number: 53}, {type: 'seat', number: 54}],
                    [ {type: 'seat', number: 55}, {type: 'pasillo'}, {type: 'seat', number: 56}, {type: 'seat', number: 57}],
                    [ {type: 'seat', number: 58}, {type: 'pasillo'}, {type: 'seat', number: 59}, {type: 'seat', number: 60}],
                ]
            },
            { // Planta Alta
                name: "Planta Alta",
                grid: ((): Cell[][] => {
                    const grid: Cell[][] = [];
                    let seat = 1;

                    // Fila 1 (panorámica)
                    grid.push([ {type: 'seat', number: seat++}, {type: 'seat', number: seat++}, {type: 'pasillo'}, {type: 'seat', number: seat++}, {type: 'seat', number: seat++}]);
                    
                    // Fila 2 (escalera)
                    grid.push([ {type: 'seat', number: seat++}, {type: 'seat', number: seat++}, {type: 'pasillo'}, {type: 'escalera'}, {type: 'escalera'}]);
                    
                     // Fila 3 (cafetera)
                    grid.push([ {type: 'seat', number: seat++}, {type: 'seat', number: seat++}, {type: 'pasillo'}, {type: 'cafetera'}, {type: 'cafetera'}]);
                    
                    // Filas 4 a 13
                    for(let i = 0; i < 10; i++) {
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
