const { Progress, Lesson, Enrollment, Course } = require('../models');

exports.markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId: lesson.courseId } });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

    const [progress, created] = await Progress.findOrCreate({
      where: { userId: req.user.id, lessonId },
      defaults: {
        userId: req.user.id,
        lessonId,
        courseId: lesson.courseId,
        completed: true,
        completedAt: new Date(),
      },
    });

    if (!created && !progress.completed) {
      await progress.update({ completed: true, completedAt: new Date() });
    }

    const totalLessons = await Lesson.count({ where: { courseId: lesson.courseId } });
    const completedLessons = await Progress.count({
      where: { userId: req.user.id, courseId: lesson.courseId, completed: true },
    });

    if (totalLessons > 0 && completedLessons >= totalLessons) {
      await enrollment.update({ status: 'completed', completedAt: new Date() });
    }

    res.json({
      progress,
      courseProgress: {
        completed: completedLessons,
        total: totalLessons,
        percent: Math.round((completedLessons / totalLessons) * 100),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateWatchTime = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { watchedSeconds } = req.body;

    const lesson = await Lesson.findByPk(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const [progress] = await Progress.findOrCreate({
      where: { userId: req.user.id, lessonId },
      defaults: { userId: req.user.id, lessonId, courseId: lesson.courseId, watchedSeconds },
    });

    if (progress.watchedSeconds < watchedSeconds) {
      const autoComplete = lesson.duration > 0 && watchedSeconds >= lesson.duration * 0.9;
      await progress.update({
        watchedSeconds,
        completed: progress.completed || autoComplete,
        completedAt: !progress.completed && autoComplete ? new Date() : progress.completedAt,
      });
    }

    res.json({ progress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId } });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled' });

    const allProgress = await Progress.findAll({ where: { userId: req.user.id, courseId } });
    const totalLessons = await Lesson.count({ where: { courseId } });
    const completedLessons = allProgress.filter((p) => p.completed).length;

    res.json({
      progress: allProgress,
      summary: {
        completed: completedLessons,
        total: totalLessons,
        percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        enrollmentStatus: enrollment.status,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
