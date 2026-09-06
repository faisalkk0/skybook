const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { bookingRules } = require('../validators/bookingValidator');

router.use(protect);
router.get('/dashboard', bookingController.dashboardStats);
router.post('/', bookingRules, validate, bookingController.create);
router.get('/', bookingController.listMine);
router.get('/:id', bookingController.getMine);
router.post('/:id/cancel', bookingController.cancelMine);
router.get('/:id/ticket', bookingController.downloadTicket);
router.post('/:id/email-ticket', bookingController.emailTicket);

module.exports = router;
