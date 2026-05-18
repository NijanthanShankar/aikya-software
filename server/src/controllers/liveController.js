const { LiveSession, User, Lesson, Module, Course } = require('../models');

const createSession = async (req, res) => {
  try {
    const { title, description, scheduledAt, duration, maxParticipants, courseId, isPublic } = req.body;
    const session = await LiveSession.create({
      title, description, scheduledAt, duration, maxParticipants,
      courseId: courseId || undefined,
      instructor: req.user._id,
      isPublic: isPublic !== undefined ? isPublic : true,
    });
    res.status(201).json({ message: 'Live session created', session });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create session', error: err.message });
  }
};

const getSessions = async (req, res) => {
  try {
    const { status, upcoming } = req.query;
    const where = {};
    if (status && ['scheduled', 'live', 'ended'].includes(status)) where.status = status;
    if (upcoming === 'true') {
      where.scheduledAt = { $gte: new Date() };
      if (!where.status) where.status = 'scheduled';
    }
    const sessions = await LiveSession.find(where)
      .populate('instructor', 'id name avatar')
      .sort({ scheduledAt: 1 });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: err.message });
  }
};

const getSessionByMeetingId = async (req, res) => {
  try {
    const session = await LiveSession.findOne({ meetingId: req.params.meetingId })
      .populate('instructor', 'id name avatar');
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json({ session });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch session', error: err.message });
  }
};

const getInstructorSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.find({ instructor: req.user._id })
      .populate('instructor', 'id name avatar')
      .sort({ scheduledAt: -1 });
    res.json({ sessions });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch sessions', error: err.message });
  }
};

const startSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    session.status = 'live';
    await session.save();
    res.json({ message: 'Session started', session });
  } catch (err) {
    res.status(500).json({ message: 'Failed to start session', error: err.message });
  }
};

const endSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.instructor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    session.status = 'ended';
    const { recordingUrl } = req.body;
    if (recordingUrl) session.recordingUrl = recordingUrl;
    await session.save();

    // Auto-add recording as a lesson if session is linked to a course
    if (recordingUrl && session.courseId && !session.recordingAddedToCourse) {
      try {
        let module = await Module.findOne({ courseId: session.courseId, title: 'Live Session Recordings' });
        if (!module) {
          const count = await Module.countDocuments({ courseId: session.courseId });
          module = await Module.create({
            title: 'Live Session Recordings',
            courseId: session.courseId,
            order: count,
          });
        }
        const lessonCount = await Lesson.countDocuments({ moduleId: module._id });
        await Lesson.create({
          title: session.title,
          description: session.description || `Recording of live session on ${new Date(session.scheduledAt).toLocaleDateString()}`,
          type: 'video',
          videoUrl: recordingUrl,
          moduleId: module._id,
          courseId: session.courseId,
          order: lessonCount,
        });
        await Course.findByIdAndUpdate(session.courseId, { $inc: { totalLessons: 1 } });
        session.recordingAddedToCourse = true;
        await session.save();
      } catch (lessonErr) {
        console.error('Failed to auto-add recording as lesson:', lessonErr.message);
      }
    }

    res.json({ message: 'Session ended', session });
  } catch (err) {
    res.status(500).json({ message: 'Failed to end session', error: err.message });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await session.deleteOne();
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete session', error: err.message });
  }
};

const updateSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (session.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const fields = ['title', 'description', 'scheduledAt', 'duration', 'maxParticipants', 'courseId', 'isPublic'];
    fields.forEach((f) => { if (req.body[f] !== undefined) session[f] = req.body[f]; });
    await session.save();
    res.json({ message: 'Session updated', session });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update session', error: err.message });
  }
};

module.exports = { createSession, getSessions, getSessionByMeetingId, getInstructorSessions, startSession, endSession, deleteSession, updateSession };
