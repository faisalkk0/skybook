import { useEffect, useRef, useState } from 'react';
import { flightService } from '../../services/flightService';

export default function AirportPicker({ label, value, onChange, exclude }) {
  const [query, setQuery] = useState(value ? `${value.city} (${value.code})` : '');
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    if (value) setQuery(`${value.city} (${value.code})`);
  }, [value]);

  useEffect(() => {
    const handle = (event) => {
      if (box.current && !box.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!open) return;
      const { data } = await flightService.searchAirports(query.includes('(') ? query.split('(')[0] : query);
      setOptions((data.data || []).filter((item) => item.code !== exclude));
    }, 200);
    return () => clearTimeout(timer);
  }, [query, open, exclude]);

  return (
    <div className="relative" ref={box}>
      <label className="label">{label}</label>
      <input
        className="input"
        value={query}
        placeholder="City or IATA code"
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange(null);
        }}
        aria-autocomplete="list"
      />
      {open && options.length > 0 ? (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200 bg-white shadow-card">
          {options.map((airport) => (
            <li key={airport._id}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-slate-50"
                onClick={() => {
                  onChange(airport);
                  setQuery(`${airport.city} (${airport.code})`);
                  setOpen(false);
                }}
              >
                <div className="font-semibold text-navy-800">
                  {airport.city} ({airport.code})
                </div>
                <div className="text-xs text-slate-500">{airport.name}</div>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
