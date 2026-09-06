const router = require('express').Router();
const adminController = require('../controllers/adminController');
const bookingController = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/overview', adminController.overview);
router.get('/lookups', adminController.lookups);
router.get('/users', adminController.listUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.get('/flights', adminController.listFlights);
router.post('/flights', adminController.createFlight);
router.patch('/flights/:id', adminController.updateFlight);
router.delete('/flights/:id', adminController.deleteFlight);
router.get('/bookings', adminController.listBookings);
router.get('/bookings/:id/ticket', bookingController.downloadTicket);
router.patch('/bookings/:id', adminController.updateBooking);
router.post('/bookings/:id/refund', adminController.refundBooking);
router.get('/payments', adminController.listPayments);

module.exports = router;
