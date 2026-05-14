import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Trophy } from 'lucide-react';
import { quizApi } from '../../api';
import Spinner from '../common/Spinner';

export default function QuizPlayer({ lessonId, onComplete }) {
  const [quiz, setQuiz]           = useState(null);
  const [answers, setAnswers]     = useState({});
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime]               = useState(Date.now());

  useEffect(() => {
    quizApi.getByLesson(lessonId)
      .then(({ data }) => setQuiz(data.quiz))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [lessonId]);

  const toggle = (questionId, optionId, type) => {
    setAnswers((prev) => {
      const cur = prev[questionId] || [];
      if (type === 'single' || type === 'true_false') return { ...prev, [questionId]: [optionId] };
      return { ...prev, [questionId]: cur.includes(optionId) ? cur.filter((id) => id !== optionId) : [...cur, optionId] };
    });
  };

  const handleSubmit = async () => {
    const unanswered = quiz.questions.filter((q) => !answers[q.id]?.length);
    if (unanswered.length) return alert(`Please answer all ${unanswered.length} remaining question(s)`);
    setSubmitting(true);
    try {
      const { data } = await quizApi.submit(quiz.id, {
        answers: Object.entries(answers).map(([questionId, selectedOptions]) => ({ questionId, selectedOptions })),
        timeTaken: Math.round((Date.now() - startTime) / 1000),
      });
      setResult(data.attempt);
      if (data.attempt.passed && onComplete) onComplete();
    } catch {} finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (!quiz)   return <p className="text-ink-muted text-sm py-4">No quiz for this lesson.</p>;

  /* ── Results view ── */
  if (result) {
    return (
      <div className="space-y-5 animate-fade-in">
        <div className={`p-6 rounded-2xl text-center ${result.passed ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
          {result.passed
            ? <Trophy size={48} className="mx-auto mb-3 text-amber-500" />
            : <XCircle  size={48} className="mx-auto mb-3 text-red-500" />}
          <h3 className="text-xl font-extrabold text-ink mb-1">{result.passed ? 'Quiz Passed!' : 'Not quite…'}</h3>
          <p className="text-4xl font-extrabold my-2 text-gradient">{Math.round(result.score)}%</p>
          <p className="text-xs text-ink-muted">Passing score: {quiz.passingScore}%</p>
          {!result.passed && (
            <button onClick={() => { setResult(null); setAnswers({}); }} className="btn btn-primary btn-md mt-4">Try Again</button>
          )}
        </div>

        {result.gradedAnswers?.map((ga, i) => {
          const q = quiz.questions[i];
          return (
            <div key={ga.questionId} className={`p-4 rounded-xl border ${ga.correct ? 'border-emerald-200 bg-emerald-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-start gap-2 mb-2">
                {ga.correct ? <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" /> : <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />}
                <p className="text-sm font-semibold text-ink">{q?.text}</p>
              </div>
              {!ga.correct && q?.explanation && (
                <p className="text-xs text-ink-muted flex items-start gap-1.5 mt-1.5 ml-6">
                  <AlertCircle size={12} className="flex-shrink-0 mt-0.5 text-blue-500" />{q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Quiz form ── */
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-ink text-base">{quiz.title}</h3>
        <span className="text-xs text-ink-muted">{quiz.questions?.length} questions · Pass: {quiz.passingScore}%</span>
      </div>

      {quiz.questions?.map((q, i) => (
        <div key={q.id} className="card p-5">
          <p className="font-semibold text-ink text-sm mb-4">{i + 1}. {q.text}</p>
          <div className="space-y-2">
            {q.options?.map((opt) => {
              const sel = answers[q.id]?.includes(opt.id);
              return (
                <button key={opt.id} onClick={() => toggle(q.id, opt.id, q.type)}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 text-sm transition-all ${
                    sel ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-surface-200 hover:border-primary-200 text-ink-muted hover:text-ink'
                  }`}
                >
                  {opt.text}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary btn-lg w-full">
        {submitting ? 'Grading…' : 'Submit Quiz'}
      </button>
    </div>
  );
}
