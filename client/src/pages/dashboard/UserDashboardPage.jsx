import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { formatMoney } from '../../utils/format';
import Spinner from '../../components/common/Spinner';
import usePageTitle from '../../hooks/usePageTitle';

export default function UserDashboardPage() {
  usePageTitle('Dashboard');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    bookingService.dashboard().then(({ data }) => setStats(data.data));
  }, []);

  if (!stats) return <Spinner />;

  const cards = [
    ['Upcoming trips', stats.upcomingCount],
    ['Past trips', stats.pastCount],
    ['Cancelled trips', stats.cancelledCount],
    ['Total spent', formatMoney(stats.totalSpent)],
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold">Your travel dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <article key={label} className="card p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-extrabold">{value}</p>
          </article>
        ))}
      </div>
      <h2 className="mt-8 text-lg font-semibold">Upcoming flight</h2>
      {stats.upcoming[0] ? (
        <article className="card mt-3 p-5">
          <p className="font-semibold">{stats.upcoming[0].flight?.flightNumber}</p>
          <p className="text-sm text-slate-500">
            {stats.upcoming[0].flight?.departureAirport?.code} → {stats.upcoming[0].flight?.arrivalAirport?.code}
          </p>
          <Link className="btn-outline mt-4" to={`/dashboard/bookings/${stats.upcoming[0]._id}`}>
            View trip
          </Link>
        </article>
      ) : (
        <p className="mt-3 text-sm text-slate-500">No upcoming trips yet.</p>
      )}
      <h2 className="mt-8 text-lg font-semibold">Recent bookings</h2>
      <div className="mt-3 space-y-2">
        {stats.recent.map((booking) => (
          <Link key={booking._id} to={`/dashboard/bookings/${booking._id}`} className="card block p-4 hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{booking.bookingReference}</span>
              <span className="text-sm text-slate-500">{booking.status}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
