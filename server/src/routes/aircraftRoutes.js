const router = require('express').Router();
const aircraftController = require('../controllers/aircraftController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);
router.get('/', aircraftController.listAircraft);
router.get('/:id', aircraftController.getAircraft);
router.post('/', aircraftController.createAircraft);
router.patch('/:id', aircraftController.updateAircraft);
router.delete('/:id', aircraftController.deleteAircraft);
router.post('/:id/seats', aircraftController.configureSeats);

module.exports = router;
