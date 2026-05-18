import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [form, setForm]         = useState({ email: '', password: '' });
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();
  const location                = useLocation();
  const from                    = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary-600/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="relative text-center text-white max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-primary mx-auto mb-6 flex items-center justify-center shadow-lg">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-extrabold mb-4 tracking-tight">Continue Your Learning Journey</h2>
          <p className="text-white/60 leading-relaxed">Access thousands of courses, join live sessions, and track your progress.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden justify-center">
            <img src="/logo.png" alt="Aikya Academy" className="h-10 w-auto object-contain" />
            <span className="font-extrabold text-xl text-ink">AikyaAcademy</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-extrabold text-ink">Sign in to your account</h1>
            <p className="text-ink-muted mt-1">Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create one free</Link>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="field pl-10" placeholder="you@example.com" required />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">Password</label>
                <a href="#" className="text-xs text-primary-600 hover:underline font-medium">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
                <input type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="field pl-10 pr-10" placeholder="Enter your password" required />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full mt-2">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-ink-muted">
            By signing in you agree to our{' '}
            <a href="#" className="text-primary-600 hover:underline">Terms</a> and{' '}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
