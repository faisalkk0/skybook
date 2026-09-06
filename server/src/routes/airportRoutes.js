const router = require('express').Router();
const airportController = require('../controllers/airportController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/search', airportController.searchAirports);
router.get('/', airportController.listAirports);
router.post('/', protect, adminOnly, airportController.createAirport);
router.patch('/:id', protect, adminOnly, airportController.updateAirport);
router.delete('/:id', protect, adminOnly, airportController.deleteAirport);

module.exports = router;
