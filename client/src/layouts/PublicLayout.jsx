import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, Plane, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/', label: 'Home' },
  { to: '/flights', label: 'Flights' },
];

export default function PublicLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-navy-800">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy-800 text-sky-400">
              <Plane size={18} />
            </span>
            SkyBook
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? 'text-sky-600' : 'text-slate-600 hover:text-navy-800'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-medium text-slate-600 hover:text-navy-800">
                  My trips
                </Link>
                {isAdmin ? (
                  <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-navy-800">
                    Admin
                  </Link>
                ) : null}
                <button
                  type="button"
                  className="btn-outline"
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Create account
                </Link>
              </>
            )}
          </nav>
          <button type="button" className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open ? (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)}>
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  Hello, {user.firstName}
                </Link>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)}>
                  Sign in
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="mt-16 border-t border-slate-200 bg-navy-800 text-slate-200">
        <div className="container-page grid gap-8 py-12 md:grid-cols-4">
          <div>
            <p className="text-lg font-bold text-white">SkyBook</p>
            <p className="mt-2 text-sm text-slate-300">Modern flight booking for routes across Asia, the Middle East, and Europe.</p>
          </div>
          <div>
            <p className="font-semibold text-white">Travel</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>Search flights</li>
              <li>Manage bookings</li>
              <li>E-tickets</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Support</p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>help@skybook.dev</li>
              <li>Cancellation policy</li>
              <li>Baggage guide</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-white">Offices</p>
            <p className="mt-3 text-sm">Islamabad · Dubai · Doha · Istanbul · London</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} SkyBook. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
