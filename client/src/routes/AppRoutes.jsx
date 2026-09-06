import { Route, Routes } from 'react-router-dom';
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import HomePage from '../pages/public/HomePage';
import FlightsPage from '../pages/public/FlightsPage';
import FlightDetailsPage from '../pages/public/FlightDetailsPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import SeatSelectionPage from '../pages/booking/SeatSelectionPage';
import PassengerDetailsPage from '../pages/booking/PassengerDetailsPage';
import ReviewPage from '../pages/booking/ReviewPage';
import PaymentPage from '../pages/booking/PaymentPage';
import BookingSuccessPage from '../pages/booking/BookingSuccessPage';
import UserDashboardPage from '../pages/dashboard/UserDashboardPage';
import BookingsPage from '../pages/dashboard/BookingsPage';
import BookingDetailsPage from '../pages/dashboard/BookingDetailsPage';
import ProfilePage from '../pages/dashboard/ProfilePage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import AdminFlightsPage from '../pages/admin/AdminFlightsPage';
import AdminAirportsPage from '../pages/admin/AdminAirportsPage';
import AdminAirlinesPage from '../pages/admin/AdminAirlinesPage';
import AdminAircraftPage from '../pages/admin/AdminAircraftPage';
import AdminBookingsPage from '../pages/admin/AdminBookingsPage';
import AdminPaymentsPage from '../pages/admin/AdminPaymentsPage';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/flights" element={<FlightsPage />} />
        <Route path="/flights/:id" element={<FlightDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/booking/:flightId/seats" element={<SeatSelectionPage />} />
        <Route path="/booking/:flightId/passengers" element={<PassengerDetailsPage />} />
        <Route path="/booking/:flightId/review" element={<ReviewPage />} />
        <Route
          path="/payment/:bookingId"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking-success/:bookingId"
          element={
            <ProtectedRoute>
              <BookingSuccessPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/dashboard/bookings" element={<BookingsPage />} />
        <Route path="/dashboard/bookings/:id" element={<BookingDetailsPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
      </Route>

      <Route
        element={
          <ProtectedRoute admin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/flights" element={<AdminFlightsPage />} />
        <Route path="/admin/airports" element={<AdminAirportsPage />} />
        <Route path="/admin/airlines" element={<AdminAirlinesPage />} />
        <Route path="/admin/aircraft" element={<AdminAircraftPage />} />
        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        <Route path="/admin/payments" element={<AdminPaymentsPage />} />
      </Route>
    </Routes>
  );
}
