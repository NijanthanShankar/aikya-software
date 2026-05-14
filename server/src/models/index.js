const sequelize = require('../config/database');
const User = require('./User');
const Course = require('./Course');
const Module = require('./Module');
const Lesson = require('./Lesson');
const Enrollment = require('./Enrollment');
const Progress = require('./Progress');
const Quiz = require('./Quiz');
const Question = require('./Question');
const QuizAttempt = require('./QuizAttempt');
const Payment = require('./Payment');
const LiveSession = require('./LiveSession');

// User -> Course (instructor)
User.hasMany(Course, { foreignKey: 'instructorId', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });

// Course -> Module
Course.hasMany(Module, { foreignKey: 'courseId', as: 'modules', onDelete: 'CASCADE' });
Module.belongsTo(Course, { foreignKey: 'courseId' });

// Module -> Lesson
Module.hasMany(Lesson, { foreignKey: 'moduleId', as: 'lessons', onDelete: 'CASCADE' });
Lesson.belongsTo(Module, { foreignKey: 'moduleId' });
Course.hasMany(Lesson, { foreignKey: 'courseId', as: 'lessons', onDelete: 'CASCADE' });
Lesson.belongsTo(Course, { foreignKey: 'courseId' });

// User -> Enrollment -> Course
User.hasMany(Enrollment, { foreignKey: 'userId', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'userId' });
Course.hasMany(Enrollment, { foreignKey: 'courseId', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'courseId' });

// Progress
User.hasMany(Progress, { foreignKey: 'userId', as: 'progress' });
Progress.belongsTo(User, { foreignKey: 'userId' });
Lesson.hasMany(Progress, { foreignKey: 'lessonId', as: 'progress' });
Progress.belongsTo(Lesson, { foreignKey: 'lessonId' });
Course.hasMany(Progress, { foreignKey: 'courseId', as: 'progress' });
Progress.belongsTo(Course, { foreignKey: 'courseId' });

// Lesson -> Quiz
Lesson.hasOne(Quiz, { foreignKey: 'lessonId', as: 'quiz', onDelete: 'CASCADE' });
Quiz.belongsTo(Lesson, { foreignKey: 'lessonId' });
Course.hasMany(Quiz, { foreignKey: 'courseId', as: 'quizzes' });
Quiz.belongsTo(Course, { foreignKey: 'courseId' });

// Quiz -> Question
Quiz.hasMany(Question, { foreignKey: 'quizId', as: 'questions', onDelete: 'CASCADE' });
Question.belongsTo(Quiz, { foreignKey: 'quizId' });

// User -> QuizAttempt
User.hasMany(QuizAttempt, { foreignKey: 'userId', as: 'quizAttempts' });
QuizAttempt.belongsTo(User, { foreignKey: 'userId' });
Quiz.hasMany(QuizAttempt, { foreignKey: 'quizId', as: 'attempts' });
QuizAttempt.belongsTo(Quiz, { foreignKey: 'quizId' });

// Payment
User.hasMany(Payment, { foreignKey: 'userId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'userId' });
Course.hasMany(Payment, { foreignKey: 'courseId', as: 'payments' });
Payment.belongsTo(Course, { foreignKey: 'courseId' });
Enrollment.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

// LiveSession
User.hasMany(LiveSession, { foreignKey: 'instructorId', as: 'liveSessions' });
LiveSession.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });
Course.hasMany(LiveSession, { foreignKey: 'courseId', as: 'liveSessions' });
LiveSession.belongsTo(Course, { foreignKey: 'courseId' });

module.exports = {
  sequelize,
  User,
  Course,
  Module,
  Lesson,
  Enrollment,
  Progress,
  Quiz,
  Question,
  QuizAttempt,
  Payment,
  LiveSession,
};
