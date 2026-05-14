import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, TrendingUp, Clock, ChevronRight, Play } from 'lucide-react';
import { enrollmentApi, liveApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { PageSpinner } from '../components/common/Spinner';
import LiveSessionCard from '../components/live/LiveSessionCard';

export default function Dashboard() {
  const { user }          = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [upcoming, setUpcoming]       = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([
      enrollmentApi.getMyEnrollments(),
      liveApi.getSessions({ upcoming: true }),
    ])
      .then(([e, l]) => { setEnrollments(e.data.enrollments); setUpcoming(l.data.sessions?.slice(0, 3) || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  const completed  = enrollments.filter((e) => e.status === 'completed').length;
  const inProgress = enrollments.filter((e) => e.status === 'active' && e.progressPercent > 0 && e.progressPercent < 100).length;
  const avgPct     = enrollments.length
    ? Math.round(enrollments.reduce((a, e) => a + (e.progressPercent || 0), 0) / enrollments.length)
    : 0;

  const stats = [
    { icon: BookOpen,    label: 'Enrolled',    value: enrollments.length, color: 'text-primary-600 bg-primary-50' },
    { icon: TrendingUp,  label: 'In Progress', value: inProgress,         color: 'text-amber-600  bg-amber-50' },
    { icon: Award,       label: 'Completed',   value: completed,          color: 'text-emerald-600 bg-emerald-50' },
    { icon: Clock,       label: 'Avg Progress',value: `${avgPct}%`,       color: 'text-violet-600  bg-violet-50' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-ink-muted mt-1 text-sm">Here's where you left off. Keep it up!</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon size={19} />
            </div>
            <p className="text-2xl font-extrabold text-ink">{value}</p>
            <p className="text-xs text-ink-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-ink text-lg">My Courses</h2>
            <Link to="/courses" className="btn btn-ghost btn-sm flex items-center gap-1 text-xs">
              Browse more <ChevronRight size={13} />
            </Link>
          </div>

          {enrollments.length === 0 ? (
            <div className="card p-10 text-center">
              <BookOpen size={40} className="mx-auto mb-3 text-ink-light" />
              <p className="text-ink-muted mb-4 text-sm">You haven't enrolled in any courses yet.</p>
              <Link to="/courses" className="btn btn-primary btn-md">Browse Courses</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrollments.slice(0, 5).map((enr) => {
                const c = enr.Course;
                return (
                  <div key={enr.id} className="card p-4 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
                    <div className="w-16 h-12 rounded-lg overflow-hidden bg-surface-100 flex-shrink-0">
                      {c.thumbnail
                        ? <img src={c.thumbnail} alt="" className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gradient-to-br from-primary-400 to-violet-400 flex items-center justify-center"><BookOpen size={18} className="text-white/70" /></div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink text-sm line-clamp-1">{c.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-surface-100 rounded-full h-1.5 max-w-[120px]">
                          <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: `${enr.progressPercent}%` }} />
                        </div>
                        <span className="text-xs text-ink-muted">{enr.progressPercent}%</span>
                      </div>
                    </div>
                    <Link to={`/learn/${c.id}`} className="btn btn-primary btn-sm flex-shrink-0">
                      <Play size={13} />{enr.progressPercent === 0 ? 'Start' : 'Continue'}
                    </Link>
                  </div>
                );
              })}
              {enrollments.length > 5 && (
                <Link to="/courses" className="block text-center text-sm text-primary-600 hover:underline py-2">
                  +{enrollments.length - 5} more courses
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Upcoming live sessions */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-ink text-lg">Upcoming Live</h2>
            <Link to="/live" className="btn btn-ghost btn-sm flex items-center gap-1 text-xs">
              See all <ChevronRight size={13} />
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="card p-6 text-center text-sm text-ink-muted">No upcoming sessions right now.</div>
          ) : (
            <div className="space-y-4">
              {upcoming.map((s) => <LiveSessionCard key={s.id} session={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
