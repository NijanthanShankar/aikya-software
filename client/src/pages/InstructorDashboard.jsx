import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Eye, EyeOff, Trash2, BookOpen, Users, TrendingUp, Video, Calendar, ChevronRight, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseApi, liveApi } from '../api';
import { PageSpinner } from '../components/common/Spinner';

export default function InstructorDashboard() {
  const [courses, setCourses]   = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('courses');

  useEffect(() => {
    Promise.all([courseApi.getMyCourses(), liveApi.getMySessions()])
      .then(([c, l]) => { setCourses(c.data.courses); setSessions(l.data.sessions); })
      .catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false));
  }, []);

  const handlePublish = async (course) => {
    try {
      const { data } = await courseApi.publish(course.id);
      setCourses((prev) => prev.map((c) => c.id === course.id ? data.course : c));
      toast.success(`Course ${data.course.status === 'published' ? 'published' : 'unpublished'}`);
    } catch { toast.error('Failed to update status'); }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('Delete this course? This cannot be undone.')) return;
    try { await courseApi.delete(id); setCourses((p) => p.filter((c) => c.id !== id)); toast.success('Course deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleDeleteSession = async (id) => {
    if (!confirm('Delete this session?')) return;
    try { await liveApi.delete(id); setSessions((p) => p.filter((s) => s.id !== id)); toast.success('Session deleted'); }
    catch { toast.error('Failed to delete'); }
  };

  const handleStartSession = async (session) => {
    try {
      await liveApi.start(session.id);
      setSessions((p) => p.map((s) => s.id === session.id ? { ...s, status: 'live' } : s));
      toast.success('Session started!');
    } catch { toast.error('Failed to start session'); }
  };

  if (loading) return <PageSpinner />;

  const totalStudents = courses.reduce((a, c) => a + (c.totalEnrollments || 0), 0);
  const published     = courses.filter((c) => c.status === 'published').length;
  const liveSessions  = sessions.filter((s) => s.status === 'live').length;

  const stats = [
    { icon: BookOpen,  label: 'Total Courses',  value: courses.length,  sub: `${published} published`,        color: 'text-primary-600 bg-primary-50' },
    { icon: Users,     label: 'Total Students', value: totalStudents,   sub: 'across all courses',             color: 'text-emerald-600 bg-emerald-50' },
    { icon: TrendingUp,label: 'Published',      value: published,       sub: `${courses.length - published} drafts`, color: 'text-violet-600 bg-violet-50' },
    { icon: Video,     label: 'Live Sessions',  value: sessions.length, sub: `${liveSessions} active now`,    color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Instructor Panel</h1>
          <p className="text-ink-muted mt-1 text-sm">Manage your courses and live sessions</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link to="/instructor/schedule-live" className="btn btn-secondary btn-md hidden sm:flex">
            <Video size={15} /> Schedule Live
          </Link>
          <Link to="/instructor/create-course" className="btn btn-primary btn-md">
            <Plus size={15} /> New Course
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={19} />
            </div>
            <p className="text-2xl font-extrabold text-ink">{value}</p>
            <p className="text-xs font-medium text-ink mt-0.5">{label}</p>
            <p className="text-xs text-ink-muted">{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-100 rounded-xl p-1 w-fit">
        {[{ id: 'courses', label: 'Courses', count: courses.length }, { id: 'sessions', label: 'Live Sessions', count: sessions.length }].map(({ id, label, count }) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === id ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}
          >
            {label}
            <span className={`ml-1.5 text-xs ${tab === id ? 'text-ink-muted' : 'text-ink-light'}`}>({count})</span>
          </button>
        ))}
      </div>

      {/* Courses table */}
      {tab === 'courses' && (
        <>
          {courses.length === 0 ? (
            <div className="card p-16 text-center">
              <BookOpen size={48} className="mx-auto mb-4 text-ink-light" />
              <p className="text-ink-muted mb-5">No courses yet. Create your first one!</p>
              <Link to="/instructor/create-course" className="btn btn-primary btn-md">Create Course</Link>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-200 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide">Course</th>
                    <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide hidden md:table-cell">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide hidden sm:table-cell">Students</th>
                    <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide hidden lg:table-cell">Price</th>
                    <th className="px-5 py-3 text-xs font-semibold text-ink-muted uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-100">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-9 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                            {c.thumbnail ? <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                              : <div className="w-full h-full bg-primary-100 flex items-center justify-center"><BookOpen size={13} className="text-primary-400" /></div>}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-ink text-sm line-clamp-1">{c.title}</p>
                            <p className="text-xs text-ink-muted capitalize">{c.level} · {c.totalLessons} lessons</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <span className={`badge capitalize ${c.status === 'published' ? 'badge-green' : c.status === 'draft' ? 'badge-yellow' : 'badge-gray'}`}>{c.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-ink-muted hidden sm:table-cell">{(c.totalEnrollments || 0).toLocaleString()}</td>
                      <td className="px-5 py-3.5 text-ink-muted hidden lg:table-cell">
                        {c.isFree || !parseFloat(c.price) ? 'Free' : `₹${Number(c.price).toLocaleString('en-IN')}`}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => handlePublish(c)} title={c.status === 'published' ? 'Unpublish' : 'Publish'} className="btn btn-ghost p-1.5 rounded-lg">
                            {c.status === 'published' ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                          <Link to={`/instructor/edit-course/${c.id}`} className="btn btn-ghost p-1.5 rounded-lg">
                            <Edit size={15} />
                          </Link>
                          <button onClick={() => handleDeleteCourse(c.id)} className="btn btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Sessions list */}
      {tab === 'sessions' && (
        <>
          <div className="mb-4 flex justify-end">
            <Link to="/instructor/schedule-live" className="btn btn-primary btn-md">
              <Video size={15} /> Schedule New Session
            </Link>
          </div>
          {sessions.length === 0 ? (
            <div className="card p-16 text-center">
              <Video size={48} className="mx-auto mb-4 text-ink-light" />
              <p className="text-ink-muted mb-5">No live sessions yet.</p>
              <Link to="/instructor/schedule-live" className="btn btn-primary btn-md">Schedule Live Session</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => {
                const dt = new Date(s.scheduledAt);
                return (
                  <div key={s.id} className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0">
                      <Video size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink text-sm line-clamp-1">{s.title}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {dt.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} · {s.duration} min
                      </p>
                    </div>
                    <span className={`badge flex-shrink-0 capitalize ${s.status === 'live' ? 'badge-red' : s.status === 'scheduled' ? 'badge-blue' : 'badge-gray'}`}>
                      {s.status === 'live' && <span className="live-dot mr-1" />}{s.status}
                    </span>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {s.status === 'scheduled' && (
                        <button onClick={() => handleStartSession(s)} className="btn btn-primary btn-sm text-xs">
                          <PlayCircle size={13} /> Go Live
                        </button>
                      )}
                      {s.status === 'live' && (
                        <Link to={`/live/${s.meetingId}`} className="btn btn-danger btn-sm text-xs">
                          Join Room
                        </Link>
                      )}
                      <button onClick={() => handleDeleteSession(s.id)} className="btn btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
