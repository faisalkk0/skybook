const router = require('express').Router();
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const { registerRules, loginRules } = require('../validators/authValidator');

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', authController.logout);
router.get('/me', protect, authController.me);
router.post('/refresh', authController.refresh);

module.exports = router;
