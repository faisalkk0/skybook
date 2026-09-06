import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { bookingService, downloadTicket } from '../../services/bookingService';
import { formatDate, formatMoney, getApiError, statusTone } from '../../utils/format';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import usePageTitle from '../../hooks/usePageTitle';

export default function BookingDetailsPage() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  usePageTitle(booking?.bookingReference || 'Booking');

  const load = () => bookingService.get(id).then(({ data }) => setBooking(data.data));
  useEffect(() => {
    load();
  }, [id]);

  if (!booking) return <Spinner />;

  return (
    <div className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{booking.bookingReference}</h1>
          <p className="text-slate-500">{booking.flight?.flightNumber}</p>
        </div>
        <div className="flex gap-2">
          <span className={`badge ${statusTone(booking.status)}`}>{booking.status}</span>
          <span className={`badge ${statusTone(booking.paymentStatus)}`}>{booking.paymentStatus}</span>
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
        <p>Route: {booking.flight?.departureAirport?.name} → {booking.flight?.arrivalAirport?.name}</p>
        <p>Date: {formatDate(booking.flight?.departureDate)} · {booking.flight?.departureTime}</p>
        <p>Seats: {booking.selectedSeats.map((s) => s.seatNumber).join(', ')}</p>
        <p>Amount: {formatMoney(booking.totalAmount, booking.currency)}</p>
      </div>
      <h2 className="mt-6 font-semibold">Passengers</h2>
      <ul className="mt-2 space-y-1 text-sm">
        {booking.passengers.map((p) => (
          <li key={p.passportNumber}>{p.firstName} {p.lastName} · {p.seatNumber} · {p.passportNumber}</li>
        ))}
      </ul>
      <div className="mt-6 flex flex-wrap gap-3">
        {booking.paymentStatus === 'paid' ? (
          <button type="button" className="btn-primary" onClick={() => downloadTicket(booking._id)}>
            Download ticket
          </button>
        ) : null}
        {booking.cancellable ? (
          <button type="button" className="btn-danger" onClick={() => setOpen(true)}>
            Cancel booking
          </button>
        ) : (
          <p className="text-sm text-slate-500">This booking can no longer be cancelled online.</p>
        )}
      </div>
      <ConfirmDialog
        open={open}
        title="Cancel booking"
        danger
        confirmLabel="Cancel booking"
        message="Seats will be released. Paid bookings are refunded when cancellation rules allow."
        onClose={() => setOpen(false)}
        onConfirm={async () => {
          try {
            await bookingService.cancel(id, reason || 'Changed plans');
            toast.success('Booking cancelled');
            setOpen(false);
            load();
          } catch (error) {
            toast.error(getApiError(error));
          }
        }}
      />
      {open ? (
        <div className="mt-4">
          <label className="label">Cancellation reason</label>
          <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      ) : null}
    </div>
  );
}
