const steps = ['Seats', 'Passengers', 'Review', 'Payment'];

export default function BookingStepper({ current = 0 }) {
  return (
    <ol className="mb-6 grid grid-cols-4 gap-2 text-center text-xs font-semibold uppercase tracking-wide">
      {steps.map((step, index) => (
        <li
          key={step}
          className={`rounded-full px-2 py-2 ${
            index <= current ? 'bg-navy-800 text-white' : 'bg-slate-200 text-slate-500'
          }`}
        > 
          {step}
        </li>
      ))} 
    </ol>
  );
}
