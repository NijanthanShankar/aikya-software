const router = require('express').Router();
const {
  getAllCourses, getCourseBySlug, getCourseById, createCourse, updateCourse,
  deleteCourse, getInstructorCourses, publishCourse,
} = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');
const { uploadThumbnail } = require('../middleware/upload');

const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (auth) return authenticate(req, res, next);
  next();
};

router.get('/', getAllCourses);
router.get('/my-courses', authenticate, authorize('instructor', 'admin'), getInstructorCourses);
router.get('/:id/full', authenticate, authorize('instructor', 'admin'), getCourseById);
router.get('/:id/with-lessons', authenticate, getCourseById);
router.get('/:slug', optionalAuth, getCourseBySlug);
router.post('/', authenticate, authorize('instructor', 'admin'), uploadThumbnail, createCourse);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), uploadThumbnail, updateCourse);
router.patch('/:id/publish', authenticate, authorize('instructor', 'admin'), publishCourse);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteCourse);

module.exports = router;
