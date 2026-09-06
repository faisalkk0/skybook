import { Link, NavLink, Outlet } from 'react-router-dom';
import { Building2, CalendarRange, LayoutDashboard, Plane, PlaneTakeoff, Ticket, Users } from 'lucide-react';

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/flights', label: 'Flights', icon: PlaneTakeoff },
  { to: '/admin/airports', label: 'Airports', icon: Building2 },
  { to: '/admin/airlines', label: 'Airlines', icon: Plane },
  { to: '/admin/aircraft', label: 'Aircraft', icon: Plane },
  { to: '/admin/bookings', label: 'Bookings', icon: Ticket },
  { to: '/admin/payments', label: 'Payments', icon: CalendarRange },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[240px_1fr]">
        <aside className="bg-navy-800 p-5 text-white">
          <Link to="/" className="mb-6 block text-lg font-extrabold">
            SkyBook Admin
          </Link>
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                    isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section className="p-4 sm:p-8">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
