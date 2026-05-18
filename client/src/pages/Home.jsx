import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Play, Star, Users, BookOpen,
  TrendingUp, Award, Zap, Shield, Video, ChevronRight,
} from 'lucide-react';
import { courseApi, liveApi } from '../api';
import CourseCard from '../components/course/CourseCard';
import LiveSessionCard from '../components/live/LiveSessionCard';

const CATEGORIES = [
  { label: 'Post-Doctoral Fellowship',    emoji: '🎓', color: 'from-teal-500 to-cyan-500' },
  { label: 'Fellowship in Repro. Medicine', emoji: '🔬', color: 'from-primary-500 to-teal-600' },
  { label: 'OB-GYN Skills',              emoji: '🏥', color: 'from-rose-400 to-red-500' },
  { label: 'Gynec Laparoscopy',          emoji: '🩺', color: 'from-blue-500 to-indigo-500' },
  { label: 'Gynec/Obs Certification',    emoji: '📋', color: 'from-orange-400 to-rose-500' },
  { label: 'Endoscopy & Repro. Medicine',emoji: '🔭', color: 'from-violet-500 to-purple-600' },
];

const STATS = [
  { icon: BookOpen, value: '500+',   label: 'Expert Courses' },
  { icon: Users,    value: '12K+',   label: 'Active Learners' },
  { icon: Award,    value: '50+',    label: 'Instructors' },
  { icon: TrendingUp, value: '96%',  label: 'Completion Rate' },
];

const FEATURES = [
  { icon: Zap,    title: 'Learn at Your Pace',    desc: 'Access course content anytime, anywhere on any device.' },
  { icon: Video,  title: 'Live Interactive Classes', desc: 'Join real-time sessions with instructors and classmates.' },
  { icon: Shield, title: 'Verified Certificates',  desc: 'Earn industry-recognized credentials upon completion.' },
];

export default function Home() {
  const [courses, setCourses]   = useState([]);
  const [sessions, setSessions] = useState([]);
  const [query, setQuery]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    courseApi.getAll({ limit: 8, sort: 'popular' }).then(({ data }) => setCourses(data.courses)).catch(() => {});
    liveApi.getSessions({ status: 'live' }).then(({ data }) => setSessions(data.sessions?.slice(0, 3) || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/courses?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="animate-fade-in">
      {/* ── Hero ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-hero text-white py-24 md:py-32 px-4">
        {/* decorative blobs */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary-600/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="badge badge-blue bg-white/10 text-white/90 text-xs mb-6 inline-flex gap-2">
            <span className="live-dot bg-emerald-400" />
            Live sessions happening now
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-6">
            Learn Without<br />
            <span className="text-gradient bg-gradient-to-r from-primary-300 to-violet-300">Limits</span>
          </h1>
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore expert-led courses, join live classes, and build real-world skills that employers actually want.
          </p>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What do you want to learn today?"
                className="field-lg pl-11 rounded-2xl shadow-lg bg-white text-ink"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg rounded-2xl shadow-lg flex-shrink-0">
              Search
            </button>
          </form>

          <p className="text-xs text-white/40 mt-4">Popular: React, Python, UI Design, Digital Marketing</p>
        </div>
      </section>

      {/* ── Stats ─────────────────────────────────── */}
      <section className="bg-white border-b border-surface-100 py-10 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center text-center">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center mb-2.5">
                <Icon size={22} className="text-primary-600" />
              </div>
              <span className="text-2xl font-extrabold text-ink">{value}</span>
              <span className="text-xs text-ink-muted mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Now ──────────────────────────────── */}
      {sessions.length > 0 && (
        <section className="py-14 px-4 bg-surface-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="live-dot" />
                  <span className="text-sm font-semibold text-red-600 uppercase tracking-wide">Live Right Now</span>
                </div>
                <h2 className="section-title">Join a Live Session</h2>
              </div>
              <Link to="/live" className="btn btn-ghost btn-sm flex items-center gap-1">
                All sessions <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {sessions.map((s) => <LiveSessionCard key={s.id} session={s} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Categories ────────────────────────────── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-title">Explore by Category</h2>
            <p className="section-sub">Hundreds of courses across the most in-demand disciplines</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ label, emoji, color }) => (
              <Link
                key={label}
                to={`/courses?category=${encodeURIComponent(label)}`}
                className="group card-hover p-5 text-center flex flex-col items-center gap-3"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform`}>
                  {emoji}
                </div>
                <span className="text-sm font-semibold text-ink group-hover:text-primary-600 transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Courses ──────────────────────── */}
      {courses.length > 0 && (
        <section className="py-14 px-4 bg-surface-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="section-title">Featured Courses</h2>
                <p className="section-sub mt-1">Handpicked by our team for quality and impact</p>
              </div>
              <Link to="/courses" className="btn btn-ghost btn-sm flex items-center gap-1">
                View all <ChevronRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {courses.map((c) => <CourseCard key={c.id} course={c} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Features ──────────────────────────────── */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-title">Why Aikya Academy?</h2>
            <p className="section-sub">Everything you need to succeed, in one place</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card-padded flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <Icon size={24} className="text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-ink mb-1.5">{title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────── */}
      <section className="py-20 px-4 bg-gradient-hero text-white text-center overflow-hidden relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight">
            Ready to Start Teaching?
          </h2>
          <p className="text-white/60 mb-8 text-lg">
            Share your expertise with thousands of eager learners. Create courses, host live sessions, and build your income.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to="/register?role=instructor" className="btn btn-lg bg-white text-primary-700 hover:bg-primary-50 shadow-lg">
              Become an Instructor
            </Link>
            <Link to="/courses" className="btn btn-lg border border-white/30 text-white hover:bg-white/10">
              Explore Courses <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
