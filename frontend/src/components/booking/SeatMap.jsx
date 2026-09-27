import { useMemo } from 'react';

export default function SeatMap({ seats, selected, onSelect, maxSeats = 6 }) {
  const rows = useMemo(() => {
    const grouped = {};
    seats.forEach((s) => {
      if (!grouped[s.row]) grouped[s.row] = [];
      grouped[s.row].push(s);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const toggle = (seat) => {
    if (seat.isBooked || (seat.isHeld && !seat.isHeldByMe)) return;
    if (selected.includes(seat.id)) {
      onSelect(selected.filter((id) => id !== seat.id));
    } else if (selected.length < maxSeats) {
      onSelect([...selected, seat.id]);
    }
  };

  const seatClass = (seat, isSelected) => {
    if (seat.isBooked) return 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed opacity-50';
    if (seat.isHeld && !seat.isHeldByMe) return 'bg-amber-500/40 cursor-not-allowed opacity-70';
    if (isSelected) return 'bg-flyxo-primary text-white scale-110 shadow-lg';
    return 'bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50';
  };

  return (
    <div className="space-y-4">
      <div className="text-center text-sm text-gray-500 mb-6">
        <div className="w-48 h-2 bg-gray-300 dark:bg-gray-600 rounded mx-auto mb-2" />
        SCREEN / STAGE
      </div>
      {rows.map(([row, rowSeats]) => (
        <div key={row} className="flex items-center justify-center gap-2">
          <span className="w-6 text-sm font-bold text-gray-500">{row}</span>
          <div className="flex gap-1.5 flex-wrap justify-center">
            {rowSeats.map((seat) => {
              const isSelected = selected.includes(seat.id);
              return (
                <button
                  key={seat.id}
                  onClick={() => toggle(seat)}
                  disabled={seat.isBooked || (seat.isHeld && !seat.isHeldByMe)}
                  title={seat.label}
                  className={`w-8 h-8 rounded-t-lg text-xs font-medium transition-all ${seatClass(seat, isSelected)}`}
                >
                  {seat.number}
                </button>
              );
            })}
          </div>
        </div>
      ))}
      <div className="flex flex-wrap justify-center gap-4 text-xs mt-4">
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-emerald-500/30 border border-emerald-500 rounded" /> Available</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-flyxo-primary rounded" /> Selected</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-amber-500/40 rounded" /> Held</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 bg-gray-400 rounded opacity-50" /> Booked</span>
      </div>
    </div>
  );
}
