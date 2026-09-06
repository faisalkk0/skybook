import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { getApiError } from '../../utils/format';
import Modal from '../../components/common/Modal';
import usePageTitle from '../../hooks/usePageTitle';

export default function AdminAirlinesPage() {
  usePageTitle('Airlines');
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    const { data } = await adminService.airlines({ limit: 50 });
    setItems(data.data);
  };
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Airlines</h1>
        <button className="btn-primary" onClick={() => { setEditing(null); reset({}); setOpen(true); }}>Add airline</button>
      </div>
      <div className="card mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left"><tr><th className="px-4 py-3">Code</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Country</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id} className="border-t">
                <td className="px-4 py-3">{item.code}</td>
                <td className="px-4 py-3">{item.name}</td>
                <td className="px-4 py-3">{item.country}</td>
                <td className="px-4 py-3">{item.active ? 'Active' : 'Inactive'}</td>
                <td className="px-4 py-3 space-x-2">
                  <button className="text-sky-600" onClick={() => { setEditing(item); reset(item); setOpen(true); }}>Edit</button>
                  <button className="text-red-600" onClick={async () => { await adminService.deleteAirline(item._id); load(); }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal open={open} title={editing ? 'Edit airline' : 'Create airline'} onClose={() => setOpen(false)}>
        <form
          className="grid gap-3"
          onSubmit={handleSubmit(async (values) => {
            try {
              if (editing) await adminService.updateAirline(editing._id, values);
              else await adminService.createAirline(values);
              setOpen(false);
              load();
            } catch (error) {
              toast.error(getApiError(error));
            }
          })}
        >
          <input className="input" placeholder="Name" {...register('name', { required: true })} />
          <input className="input" placeholder="Code" {...register('code', { required: true })} />
          <input className="input" placeholder="Country" {...register('country', { required: true })} />
          <input className="input" placeholder="Website" {...register('website')} />
          <textarea className="input" placeholder="Description" {...register('description')} />
          <button className="btn-primary">Save</button>
        </form>
      </Modal>
    </div>
  );
}
