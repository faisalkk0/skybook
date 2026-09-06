import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import BookingStepper from '../../components/booking/BookingStepper';
import Spinner from '../../components/common/Spinner';
import { paymentService } from '../../services/paymentService';
import { bookingService } from '../../services/bookingService';
import { formatMoney, getApiError } from '../../utils/format';
import usePageTitle from '../../hooks/usePageTitle';

function StripeForm({ bookingId, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    const result = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (result.error) {
      toast.error(result.error.message);
      setBusy(false);
      return;
    }
    try {
      await paymentService.confirm(bookingId, {
        paymentIntentId: result.paymentIntent.id,
        paymentMethod: 'card',
      });
      onPaid();
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <PaymentElement />
      <button className="btn-accent w-full" disabled={busy || !stripe}>
        {busy ? 'Processing...' : 'Pay now'}
      </button>
    </form>
  );
}

export default function PaymentPage() {
  usePageTitle('Payment');
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [intent, setIntent] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [{ data: bookingRes }, { data: intentRes }] = await Promise.all([
          bookingService.get(bookingId),
          paymentService.createIntent(bookingId),
        ]);
        setBooking(bookingRes.data);
        setIntent(intentRes.data);
        if (intentRes.data.publishableKey) {
          setStripePromise(loadStripe(intentRes.data.publishableKey));
        }
      } catch (error) {
        toast.error(getApiError(error, 'Unable to start payment'));
      }
    };
    load();
  }, [bookingId]);

  const finish = () => navigate(`/booking-success/${bookingId}`);

  const devPay = async () => {
    try {
      await paymentService.confirm(bookingId, { paymentMethod: 'test_card' });
      finish();
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  if (!booking || !intent) return <Spinner label="Preparing checkout" />;

  return (
    <div className="container-page py-8">
      <BookingStepper current={3} />
      <div className="card mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-bold">Pay securely</h1>
        <p className="mt-2 text-slate-500">
          {booking.bookingReference} · {formatMoney(booking.totalAmount, booking.currency)}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          The amount is calculated on the server. The browser cannot change the fare.
        </p>
        <div className="mt-6">
          {intent.provider === 'stripe' && stripePromise && intent.clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret: intent.clientSecret }}>
              <StripeForm bookingId={bookingId} onPaid={finish} />
            </Elements>
          ) : (
            <div>
              <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                Stripe keys are not configured. This development checkout still creates a payment record and confirms the booking on the backend.
              </p>
              <button type="button" className="btn-accent mt-4 w-full" onClick={devPay}>
                Pay {formatMoney(booking.totalAmount, booking.currency)} with test card
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
