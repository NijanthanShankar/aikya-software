const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: { type: Array, required: true },
  score: { type: Number, default: 0 },
  passed: { type: Boolean, default: false },
  timeTaken: Number,
  completedAt: { type: Date, default: Date.now },
}, { timestamps: true, toJSON: { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; } } });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
