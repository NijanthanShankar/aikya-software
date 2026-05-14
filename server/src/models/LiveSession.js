const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
const sequelize = require('../config/database');

const LiveSession = sequelize.define('LiveSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  scheduledAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'live', 'ended'),
    defaultValue: 'scheduled',
  },
  meetingId: {
    type: DataTypes.STRING(100),
    unique: true,
    defaultValue: () => uuidv4(),
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  instructorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
}, {
  tableName: 'live_sessions',
  timestamps: true,
});

module.exports = LiveSession;
