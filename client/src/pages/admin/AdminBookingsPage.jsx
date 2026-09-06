import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { formatDate, formatMoney, getApiError, statusTone } from '../../utils/format';
import usePageTitle from '../../hooks/usePageTitle';

export default function AdminBookingsPage() {
  usePageTitle('Admin bookings');
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');

  const load = async () => {
    const { data } = await adminService.bookings({ q, limit: 20 });
    setItems(data.data);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Bookings</h1>
      <div className="mt-4 flex gap-3">
        <input className="input max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Reference" />
        <button className="btn-outline" onClick={load}>Search</button>
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Flight</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((booking) => (
              <tr key={booking._id} className="border-t">
                <td className="px-4 py-3">{booking.bookingReference}</td>
                <td className="px-4 py-3">{booking.user?.firstName} {booking.user?.lastName}</td>
                <td className="px-4 py-3">{booking.flight?.flightNumber}</td>
                <td className="px-4 py-3">{formatMoney(booking.totalAmount)}</td>
                <td className="px-4 py-3"><span className={`badge ${statusTone(booking.paymentStatus)}`}>{booking.paymentStatus}</span></td>
                <td className="px-4 py-3">
                  <select
                    className="input"
                    value={booking.status}
                    onChange={async (e) => {
                      await adminService.updateBooking(booking._id, { status: e.target.value });
                      load();
                    }}
                  >
                    {['pending', 'confirmed', 'cancelled', 'completed'].map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <span className="text-slate-500">{formatDate(booking.createdAt)}</span>
                  {booking.paymentStatus === 'paid' ? (
                    <button
                      className="text-sky-600"
                      onClick={async () => {
                        try {
                          await adminService.refundBooking(booking._id);
                          toast.success('Refund processed');
                          load();
                        } catch (error) {
                          toast.error(getApiError(error));
                        }
                      }}
                    >
                      Refund
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
