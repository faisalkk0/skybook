const router = require('express').Router();
const multer = require('multer');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { passwordRules } = require('../validators/authValidator');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 3 * 1024 * 1024 },
});

router.use(protect);
router.patch('/me', userController.updateProfile);
router.patch('/me/password', passwordRules, validate, userController.changePassword);
router.post('/me/avatar', upload.single('avatar'), userController.uploadAvatar);

module.exports = router;
