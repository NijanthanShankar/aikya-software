const { LiveSession, User } = require('../models');
const { Op } = require('sequelize');

// POST /api/live
const createSession = async (req, res) => {
  try {
    const { title, description, scheduledAt, duration, maxParticipants, courseId, isPublic } = req.body;

    const session = await LiveSession.create({
      title,
      description,
      scheduledAt,
      duration,
      maxParticipants,
      courseId: courseId || null,
      instructorId: req.user.id,
      isPublic: isPublic !== undefined ? isPublic : true,
    });

    res.status(201).json({ message: 'Live session created', session });
  } catch (err) {
    console.error('createSession error:', err);
    res.status(500).json({ message: 'Failed to create session', error: err.message });
  }
};

// GET /api/live
const getSessions = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const where = {};

    if (status && ['scheduled', 'live', 'ended'].includes(status)) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.scheduledAt = { [Op.gte]: new Date() };
      if (!where.status) where.status = 'scheduled';
    }

    const sessions = await LiveSession.findAll({
      where,
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['scheduledAt', 'ASC']],
    });

    res.json({ sessions });
  } catch (err) {
    console.error('getSessions error:', err);
    res.status(500).json({ message: 'Failed to fetch sessions', error: err.message });
  }
};

// GET /api/live/:meetingId
const getSessionByMeetingId = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const session = await LiveSession.findOne({
      where: { meetingId },
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (err) {
    console.error('getSessionByMeetingId error:', err);
    res.status(500).json({ message: 'Failed to fetch session', error: err.message });
  }
};

// GET /api/live/my
const getInstructorSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.findAll({
      where: { instructorId: req.user.id },
      include: [
        {
          model: User,
          as: 'instructor',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['scheduledAt', 'DESC']],
    });

    res.json({ sessions });
  } catch (err) {
    console.error('getInstructorSessions error:', err);
    res.status(500).json({ message: 'Failed to fetch sessions', error: err.message });
  }
};

// PATCH /api/live/:id/start
const startSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await LiveSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to start this session' });
    }

    await session.update({ status: 'live' });
    res.json({ message: 'Session started', session });
  } catch (err) {
    console.error('startSession error:', err);
    res.status(500).json({ message: 'Failed to start session', error: err.message });
  }
};

// PATCH /api/live/:id/end
const endSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await LiveSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.instructorId !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to end this session' });
    }

    await session.update({ status: 'ended' });
    res.json({ message: 'Session ended', session });
  } catch (err) {
    console.error('endSession error:', err);
    res.status(500).json({ message: 'Failed to end session', error: err.message });
  }
};

// DELETE /api/live/:id
const deleteSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await LiveSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this session' });
    }

    await session.destroy();
    res.json({ message: 'Session deleted' });
  } catch (err) {
    console.error('deleteSession error:', err);
    res.status(500).json({ message: 'Failed to delete session', error: err.message });
  }
};

// PATCH /api/live/:id
const updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, scheduledAt, duration, maxParticipants, courseId, isPublic } = req.body;

    const session = await LiveSession.findByPk(id);
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (scheduledAt !== undefined) updates.scheduledAt = scheduledAt;
    if (duration !== undefined) updates.duration = duration;
    if (maxParticipants !== undefined) updates.maxParticipants = maxParticipants;
    if (courseId !== undefined) updates.courseId = courseId;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    await session.update(updates);
    res.json({ message: 'Session updated', session });
  } catch (err) {
    console.error('updateSession error:', err);
    res.status(500).json({ message: 'Failed to update session', error: err.message });
  }
};

module.exports = {
  createSession,
  getSessions,
  getSessionByMeetingId,
  getInstructorSessions,
  startSession,
  endSession,
  deleteSession,
  updateSession,
};
