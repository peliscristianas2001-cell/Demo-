
"use client"

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { CustomLayoutConfig, LayoutCategory } from "@/lib/types";
import type { Layout, Floor, Cell } from "@/lib/layouts";
import { Trash2, PlusCircle, Armchair, Waves, PersonStandingIcon, BusIcon, ChefHatIcon, ShieldIcon, BedDouble, Anchor } from "lucide-react";

interface LayoutEditorProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (originalKey: string | null, config: CustomLayoutConfig) => void;
  category?: LayoutCategory | null;
  layoutKey?: string | null;
  layoutConfig?: CustomLayoutConfig;
}

const defaultCell: Cell = { type: 'empty' };
const defaultFloor: Floor = { name: "Planta Baja", grid: Array(5).fill(Array(4).fill(defaultCell)) };

const CellEditor = ({ cell, onCellChange, category }: { cell: Cell, onCellChange: (newCell: Cell) => void, category: LayoutCategory }) => {
    
    const handleTypeChange = (type: Cell['type']) => {
        if (type === 'seat') {
            onCellChange({ type: 'seat', number: '' });
        } else if (type === 'cabin') {
            onCellChange({ type: 'cabin', number: '', cabinType: 'Interior', capacity: 2 });
        } else {
            onCellChange({ type });
        }
    }

    const handleSeatNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (cell.type !== 'seat') return;
        const value = e.target.value;
        onCellChange({ type: 'seat', number: value === '' ? '' : parseInt(value, 10) });
    }

    const handleCabinChange = (field: keyof (Extract<Cell, {type: 'cabin'}>), value: any) => {
        if (cell.type !== 'cabin') return;
        let processedValue = value;
        if (field === 'capacity') {
            processedValue = value === '' ? '' : parseInt(value, 10);
        }
        onCellChange({ ...cell, [field]: processedValue });
    }

    const baseCellTypes = [
        { value: 'empty', label: 'Vacío', icon: <div className="w-4 h-4 border border-dashed rounded-sm" /> },
        { value: 'pasillo', label: 'Pasillo', icon: <div className="w-4 h-4 bg-gray-300 rounded-sm" /> },
    ];

    const categoryCellTypes: Record<LayoutCategory, typeof baseCellTypes> = {
        vehicles: [
            { value: 'seat', label: 'Asiento', icon: <Armchair className="w-4 h-4" /> },
            { value: 'baño', label: 'Baño', icon: <Waves className="w-4 h-4" /> },
            { value: 'escalera', label: 'Escalera', icon: <PersonStandingIcon className="w-4 h-4" /> },
            { value: 'chofer', label: 'Chofer', icon: <BusIcon className="w-4 h-4" /> },
            { value: 'cafetera', label: 'Cafetera', icon: <ChefHatIcon className="w-4 h-4" /> },
        ],
        airplanes: [
             { value: 'seat', label: 'Asiento', icon: <Armchair className="w-4 h-4" /> },
             { value: 'baño', label: 'Baño', icon: <Waves className="w-4 h-4" /> },
             { value: 'cabina', label: 'Cabina Piloto', icon: <ShieldIcon className="w-4 h-4" /> },
        ],
        cruises: [
            { value: 'cabin', label: 'Camarote', icon: <BedDouble className="w-4 h-4" /> },
            { value: 'baño', label: 'Baño Público', icon: <Waves className="w-4 h-4" /> },
            { value: 'escalera', label: 'Escalera/Ascensor', icon: <PersonStandingIcon className="w-4 h-4" /> },
            { value: 'anchor', label: 'Zona Común', icon: <Anchor className="w-4 h-4" /> },
            { value: 'waves', label: 'Piscina', icon: <Waves className="w-4 h-4" /> }
        ]
    }
    
    const cellTypes = [...baseCellTypes, ...categoryCellTypes[category]];

    return (
        <div className="p-4 space-y-4 border rounded-lg bg-muted/50">
            <h4 className="font-semibold">Editar Celda</h4>
            <div className="space-y-2">
                <Label>Tipo de Celda</Label>
                <Select onValueChange={(v) => handleTypeChange(v as Cell['type'])} value={cell.type}>
                    <SelectTrigger><SelectValue/></SelectTrigger>
                    <SelectContent>
                        {cellTypes.map(ct => (
                            <SelectItem key={ct.value} value={ct.value}>
                                <div className="flex items-center gap-2">
                                    {ct.icon}
                                    <span>{ct.label}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {cell.type === 'seat' && (
                <div className="space-y-2">
                    <Label>Número de Asiento</Label>
                    <Input type="number" value={cell.number} onChange={handleSeatNumberChange} />
                </div>
            )}
            {cell.type === 'cabin' && (
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Número de Camarote</Label>
                        <Input type="text" value={cell.number} onChange={(e) => handleCabinChange('number', e.target.value)} />
                    </div>
                     <div className="space-y-2">
                        <Label>Tipo de Camarote</Label>
                        <Select value={cell.cabinType} onValueChange={(val) => handleCabinChange('cabinType', val)}>
                            <SelectTrigger><SelectValue/></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Interior">Interior</SelectItem>
                                <SelectItem value="Exterior">Exterior</SelectItem>
                                <SelectItem value="Balcón">Balcón</SelectItem>
                                <SelectItem value="Suite">Suite</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Capacidad</Label>
                        <Input type="number" min="1" value={cell.capacity} onChange={(e) => handleCabinChange('capacity', e.target.value)} />
                    </div>
                </div>
            )}
        </div>
    );
};


export function LayoutEditor({ isOpen, onOpenChange, onSave, category, layoutKey, layoutConfig }: LayoutEditorProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [layout, setLayout] = useState<Layout>(() => ({ floors: [defaultFloor] }));
  const [editingCell, setEditingCell] = useState<{ floor: number; row: number; col: number } | null>(null);
  const [gridDimensions, setGridDimensions] = useState<Array<{rows: number | '', cols: number | ''}>>([]);


  useEffect(() => {
    if (isOpen) {
      if (layoutConfig) {
        setName(layoutConfig.name);
        const newLayout = JSON.parse(JSON.stringify(layoutConfig.layout));
        setLayout(newLayout);
        setGridDimensions(newLayout.floors.map(f => ({ rows: f.grid.length, cols: f.grid[0]?.length || 0 })));
      } else {
        setName("");
        const newLayout = { floors: [JSON.parse(JSON.stringify(defaultFloor))] };
        setLayout(newLayout);
        setGridDimensions(newLayout.floors.map(f => ({ rows: f.grid.length, cols: f.grid[0]?.length || 0 })));
      }
      setEditingCell(null);
    }
  }, [isOpen, layoutConfig]);

  const updateGridDimensions = (floorIndex: number, dimension: 'rows' | 'cols', value: string) => {
    const newDims = [...gridDimensions];
    const numericValue = parseInt(value, 10);
    newDims[floorIndex] = { ...newDims[floorIndex], [dimension]: value === '' ? '' : numericValue };
    setGridDimensions(newDims);

    if (!isNaN(numericValue) && numericValue > 0) {
        const { rows, cols } = newDims[floorIndex];
        const newRows = dimension === 'rows' ? numericValue : (rows || layout.floors[floorIndex].grid.length);
        const newCols = dimension === 'cols' ? numericValue : (cols || layout.floors[floorIndex].grid[0].length);
        updateGrid(floorIndex, newRows, newCols);
    }
  };


  const updateGrid = (floorIndex: number, newRows: number, newCols: number) => {
    setLayout(prev => {
        const newLayout = { ...prev };
        const oldGrid = newLayout.floors[floorIndex].grid;
        const newGrid = Array.from({ length: newRows }, (_, r) => 
            Array.from({ length: newCols }, (_, c) => oldGrid[r]?.[c] || defaultCell)
        );
        newLayout.floors[floorIndex].grid = newGrid;
        return newLayout;
    });
  };
  
  const handleCellChange = (newCell: Cell) => {
    if (!editingCell) return;
    const { floor, row, col } = editingCell;
    setLayout(prev => {
        const newLayout = JSON.parse(JSON.stringify(prev));
        newLayout.floors[floor].grid[row][col] = newCell;
        return newLayout;
    })
  }

  const handleSaveClick = () => {
    if (!name || !category) {
      toast({ title: "Error", description: "El nombre es obligatorio.", variant: "destructive" });
      return;
    }

    const uniqueIdentifiers = new Set<string>();
    let totalCapacity = 0;

    for (const floor of layout.floors) {
        for (const row of floor.grid) {
            for (const cell of row) {
                let identifier: string | null = null;
                if (cell.type === 'seat') {
                    if (cell.number && cell.number > 0) identifier = `seat-${cell.number}`;
                    totalCapacity++;
                } else if (cell.type === 'cabin') {
                    if (cell.number) identifier = `cabin-${cell.number}`;
                    if (cell.capacity && cell.capacity > 0) totalCapacity += cell.capacity;
                }
                
                if (identifier) {
                    if (uniqueIdentifiers.has(identifier)) {
                         toast({ title: "Error", description: `Identificador duplicado: ${identifier.replace('-', ' ')}`, variant: "destructive" });
                         return;
                    }
                    uniqueIdentifiers.add(identifier);
                }
            }
        }
    }
    onSave(layoutKey, { name, capacity: totalCapacity, layout });
  };
  
  const addFloor = () => {
      const newFloor = { name: `Piso ${layout.floors.length + 1}`, grid: defaultFloor.grid };
      setLayout(prev => ({...prev, floors: [...prev.floors, newFloor]}));
      setGridDimensions(prev => [...prev, { rows: newFloor.grid.length, cols: newFloor.grid[0]?.length || 0 }]);
  }
  
  const removeFloor = (index: number) => {
       if (layout.floors.length <= 1) return;
       setLayout(prev => ({...prev, floors: prev.floors.filter((_, i) => i !== index)}));
       setGridDimensions(prev => prev.filter((_, i) => i !== index));
       if(editingCell?.floor === index) setEditingCell(null);
  }

  const categoryTitles: Record<LayoutCategory, string> = {
    vehicles: "Vehículo",
    airplanes: "Avión",
    cruises: "Crucero"
  }
  
  if (!category) return null;

  const title = layoutConfig ? `Editar ${categoryTitles[category]}` : `Nuevo ${categoryTitles[category]}`;
  const editingCellData = editingCell ? layout.floors[editingCell.floor]?.grid[editingCell.row]?.[editingCell.col] : null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl flex flex-col max-h-[95vh] h-full">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Define el nombre y el layout de este tipo de transporte.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
            <div className="md:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2">
                <div className="space-y-2">
                    <Label htmlFor="layoutName">Nombre del Tipo</Label>
                    <Input id="layoutName" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                 <Button onClick={addFloor} variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4"/> Añadir Piso/Cubierta
                </Button>
                {editingCell && editingCellData && (
                    <CellEditor 
                        cell={editingCellData}
                        onCellChange={handleCellChange}
                        category={category}
                    />
                )}
            </div>

            <div className="md:col-span-2 overflow-y-auto space-y-4 pr-2">
                 {layout.floors.map((floor, floorIndex) => (
                    <div key={floorIndex} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                             <Input 
                                value={floor.name}
                                onChange={(e) => setLayout(prev => {
                                    const newLayout = {...prev};
                                    newLayout.floors[floorIndex].name = e.target.value;
                                    return newLayout;
                                })}
                                className="text-lg font-bold w-1/2"
                             />
                             {layout.floors.length > 1 && (
                                <Button variant="ghost" size="icon" onClick={() => removeFloor(floorIndex)}>
                                    <Trash2 className="w-4 h-4 text-destructive"/>
                                </Button>
                             )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="space-y-1">
                                <Label>Filas</Label>
                                <Input type="number" value={gridDimensions[floorIndex]?.rows} onChange={e => updateGridDimensions(floorIndex, 'rows', e.target.value)} min="1"/>
                            </div>
                            <div className="space-y-1">
                                <Label>Columnas</Label>
                                <Input type="number" value={gridDimensions[floorIndex]?.cols} onChange={e => updateGridDimensions(floorIndex, 'cols', e.target.value)} min="1"/>
                            </div>
                        </div>
                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${floor.grid[0]?.length || 1}, minmax(0, 4rem))`}}>
                            {floor.grid.map((row, rowIndex) => (
                                row.map((cell, colIndex) => {
                                    const cellKey = `${floorIndex}-${rowIndex}-${colIndex}`;
                                    let cellContent = <span>{cell.type.charAt(0).toUpperCase()}</span>;
                                    if(cell.type === 'seat') {
                                        cellContent = <div className="flex flex-col items-center"><Armchair className="w-4 h-4"/><span className="font-bold">{cell.number || '?'}</span></div>
                                    } else if (cell.type === 'cabin') {
                                        cellContent = <div className="flex flex-col items-center"><BedDouble className="w-4 h-4"/><span className="font-bold truncate">{cell.number || '?'}</span></div>
                                    }

                                    return (
                                        <button 
                                            key={cellKey}
                                            onClick={() => setEditingCell({ floor: floorIndex, row: rowIndex, col: colIndex })}
                                            className={`w-full aspect-square text-xs border flex items-center justify-center ${editingCell?.floor === floorIndex && editingCell?.row === rowIndex && editingCell?.col === colIndex ? 'ring-2 ring-primary' : 'border-dashed'}`}
                                        >
                                            {cellContent}
                                        </button>
                                    )
                                })
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <DialogFooter className="mt-auto pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Cancelar</Button>
          </DialogClose>
          <Button onClick={handleSaveClick}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    