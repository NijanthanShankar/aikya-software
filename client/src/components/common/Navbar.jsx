import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap, Search, Bell, ChevronDown, LayoutDashboard,
  User, LogOut, Menu, X, Video, BookOpen, Sparkles,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [scrolled, setScrolled]         = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setDropdownOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { to: '/courses', label: 'Courses', icon: BookOpen },
    { to: '/live', label: 'Live Sessions', icon: Video },
  ];

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-glass shadow-sm border-b border-surface-200' : 'bg-white border-b border-surface-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
              <GraduationCap size={20} className="text-white" />
            </div>
            <span className="font-extrabold text-lg text-ink tracking-tight hidden sm:block">
              Aikya<span className="text-gradient">Courses</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to} to={to}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-150 ${
                  location.pathname.startsWith(to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-ink-muted hover:text-ink hover:bg-surface-100'
                }`}
              >
                <Icon size={15} />{label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {/* Avatar dropdown */}
                <div className="relative" ref={dropRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-surface-100 transition-colors"
                  >
                    {user.avatar
                      ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-surface-200" />
                      : <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-white text-sm font-bold ring-2 ring-primary-100">{user.name[0]}</div>
                    }
                    <span className="hidden md:block text-sm font-medium text-ink max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                    <ChevronDown size={14} className={`text-ink-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 card py-1.5 animate-scale-in origin-top-right z-50">
                      <div className="px-4 py-2.5 border-b border-surface-100">
                        <p className="text-sm font-semibold text-ink truncate">{user.name}</p>
                        <p className="text-xs text-ink-light truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <DropItem to="/dashboard" icon={LayoutDashboard} label="My Learning" />
                        {(user.role === 'instructor' || user.role === 'admin') && (
                          <DropItem to="/instructor" icon={Sparkles} label="Instructor Panel" />
                        )}
                        <DropItem to="/profile" icon={User} label="Profile" />
                      </div>
                      <div className="border-t border-surface-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg mx-1"
                          style={{ width: 'calc(100% - 8px)' }}
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden btn btn-ghost btn-sm p-2"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-surface-100 px-4 py-3 space-y-1 animate-slide-up">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-muted hover:bg-surface-50 hover:text-ink">
              <Icon size={16} />{label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-muted hover:bg-surface-50 hover:text-ink">
                <LayoutDashboard size={16} />My Learning
              </Link>
              {(user.role === 'instructor' || user.role === 'admin') && (
                <Link to="/instructor" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-muted hover:bg-surface-50 hover:text-ink">
                  <Sparkles size={16} />Instructor Panel
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50">
                <LogOut size={16} />Sign Out
              </button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="btn btn-secondary btn-md flex-1 justify-center">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-md flex-1 justify-center">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function DropItem({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="flex items-center gap-2.5 px-4 py-2 text-sm text-ink-muted hover:text-ink hover:bg-surface-50 transition-colors mx-1 rounded-lg" style={{ marginLeft: 4, marginRight: 4 }}>
      <Icon size={15} />{label}
    </Link>
  );
}
