const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quiz = sequelize.define('Quiz', {
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
  passingScore: {
    type: DataTypes.INTEGER,
    defaultValue: 60,
    comment: 'Minimum percentage to pass',
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time limit in minutes, null = no limit',
  },
  lessonId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },
  courseId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'quizzes',
});

module.exports = Quiz;
