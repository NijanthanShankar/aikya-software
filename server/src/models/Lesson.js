const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['video', 'text', 'quiz'], default: 'video' },
  videoUrl: String,
  videoKey: String,
  duration: { type: Number, default: 0 },
  content: String,
  order: { type: Number, default: 0 },
  isFreePreview: { type: Boolean, default: false },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; } } });

module.exports = mongoose.model('Lesson', lessonSchema);
