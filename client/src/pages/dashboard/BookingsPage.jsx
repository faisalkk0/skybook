import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingService, downloadTicket } from '../../services/bookingService';
import { formatDate, formatMoney, getApiError, statusTone } from '../../utils/format';
import EmptyState from '../../components/common/EmptyState';
import Spinner from '../../components/common/Spinner';
import usePageTitle from '../../hooks/usePageTitle';

export default function BookingsPage() {
  usePageTitle('My bookings');
  const [bookings, setBookings] = useState(null);

  useEffect(() => {
    bookingService.list().then(({ data }) => setBookings(data.data));
  }, []);

  if (!bookings) return <Spinner />;
  if (!bookings.length) {
    return <EmptyState title="No bookings yet" description="Search a route to make your first reservation." action={<Link className="btn-primary" to="/">Search flights</Link>} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">My bookings</h1>
      <div className="mt-6 overflow-x-auto card">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Flight</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking._id} className="border-t">
                <td className="px-4 py-3 font-semibold">{booking.bookingReference}</td>
                <td className="px-4 py-3">{booking.flight?.flightNumber}</td>
                <td className="px-4 py-3">
                  {booking.flight?.departureAirport?.code} → {booking.flight?.arrivalAirport?.code}
                </td>
                <td className="px-4 py-3">{formatDate(booking.flight?.departureDate)}</td>
                <td className="px-4 py-3"><span className={`badge ${statusTone(booking.status)}`}>{booking.status}</span></td>
                <td className="px-4 py-3"><span className={`badge ${statusTone(booking.paymentStatus)}`}>{booking.paymentStatus}</span></td>
                <td className="px-4 py-3">{formatMoney(booking.totalAmount)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link className="text-sky-600" to={`/dashboard/bookings/${booking._id}`}>View</Link>
                    {booking.paymentStatus === 'paid' ? (
                      <button type="button" className="text-navy-700" onClick={() => downloadTicket(booking._id).catch((e) => toast.error(getApiError(e)))}>
                        Ticket
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
