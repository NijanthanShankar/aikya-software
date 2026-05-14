const router = require('express').Router({ mergeParams: true });
const { createModule, updateModule, deleteModule, reorderModules } = require('../controllers/moduleController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('instructor', 'admin'), createModule);
router.patch('/reorder', authenticate, authorize('instructor', 'admin'), reorderModules);
router.patch('/:id', authenticate, authorize('instructor', 'admin'), updateModule);
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteModule);

module.exports = router;
