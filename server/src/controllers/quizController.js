const { Quiz, Question, QuizAttempt, Lesson, Course, Enrollment, Progress } = require('../models');

exports.createQuiz = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    const course = await Course.findById(lesson.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const existing = await Quiz.findOne({ lessonId: lesson._id });
    if (existing) return res.status(400).json({ message: 'Quiz already exists for this lesson' });

    const quiz = await Quiz.create({ ...req.body, lessonId: lesson._id, courseId: lesson.courseId });
    lesson.type = 'quiz';
    await lesson.save();
    res.status(201).json({ quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    const lesson = await Lesson.findById(quiz.lessonId);
    const course = await Course.findById(lesson.courseId);
    if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const count = await Question.countDocuments({ quizId: quiz._id });
    const question = await Question.create({ ...req.body, quizId: quiz._id, order: req.body.order ?? count });
    res.status(201).json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ lessonId: req.params.lessonId });
    if (!quiz) return res.status(404).json({ message: 'No quiz for this lesson' });

    let questions = await Question.find({ quizId: quiz._id }).sort({ order: 1 });
    if (req.user?.role === 'student') {
      questions = questions.map((q) => ({
        ...q.toJSON(),
        options: q.options.map(({ id, text }) => ({ id, text })),
      }));
    }

    res.json({ quiz: { ...quiz.toJSON(), questions } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const enrollment = await Enrollment.findOne({ userId: req.user._id, courseId: quiz.courseId });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

    const questions = await Question.find({ quizId: quiz._id });
    const { answers, timeTaken } = req.body;
    let correct = 0;

    const gradedAnswers = questions.map((q) => {
      const userAnswer = answers.find((a) => a.questionId === q.id);
      const selected = userAnswer?.selectedOptions || [];
      const correctOptions = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      const isCorrect =
        correctOptions.length === selected.length && correctOptions.every((id) => selected.includes(id));
      if (isCorrect) correct++;
      return { questionId: q.id, selectedOptions: selected, correct: isCorrect, correctOptions };
    });

    const score = questions.length > 0 ? (correct / questions.length) * 100 : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      userId: req.user._id, quizId: quiz._id, answers: gradedAnswers, score, passed, timeTaken,
    });

    if (passed) {
      const existing = await Progress.findOne({ userId: req.user._id, lessonId: quiz.lessonId });
      if (!existing) {
        await Progress.create({
          userId: req.user._id, lessonId: quiz.lessonId, courseId: quiz.courseId, completed: true, completedAt: new Date(),
        });
      }
    }

    res.json({ attempt: { ...attempt.toJSON(), gradedAnswers } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id, quizId: req.params.quizId })
      .sort({ completedAt: -1 });
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
