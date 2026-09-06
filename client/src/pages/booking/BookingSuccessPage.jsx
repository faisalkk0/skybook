import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingService, downloadTicket } from '../../services/bookingService';
import { useBooking } from '../../context/BookingContext';
import { formatDate, formatMoney, getApiError } from '../../utils/format';
import Spinner from '../../components/common/Spinner';
import usePageTitle from '../../hooks/usePageTitle';

export default function BookingSuccessPage() {
  usePageTitle('Booking confirmed');
  const { bookingId } = useParams();
  const { clearDraft } = useBooking();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    bookingService.get(bookingId).then(({ data }) => setBooking(data.data));
    clearDraft();
  }, [bookingId, clearDraft]);

  if (!booking) return <Spinner />;

  return (
    <div className="container-page py-10">
      <div className="card mx-auto max-w-2xl p-8 text-center">
        <p className="text-sm uppercase tracking-widest text-emerald-600">Success</p>
        <h1 className="mt-2 text-3xl font-extrabold">Booking Confirmed!</h1>
        <p className="mt-2 text-slate-500">Reference {booking.bookingReference}</p>
        <div className="mt-6 space-y-2 text-left text-sm">
          <p>
            <strong>Passengers:</strong>{' '}
            {booking.passengers.map((p) => `${p.firstName} ${p.lastName}`).join(', ')}
          </p>
          <p>
            <strong>Flight:</strong> {booking.flight?.flightNumber}
          </p>
          <p>
            <strong>Route:</strong> {booking.flight?.departureAirport?.code} → {booking.flight?.arrivalAirport?.code}
          </p>
          <p>
            <strong>Date / time:</strong> {formatDate(booking.flight?.departureDate)} · {booking.flight?.departureTime}
          </p>
          <p>
            <strong>Seats:</strong> {booking.selectedSeats.map((s) => s.seatNumber).join(', ')}
          </p>
          <p>
            <strong>Amount paid:</strong> {formatMoney(booking.totalAmount, booking.currency)}
          </p>
          <p>
            <strong>Payment:</strong> {booking.paymentStatus}
          </p>
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary" onClick={() => downloadTicket(booking._id)}>
            Download E-Ticket
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={async () => {
              try {
                await bookingService.emailTicket(booking._id);
                toast.success('Ticket email requested');
              } catch (error) {
                toast.error(getApiError(error));
              }
            }}
          >
            Email Ticket
          </button>
          <Link to={`/dashboard/bookings/${booking._id}`} className="btn-outline">
            View Booking
          </Link>
        </div>
      </div>
    </div>
  );
}
