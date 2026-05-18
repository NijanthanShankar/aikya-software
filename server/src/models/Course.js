const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  shortDescription: String,
  thumbnail: String,
  price: { type: Number, default: 0 },
  discountPrice: Number,
  currency: { type: String, default: 'INR' },
  category: String,
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  language: { type: String, default: 'English' },
  status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
  isFree: { type: Boolean, default: false },
  totalDuration: { type: Number, default: 0 },
  totalLessons: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  totalEnrollments: { type: Number, default: 0 },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  publishedAt: { type: Date },
}, { timestamps: true, toJSON: { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; } } });

module.exports = mongoose.model('Course', courseSchema);
