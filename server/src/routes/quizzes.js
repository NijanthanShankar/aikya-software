const router = require('express').Router();
const { createQuiz, addQuestion, getQuiz, submitQuiz, getMyAttempts } = require('../controllers/quizController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/lessons/:lessonId', authenticate, authorize('instructor', 'admin'), createQuiz);
router.post('/:quizId/questions', authenticate, authorize('instructor', 'admin'), addQuestion);
router.get('/lessons/:lessonId', authenticate, getQuiz);
router.post('/:quizId/submit', authenticate, submitQuiz);
router.get('/:quizId/my-attempts', authenticate, getMyAttempts);

module.exports = router;
