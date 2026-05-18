import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import { PageSpinner } from './components/common/Spinner';

import Home                from './pages/Home';
import Login               from './pages/Login';
import Register            from './pages/Register';
import Courses             from './pages/Courses';
import CourseDetail        from './pages/CourseDetail';
import Dashboard           from './pages/Dashboard';
import Learn               from './pages/Learn';
import InstructorDashboard from './pages/InstructorDashboard';
import CreateCourse        from './pages/CreateCourse';
import EditCourse          from './pages/EditCourse';
import PaymentVerify       from './pages/PaymentVerify';
import LiveSessions        from './pages/LiveSessions';
import LiveRoom            from './pages/LiveRoom';
import ScheduleLiveSession from './pages/ScheduleLiveSession';
import Profile             from './pages/Profile';

/* Layout that wraps a page with Navbar + Footer */
function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/* Redirect unauthenticated users to /login */
function RequireAuth({ roles }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user)   return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return <PageSpinner />;

  return (
    <Routes>
      {/* ── Full-screen (no Navbar/Footer) ── */}
      <Route element={<RequireAuth />}>
        <Route path="/live/:meetingId" element={<LiveRoom />} />
        <Route path="/learn/:courseId"  element={<Learn />} />
      </Route>

      {/* ── Public pages with Navbar/Footer ── */}
      <Route element={<MainLayout />}>
        <Route path="/"               element={<Home />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/courses"        element={<Courses />} />
        <Route path="/courses/:slug"  element={<CourseDetail />} />
        <Route path="/live"           element={<LiveSessions />} />
        <Route path="/payment/verify" element={<PaymentVerify />} />

        {/* Protected pages */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile"   element={<Profile />} />
        </Route>

        <Route element={<RequireAuth roles={['instructor','admin']} />}>
          <Route path="/instructor"                        element={<InstructorDashboard />} />
          <Route path="/instructor/create-course"         element={<CreateCourse />} />
          <Route path="/instructor/edit-course/:courseId" element={<EditCourse />} />
          <Route path="/instructor/schedule-live"         element={<ScheduleLiveSession />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
