import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import BookingStepper from '../../components/booking/BookingStepper';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import { flightService } from '../../services/flightService';
import { bookingService } from '../../services/bookingService';
import { formatMoney, getApiError } from '../../utils/format';
import usePageTitle from '../../hooks/usePageTitle';

export default function ReviewPage() {
  usePageTitle('Review booking');
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { draft, setDraft } = useBooking();
  const [fare, setFare] = useState(null);
  const [accepted, setAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!draft?.selectedSeats?.length) return;
    flightService
      .quote(flightId, {
        passengers: draft.passengerDetails,
        selectedSeats: draft.selectedSeats,
        cabinClass: draft.cabinClass,
      })
      .then(({ data }) => setFare(data.data))
      .catch((err) => toast.error(getApiError(err)));
  }, [draft, flightId]);

  const pay = async () => {
    if (!accepted) return toast.error('Please accept the terms');
    if (!isAuthenticated) {
      toast.error('Sign in to complete your booking');
      navigate('/login', { state: { from: `/booking/${flightId}/review` } });
      return;
    }
    setSubmitting(true);
    try {
      const passengers = (draft.passengerDetails || []).map((passenger, index) => ({
        ...passenger,
        seatNumber: draft.selectedSeats[index]?.seatNumber || passenger.seatNumber,
      }));
      const { data } = await bookingService.create({
        flightId,
        cabinClass: draft.cabinClass,
        passengers,
        selectedSeats: draft.selectedSeats,
      });
      setDraft((prev) => ({ ...prev, booking: data.data }));
      navigate(`/payment/${data.data._id}`);
    } catch (error) {
      toast.error(getApiError(error, 'Unable to create booking'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-page py-8">
      <BookingStepper current={2} />
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h1 className="text-2xl font-bold">Review your trip</h1>
          <p className="mt-2 text-slate-500">
            {draft?.flight?.flightNumber} · {draft?.flight?.departureAirport?.code} → {draft?.flight?.arrivalAirport?.code}
          </p>
          <h2 className="mt-6 font-semibold">Passengers</h2>
          <ul className="mt-2 space-y-2 text-sm">
            {(draft?.passengerDetails || []).map((p) => (
              <li key={p.passportNumber}>
                {p.firstName} {p.lastName} · {p.passengerType} · Seat {p.seatNumber || ''}
              </li>
            ))}
          </ul>
          <h2 className="mt-6 font-semibold">Seats</h2>
          <p>{(draft?.selectedSeats || []).map((s) => s.seatNumber).join(', ')}</p>
        </div>
        <aside className="card p-6">
          <h2 className="font-semibold">Fare breakdown</h2>
          {fare ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt>Base fare</dt><dd>{formatMoney(fare.baseFare)}</dd></div>
              <div className="flex justify-between"><dt>Taxes</dt><dd>{formatMoney(fare.taxes)}</dd></div>
              <div className="flex justify-between"><dt>Airport charges</dt><dd>{formatMoney(fare.airportCharges)}</dd></div>
              <div className="flex justify-between"><dt>Baggage</dt><dd>{formatMoney(fare.baggage)}</dd></div>
              <div className="flex justify-between"><dt>Service fee</dt><dd>{formatMoney(fare.serviceFee)}</dd></div>
              <div className="flex justify-between"><dt>Seat extras</dt><dd>{formatMoney(fare.seatPremium)}</dd></div>
              <div className="flex justify-between"><dt>Discount</dt><dd>-{formatMoney(fare.discount)}</dd></div>
              <div className="flex justify-between border-t pt-2 text-base font-bold">
                <dt>Total</dt>
                <dd>{formatMoney(fare.totalAmount)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Calculating fare...</p>
          )}
          <label className="mt-6 flex items-start gap-2 text-sm">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
            I agree to the SkyBook terms and fare rules.
          </label>
          <button type="button" className="btn-accent mt-4 w-full" disabled={submitting} onClick={pay}>
            {submitting ? 'Creating booking...' : 'Proceed to Payment'}
          </button>
        </aside>
      </div>
    </div>
  );
}
