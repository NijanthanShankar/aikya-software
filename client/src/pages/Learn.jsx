import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Circle, ChevronLeft, ChevronRight,
  FileText, Video, HelpCircle, Menu, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { progressApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { PageSpinner } from '../components/common/Spinner';
import QuizPlayer from '../components/quiz/QuizPlayer';

export default function Learn() {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();

  const [course, setCourse]           = useState(null);
  const [progress, setProgress]       = useState({});
  const [currentLesson, setCurrentLesson] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const allLessons = course?.modules?.flatMap((m) => m.lessons || []) || [];

  useEffect(() => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`/api/courses/${courseId}/with-lessons`, { headers }).then((r) => r.json()),
      fetch(`/api/enrollments/courses/${courseId}/check`, { headers }).then((r) => r.json()),
      fetch(`/api/progress/courses/${courseId}`, { headers }).then((r) => r.json()),
    ])
      .then(([courseData, enrollData, progressData]) => {
        if (!enrollData.isEnrolled) {
          toast.error('Please enroll in this course first');
          navigate('/courses');
          return;
        }
        setCourse(courseData.course);
        const map = {};
        progressData.progress?.forEach((p) => { map[p.lessonId] = p; });
        setProgress(map);
        const first = courseData.course?.modules?.[0]?.lessons?.[0];
        if (first) setCurrentLesson(first);
      })
      .catch(() => { toast.error('Failed to load course'); navigate('/dashboard'); })
      .finally(() => setLoading(false));
  }, [courseId]);

  const markComplete = async (lessonId) => {
    try {
      await progressApi.markComplete(lessonId);
      setProgress((p) => ({ ...p, [lessonId]: { ...p[lessonId], completed: true } }));
      toast.success('Lesson completed!');
    } catch {}
  };

  if (loading) return <PageSpinner label="Loading course…" />;
  if (!course)  return null;

  const currentIndex = allLessons.findIndex((l) => l.id === currentLesson?.id);
  const prevLesson   = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson   = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;
  const completedCount = Object.values(progress).filter((p) => p.completed).length;
  const pct            = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;

  const LessonTypeIcon = ({ type }) =>
    type === 'quiz' ? <HelpCircle size={13} className="text-violet-400" />
    : type === 'text' ? <FileText size={13} className="text-blue-400" />
    : <Video size={13} className="text-emerald-400" />;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-surface-50">
      {/* Sidebar */}
      <div className={`flex-shrink-0 flex flex-col bg-white border-r border-surface-200 transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
        <div className="p-4 border-b border-surface-100">
          <p className="font-bold text-ink text-sm line-clamp-2 mb-2">{course.title}</p>
          <div>
            <div className="flex justify-between text-xs text-ink-muted mb-1">
              <span>Your progress</span><span className="font-medium">{pct}%</span>
            </div>
            <div className="w-full bg-surface-100 rounded-full h-1.5">
              <div className="bg-primary-600 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
        <div className="overflow-y-auto flex-1 scrollbar-thin py-2">
          {course.modules?.map((mod) => (
            <div key={mod.id}>
              <div className="px-4 py-2 text-[11px] font-semibold text-ink-muted uppercase tracking-wide bg-surface-50 sticky top-0">
                {mod.title}
              </div>
              {mod.lessons?.map((lesson) => {
                const done   = progress[lesson.id]?.completed;
                const active = currentLesson?.id === lesson.id;
                return (
                  <button key={lesson.id} onClick={() => setCurrentLesson(lesson)}
                    className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                      active ? 'bg-primary-50 text-primary-700' : 'hover:bg-surface-50 text-ink-muted hover:text-ink'
                    }`}
                  >
                    {done
                      ? <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                      : <Circle size={14} className={`flex-shrink-0 ${active ? 'text-primary-400' : 'text-surface-200'}`} />
                    }
                    <span className="flex-1 line-clamp-2 text-xs leading-snug">{lesson.title}</span>
                    <LessonTypeIcon type={lesson.type} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-surface-100 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="btn btn-ghost p-2 rounded-lg">
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-sm text-ink-muted truncate flex-1 hidden sm:block">{currentLesson?.title}</span>
          <span className="text-xs text-ink-muted flex-shrink-0">{currentIndex + 1} / {allLessons.length}</span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {currentLesson ? (
            <>
              {/* Video */}
              {currentLesson.type === 'video' && (
                <div className="bg-black aspect-video w-full">
                  <video key={currentLesson.id} controls className="w-full h-full"
                    src={`/api/lessons/${currentLesson.id}/stream`}
                    onEnded={() => markComplete(currentLesson.id)} />
                </div>
              )}

              {/* Text / Quiz placeholder area */}
              {currentLesson.type !== 'video' && (
                <div className="aspect-video bg-gradient-hero flex items-center justify-center">
                  {currentLesson.type === 'quiz'
                    ? <HelpCircle size={56} className="text-white/40" />
                    : <FileText size={56} className="text-white/40" />
                  }
                </div>
              )}

              {/* Lesson body */}
              <div className="max-w-3xl mx-auto px-5 py-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-xl font-extrabold text-ink">{currentLesson.title}</h1>
                  {currentLesson.type !== 'quiz' && (
                    progress[currentLesson.id]?.completed
                      ? <span className="flex items-center gap-1 text-emerald-600 text-sm font-semibold flex-shrink-0"><CheckCircle size={16} /> Done</span>
                      : <button onClick={() => markComplete(currentLesson.id)} className="btn btn-secondary btn-sm flex-shrink-0">Mark Complete</button>
                  )}
                </div>

                {currentLesson.description && (
                  <p className="text-ink-muted text-sm leading-relaxed mb-6">{currentLesson.description}</p>
                )}

                {currentLesson.type === 'text' && currentLesson.content && (
                  <div className="prose prose-sm max-w-none text-ink-muted whitespace-pre-line leading-relaxed">
                    {currentLesson.content}
                  </div>
                )}

                {currentLesson.type === 'quiz' && (
                  <QuizPlayer lessonId={currentLesson.id} onComplete={() => markComplete(currentLesson.id)} />
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8 pt-5 border-t border-surface-200">
                  <button onClick={() => prevLesson && setCurrentLesson(prevLesson)} disabled={!prevLesson}
                    className="btn btn-secondary btn-md disabled:opacity-40">
                    <ChevronLeft size={15} /> Previous
                  </button>
                  <button onClick={() => nextLesson && setCurrentLesson(nextLesson)} disabled={!nextLesson}
                    className="btn btn-primary btn-md disabled:opacity-40">
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-ink-muted gap-3">
              <Video size={48} className="text-ink-light" />
              <p>Select a lesson from the sidebar to begin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
