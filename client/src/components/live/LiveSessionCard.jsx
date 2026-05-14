import { Link } from 'react-router-dom';
import { Video, Calendar, Clock, Users, Play } from 'lucide-react';

const STATUS_CONFIG = {
  live:      { label: 'Live Now', cls: 'badge-red', dot: true },
  scheduled: { label: 'Upcoming', cls: 'badge-blue', dot: false },
  ended:     { label: 'Ended',    cls: 'badge-gray', dot: false },
};

export default function LiveSessionCard({ session }) {
  const cfg = STATUS_CONFIG[session.status] || STATUS_CONFIG.scheduled;
  const dt  = new Date(session.scheduledAt);

  const dateStr = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="card-hover p-5 flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Video size={18} className="text-white" />
        </div>
        <span className={`badge ${cfg.cls} flex items-center gap-1.5`}>
          {cfg.dot && <span className="live-dot" />}
          {cfg.label}
        </span>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-semibold text-ink leading-snug line-clamp-2">{session.title}</h3>
        {session.instructor && (
          <p className="text-xs text-ink-muted mt-0.5">by {session.instructor.name}</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5"><Calendar size={12} />{dateStr}</span>
        <span className="flex items-center gap-1.5"><Clock size={12} />{timeStr} · {session.duration} min</span>
        <span className="flex items-center gap-1.5"><Users size={12} />Up to {session.maxParticipants}</span>
      </div>

      {/* CTA */}
      <Link
        to={session.status === 'ended' ? '#' : `/live/${session.meetingId}`}
        className={`btn btn-md mt-1 w-full justify-center ${
          session.status === 'live'      ? 'btn-danger' :
          session.status === 'scheduled' ? 'btn-primary' :
          'btn-secondary pointer-events-none opacity-60'
        }`}
      >
        {session.status === 'live' && <><span className="live-dot" /> Join Live</>}
        {session.status === 'scheduled' && <><Play size={15} />Join When Live</>}
        {session.status === 'ended' && 'Session Ended'}
      </Link>
    </div>
  );
}
