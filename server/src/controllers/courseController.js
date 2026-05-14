const { Op } = require('sequelize');
const slugify = require('../utils/slugify');
const { Course, Module, Lesson, Enrollment, User } = require('../models');

exports.getAllCourses = async (req, res) => {
  try {
    const { search, category, level, page = 1, limit = 12, sort = 'createdAt' } = req.query;
    const where = { status: 'published' };

    if (search) where.title = { [Op.like]: `%${search}%` };
    if (category) where.category = category;
    if (level) where.level = level;

    const sortMap = {
      createdAt: [['createdAt', 'DESC']],
      popular: [['totalEnrollments', 'DESC']],
      rating: [['rating', 'DESC']],
      price_asc: [['price', 'ASC']],
      price_desc: [['price', 'DESC']],
    };

    const { count, rows } = await Course.findAndCountAll({
      where,
      include: [{ model: User, as: 'instructor', attributes: ['id', 'name', 'avatar'] }],
      order: sortMap[sort] || sortMap.createdAt,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
    });

    res.json({
      courses: rows,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit)),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { slug: req.params.slug },
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name', 'avatar', 'bio'] },
        {
          model: Module, as: 'modules',
          include: [{
            model: Lesson, as: 'lessons',
            attributes: ['id', 'title', 'type', 'duration', 'isFreePreview', 'order'],
            order: [['order', 'ASC']],
          }],
          order: [['order', 'ASC']],
        },
      ],
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId: course.id } });
      isEnrolled = !!enrollment;
    }

    res.json({ course, isEnrolled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id, {
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'name', 'avatar', 'bio'] },
        {
          model: Module, as: 'modules',
          include: [{
            model: Lesson, as: 'lessons',
            order: [['order', 'ASC']],
          }],
          order: [['order', 'ASC']],
        },
      ],
    });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, shortDescription, price, discountPrice, category, level, language, isFree } = req.body;
    const slug = await generateUniqueSlug(title);

    const course = await Course.create({
      title, description, shortDescription, price: price || 0,
      discountPrice: discountPrice || null, category, level, language,
      isFree: isFree === 'true' || isFree === true,
      slug, instructorId: req.user.id,
      thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : null,
    });

    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = { ...req.body };
    if (req.file) updates.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    if (updates.title && updates.title !== course.title) {
      updates.slug = await generateUniqueSlug(updates.title);
    }

    await course.update(updates);
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await course.destroy();
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      where: { instructorId: req.user.id },
      order: [['createdAt', 'DESC']],
    });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.publishCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await course.update({ status: course.status === 'published' ? 'draft' : 'published' });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function generateUniqueSlug(title) {
  let slug = slugify(title);
  let count = 0;
  while (await Course.findOne({ where: { slug: count ? `${slug}-${count}` : slug } })) {
    count++;
  }
  return count ? `${slug}-${count}` : slug;
}
