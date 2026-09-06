const router = require('express').Router();
const multer = require('multer');
const airlineController = require('../controllers/airlineController');
const { protect, adminOnly } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 3 * 1024 * 1024 } });

router.get('/public', airlineController.listPublic);
router.get('/', protect, adminOnly, airlineController.listAirlines);
router.post('/', protect, adminOnly, airlineController.createAirline);
router.patch('/:id', protect, adminOnly, airlineController.updateAirline);
router.delete('/:id', protect, adminOnly, airlineController.deleteAirline);
router.post('/:id/logo', protect, adminOnly, upload.single('logo'), airlineController.uploadLogo);

module.exports = router;
