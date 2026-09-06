import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { getApiError } from '../../utils/format';
import Modal from '../../components/common/Modal';
import usePageTitle from '../../hooks/usePageTitle';

const defaultConfig = {
  first: { rows: 2, columns: ['A', 'F'], startRow: 1 },
  business: { rows: 4, columns: ['A', 'C', 'D', 'F'], startRow: 3 },
  premiumEconomy: { rows: 3, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 7 },
  economy: { rows: 10, columns: ['A', 'B', 'C', 'D', 'E', 'F'], startRow: 10 },
};

export default function AdminAircraftPage() {
  usePageTitle('Aircraft');
  const [items, setItems] = useState([]);
  const [airlines, setAirlines] = useState([]);
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    const [{ data }, lookup] = await Promise.all([adminService.aircraft({ limit: 50 }), adminService.lookups()]);
    setItems(data.data);
    setAirlines(lookup.data.data.airlines);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Aircraft</h1>
        <button className="btn-primary" onClick={() => { reset({}); setOpen(true); }}>Add aircraft</button>
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left"><tr><th className="px-4 py-3">Registration</th><th className="px-4 py-3">Model</th><th className="px-4 py-3">Airline</th><th className="px-4 py-3">Seats</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="px-4 py-3">{item.registrationNumber}</td>
                <td className="px-4 py-3">{item.model}</td>
                <td className="px-4 py-3">{item.airline?.name}</td>
                <td className="px-4 py-3">{item.totalSeats}</td>
                <td className="px-4 py-3">
                  <button className="text-red-600" onClick={async () => { await adminService.deleteAircraft(item._id); load(); }}>Deactivate / delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} title="Create aircraft" onClose={() => setOpen(false)}>
        <form
          className="grid gap-3"
          onSubmit={handleSubmit(async (values) => {
            try {
              await adminService.createAircraft({
                ...values,
                totalSeats: Number(values.totalSeats || 84),
                seatConfiguration: defaultConfig,
              });
              setOpen(false);
              load();
            } catch (error) {
              toast.error(getApiError(error));
            }
          })}
        >
          <select className="input" {...register('airline', { required: true })}>
            <option value="">Assign airline</option>
            {airlines.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <input className="input" placeholder="Model" {...register('model', { required: true })} />
          <input className="input" placeholder="Registration" {...register('registrationNumber', { required: true })} />
          <input className="input" placeholder="Total seats" {...register('totalSeats')} />
          <p className="text-xs text-slate-500">Seats are generated from the standard cabin configuration after save.</p>
          <button className="btn-primary">Save aircraft</button>
        </form>
      </Modal>
    </div>
  );
}
