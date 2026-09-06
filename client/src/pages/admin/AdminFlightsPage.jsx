import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { adminService } from '../../services/adminService';
import { formatDate, getApiError } from '../../utils/format';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import usePageTitle from '../../hooks/usePageTitle';

export default function AdminFlightsPage() {
  usePageTitle('Manage flights');
  const [flights, setFlights] = useState([]);
  const [lookups, setLookups] = useState({ airlines: [], airports: [], aircraft: [] });
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();

  const load = async () => {
    setLoading(true);
    const [{ data }, lookup] = await Promise.all([adminService.flights({ q, limit: 20 }), adminService.lookups()]);
    setFlights(data.data);
    setLookups(lookup.data.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (values) => {
    try {
      const payload = { ...values, duration: Number(values.duration), economyPrice: Number(values.economyPrice), businessPrice: Number(values.businessPrice), firstClassPrice: Number(values.firstClassPrice), availableSeats: Number(values.availableSeats) };
      if (editing) await adminService.updateFlight(editing._id, payload);
      else await adminService.createFlight(payload);
      toast.success(editing ? 'Flight updated' : 'Flight created');
      setOpen(false);
      setEditing(null);
      load();
    } catch (error) {
      toast.error(getApiError(error));
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Flights</h1>
        <button className="btn-primary" onClick={() => { setEditing(null); reset({}); setOpen(true); }}>Create flight</button>
      </div>
      <div className="mt-4 flex gap-3">
        <input className="input max-w-xs" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Flight number" />
        <button className="btn-outline" onClick={load}>Search</button>
      </div>
      {loading ? <Spinner /> : (
        <div className="card mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">Flight</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((flight) => (
                <tr key={flight._id} className="border-t">
                  <td className="px-4 py-3">{flight.flightNumber}</td>
                  <td className="px-4 py-3">{flight.departureAirport?.code} → {flight.arrivalAirport?.code}</td>
                  <td className="px-4 py-3">{formatDate(flight.departureDate)} {flight.departureTime}</td>
                  <td className="px-4 py-3">
                    <select
                      className="input"
                      value={flight.status}
                      onChange={async (e) => {
                        await adminService.updateFlight(flight._id, { status: e.target.value });
                        load();
                      }}
                    >
                      {['scheduled', 'boarding', 'departed', 'delayed', 'cancelled', 'completed'].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button className="text-sky-600" onClick={() => { setEditing(flight); reset({ ...flight, airline: flight.airline?._id, aircraft: flight.aircraft?._id, departureAirport: flight.departureAirport?._id, arrivalAirport: flight.arrivalAirport?._id, departureDate: flight.departureDate?.slice(0, 10), arrivalDate: flight.arrivalDate?.slice(0, 10) }); setOpen(true); }}>Edit</button>
                    <button className="text-red-600" onClick={async () => { await adminService.cancelFlight(flight._id); load(); }}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={open} title={editing ? 'Edit flight' : 'Create flight'} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(save)} className="grid max-h-[70vh] gap-3 overflow-y-auto sm:grid-cols-2">
          <input className="input" placeholder="Flight number" {...register('flightNumber', { required: true })} />
          <select className="input" {...register('airline', { required: true })}>
            <option value="">Airline</option>
            {lookups.airlines.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>
          <select className="input" {...register('aircraft', { required: true })}>
            <option value="">Aircraft</option>
            {lookups.aircraft.map((a) => <option key={a._id} value={a._id}>{a.model}</option>)}
          </select>
          <select className="input" {...register('departureAirport', { required: true })}>
            <option value="">From</option>
            {lookups.airports.map((a) => <option key={a._id} value={a._id}>{a.code}</option>)}
          </select>
          <select className="input" {...register('arrivalAirport', { required: true })}>
            <option value="">To</option>
            {lookups.airports.map((a) => <option key={a._id} value={a._id}>{a.code}</option>)}
          </select>
          <input className="input" type="date" {...register('departureDate', { required: true })} />
          <input className="input" type="time" {...register('departureTime', { required: true })} />
          <input className="input" type="date" {...register('arrivalDate', { required: true })} />
          <input className="input" type="time" {...register('arrivalTime', { required: true })} />
          <input className="input" placeholder="Duration minutes" {...register('duration', { required: true })} />
          <input className="input" placeholder="Economy price" {...register('economyPrice', { required: true })} />
          <input className="input" placeholder="Business price" {...register('businessPrice', { required: true })} />
          <input className="input" placeholder="First price" {...register('firstClassPrice', { required: true })} />
          <input className="input" placeholder="Available seats" {...register('availableSeats', { required: true })} />
          <button className="btn-primary sm:col-span-2">Save flight</button>
        </form>
      </Modal>
    </div>
  );
}
