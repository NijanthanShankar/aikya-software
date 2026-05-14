const router = require('express').Router();
const { enrollFree, getMyEnrollments, checkEnrollment } = require('../controllers/enrollmentController');
const { authenticate } = require('../middleware/auth');

router.post('/courses/:courseId/enroll', authenticate, enrollFree);
router.get('/my', authenticate, getMyEnrollments);
router.get('/courses/:courseId/check', authenticate, checkEnrollment);

module.exports = router;
