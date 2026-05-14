import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Star, Users, BookOpen, Clock, Globe, ChevronDown, ChevronUp,
  Play, Lock, CheckCircle, ShoppingCart,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { courseApi, enrollmentApi, paymentApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { PageSpinner } from '../components/common/Spinner';

export default function CourseDetail() {
  const { slug }    = useParams();
  const { user }    = useAuth();
  const navigate    = useNavigate();

  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [enrolling, setEnrolling]   = useState(false);
  const [expanded, setExpanded]     = useState({});

  useEffect(() => {
    courseApi.getBySlug(slug)
      .then(({ data }) => {
        setData(data);
        if (data.course?.modules?.[0]) setExpanded({ [data.course.modules[0].id]: true });
      })
      .catch(() => toast.error('Course not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login', { state: { from: { pathname: `/courses/${slug}` } } });
    setEnrolling(true);
    try {
      const { id, isFree, price } = data.course;
      if (isFree || !parseFloat(price)) {
        await enrollmentApi.enrollFree(id);
        toast.success('Enrolled!');
        navigate(`/learn/${id}`);
      } else {
        const { data: pmt } = await paymentApi.initiate(id);
        window.location.href = pmt.redirectUrl;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return <PageSpinner />;
  if (!data)   return <div className="text-center py-20 text-ink-muted">Course not found</div>;

  const { course, isEnrolled } = data;
  const price        = course.discountPrice || course.price;
  const isFree       = course.isFree || !parseFloat(price);
  const hasDiscount  = course.discountPrice && parseFloat(course.discountPrice) < parseFloat(course.price);
  const totalHours   = course.totalDuration ? (course.totalDuration / 3600).toFixed(1) : null;
  const pct          = hasDiscount ? Math.round((1 - parseFloat(course.discountPrice) / parseFloat(course.price)) * 100) : null;

  return (
    <div className="animate-fade-in">
      {/* Hero banner */}
      <div className="bg-gradient-hero text-white py-12 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="badge badge-blue bg-white/10 text-white/80 capitalize">{course.level}</span>
              {course.category && <span className="badge badge-blue bg-white/10 text-white/80">{course.category}</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{course.title}</h1>
            <p className="text-white/70 leading-relaxed text-sm max-w-xl">{course.shortDescription || course.description?.slice(0, 180)}</p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
              <span className="flex items-center gap-1.5"><Star size={14} className="text-amber-400 fill-amber-400" /><strong className="text-white">{parseFloat(course.rating).toFixed(1)}</strong></span>
              <span className="flex items-center gap-1.5"><Users size={14} />{(course.totalEnrollments || 0).toLocaleString()} students</span>
              <span className="flex items-center gap-1.5"><BookOpen size={14} />{course.totalLessons} lessons</span>
              {totalHours && <span className="flex items-center gap-1.5"><Clock size={14} />{totalHours}h</span>}
              <span className="flex items-center gap-1.5"><Globe size={14} />{course.language}</span>
            </div>

            {course.instructor && (
              <div className="flex items-center gap-3 mt-2">
                {course.instructor.avatar
                  ? <img src={course.instructor.avatar} alt="" className="w-9 h-9 rounded-full object-cover ring-2 ring-white/20" />
                  : <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">{course.instructor.name[0]}</div>}
                <div>
                  <p className="text-xs text-white/50">Instructor</p>
                  <p className="text-sm font-semibold">{course.instructor.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="font-bold text-ink text-lg mb-3">About this course</h2>
            <p className="text-ink-muted text-sm leading-relaxed whitespace-pre-line">{course.description}</p>
          </div>

          {/* Curriculum */}
          {course.modules?.length > 0 && (
            <div className="card p-6">
              <h2 className="font-bold text-ink text-lg mb-1">Curriculum</h2>
              <p className="text-xs text-ink-muted mb-5">{course.modules.length} modules · {course.totalLessons} lessons</p>
              <div className="space-y-2">
                {course.modules.map((mod) => (
                  <div key={mod.id} className="border border-surface-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, [mod.id]: !p[mod.id] }))}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface-50 transition-colors"
                    >
                      <span className="font-semibold text-ink text-sm">{mod.title}</span>
                      <div className="flex items-center gap-3 text-xs text-ink-muted">
                        <span>{mod.lessons?.length || 0} lessons</span>
                        {expanded[mod.id] ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </div>
                    </button>
                    {expanded[mod.id] && mod.lessons?.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between px-4 py-2.5 border-t border-surface-100 text-xs">
                        <div className="flex items-center gap-2">
                          {lesson.isFreePreview
                            ? <Play size={12} className="text-primary-600" />
                            : <Lock size={12} className="text-ink-light" />}
                          <span className={lesson.isFreePreview ? 'text-primary-700 font-medium' : 'text-ink-muted'}>{lesson.title}</span>
                          {lesson.isFreePreview && <span className="badge badge-green">Preview</span>}
                        </div>
                        {lesson.duration > 0 && (
                          <span className="text-ink-light">{Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky sidebar */}
        <div className="lg:col-span-1">
          <div className="card overflow-hidden sticky top-20">
            {course.thumbnail && (
              <div className="aspect-video overflow-hidden">
                <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5 space-y-4">
              {isFree ? (
                <p className="text-3xl font-extrabold text-emerald-600">Free</p>
              ) : (
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-extrabold text-ink">₹{Number(price).toLocaleString('en-IN')}</span>
                  {hasDiscount && (
                    <>
                      <span className="text-ink-light line-through text-sm">₹{Number(course.price).toLocaleString('en-IN')}</span>
                      <span className="badge badge-red">{pct}% off</span>
                    </>
                  )}
                </div>
              )}

              {isEnrolled ? (
                <Link to={`/learn/${course.id}`} className="btn btn-primary btn-lg w-full justify-center">
                  <Play size={16} /> Continue Learning
                </Link>
              ) : (
                <button onClick={handleEnroll} disabled={enrolling} className="btn btn-primary btn-lg w-full">
                  {enrolling ? 'Processing…' : isFree ? <><CheckCircle size={16} />Enroll for Free</> : <><ShoppingCart size={16} />Buy Now</>}
                </button>
              )}

              <ul className="space-y-2 text-xs text-ink-muted pt-1">
                <li className="flex items-center gap-2"><BookOpen size={13} />{course.totalLessons} lessons</li>
                {totalHours && <li className="flex items-center gap-2"><Clock size={13} />{totalHours} hours of content</li>}
                <li className="flex items-center gap-2"><Globe size={13} />Language: {course.language}</li>
                <li className="flex items-center gap-2"><Star size={13} />Level: <span className="capitalize">{course.level}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
