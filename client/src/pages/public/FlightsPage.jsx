import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchCard from '../../components/search/SearchCard';
import FlightCard from '../../components/flights/FlightCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { flightService } from '../../services/flightService';
import { getApiError } from '../../utils/format';
import usePageTitle from '../../hooks/usePageTitle';

export default function FlightsPage() {
  usePageTitle('Search flights', 'Compare available SkyBook flights.');
  const [params, setParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState({ flights: [], returnFlights: [], meta: null });
  const [airlines, setAirlines] = useState([]);

  const query = useMemo(
    () => ({
      from: params.get('from') || '',
      to: params.get('to') || '',
      departureDate: params.get('departureDate') || '',
      returnDate: params.get('returnDate') || '',
      passengers: params.get('passengers') || '1',
      cabinClass: params.get('cabinClass') || 'economy',
      sort: params.get('sort') || 'cheapest',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      airline: params.get('airline') || '',
      departureTime: params.get('departureTime') || '',
      arrivalTime: params.get('arrivalTime') || '',
      stops: params.get('stops') || '',
      page: params.get('page') || '1',
    }),
    [params]
  );

  useEffect(() => {
    flightService.featuredAirlines().then(({ data }) => setAirlines(data.data || []));
  }, []);

  useEffect(() => {
    if (!query.from || !query.to || !query.departureDate) return;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await flightService.search(query);
        setResult({ flights: data.data.flights, returnFlights: data.data.returnFlights, meta: data.meta });
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [query]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setParams(next);
  };

  return (
    <div className="container-page py-8">
      <SearchCard
        compact
        initial={{
          from: query.from ? { code: query.from, city: query.from } : null,
          to: query.to ? { code: query.to, city: query.to } : null,
          ...query,
          tripType: query.returnDate ? 'round' : 'oneway',
        }}
      />

      {!query.from ? (
        <div className="mt-8">
          <EmptyState title="Start your search" description="Choose airports and a departure date to see live inventory." />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="card h-fit space-y-4 p-4">
            <h2 className="font-semibold">Filters</h2>
            <div>
              <label className="label">Price up to</label>
              <input className="input" type="number" value={query.maxPrice} onChange={(e) => update('maxPrice', e.target.value)} />
            </div>
            <div>
              <label className="label">Airline</label>
              <select className="input" value={query.airline} onChange={(e) => update('airline', e.target.value)}>
                <option value="">All airlines</option>
                {airlines.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Departure</label>
              <select className="input" value={query.departureTime} onChange={(e) => update('departureTime', e.target.value)}>
                <option value="">Any time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div>
              <label className="label">Arrival</label>
              <select className="input" value={query.arrivalTime} onChange={(e) => update('arrivalTime', e.target.value)}>
                <option value="">Any time</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div>
              <label className="label">Cabin</label>
              <select className="input" value={query.cabinClass} onChange={(e) => update('cabinClass', e.target.value)}>
                <option value="economy">Economy</option>
                <option value="premiumEconomy">Premium Economy</option>
                <option value="business">Business</option>
                <option value="first">First</option>
              </select>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold">
                  {query.from} → {query.to}
                </h1>
                <p className="text-sm text-slate-500">
                  {query.departureDate} · {query.passengers} passenger(s) · {query.cabinClass}
                </p>
              </div>
              <select className="input w-auto" value={query.sort} onChange={(e) => update('sort', e.target.value)}>
                <option value="cheapest">Cheapest</option>
                <option value="fastest">Fastest</option>
                <option value="earliest">Earliest</option>
                <option value="latest">Latest</option>
              </select>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-28" />
                ))}
              </div>
            ) : error ? (
              <ErrorState message={error} />
            ) : result.flights.length === 0 ? (
              <EmptyState title="No flights found for your search." description="Try another date or remove some filters." />
            ) : (
              <div className="space-y-3">
                {result.flights.map((flight) => (
                  <FlightCard
                    key={flight._id}
                    flight={flight}
                    cabinClass={query.cabinClass}
                    search={params.toString()}
                  />
                ))}
              </div>
            )}

            {result.returnFlights?.length ? (
              <div className="mt-10">
                <h2 className="mb-3 text-lg font-bold">Return flights</h2>
                <div className="space-y-3">
                  {result.returnFlights.map((flight) => (
                    <FlightCard key={flight._id} flight={flight} cabinClass={query.cabinClass} search={params.toString()} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
