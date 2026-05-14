const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  slug: {
    type: DataTypes.STRING(300),
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  thumbnail: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'INR',
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    defaultValue: 'beginner',
  },
  language: {
    type: DataTypes.STRING(50),
    defaultValue: 'English',
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft',
  },
  isFree: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  totalDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: 'Total duration in seconds',
  },
  totalLessons: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00,
  },
  totalEnrollments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  instructorId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'courses',
});

module.exports = Course;
