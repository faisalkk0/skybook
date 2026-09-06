import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { getApiError } from '../../utils/format';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Spinner from '../../components/common/Spinner';
import usePageTitle from '../../hooks/usePageTitle';

export default function AdminUsersPage() {
  usePageTitle('Manage users');
  const [state, setState] = useState({ data: [], meta: {} });
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState('');

  const load = async (page = 1) => {
    setLoading(true);
    const { data } = await adminService.users({ q, role, page, limit: 10 });
    setState({ data: data.data, meta: data.meta });
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="mt-4 flex flex-wrap gap-3">
        <input className="input max-w-xs" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input w-auto" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn-primary" onClick={() => load()}>Filter</button>
      </div>
      {loading ? <Spinner /> : (
        <div className="card mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.data.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-3">{user.firstName} {user.lastName}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input"
                      value={user.role}
                      onChange={async (e) => {
                        await adminService.updateUser(user._id, { role: e.target.value });
                        load(state.meta.page);
                      }}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">{user.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      className="text-amber-700"
                      onClick={async () => {
                        await adminService.updateUser(user._id, { isActive: !user.isActive });
                        load(state.meta.page);
                      }}
                    >
                      {user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button className="text-red-600" onClick={() => setDeleteId(user._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete user"
        danger
        message="This permanently removes the user account."
        onClose={() => setDeleteId('')}
        onConfirm={async () => {
          try {
            await adminService.deleteUser(deleteId);
            setDeleteId('');
            load();
          } catch (error) {
            toast.error(getApiError(error));
          }
        }}
      />
    </div>
  );
}
