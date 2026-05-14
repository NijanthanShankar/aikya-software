const router = require('express').Router();
const { initiatePayment, verifyPayment, handleCallback, getPaymentHistory } = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.post('/initiate', authenticate, initiatePayment);
router.get('/verify', authenticate, verifyPayment);
router.post('/callback', handleCallback);
router.get('/history', authenticate, getPaymentHistory);

module.exports = router;
