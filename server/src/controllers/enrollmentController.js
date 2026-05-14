const { Enrollment, Course, Lesson, Progress } = require('../models');

exports.enrollFree = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.isFree && course.price > 0) {
      return res.status(400).json({ message: 'This course requires payment to enroll' });
    }

    const [enrollment, created] = await Enrollment.findOrCreate({
      where: { userId: req.user.id, courseId: course.id },
      defaults: { userId: req.user.id, courseId: course.id },
    });

    if (!created) return res.status(400).json({ message: 'Already enrolled' });

    await Course.increment('totalEnrollments', { by: 1, where: { id: course.id } });
    res.status(201).json({ enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { userId: req.user.id, status: 'active' },
      include: [{ model: Course, include: [{ association: 'instructor', attributes: ['id', 'name', 'avatar'] }] }],
      order: [['enrolledAt', 'DESC']],
    });

    const withProgress = await Promise.all(enrollments.map(async (e) => {
      const totalLessons = e.Course.totalLessons;
      const completedLessons = await Progress.count({
        where: { userId: req.user.id, courseId: e.courseId, completed: true },
      });
      return {
        ...e.toJSON(),
        progressPercent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    }));

    res.json({ enrollments: withProgress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId: req.params.courseId },
    });
    res.json({ isEnrolled: !!enrollment, enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
