const router = require('express').Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/flights', require('./flightRoutes'));
router.use('/airports', require('./airportRoutes'));
router.use('/airlines', require('./airlineRoutes'));
router.use('/aircraft', require('./aircraftRoutes'));
router.use('/bookings', require('./bookingRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/admin', require('./adminRoutes'));

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'SkyBook API is running', data: { time: new Date().toISOString() } });
});

module.exports = router;
