const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const {
  createSession,
  getSessions,
  getSessionByMeetingId,
  getInstructorSessions,
  startSession,
  endSession,
  deleteSession,
  updateSession,
} = require('../controllers/liveController');

// GET /api/live — public, no auth required
router.get('/', getSessions);

// GET /api/live/my — instructor/admin only (must be before /:meetingId)
router.get('/my', authenticate, authorize('instructor', 'admin'), getInstructorSessions);

// GET /api/live/:meetingId — public
router.get('/:meetingId', getSessionByMeetingId);

// POST /api/live — instructor/admin only
router.post('/', authenticate, authorize('instructor', 'admin'), createSession);

// PATCH /api/live/:id/start — authenticated
router.patch('/:id/start', authenticate, startSession);

// PATCH /api/live/:id/end — authenticated
router.patch('/:id/end', authenticate, endSession);

// PATCH /api/live/:id — instructor/admin only
router.patch('/:id', authenticate, authorize('instructor', 'admin'), updateSession);

// DELETE /api/live/:id — instructor/admin only
router.delete('/:id', authenticate, authorize('instructor', 'admin'), deleteSession);

module.exports = router;
