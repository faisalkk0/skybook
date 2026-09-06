import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { flightService } from '../../services/flightService';
import { cabinLabel, formatDate, formatDuration, formatMoney, getApiError } from '../../utils/format';
import ErrorState from '../../components/common/ErrorState';
import Spinner from '../../components/common/Spinner';
import { useBooking } from '../../context/BookingContext';
import usePageTitle from '../../hooks/usePageTitle';

export default function FlightDetailsPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setDraft } = useBooking();
  const [flight, setFlight] = useState(null);
  const [error, setError] = useState('');
  const cabinClass = params.get('cabinClass') || 'economy';
  const passengers = Number(params.get('passengers') || 1);

  usePageTitle(flight ? `${flight.flightNumber}` : 'Flight details');

  useEffect(() => {
    flightService
      .getById(id)
      .then(({ data }) => setFlight(data.data))
      .catch((err) => setError(getApiError(err)));
  }, [id]);

  if (error) return <div className="container-page py-10"><ErrorState message={error} /></div>;
  if (!flight) return <Spinner />;

  const price =
    cabinClass === 'business' ? flight.businessPrice : cabinClass === 'first' ? flight.firstClassPrice : flight.economyPrice;

  const continueBooking = () => {
    setDraft({
      flightId: flight._id,
      flight,
      cabinClass,
      passengers,
      selectedSeats: [],
      passengerDetails: [],
    });
    navigate(`/booking/${flight._id}/seats`);
  };

  return (
    <div className="container-page py-8">
      <Link to={`/flights?${params.toString()}`} className="text-sm text-sky-600">
        Back to results
      </Link>
      <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="card p-6">
          <p className="text-sm text-slate-500">{flight.airline?.name}</p>
          <h1 className="text-3xl font-extrabold">{flight.flightNumber}</h1>
          <p className="text-slate-500">{flight.aircraft?.model}</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-slate-400">Departure</p>
              <p className="text-2xl font-bold">{flight.departureAirport?.code}</p>
              <p>{flight.departureAirport?.name}</p>
              <p className="text-sm text-slate-500">
                {formatDate(flight.departureDate)} · {flight.departureTime}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="h-px w-full bg-slate-300" />
              <p className="mt-2 text-sm">{formatDuration(flight.duration)}</p>
            </div>
            <div className="md:text-right">
              <p className="text-xs uppercase text-slate-400">Arrival</p>
              <p className="text-2xl font-bold">{flight.arrivalAirport?.code}</p>
              <p>{flight.arrivalAirport?.name}</p>
              <p className="text-sm text-slate-500">
                {formatDate(flight.arrivalDate)} · {flight.arrivalTime}
              </p>
            </div>
          </div>
          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div><dt className="text-xs uppercase text-slate-400">Baggage</dt><dd>{flight.baggageAllowance}</dd></div>
            <div><dt className="text-xs uppercase text-slate-400">Meals</dt><dd>{flight.mealIncluded ? 'Included' : 'Paid onboard'}</dd></div>
            <div><dt className="text-xs uppercase text-slate-400">Refunds</dt><dd>{flight.refundable ? 'Refundable before departure' : 'Non-refundable fare'}</dd></div>
            <div><dt className="text-xs uppercase text-slate-400">Terminal / Gate</dt><dd>{flight.terminal || '—'} / {flight.gate || 'TBA'}</dd></div>
          </dl>
          <p className="mt-6 text-sm text-slate-500">
            Fare rules: changes are subject to airline fees. SkyBook service fees are shown at checkout. Seats are confirmed only after payment.
          </p>
        </div>
        <aside className="card h-fit p-6">
          <p className="text-sm text-slate-500">{cabinLabel(cabinClass)} fare</p>
          <p className="text-3xl font-extrabold">{formatMoney(price)}</p>
          <p className="text-sm text-slate-500">per adult · {passengers} passenger(s)</p>
          <button type="button" className="btn-accent mt-6 w-full" onClick={continueBooking}>
            Continue to Seat Selection
          </button>
        </aside>
      </div>
    </div>
  );
}
