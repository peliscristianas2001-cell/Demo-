
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
import type { CustomVehicleConfig } from "@/lib/types";
import type { Layout, Floor, Cell } from "@/lib/layouts";
import { Trash2, PlusCircle, Armchair, Waves, PersonStandingIcon, BusIcon, ChefHatIcon } from "lucide-react";

interface VehicleLayoutEditorProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (originalKey: string, config: CustomVehicleConfig) => void;
  vehicleKey?: string | null;
  vehicleConfig?: CustomVehicleConfig;
}

const defaultCell: Cell = { type: 'empty' };
const defaultFloor: Floor = { name: "Planta Baja", grid: Array(5).fill(Array(4).fill(defaultCell)) };

const CellEditor = ({ cell, onCellChange }: { cell: Cell, onCellChange: (newCell: Cell) => void }) => {
    const handleTypeChange = (type: Cell['type']) => {
        if (type === 'seat') {
            onCellChange({ type: 'seat', number: 0 });
        } else {
            onCellChange({ type });
        }
    }

    const handleSeatNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onCellChange({ type: 'seat', number: parseInt(e.target.value, 10) || 0 });
    }

    const cellTypes: { value: Cell['type'], label: string, icon: React.ReactNode }[] = [
        { value: 'empty', label: 'Vacío', icon: <div className="w-4 h-4 border border-dashed rounded-sm" /> },
        { value: 'seat', label: 'Asiento', icon: <Armchair className="w-4 h-4" /> },
        { value: 'pasillo', label: 'Pasillo', icon: <div className="w-4 h-4 bg-gray-300 rounded-sm" /> },
        { value: 'baño', label: 'Baño', icon: <Waves className="w-4 h-4" /> },
        { value: 'escalera', label: 'Escalera', icon: <PersonStandingIcon className="w-4 h-4" /> },
        { value: 'chofer', label: 'Chofer', icon: <BusIcon className="w-4 h-4" /> },
        { value: 'cafetera', label: 'Cafetera', icon: <ChefHatIcon className="w-4 h-4" /> },
    ];

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
        </div>
    );
};


export function VehicleLayoutEditor({ isOpen, onOpenChange, onSave, vehicleKey, vehicleConfig }: VehicleLayoutEditorProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [layout, setLayout] = useState<Layout>(() => ({ floors: [defaultFloor] }));
  const [editingCell, setEditingCell] = useState<{ floor: number; row: number; col: number } | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (vehicleConfig) {
        setName(vehicleConfig.name);
        setLayout(JSON.parse(JSON.stringify(vehicleConfig.layout))); // Deep copy
      } else {
        // Reset for new vehicle
        setName("");
        setLayout({ floors: [JSON.parse(JSON.stringify(defaultFloor))] });
      }
      setEditingCell(null);
    }
  }, [isOpen, vehicleConfig]);

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
        const newLayout = JSON.parse(JSON.stringify(prev)); // Deep copy
        newLayout.floors[floor].grid[row][col] = newCell;
        return newLayout;
    })
  }

  const handleSaveClick = () => {
    if (!name) {
      toast({ title: "Error", description: "El nombre del vehículo es obligatorio.", variant: "destructive" });
      return;
    }
    const seatNumbers = new Set<number>();
    let totalSeats = 0;
    for (const floor of layout.floors) {
        for (const row of floor.grid) {
            for (const cell of row) {
                if (cell.type === 'seat') {
                    if(seatNumbers.has(cell.number)) {
                         toast({ title: "Error", description: `Número de asiento duplicado: ${cell.number}`, variant: "destructive" });
                         return;
                    }
                    if(cell.number > 0) seatNumbers.add(cell.number);
                    totalSeats++;
                }
            }
        }
    }
    onSave(vehicleKey || name.toLowerCase().replace(/\s+/g, '_'), { name, seats: totalSeats, layout });
  };
  
  const addFloor = () => {
      setLayout(prev => ({...prev, floors: [...prev.floors, { name: `Piso ${prev.floors.length + 1}`, grid: defaultFloor.grid }]}));
  }
  
  const removeFloor = (index: number) => {
       if (layout.floors.length <= 1) return;
       setLayout(prev => ({...prev, floors: prev.floors.filter((_, i) => i !== index)}));
       if(editingCell?.floor === index) setEditingCell(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl flex flex-col max-h-[95vh] h-full">
        <DialogHeader>
          <DialogTitle>{vehicleConfig ? "Editar Vehículo" : "Nuevo Vehículo"}</DialogTitle>
          <DialogDescription>
            Define el nombre y el layout de asientos de este tipo de vehículo.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
            {/* Left Panel: Config */}
            <div className="md:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2">
                <div className="space-y-2">
                    <Label htmlFor="vehicleName">Nombre del Tipo de Vehículo</Label>
                    <Input id="vehicleName" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                 <Button onClick={addFloor} variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4"/> Añadir Piso
                </Button>
                {editingCell && (
                    <CellEditor 
                        cell={layout.floors[editingCell.floor].grid[editingCell.row][editingCell.col]}
                        onCellChange={handleCellChange}
                    />
                )}
            </div>

            {/* Right Panel: Layout Editor */}
            <div className="md:col-span-2 overflow-y-auto space-y-4">
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
                                <Input type="number" value={floor.grid.length} onChange={e => updateGrid(floorIndex, parseInt(e.target.value) || 1, floor.grid[0]?.length || 1)} min="1"/>
                            </div>
                            <div className="space-y-1">
                                <Label>Columnas</Label>
                                <Input type="number" value={floor.grid[0]?.length || 1} onChange={e => updateGrid(floorIndex, floor.grid.length, parseInt(e.target.value) || 1)} min="1"/>
                            </div>
                        </div>
                        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${floor.grid[0]?.length || 1}, 1fr)`}}>
                            {floor.grid.map((row, rowIndex) => (
                                row.map((cell, colIndex) => (
                                    <button 
                                        key={`${rowIndex}-${colIndex}`} 
                                        onClick={() => setEditingCell({ floor: floorIndex, row: rowIndex, col: colIndex })}
                                        className={`w-full aspect-square text-xs border flex items-center justify-center ${editingCell?.floor === floorIndex && editingCell?.row === rowIndex && editingCell?.col === colIndex ? 'ring-2 ring-primary' : 'border-dashed'}`}
                                    >
                                        {cell.type === 'seat' ? <div className="flex flex-col items-center"><Armchair className="w-4 h-4"/><span className="font-bold">{cell.number || '?'}</span></div>: <span>{cell.type.charAt(0).toUpperCase()}</span>}
                                    </button>
                                ))
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
          <Button onClick={handleSaveClick}>Guardar Vehículo</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
