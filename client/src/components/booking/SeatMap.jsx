const CLASS_STYLES = {
  first: 'bg-amber-200 border-amber-400',
  business: 'bg-violet-200 border-violet-400',
  premiumEconomy: 'bg-sky-200 border-sky-400',
  economy: 'bg-white border-slate-300',
};

export default function SeatMap({ seats, selected, passengerCount, onToggle }) {
  const rows = [...new Set(seats.map((s) => s.row))].sort((a, b) => a - b);
  const columns = [...new Set(seats.map((s) => s.column))].sort();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[520px] rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <div
          className="mb-3 grid text-center text-xs font-semibold text-slate-500"
          style={{ gridTemplateColumns: `40px repeat(${columns.length + 1}, minmax(36px, 1fr))` }}
        >
          <span />
          {columns.map((col, index) => (
            <span key={col} className={index === Math.floor(columns.length / 2) ? 'ml-4' : ''}>
              {col}
            </span>
          ))}   
        </div> 
        {rows.map((row) => (  
          <div   
            key={row}
            className="mb-1.5 grid items-center"
            style={{ gridTemplateColumns: `40px repeat(${columns.length + 1}, minmax(36px, 1fr))` }}
          >
            <span className="text-xs text-slate-500">{row}</span>
            {columns.map((col, index) => {
              const seat = seats.find((s) => s.row === row && s.column === col);
              const aisle = index === Math.floor(columns.length / 2);
              if (!seat) return <span key={`${row}${col}`} className={aisle ? 'ml-4' : ''} />;
              const isSelected = selected.includes(seat.seatNumber);
              const disabled = seat.occupied && !isSelected;
              return (
                <button
                  key={seat.seatNumber}
                  type="button" 
                  disabled={disabled} 
                  onClick={() => onToggle(seat)}
                  aria-pressed={isSelected}
                  aria-label={`Seat ${seat.seatNumber}${seat.occupied ? ' occupied' : ''}`}
                  className={`h-9 rounded-lg border text-xs font-semibold ${aisle ? 'ml-4' : ''} ${
                    disabled
                      ? 'cursor-not-allowed bg-slate-300 text-slate-500'
                      : isSelected
                        ? 'border-navy-800 bg-navy-800 text-white'
                        : CLASS_STYLES[seat.class]
                  }`}
                >
                  {seat.seatNumber}
                </button>
              );
            })} 
          </div> 
        ))}
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Select {passengerCount} seat{passengerCount > 1 ? 's' : ''}. Occupied seats cannot be chosen.
      </p>
    </div>
  );
}
