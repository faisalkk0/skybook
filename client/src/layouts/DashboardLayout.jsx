import { Link, NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, Plane, UserRound } from 'lucide-react';

const items = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/bookings', label: 'My bookings', icon: CalendarDays },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound },
];

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container-page grid gap-6 py-8 lg:grid-cols-[240px_1fr]">
        <aside className="card h-fit p-4">
          <Link to="/" className="mb-4 flex items-center gap-2 font-bold text-navy-800">
            <Plane size={18} /> SkyBook
          </Link>
          <nav className="flex flex-col gap-1">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
