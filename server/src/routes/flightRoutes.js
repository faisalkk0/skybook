const router = require('express').Router();
const flightController = require('../controllers/flightController');

router.get('/search', flightController.search);
router.get('/:id/seats', flightController.getSeats);
router.post('/:id/quote', flightController.quoteFare);
router.get('/:id', flightController.getFlight);

module.exports = router;
