const router = require('express').Router();
const { register, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/upload');

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, uploadThumbnail, updateProfile);
router.patch('/change-password', authenticate, changePassword);

module.exports = router;
