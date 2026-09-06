import { Link } from 'react-router-dom';
import { formatDuration, formatMoney } from '../../utils/format';

export default function FlightCard({ flight, cabinClass = 'economy', search }) {
  const price =
    cabinClass === 'business'
      ? flight.businessPrice
      : cabinClass === 'first'
        ? flight.firstClassPrice
        : flight.economyPrice;

  const params = search ? `?${search}` : '';

  return (
    <article className="card p-4 sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-3">
          <img
            src={flight.airline?.logo}
            alt=""
            className="h-10 w-10 rounded-full bg-slate-100 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div>
            <p className="font-semibold text-navy-800">{flight.airline?.name}</p>
            <p className="text-xs text-slate-500">
              {flight.flightNumber} · {flight.aircraft?.model}
            </p>
          </div>
        </div>
        <div className="grid flex-[1.4] grid-cols-3 items-center text-center">
          <div>
            <p className="text-xl font-bold">{flight.departureTime}</p>
            <p className="text-xs text-slate-500">{flight.departureAirport?.code}</p>
          </div>
          <div>
            <p className="text-xs uppercase text-slate-400">{formatDuration(flight.duration)}</p>
            <div className="my-1 h-px bg-slate-300" />
            <p className="text-xs text-slate-500">{flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}</p>
          </div>
          <div>
            <p className="text-xl font-bold">{flight.arrivalTime}</p>
            <p className="text-xs text-slate-500">{flight.arrivalAirport?.code}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 lg:block lg:text-right">
          <div>
            <p className="text-xs text-slate-500">Baggage {flight.baggageAllowance}</p>
            <p className="text-2xl font-extrabold text-navy-800">{formatMoney(price)}</p>
          </div>
          <Link to={`/flights/${flight._id}${params}`} className="btn-primary">
            Select
          </Link>
        </div>
      </div>
    </article>
  );
}
