const router = require('express').Router({ mergeParams: true });
const { createLesson, getLessonContent, updateLesson, deleteLesson, streamVideo } = require('../controllers/lessonController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadVideo } = require('../middleware/upload');

const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth) return authenticate(req, res, next);
  next();
};

router.post('/', authenticate, authorize('instructor', 'admin'), uploadVideo, createLesson);
router.get('/:id', optionalAuth, getLessonContent);
router.get('/:id/stream', optionalAuth, streamVideo);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), uploadVideo, updateLesson);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteLesson);

module.exports = router;
