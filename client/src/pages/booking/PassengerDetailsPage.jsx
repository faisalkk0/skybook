import { useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import BookingStepper from '../../components/booking/BookingStepper';
import { useAuth } from '../../context/AuthContext';
import { useBooking } from '../../context/BookingContext';
import usePageTitle from '../../hooks/usePageTitle';

export default function PassengerDetailsPage() {
  usePageTitle('Passenger details');
  const { flightId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { draft, setDraft } = useBooking();
  const count = draft?.passengers || 1;
  const seats = draft?.selectedSeats || [];

  const { register, control, handleSubmit, setValue } = useForm({
    defaultValues: {
      passengers:
        draft?.passengerDetails?.length === count
          ? draft.passengerDetails
          : Array.from({ length: count }, (_, i) => ({
              firstName: '',
              lastName: '',
              dateOfBirth: '',
              gender: 'male',
              nationality: '',
              passportNumber: '',
              passportExpiry: '',
              passengerType: 'adult',
              seatNumber: seats[i]?.seatNumber || '',
            })),
    },
  });

  const { fields } = useFieldArray({ control, name: 'passengers' });

  const useProfile = () => {
    if (!user) return toast.error('Sign in to use your profile');
    setValue('passengers.0.firstName', user.firstName || '');
    setValue('passengers.0.lastName', user.lastName || '');
    setValue('passengers.0.dateOfBirth', user.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '');
    setValue('passengers.0.gender', user.gender || 'male');
    setValue('passengers.0.nationality', user.nationality || user.country || '');
    setValue('passengers.0.passportNumber', user.passportNumber || '');
  };

  const onSubmit = (values) => {
    setDraft((prev) => ({ ...(prev || {}), passengerDetails: values.passengers }));
    navigate(`/booking/${flightId}/review`);
  };

  return (
    <div className="container-page py-8">
      <BookingStepper current={1} />
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Passenger details</h1>
          <button type="button" className="btn-outline" onClick={useProfile}>
            Use my profile information
          </button>
        </div>
        <div className="mt-6 space-y-8">
          {fields.map((field, index) => (
            <fieldset key={field.id} className="grid gap-4 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2">
              <legend className="px-2 font-semibold">
                Passenger {index + 1} · Seat {seats[index]?.seatNumber || '—'}
              </legend>
              <div>
                <label className="label">First name</label>
                <input className="input" {...register(`passengers.${index}.firstName`, { required: true })} />
              </div>
              <div>
                <label className="label">Last name</label>
                <input className="input" {...register(`passengers.${index}.lastName`, { required: true })} />
              </div>
              <div>
                <label className="label">Date of birth</label>
                <input className="input" type="date" {...register(`passengers.${index}.dateOfBirth`, { required: true })} />
              </div>
              <div>
                <label className="label">Gender</label>
                <select className="input" {...register(`passengers.${index}.gender`, { required: true })}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Nationality</label>
                <input className="input" {...register(`passengers.${index}.nationality`, { required: true })} />
              </div>
              <div>
                <label className="label">Passenger type</label>
                <select className="input" {...register(`passengers.${index}.passengerType`, { required: true })}>
                  <option value="adult">Adult</option>
                  <option value="child">Child</option>
                  <option value="infant">Infant</option>
                </select>
              </div>
              <div>
                <label className="label">Passport number</label>
                <input className="input" {...register(`passengers.${index}.passportNumber`, { required: true })} />
              </div>
              <div>
                <label className="label">Passport expiry</label>
                <input className="input" type="date" {...register(`passengers.${index}.passportExpiry`, { required: true })} />
              </div>
            </fieldset>
          ))}
        </div>
        <button className="btn-accent mt-6">Continue to review</button>
      </form>
    </div>
  );
}
