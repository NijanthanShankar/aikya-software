const { Module, Lesson, Course } = require('../models');

exports.createModule = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const count = await Module.count({ where: { courseId: course.id } });
    const module = await Module.create({
      ...req.body,
      courseId: course.id,
      order: req.body.order ?? count,
    });
    res.status(201).json({ module });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, {
      include: [{ model: Course, attributes: ['instructorId'] }],
    });
    if (!module) return res.status(404).json({ message: 'Module not found' });
    if (module.Course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await module.update(req.body);
    res.json({ module });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.id, {
      include: [{ model: Course, attributes: ['instructorId'] }],
    });
    if (!module) return res.status(404).json({ message: 'Module not found' });
    if (module.Course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await module.destroy();
    res.json({ message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reorderModules = async (req, res) => {
  try {
    const { order } = req.body;
    await Promise.all(order.map(({ id, order: o }) => Module.update({ order: o }, { where: { id } })));
    res.json({ message: 'Modules reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
