const slugify = require('../utils/slugify');
const { Course, Module, Lesson, Enrollment } = require('../models');

exports.getAllCourses = async (req, res) => {
  try {
    const { search, category, level, page = 1, limit = 12, sort = 'createdAt' } = req.query;
    const where = { status: 'published' };

    if (search) where.title = { $regex: search, $options: 'i' };
    if (category) where.category = category;
    if (level) where.level = level;

    const sortMap = {
      createdAt: { createdAt: -1 },
      popular: { totalEnrollments: -1 },
      rating: { rating: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [courses, count] = await Promise.all([
      Course.find(where)
        .populate('instructor', 'id name avatar')
        .sort(sortMap[sort] || sortMap.createdAt)
        .skip(skip)
        .limit(parseInt(limit)),
      Course.countDocuments(where),
    ]);

    res.json({ courses, total: count, page: parseInt(page), totalPages: Math.ceil(count / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseBySlug = async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug })
      .populate('instructor', 'id name avatar bio');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const modules = await Module.find({ courseId: course._id }).sort({ order: 1 });
    const lessons = await Lesson.find({ courseId: course._id })
      .select('id title type duration isFreePreview order moduleId')
      .sort({ order: 1 });

    const modulesWithLessons = modules.map((m) => ({
      ...m.toJSON(),
      lessons: lessons.filter((l) => l.moduleId.toString() === m._id.toString()),
    }));

    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: course._id });
      isEnrolled = !!enrollment;
    }

    res.json({ course: { ...course.toJSON(), modules: modulesWithLessons }, isEnrolled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'id name avatar bio');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const modules = await Module.find({ courseId: course._id }).sort({ order: 1 });
    const lessons = await Lesson.find({ courseId: course._id }).sort({ order: 1 });

    const modulesWithLessons = modules.map((m) => ({
      ...m.toJSON(),
      lessons: lessons.filter((l) => l.moduleId.toString() === m._id.toString()),
    }));

    res.json({ course: { ...course.toJSON(), modules: modulesWithLessons } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, description, shortDescription, price, discountPrice, category, level, language, isFree } = req.body;
    const slug = await generateUniqueSlug(title);

    const course = await Course.create({
      title, description, shortDescription,
      price: price || 0,
      discountPrice: discountPrice || undefined,
      category, level, language,
      isFree: isFree === 'true' || isFree === true,
      slug,
      instructor: req.user._id,
      thumbnail: req.file ? `/uploads/thumbnails/${req.file.filename}` : undefined,
    });

    res.status(201).json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = { ...req.body };
    if (req.file) updates.thumbnail = `/uploads/thumbnails/${req.file.filename}`;
    if (updates.title && updates.title !== course.title) {
      updates.slug = await generateUniqueSlug(updates.title);
    }

    Object.assign(course, updates);
    await course.save();
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    await course.deleteOne();
    res.json({ message: 'Course deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    course.status = course.status === 'published' ? 'draft' : 'published';
    await course.save();
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

async function generateUniqueSlug(title) {
  let slug = slugify(title);
  let count = 0;
  while (await Course.findOne({ slug: count ? `${slug}-${count}` : slug })) {
    count++;
  }
  return count ? `${slug}-${count}` : slug;
}
