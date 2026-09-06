import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminService } from '../../services/adminService';
import { formatMoney } from '../../utils/format';
import Spinner from '../../components/common/Spinner';
import usePageTitle from '../../hooks/usePageTitle';

const COLORS = ['#0B1F3A', '#0EA5E9', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function AdminDashboardPage() {
  usePageTitle('Admin');
  const [data, setData] = useState(null);

  useEffect(() => {
    adminService.overview().then((res) => setData(res.data.data));
  }, []);

  if (!data) return <Spinner />;
  const cards = data.cards;

  return (
    <div>
      <h1 className="text-2xl font-bold">Platform overview</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ['Total users', cards.users],
          ['Total flights', cards.flights],
          ['Total bookings', cards.bookings],
          ['Revenue', formatMoney(cards.revenue)],
          ['Active flights', cards.activeFlights],
          ['Cancelled flights', cards.cancelledFlights],
        ].map(([label, value]) => (
          <article key={label} className="card p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-extrabold">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <article className="card p-4">
          <h2 className="mb-3 font-semibold">Revenue over time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data.revenueOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </article>
        <article className="card p-4">
          <h2 className="mb-3 font-semibold">Bookings over time</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.bookingsOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#0B1F3A" />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="card p-4">
          <h2 className="mb-3 font-semibold">Popular destinations</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.popularDestinations}>
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#0EA5E9" />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="card p-4">
          <h2 className="mb-3 font-semibold">Airline performance</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.airlinePerformance}>
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#0B1F3A" />
              <Bar dataKey="revenue" fill="#0EA5E9" />
            </BarChart>
          </ResponsiveContainer>
        </article>
        <article className="card p-4 xl:col-span-2">
          <h2 className="mb-3 font-semibold">Booking status distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data.bookingStatus} dataKey="count" nameKey="status" outerRadius={90} label>
                {data.bookingStatus.map((entry, index) => (
                  <Cell key={entry.status} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </article>
      </div>
    </div>
  );
}
