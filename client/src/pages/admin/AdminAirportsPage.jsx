import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { getApiError } from '../../utils/format';
import Modal from '../../components/common/Modal';
import usePageTitle from '../../hooks/usePageTitle';

export default function AdminAirportsPage() {
  usePageTitle('Airports');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    const { data } = await adminService.airports({ limit: 50 });
    setItems(data.data);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Airports</h1>
        <button className="btn-primary" onClick={() => { setEditing(null); reset({}); setOpen(true); }}>Add airport</button>
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">City</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="px-4 py-3 font-semibold">{item.code}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.city}</td>
                <td className="px-4 py-3">{item.active ? 'Active' : 'Inactive'}</td>
                <td className="px-4 py-3 space-x-2">
                  <button className="text-sky-600" onClick={() => { setEditing(item); reset(item); setOpen(true); }}>Edit</button>
                  <button className="text-amber-700" onClick={async () => { await adminService.updateAirport(item._id, { active: !item.active }); load(); }}>{item.active ? 'Deactivate' : 'Activate'}</button>
                  <button className="text-red-600" onClick={async () => { await adminService.deleteAirport(item._id); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} title={editing ? 'Edit airport' : 'Create airport'} onClose={() => setOpen(false)}>
        <form
          className="grid gap-3"
          onSubmit={handleSubmit(async (values) => {
            try {
              if (editing) await adminService.updateAirport(editing._id, values);
              else await adminService.createAirport(values);
              setOpen(false);
              load();
            } catch (error) {
              toast.error(getApiError(error));
            }
          })}
        >
          <input className="input" placeholder="Name" {...register('name', { required: true })} />
          <input className="input" placeholder="IATA code" {...register('code', { required: true })} />
          <input className="input" placeholder="City" {...register('city', { required: true })} />
          <input className="input" placeholder="Country" {...register('country', { required: true })} />
          <input className="input" placeholder="Timezone" {...register('timezone')} />
          <button className="btn-primary">Save</button>
        </form>
      </Modal>
    </div>
  );
}
