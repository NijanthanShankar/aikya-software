const router = require('express').Router();
const { markLessonComplete, updateWatchTime, getCourseProgress } = require('../controllers/progressController');
const { authenticate } = require('../middleware/auth');

router.post('/lessons/:lessonId/complete', authenticate, markLessonComplete);
router.patch('/lessons/:lessonId/watch-time', authenticate, updateWatchTime);
router.get('/courses/:courseId', authenticate, getCourseProgress);

module.exports = router;
