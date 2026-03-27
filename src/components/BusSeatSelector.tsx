import { useState, useMemo, useCallback } from "react";
import BusLoadingOverlay from "@/components/BusLoadingOverlay";

type SeatStatus = "livre" | "ocupado" | "selecionado";

interface Seat {
  number: number;
  status: SeatStatus;
  row: number;
  col: number;
}

interface BusSeatSelectorProps {
  tripType: string;
  departureDate: string;
  price: string; // e.g. "329"
  onSelectSeats: (seats: number[]) => void;
  onContinue: () => void;
}

function generateOccupancy(
  totalSeats: number,
  departureDate: string
): Set<number> {
  // Calculate days until departure
  let daysUntil = 3;
  if (departureDate) {
    const parts = departureDate.split("/");
    if (parts.length === 3) {
      const depDate = new Date(
        parseInt(parts[2]),
        parseInt(parts[1]) - 1,
        parseInt(parts[0])
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      daysUntil = Math.max(
        0,
        Math.ceil((depDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      );
    }
  }

  // Occupancy percentage based on days until departure
  let occupancyRate: number;
  if (daysUntil <= 1) {
    occupancyRate = 0.75 + Math.random() * 0.15; // 75-90%
  } else if (daysUntil <= 3) {
    occupancyRate = 0.55 + Math.random() * 0.2; // 55-75%
  } else if (daysUntil <= 7) {
    occupancyRate = 0.35 + Math.random() * 0.2; // 35-55%
  } else if (daysUntil <= 14) {
    occupancyRate = 0.2 + Math.random() * 0.15; // 20-35%
  } else if (daysUntil <= 30) {
    occupancyRate = 0.1 + Math.random() * 0.15; // 10-25%
  } else if (daysUntil <= 90) {
    occupancyRate = 0.05 + Math.random() * 0.1; // 5-15%
  } else {
    occupancyRate = 0.02 + Math.random() * 0.05; // 2-7%
  }

  const numOccupied = Math.floor(totalSeats * occupancyRate);
  const occupied = new Set<number>();

  // Use a seeded-ish approach so it's consistent per render
  const seed = departureDate.length > 0 ? departureDate.charCodeAt(0) : 42;
  let rng = seed;
  const pseudoRandom = () => {
    rng = (rng * 1103515245 + 12345) & 0x7fffffff;
    return rng / 0x7fffffff;
  };

  // Prefer middle/window seats to feel realistic
  const allSeats = Array.from({ length: totalSeats }, (_, i) => i + 1);
  allSeats.sort(() => pseudoRandom() - 0.5);

  for (let i = 0; i < numOccupied && i < allSeats.length; i++) {
    occupied.add(allSeats[i]);
  }

  return occupied;
}

function getBusLayout(tripType: string) {
  if (tripType === "Leito") {
    // 3 seats per row (1-aisle-2), fewer rows
    return { cols: 3, rows: 8, totalSeats: 24, maxSelect: 3, label: "Leito" };
  }
  if (tripType === "Executivo") {
    // 3 seats per row, more rows
    return { cols: 3, rows: 10, totalSeats: 30, maxSelect: 5, label: "Executivo" };
  }
  // Convencional: 4 seats per row (2-aisle-2)
  return { cols: 4, rows: 11, totalSeats: 44, maxSelect: 5, label: "Semileito" };
}

export default function BusSeatSelector({
  tripType,
  departureDate,
  price,
  onSelectSeats,
  onContinue,
}: BusSeatSelectorProps) {
  const layout = getBusLayout(tripType);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showLoading, setShowLoading] = useState(false);

  const occupied = useMemo(
    () => generateOccupancy(layout.totalSeats, departureDate),
    [layout.totalSeats, departureDate]
  );

  const toggleSeat = (num: number) => {
    if (occupied.has(num)) return;
    const next = new Set(selected);
    if (next.has(num)) {
      next.delete(num);
    } else {
      if (next.size >= layout.maxSelect) return;
      next.add(num);
    }
    setSelected(next);
    onSelectSeats(Array.from(next).sort((a, b) => a - b));
  };

  // Build seat grid
  const seats: (number | null)[][] = [];
  let seatNum = 1;

  for (let r = 0; r < layout.rows; r++) {
    const row: (number | null)[] = [];
    if (layout.cols === 4) {
      // 2 seats - aisle - 2 seats
      row.push(seatNum <= layout.totalSeats ? seatNum++ : null);
      row.push(seatNum <= layout.totalSeats ? seatNum++ : null);
      row.push(null); // aisle
      row.push(seatNum <= layout.totalSeats ? seatNum++ : null);
      row.push(seatNum <= layout.totalSeats ? seatNum++ : null);
    } else {
      // 1 seat - aisle - 2 seats
      row.push(seatNum <= layout.totalSeats ? seatNum++ : null);
      row.push(null); // aisle
      row.push(seatNum <= layout.totalSeats ? seatNum++ : null);
      row.push(seatNum <= layout.totalSeats ? seatNum++ : null);
    }
    seats.push(row);
  }

  const getStatus = (num: number): SeatStatus => {
    if (occupied.has(num)) return "ocupado";
    if (selected.has(num)) return "selecionado";
    return "livre";
  };

  return (
    <div className="border-t border-gray-100 bg-gray-50 px-5 py-6">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Bus outline */}
        <div className="relative mx-auto lg:mx-0">
          {/* Bus body */}
          <div className="relative border-2 border-gray-300 rounded-[2rem] bg-white p-4 pt-6 pb-4 min-w-[280px]">
            {/* Front of bus (top) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-3 bg-gray-300 rounded-t-full" />

            {/* Driver seat area */}
            <div className="flex justify-end mb-4 pr-1">
              <div className="w-9 h-9 rounded-md border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <circle cx="12" cy="12" r="4" />
                  <line x1="12" y1="2" x2="12" y2="8" />
                  <line x1="12" y1="16" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="8" y2="12" />
                  <line x1="16" y1="12" x2="22" y2="12" />
                </svg>
              </div>
            </div>

            {/* Seat grid */}
            <div className="space-y-1.5">
              {seats.map((row, ri) => (
                <div key={ri} className="flex items-center justify-center gap-1.5">
                  {row.map((seat, ci) => {
                    if (seat === null) {
                      return (
                        <div
                          key={`${ri}-${ci}`}
                          className={ci === (layout.cols === 4 ? 2 : 1) ? "w-4" : "w-9 h-9"}
                        />
                      );
                    }
                    const status = getStatus(seat);
                    return (
                      <button
                        key={seat}
                        type="button"
                        onClick={() => toggleSeat(seat)}
                        disabled={status === "ocupado"}
                        className={`
                          w-9 h-9 rounded-md text-xs font-bold flex items-center justify-center transition-all
                          ${status === "ocupado"
                            ? "border-2 border-gray-200 bg-gray-100 text-gray-300 cursor-not-allowed"
                            : status === "selecionado"
                            ? "border-2 border-amber-400 bg-amber-400 text-white shadow-sm"
                            : "border-2 border-[#8629cc] bg-white text-[#8629cc] hover:bg-[#8629cc]/10 cursor-pointer"
                          }
                        `}
                      >
                        {status === "ocupado" ? (
                          <svg className="w-3.5 h-3.5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        ) : (
                          seat
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Wheels (decorative) */}
            <div className="absolute -left-3 top-[30%] w-5 h-10 bg-gray-400 rounded-l-full" />
            <div className="absolute -left-3 bottom-[20%] w-5 h-10 bg-gray-400 rounded-l-full" />
            <div className="absolute -right-3 top-[30%] w-5 h-10 bg-gray-400 rounded-r-full" />
            <div className="absolute -right-3 bottom-[20%] w-5 h-10 bg-gray-400 rounded-r-full" />
          </div>
        </div>

        {/* Info panel */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{layout.label}</h3>
          <p className="text-sm text-gray-500 mb-4">
            Escolha até {layout.maxSelect} assentos
          </p>

          {/* Selected seats list */}
          {selected.size > 0 && (
            <div className="space-y-2 mb-4">
              {Array.from(selected)
                .sort((a, b) => a - b)
                .map((seatNum) => (
                  <div key={seatNum} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-amber-400" />
                      <span className="text-sm font-semibold text-gray-900">Assento {seatNum}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">R$ {price},99</span>
                      <button
                        onClick={() => toggleSeat(seatNum)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

              {/* Total */}
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-gray-600">{selected.size} assento{selected.size > 1 ? "s" : ""}</span>
                  <div className="text-right">
                    <span className="text-lg font-black text-gray-900">
                      R$ {(Number(price) * selected.size).toFixed(2).replace(".", ",")}
                    </span>
                    <p className="text-xs text-gray-400">em até 4x sem juros</p>
                  </div>
                </div>
              </div>

              {selected.size < layout.maxSelect && (
                <p className="text-sm text-gray-500 mt-2">
                  Mais viajantes?<br />
                  <span className="text-gray-400">Selecione outro assento</span>
                </p>
              )}
            </div>
          )}

          {selected.size === 0 && (
            <p className="text-sm text-gray-400 mb-4">Clique no assento que você quer</p>
          )}

          {/* Legend */}
          <div className="flex items-center gap-5 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-[#8629cc] bg-white" />
              <span className="text-sm text-gray-600">Livre</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-amber-400" />
              <span className="text-sm text-gray-600">Selecionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-gray-200 bg-gray-100 flex items-center justify-center">
                <svg className="w-3 h-3 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
              <span className="text-sm text-gray-600">Ocupado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Continuar reserva - full width at bottom */}
      <div className="mt-6 flex justify-center">
        <button
          onClick={() => setShowLoading(true)}
          disabled={selected.size === 0}
          className={`
            w-full max-w-md rounded-full py-3.5 text-base font-bold transition-all
            ${selected.size > 0
              ? "bg-[#8629cc] text-white hover:bg-[#6b1fb3] cursor-pointer shadow-lg"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          Continuar reserva
        </button>
      </div>

      {showLoading && (
        <BusLoadingOverlay
          message="Reservando seu assento"
          duration={2200}
          onComplete={onContinue}
        />
      )}
    </div>
  );
}