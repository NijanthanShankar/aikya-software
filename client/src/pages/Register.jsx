import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { GraduationCap, Mail, Lock, User, Eye, EyeOff, Sparkles, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [searchParams]          = useSearchParams();
  const defaultRole             = searchParams.get('role') === 'instructor' ? 'instructor' : 'student';
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: defaultRole });
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const { register }            = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome aboard 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'student', icon: BookOpen, label: 'Learn as Student', desc: 'Access courses and live sessions' },
    { value: 'instructor', icon: Sparkles, label: 'Teach as Instructor', desc: 'Create courses and host live classes' },
  ];

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-hero flex-col justify-center p-14 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary-500/25 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-violet-600/15 rounded-full blur-3xl" />
        <div className="relative text-white">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary mb-6 flex items-center justify-center shadow-lg">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight leading-snug">Start Your<br />Learning Journey</h2>
          <p className="text-white/55 leading-relaxed text-sm">
            Join 12,000+ learners on Aikya Courses. Access expert content, attend live sessions, and build career-changing skills.
          </p>
          <div className="mt-8 space-y-3">
            {['500+ expert-led courses', 'Live interactive classes', 'Certificates of completion'].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <span className="text-emerald-400 text-xs">✓</span>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 overflow-y-auto">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="font-extrabold text-xl text-ink">AikyaCourses</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-ink">Create your account</h1>
            <p className="text-ink-muted mt-1 text-sm">
              Already have one?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
            </p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {roles.map(({ value, icon: Icon, label, desc }) => (
              <button key={value} type="button" onClick={() => setForm({ ...form, role: value })}
                className={`p-3.5 rounded-xl border-2 text-left transition-all ${
                  form.role === value
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-surface-200 hover:border-surface-300 bg-white'
                }`}
              >
                <Icon size={18} className={form.role === value ? 'text-primary-600' : 'text-ink-muted'} />
                <p className={`text-sm font-semibold mt-2 ${form.role === value ? 'text-primary-700' : 'text-ink'}`}>{label}</p>
                <p className="text-xs text-ink-muted mt-0.5">{desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="field pl-10" placeholder="John Doe" required />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="field pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="field pl-10 pr-10" placeholder="Minimum 6 characters" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-ink-muted">
            By signing up you agree to our{' '}
            <a href="#" className="text-primary-600 hover:underline">Terms</a> &{' '}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
