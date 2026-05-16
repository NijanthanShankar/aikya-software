const { Module, Lesson, Course } = require('../models');

exports.createModule = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const count = await Module.countDocuments({ courseId: course._id });
    const module = await Module.create({ ...req.body, courseId: course._id, order: req.body.order ?? count });
    res.status(201).json({ module });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    const course = await Course.findById(module.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    Object.assign(module, req.body);
    await module.save();
    res.json({ module });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteModule = async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    const course = await Course.findById(module.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await module.deleteOne();
    res.json({ message: 'Module deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reorderModules = async (req, res) => {
  try {
    const { order } = req.body;
    await Promise.all(order.map(({ id, order: o }) => Module.findByIdAndUpdate(id, { order: o })));
    res.json({ message: 'Modules reordered' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
