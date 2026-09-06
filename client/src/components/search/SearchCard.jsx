import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AirportPicker from './AirportPicker';
import { addDaysInput, todayInputValue } from '../../utils/format';

export default function SearchCard({ compact, initial }) {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState(initial?.tripType || 'oneway');
  const [from, setFrom] = useState(initial?.from || null);
  const [to, setTo] = useState(initial?.to || null);
  const [departureDate, setDepartureDate] = useState(initial?.departureDate || addDaysInput(todayInputValue(), 7));
  const [returnDate, setReturnDate] = useState(initial?.returnDate || addDaysInput(todayInputValue(), 14));
  const [passengers, setPassengers] = useState(Number(initial?.passengers) || 1);
  const [cabinClass, setCabinClass] = useState(initial?.cabinClass || 'economy');

  const submit = (event) => {
    event.preventDefault();
    if (!from || !to) return toast.error('Select origin and destination airports');
    if (from.code === to.code) return toast.error('From and To cannot be the same airport');
    if (departureDate < todayInputValue()) return toast.error('Departure date cannot be in the past');
    if (tripType === 'round' && returnDate < departureDate) {
      return toast.error('Return date cannot be before departure');
    }
    const params = new URLSearchParams({
      from: from.code,
      to: to.code,
      departureDate,
      passengers: String(passengers),
      cabinClass,
      tripType,
    });
    if (tripType === 'round') params.set('returnDate', returnDate);
    navigate(`/flights?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className={`card p-4 sm:p-6 ${compact ? '' : 'shadow-card'}`}>
      <div className="mb-4 flex gap-2">
        {['oneway', 'round'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTripType(type)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold ${
              tripType === type ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {type === 'oneway' ? 'One way' : 'Round trip'}
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
        <AirportPicker label="From" value={from} onChange={setFrom} exclude={to?.code} />
        <AirportPicker label="To" value={to} onChange={setTo} exclude={from?.code} />
        <div>
          <label className="label" htmlFor="departure">
            Departure
          </label>
          <input
            id="departure"
            type="date"
            className="input"
            min={todayInputValue()}
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="return">
            Return
          </label>
          <input
            id="return"
            type="date"
            className="input"
            disabled={tripType !== 'round'}
            min={departureDate}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="passengers">
            Passengers
          </label>
          <input
            id="passengers"
            type="number"
            min="1"
            max="9"
            className="input"
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label" htmlFor="cabin">
            Cabin
          </label>
          <select id="cabin" className="input" value={cabinClass} onChange={(e) => setCabinClass(e.target.value)}>
            <option value="economy">Economy</option>
            <option value="premiumEconomy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button type="submit" className="btn-accent w-full sm:w-auto">
          Search Flights
        </button>
      </div>
    </form>
  );
}
