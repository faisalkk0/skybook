import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import BookingStepper from '../../components/booking/BookingStepper';
import SeatMap from '../../components/booking/SeatMap';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import { flightService } from '../../services/flightService';
import { useBooking } from '../../context/BookingContext';
import { formatMoney, getApiError } from '../../utils/format';
import usePageTitle from '../../hooks/usePageTitle';

export default function SeatSelectionPage() {
  usePageTitle('Select seats');
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { draft, setDraft } = useBooking();
  const [seats, setSeats] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(draft?.selectedSeats || []);

  const passengerCount = draft?.passengers || 1;

  useEffect(() => {
    flightService
      .getSeats(flightId)
      .then(({ data }) => setSeats(data.data.seats))
      .catch((err) => setError(getApiError(err)));
  }, [flightId]);

  const toggle = (seat) => {
    setSelected((current) => {
      const exists = current.find((s) => s.seatNumber === seat.seatNumber);
      if (exists) return current.filter((s) => s.seatNumber !== seat.seatNumber);
      if (current.length >= passengerCount) {
        toast.error(`You can select ${passengerCount} seat(s)`);
        return current;
      }
      return [...current, { seatNumber: seat.seatNumber, class: seat.class, extraPrice: seat.extraPrice || 0 }];
    });
  };

  const continueNext = () => {
    if (selected.length !== passengerCount) {
      toast.error('Select a seat for every passenger');
      return;
    }
    setDraft((prev) => ({ ...(prev || {}), flightId, selectedSeats: selected }));
    navigate(`/booking/${flightId}/passengers`);
  };

  if (error) return <div className="container-page py-10"><ErrorState message={error} /></div>;
  if (!seats.length) return <Spinner label="Loading seat map" />;

  const extra = selected.reduce((sum, s) => sum + Number(s.extraPrice || 0), 0);

  return (
    <div className="container-page py-8">
      <BookingStepper current={0} />
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="card p-4 sm:p-6">
          <h1 className="mb-4 text-2xl font-bold">Choose your seats</h1>
          <div className="mb-4 flex flex-wrap gap-3 text-xs">
            <span className="rounded-lg border border-slate-300 bg-white px-2 py-1">Economy</span>
            <span className="rounded-lg bg-sky-200 px-2 py-1">Premium</span>
            <span className="rounded-lg bg-violet-200 px-2 py-1">Business</span>
            <span className="rounded-lg bg-amber-200 px-2 py-1">First</span>
            <span className="rounded-lg bg-slate-300 px-2 py-1">Occupied</span>
          </div>
          <SeatMap
            seats={seats}
            selected={selected.map((s) => s.seatNumber)}
            passengerCount={passengerCount}
            onToggle={toggle}
          />
        </div>
        <aside className="card h-fit p-6">
          <p className="text-sm text-slate-500">Passengers</p>
          <p className="text-2xl font-bold">{passengerCount}</p>
          <p className="mt-4 text-sm text-slate-500">Selected seats</p>
          <p className="font-semibold">{selected.map((s) => s.seatNumber).join(', ') || 'None'}</p>
          <p className="mt-4 text-sm text-slate-500">Seat extras</p>
          <p className="text-xl font-bold">{formatMoney(extra)}</p>
          <button type="button" className="btn-accent mt-6 w-full" onClick={continueNext}>
            Continue
          </button>
        </aside>
      </div>
    </div>
  );
}
