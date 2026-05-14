const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('single', 'multiple', 'true_false'),
    defaultValue: 'single',
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '[{ id, text, isCorrect }]',
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  quizId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
}, {
  tableName: 'questions',
});

module.exports = Question;
