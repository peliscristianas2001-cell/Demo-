
"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface SeatSelectorProps {
  totalSeats: number
  occupiedSeats: string[]
  selectedSeats: string[]
  onSeatSelect: (seatId: string) => void
  passengerSeats: (string | null)[]
}

export function SeatSelector({
  totalSeats,
  occupiedSeats,
  selectedSeats,
  onSeatSelect,
  passengerSeats
}: SeatSelectorProps) {
  const rows = Array.from({ length: Math.ceil(totalSeats / 4) }, (_, i) => i + 1)
  const cols = ["A", "B", "C", "D"]

  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex justify-center mb-4">
        <div className="w-48 p-2 text-center border-2 border-dashed rounded-md border-muted-foreground text-muted-foreground">
          Frente del Colectivo
        </div>
      </div>
      <div className="flex flex-col items-center space-y-2">
        {rows.map((row) => (
          <div key={row} className="flex items-center w-full gap-2 md:gap-4">
            <div className="flex justify-around flex-1 gap-2 md:gap-4">
              {cols.slice(0, 2).map((col) => {
                const seatId = `${row}${col}`
                const isOccupied = occupiedSeats.includes(seatId) && !selectedSeats.includes(seatId)
                const isSelected = selectedSeats.includes(seatId)
                const passengerIndex = passengerSeats.findIndex(s => s === seatId);

                return (
                    <button
                        key={seatId}
                        onClick={() => onSeatSelect(seatId)}
                        disabled={isOccupied}
                        className={cn(
                        "relative flex items-center justify-center w-10 h-10 rounded-md transition-colors font-mono",
                        isOccupied ? "bg-destructive/50 text-destructive-foreground/70 cursor-not-allowed" :
                        isSelected ? "bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary" :
                        "bg-secondary hover:bg-primary/20",
                        "text-sm"
                        )}
                    >
                        {seatId}
                         {isSelected && passengerIndex > -1 &&
                            <Badge variant="destructive" className="absolute -top-2 -right-2 p-0 w-5 h-5 flex justify-center text-xs">{passengerIndex + 1}</Badge>
                         }
                    </button>
                )
              })}
            </div>

            <div className="w-8 text-center text-muted-foreground">{row}</div>

            <div className="flex justify-around flex-1 gap-2 md:gap-4">
              {cols.slice(2, 4).map((col) => {
                const seatId = `${row}${col}`
                const isOccupied = occupiedSeats.includes(seatId) && !selectedSeats.includes(seatId)
                const isSelected = selectedSeats.includes(seatId)
                const passengerIndex = passengerSeats.findIndex(s => s === seatId);

                return (
                     <button
                        key={seatId}
                        onClick={() => onSeatSelect(seatId)}
                        disabled={isOccupied}
                        className={cn(
                        "relative flex items-center justify-center w-10 h-10 rounded-md transition-colors font-mono",
                        isOccupied ? "bg-destructive/50 text-destructive-foreground/70 cursor-not-allowed" :
                        isSelected ? "bg-primary text-primary-foreground ring-2 ring-offset-2 ring-primary" :
                        "bg-secondary hover:bg-primary/20",
                        "text-sm"
                        )}
                    >
                        {seatId}
                         {isSelected && passengerIndex > -1 &&
                            <Badge variant="destructive" className="absolute -top-2 -right-2 p-0 w-5 h-5 flex justify-center text-xs">{passengerIndex + 1}</Badge>
                         }
                    </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
       <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-secondary border"></div>
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-primary"></div>
          <span>Seleccionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm bg-destructive/50"></div>
          <span>Ocupado</span>
        </div>
      </div>
    </div>
  )
}
