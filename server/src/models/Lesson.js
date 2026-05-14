const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Lesson = sequelize.define('Lesson', {
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
  type: {
    type: DataTypes.ENUM('video', 'text', 'quiz'),
    defaultValue: 'video',
  },
  videoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  videoKey: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Local file path or storage key',
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Duration in seconds',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'For text-type lessons',
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  isFreePreview: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  moduleId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'lessons',
});

module.exports = Lesson;
