import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatDate, formatMoney, statusTone } from '../../utils/format';
import usePageTitle from '../../hooks/usePageTitle';

export default function AdminPaymentsPage() {
  usePageTitle('Payments');
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/admin/payments').then(({ data }) => setItems(data.data));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="card mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Paid</th>
            </tr>
          </thead>
          <tbody>
            {items.map((payment) => (
              <tr key={payment._id} className="border-t">
                <td className="px-4 py-3">{payment.booking?.bookingReference}</td>
                <td className="px-4 py-3">{payment.user?.email}</td>
                <td className="px-4 py-3">{formatMoney(payment.amount, payment.currency)}</td>
                <td className="px-4 py-3"><span className={`badge ${statusTone(payment.status)}`}>{payment.status}</span></td>
                <td className="px-4 py-3">{formatDate(payment.paidAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
