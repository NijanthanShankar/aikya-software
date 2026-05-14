const { Quiz, Question, QuizAttempt, Lesson, Course, Enrollment, Progress } = require('../models');

exports.createQuiz = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.lessonId, {
      include: [{ model: Course, attributes: ['instructorId'] }],
    });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
    if (lesson.Course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const existing = await Quiz.findOne({ where: { lessonId: lesson.id } });
    if (existing) return res.status(400).json({ message: 'Quiz already exists for this lesson' });

    const quiz = await Quiz.create({ ...req.body, lessonId: lesson.id, courseId: lesson.courseId });
    await lesson.update({ type: 'quiz' });
    res.status(201).json({ quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.quizId, {
      include: [{ model: Lesson, include: [{ model: Course, attributes: ['instructorId'] }] }],
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    if (quiz.Lesson.Course.instructorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const count = await Question.count({ where: { quizId: quiz.id } });
    const question = await Question.create({ ...req.body, quizId: quiz.id, order: req.body.order ?? count });
    res.status(201).json({ question });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      where: { lessonId: req.params.lessonId },
      include: [{
        model: Question, as: 'questions',
        attributes: req.user?.role === 'student' ? ['id', 'text', 'type', 'options', 'order'] : undefined,
        order: [['order', 'ASC']],
      }],
    });
    if (!quiz) return res.status(404).json({ message: 'No quiz for this lesson' });

    if (req.user?.role === 'student') {
      quiz.questions = quiz.questions.map((q) => ({
        ...q.toJSON(),
        options: q.options.map(({ id, text }) => ({ id, text })),
      }));
    }

    res.json({ quiz });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.quizId, {
      include: [{ model: Question, as: 'questions' }],
    });
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    const enrollment = await Enrollment.findOne({ where: { userId: req.user.id, courseId: quiz.courseId } });
    if (!enrollment) return res.status(403).json({ message: 'Not enrolled in this course' });

    const { answers, timeTaken } = req.body;
    let correct = 0;

    const gradedAnswers = quiz.questions.map((q) => {
      const userAnswer = answers.find((a) => a.questionId === q.id);
      const selected = userAnswer?.selectedOptions || [];
      const correctOptions = q.options.filter((o) => o.isCorrect).map((o) => o.id);
      const isCorrect =
        correctOptions.length === selected.length &&
        correctOptions.every((id) => selected.includes(id));
      if (isCorrect) correct++;
      return { questionId: q.id, selectedOptions: selected, correct: isCorrect, correctOptions };
    });

    const score = quiz.questions.length > 0 ? (correct / quiz.questions.length) * 100 : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      userId: req.user.id,
      quizId: quiz.id,
      answers: gradedAnswers,
      score,
      passed,
      timeTaken,
    });

    if (passed) {
      await Progress.findOrCreate({
        where: { userId: req.user.id, lessonId: quiz.lessonId },
        defaults: { userId: req.user.id, lessonId: quiz.lessonId, courseId: quiz.courseId, completed: true, completedAt: new Date() },
      });
    }

    res.json({ attempt: { ...attempt.toJSON(), gradedAnswers } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.findAll({
      where: { userId: req.user.id, quizId: req.params.quizId },
      order: [['completedAt', 'DESC']],
    });
    res.json({ attempts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
