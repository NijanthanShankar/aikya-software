import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Video, Calendar, Filter } from 'lucide-react';
import { liveApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import LiveSessionCard from '../components/live/LiveSessionCard';
import { PageSpinner } from '../components/common/Spinner';

const FILTERS = [
  { value: '',          label: 'All Sessions' },
  { value: 'live',      label: 'Live Now' },
  { value: 'scheduled', label: 'Upcoming' },
  { value: 'ended',     label: 'Past' },
];

export default function LiveSessions() {
  const { user }                        = useAuth();
  const [sessions, setSessions]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    else params.upcoming = 'true';

    liveApi.getSessions(statusFilter ? params : {})
      .then(({ data }) => setSessions(data.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const live      = sessions.filter((s) => s.status === 'live');
  const scheduled = sessions.filter((s) => s.status === 'scheduled');
  const ended     = sessions.filter((s) => s.status === 'ended');

  const display = statusFilter
    ? sessions
    : [...live, ...scheduled, ...ended];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Live Sessions</h1>
          <p className="text-ink-muted mt-1 text-sm">Join real-time classes with expert instructors</p>
        </div>
        {(user?.role === 'instructor' || user?.role === 'admin') && (
          <Link to="/instructor/schedule-live" className="btn btn-primary btn-md flex-shrink-0">
            <Video size={16} /> Schedule Session
          </Link>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto hide-scrollbar">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              statusFilter === value
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-white border border-surface-200 text-ink-muted hover:text-ink hover:border-surface-300'
            }`}
          >
            {label}
            {value === 'live' && live.length > 0 && (
              <span className="ml-1.5 badge badge-red py-0 px-1.5 text-[10px]">{live.length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <PageSpinner />
      ) : display.length === 0 ? (
        <div className="card p-16 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-ink-light" />
          <p className="text-ink-muted">No sessions found.</p>
        </div>
      ) : (
        <>
          {/* Live now banner */}
          {live.length > 0 && !statusFilter && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="live-dot" />
                <h2 className="font-bold text-ink">Live Right Now</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {live.map((s) => <LiveSessionCard key={s.id} session={s} />)}
              </div>
            </div>
          )}

          {/* Scheduled */}
          {(scheduled.length > 0 && !statusFilter) || (statusFilter === 'scheduled' && display.length > 0) ? (
            <div className={live.length > 0 && !statusFilter ? 'mt-6' : ''}>
              {!statusFilter && <h2 className="font-bold text-ink mb-4">Upcoming Sessions</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(statusFilter === 'scheduled' ? display : scheduled).map((s) => <LiveSessionCard key={s.id} session={s} />)}
              </div>
            </div>
          ) : null}

          {/* Ended */}
          {statusFilter === 'ended' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {display.map((s) => <LiveSessionCard key={s.id} session={s} />)}
            </div>
          )}

          {/* All mode when no specific filter */}
          {!statusFilter && live.length === 0 && scheduled.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {display.map((s) => <LiveSessionCard key={s.id} session={s} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
