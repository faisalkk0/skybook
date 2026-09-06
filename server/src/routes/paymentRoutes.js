const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.get('/config', paymentController.config);
router.post('/:bookingId/intent', protect, paymentController.createIntent);
router.post('/:bookingId/confirm', protect, paymentController.confirm);

module.exports = router;
