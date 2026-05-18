const path = require('path');
const fs = require('fs');
const { Lesson, Module, Course, Enrollment } = require('../models');

exports.createLesson = async (req, res) => {
  try {
    const module = await Module.findById(req.params.moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });
    const course = await Course.findById(module.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const count = await Lesson.countDocuments({ moduleId: module._id });
    const lessonData = { ...req.body, moduleId: module._id, courseId: module.courseId, order: req.body.order ?? count };
    if (req.file) {
      lessonData.videoKey = req.file.filename;
      lessonData.videoUrl = `/uploads/videos/${req.file.filename}`;
    }
    const lesson = await Lesson.create(lessonData);
    await Course.findByIdAndUpdate(module.courseId, { $inc: { totalLessons: 1 } });
    res.status(201).json({ lesson });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getLessonContent = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    if (!lesson.isFreePreview) {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: lesson.courseId });
      const course = await Course.findById(lesson.courseId);
      const isInstructor = course.instructor.toString() === req.user.id;
      if (!enrollment && !isInstructor && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Enroll in this course to access this lesson' });
      }
      if (enrollment && enrollment.expiresAt && enrollment.expiresAt < new Date()) {
        return res.status(403).json({ message: 'Your access to this course has expired' });
      }
    }
    res.json({ lesson });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    const course = await Course.findById(lesson.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (req.file) {
      if (lesson.videoKey) {
        const oldPath = path.join(__dirname, '../../uploads/videos', lesson.videoKey);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      req.body.videoKey = req.file.filename;
      req.body.videoUrl = `/uploads/videos/${req.file.filename}`;
    }
    Object.assign(lesson, req.body);
    await lesson.save();
    res.json({ lesson });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    const course = await Course.findById(lesson.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    if (lesson.videoKey) {
      const filePath = path.join(__dirname, '../../uploads/videos', lesson.videoKey);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    await lesson.deleteOne();
    await Course.findByIdAndUpdate(lesson.courseId, { $inc: { totalLessons: -1 } });
    res.json({ message: 'Lesson deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.streamVideo = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson || !lesson.videoKey) return res.status(404).json({ message: 'Video not found' });
    if (!lesson.isFreePreview) {
      if (!req.user) return res.status(401).json({ message: 'Authentication required' });
      const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: lesson.courseId });
      const course = await Course.findById(lesson.courseId);
      const isInstructor = course.instructor.toString() === req.user.id;
      if (!enrollment && !isInstructor && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
      if (enrollment && enrollment.expiresAt && enrollment.expiresAt < new Date()) {
        return res.status(403).json({ message: 'Your access to this course has expired' });
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
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': end - start + 1,
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
