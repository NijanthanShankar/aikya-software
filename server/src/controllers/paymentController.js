const crypto = require('crypto');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { Payment, Enrollment, Course } = require('../models');

const PHONEPE_BASE_URL = {
  UAT: 'https://api-preprod.phonepe.com/apis/pg-sandbox',
  PROD: 'https://api.phonepe.com/apis/hermes',
};

function getPhonePeBase() {
  return PHONEPE_BASE_URL[process.env.PHONEPE_ENV] || PHONEPE_BASE_URL.UAT;
}

function generateChecksum(payload, saltKey, saltIndex) {
  const base64 = Buffer.from(JSON.stringify(payload)).toString('base64');
  const hash = crypto.createHash('sha256').update(`${base64}/pg/v1/pay${saltKey}`).digest('hex');
  return `${hash}###${saltIndex}`;
}

exports.initiatePayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const existingEnrollment = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (existingEnrollment) return res.status(400).json({ message: 'Already enrolled' });

    const amount = course.discountPrice || course.price;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Invalid course price' });

    const merchantTransactionId = `MT_${uuidv4().replace(/-/g, '').toUpperCase().slice(0, 30)}`;
    const payment = await Payment.create({
      userId: req.user._id, courseId, amount, currency: 'INR', merchantTransactionId, status: 'pending',
    });

    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: `USER_${req.user.id.slice(0, 20)}`,
      amount: Math.round(amount * 100),
      redirectUrl: `${process.env.CLIENT_URL}/payment/verify?txnId=${merchantTransactionId}`,
      redirectMode: 'REDIRECT',
      callbackUrl: `${process.env.CLIENT_URL}/api/payments/callback`,
      paymentInstrument: { type: 'PAY_PAGE' },
    };

    const checksum = generateChecksum(payload, process.env.PHONEPE_SALT_KEY, process.env.PHONEPE_SALT_INDEX);
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');

    const response = await axios.post(
      `${getPhonePeBase()}/pg/v1/pay`,
      { request: base64Payload },
      { headers: { 'Content-Type': 'application/json', 'X-VERIFY': checksum } }
    );

    const redirectUrl = response.data?.data?.instrumentResponse?.redirectInfo?.url;
    res.json({ redirectUrl, merchantTransactionId });
  } catch (err) {
    console.error('PhonePe initiate error:', err?.response?.data || err.message);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { txnId } = req.query;
    const payment = await Payment.findOne({ merchantTransactionId: txnId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const checksum =
      crypto.createHash('sha256')
        .update(`/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${txnId}${process.env.PHONEPE_SALT_KEY}`)
        .digest('hex') + `###${process.env.PHONEPE_SALT_INDEX}`;

    const response = await axios.get(
      `${getPhonePeBase()}/pg/v1/status/${process.env.PHONEPE_MERCHANT_ID}/${txnId}`,
      { headers: { 'Content-Type': 'application/json', 'X-VERIFY': checksum, 'X-MERCHANT-ID': process.env.PHONEPE_MERCHANT_ID } }
    );

    const data = response.data;
    const success = data.success && data.code === 'PAYMENT_SUCCESS';

    payment.status = success ? 'success' : 'failed';
    payment.phonepeTransactionId = data?.data?.transactionId;
    payment.paymentMethod = data?.data?.paymentInstrument?.type;
    payment.gatewayResponse = data;
    await payment.save();

    if (success) {
      const existing = await Enrollment.findOne({ userId: payment.userId, courseId: payment.courseId });
      if (!existing) {
        await Enrollment.create({ userId: payment.userId, courseId: payment.courseId, paymentId: payment._id });
        await Course.findByIdAndUpdate(payment.courseId, { $inc: { totalEnrollments: 1 } });
      }
    }

    res.json({ success, payment });
  } catch (err) {
    console.error('PhonePe verify error:', err?.response?.data || err.message);
    res.status(500).json({ message: 'Payment verification failed' });
  }
};

exports.handleCallback = async (req, res) => {
  res.status(200).json({ message: 'Callback received' });
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('courseId', 'id title thumbnail slug')
      .sort({ createdAt: -1 });
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
