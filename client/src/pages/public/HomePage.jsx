import { Plane, ShieldCheck, Clock3, Headphones } from 'lucide-react';
import SearchCard from '../../components/search/SearchCard';
import usePageTitle from '../../hooks/usePageTitle';

const destinations = [
  { city: 'Dubai', code: 'DXB', text: 'From Islamabad' },
  { city: 'Doha', code: 'DOH', text: 'Award-winning hub' },
  { city: 'Istanbul', code: 'IST', text: 'Europe gateway' },
  { city: 'London', code: 'LHR', text: 'Heathrow connections' },
];

export default function HomePage() {
  usePageTitle('Home', 'Search and book flights with SkyBook.');

  return (
    <div>
      <section className="bg-navy-800 text-white">
        <div className="container-page grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-sky-300">SkyBook</p>
            <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-6xl">Your Journey Starts Here</h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Compare real fares, choose your seat, and pay securely. Built for travellers flying between Pakistan, the Gulf, Turkey, and Europe.
            </p>
          </div>
          <SearchCard />
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-bold">Popular destinations</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {destinations.map((item) => (
            <article key={item.code} className="card p-5">
              <p className="text-sm text-sky-600">{item.code}</p>
              <h3 className="mt-1 text-xl font-bold">{item.city}</h3>
              <p className="text-sm text-slate-500">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page">
          <h2 className="text-2xl font-bold">Why travellers choose SkyBook</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              { icon: Plane, title: 'Live inventory', text: 'Search only returns bookable seats.' },
              { icon: ShieldCheck, title: 'Secure checkout', text: 'Stripe test payments and JWT sessions.' },
              { icon: Clock3, title: 'Seat hold', text: 'Seats are reserved while you pay.' },
              { icon: Headphones, title: 'E-tickets', text: 'Download or email your boarding pass.' },
            ].map((item) => (
              <article key={item.title} className="card p-5">
                <item.icon className="text-sky-500" />
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-16">
        <div className="grid gap-4 md:grid-cols-3">
          {['Emirates', 'Qatar Airways', 'Turkish Airlines'].map((name) => (
            <article key={name} className="card p-6">
              <p className="text-sm text-slate-500">Featured airline</p>
              <h3 className="mt-1 text-xl font-bold">{name}</h3>
              <p className="mt-2 text-sm text-slate-500">Cabin options from economy to first, with meal service and checked baggage.</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-page grid gap-6 md:grid-cols-3">
          {[
            ['Sara Ahmed', 'Booked ISB → DXB in minutes. Seat map felt like a real airline site.'],
            ['Omar Farooq', 'Admin tools and passenger forms are actually connected. No dummy buttons.'],
            ['Layla Hassan', 'Loved downloading the PDF ticket with the QR booking reference.'],
          ].map(([name, quote]) => (
            <blockquote key={name} className="card p-6">
              <p className="text-slate-600">“{quote}”</p>
              <footer className="mt-4 text-sm font-semibold">{name}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <div className="mt-6 space-y-3">
          {[
            ['Can I cancel a booking?', 'Yes, if the flight is more than 6 hours away and still scheduled. Paid bookings are refunded through the payment service.'],
            ['Do I need Stripe keys?', 'For live card testing, yes. Without keys, development checkout still confirms a real booking on the server.'],
            ['Are seats protected from double booking?', 'Yes. The API checks occupied seats and rejects conflicts before a booking is saved.'],
          ].map(([q, a]) => (
            <details key={q} className="card p-4">
              <summary className="cursor-pointer font-semibold">{q}</summary>
              <p className="mt-2 text-sm text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
