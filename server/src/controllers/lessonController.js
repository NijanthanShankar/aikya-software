const path = require('path');
const fs = require('fs');
const { Lesson, Module, Course, Enrollment, Progress } = require('../models');

exports.createLesson = async (req, res) => {
  try {
    const module = await Module.findByPk(req.params.moduleId, {
      include: [{ model: Course, attributes: ['id', 'instructorId'] }],
    });
    if (!module) return res.status(404).json({ message: 'Module not found' });
    if (module.Course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const count = await Lesson.count({ where: { moduleId: module.id } });
    const lessonData = {
      ...req.body,
      moduleId: module.id,
      courseId: module.courseId,
      order: req.body.order ?? count,
    };

    if (req.file) {
      lessonData.videoKey = req.file.filename;
      lessonData.videoUrl = `/uploads/videos/${req.file.filename}`;
    }

    const lesson = await Lesson.create(lessonData);

    await Course.increment('totalLessons', { by: 1, where: { id: module.courseId } });

    res.status(201).json({ lesson });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLessonContent = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    if (!lesson.isFreePreview) {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId: lesson.courseId } });
      const isInstructor = (await Course.findByPk(lesson.courseId)).instructorId === req.user.id;
      if (!enrollment && !isInstructor && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Enroll in this course to access this lesson' });
      }
    }

    res.json({ lesson });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{ model: Course, attributes: ['instructorId'] }],
    });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    if (lesson.Course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updates = { ...req.body };
    if (req.file) {
      if (lesson.videoKey) {
        const oldPath = path.join(__dirname, '../../uploads/videos', lesson.videoKey);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updates.videoKey = req.file.filename;
      updates.videoUrl = `/uploads/videos/${req.file.filename}`;
    }

    await lesson.update(updates);
    res.json({ lesson });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id, {
      include: [{ model: Course, attributes: ['instructorId', 'id'] }],
    });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    if (lesson.Course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (lesson.videoKey) {
      const filePath = path.join(__dirname, '../../uploads/videos', lesson.videoKey);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await lesson.destroy();
    await Course.decrement('totalLessons', { by: 1, where: { id: lesson.courseId } });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.streamVideo = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson || !lesson.videoKey) return res.status(404).json({ message: 'Video not found' });

    if (!lesson.isFreePreview) {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId: lesson.courseId } });
      const isInstructor = (await Course.findByPk(lesson.courseId)).instructorId === req.user.id;
      if (!enrollment && !isInstructor && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const videoPath = path.join(__dirname, '../../uploads/videos', lesson.videoKey);
    if (!fs.existsSync(videoPath)) return res.status(404).json({ message: 'Video file not found' });

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      fs.createReadStream(videoPath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Length': fileSize, 'Content-Type': 'video/mp4' });
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
