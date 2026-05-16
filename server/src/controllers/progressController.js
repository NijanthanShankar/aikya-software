const { Progress, Lesson, Enrollment } = require('../models');

exports.markLessonComplete = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: lesson.courseId });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

    let progress = await Progress.findOne({ userId: req.user._id, lessonId });
    if (!progress) {
      progress = await Progress.create({
        userId: req.user._id, lessonId, courseId: lesson.courseId, completed: true, completedAt: new Date(),
      });
    } else if (!progress.completed) {
      progress.completed = true;
      progress.completedAt = new Date();
      await progress.save();
    }

    const [totalLessons, completedLessons] = await Promise.all([
      Lesson.countDocuments({ courseId: lesson.courseId }),
      Progress.countDocuments({ userId: req.user._id, courseId: lesson.courseId, completed: true }),
    ]);

    if (totalLessons > 0 && completedLessons >= totalLessons) {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
      await enrollment.save();
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
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    let progress = await Progress.findOne({ userId: req.user._id, lessonId });
    if (!progress) {
      progress = await Progress.create({ userId: req.user._id, lessonId, courseId: lesson.courseId, watchedSeconds });
    } else if (progress.watchedSeconds < watchedSeconds) {
      const autoComplete = lesson.duration > 0 && watchedSeconds >= lesson.duration * 0.9;
      progress.watchedSeconds = watchedSeconds;
      if (!progress.completed && autoComplete) {
        progress.completed = true;
        progress.completedAt = new Date();
      }
      await progress.save();
    }

    res.json({ progress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled' });

    const [allProgress, totalLessons] = await Promise.all([
      Progress.find({ userId: req.user._id, courseId }),
      Lesson.countDocuments({ courseId }),
    ]);
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
