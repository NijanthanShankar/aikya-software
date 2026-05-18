const { Enrollment, Course, Progress } = require('../models');

exports.enrollFree = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!course.isFree && course.price > 0) {
      return res.status(400).json({ message: 'This course requires payment to enroll' });
    }
    const existing = await Enrollment.findOne({ userId: req.user._id, courseId: course._id });
    if (existing) return res.status(400).json({ message: 'Already enrolled' });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);
    const enrollment = await Enrollment.create({ userId: req.user._id, courseId: course._id, expiresAt });
    await Course.findByIdAndUpdate(course._id, { $inc: { totalEnrollments: 1 } });
    res.status(201).json({ enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user._id, status: 'active' })
      .populate({ path: 'courseId', populate: { path: 'instructor', select: 'id name avatar' } })
      .sort({ enrolledAt: -1 });

    const withProgress = await Promise.all(enrollments.map(async (e) => {
      const course = e.courseId;
      const completedLessons = await Progress.countDocuments({
        userId: req.user._id, courseId: course._id, completed: true,
      });
      const data = e.toJSON();
      data.Course = data.courseId;
      delete data.courseId;
      return {
        ...data,
        progressPercent: course.totalLessons > 0 ? Math.round((completedLessons / course.totalLessons) * 100) : 0,
      };
    }));

    res.json({ enrollments: withProgress });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: req.params.courseId });
    res.json({ isEnrolled: !!enrollment, enrollment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
