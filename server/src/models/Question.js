const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['single', 'multiple', 'true_false'], default: 'single' },
  options: { type: Array, required: true },
  explanation: String,
  order: { type: Number, default: 0 },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
}, { timestamps: true, toJSON: { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; } } });

module.exports = mongoose.model('Question', questionSchema);
