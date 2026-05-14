const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuizAttempt = sequelize.define('QuizAttempt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  quizId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  answers: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '[{ questionId, selectedOptions: [] }]',
  },
  score: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
    comment: 'Percentage score',
  },
  passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  timeTaken: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Seconds taken to complete',
  },
  completedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'quiz_attempts',
});

module.exports = QuizAttempt;
