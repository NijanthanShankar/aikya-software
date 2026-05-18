const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const liveSessionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  scheduledAt: { type: Date, required: true },
  duration: { type: Number, default: 60 },
  status: { type: String, enum: ['scheduled', 'live', 'ended'], default: 'scheduled' },
  meetingId: { type: String, unique: true, default: () => uuidv4() },
  maxParticipants: { type: Number, default: 100 },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: true },
  recordingUrl: { type: String },
  recordingAddedToCourse: { type: Boolean, default: false },
}, { timestamps: true, toJSON: { virtuals: true, transform: (doc, ret) => { delete ret._id; delete ret.__v; return ret; } } });

module.exports = mongoose.model('LiveSession', liveSessionSchema);
