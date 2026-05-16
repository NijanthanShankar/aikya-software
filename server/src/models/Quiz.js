const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  passingScore: { type: Number, default: 60 },
  timeLimit: Number,
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true, unique: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; } } });

module.exports = mongoose.model('Quiz', quizSchema);
