import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { courseApi } from '../api';
import CourseCard from '../components/course/CourseCard';
import { PageSpinner } from '../components/common/Spinner';

const LEVELS      = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES = [
  'Post-Doctoral Fellowship in Reproductive Medicine',
  'Fellowship in Reproductive Medicine',
  'Master Advanced OB-GYN Skills',
  'Fellowship in Gynecological Laparoscopy',
  'Certification Courses in Gynec/Obstetrics',
  'Certification Course for Clinicians (Endoscopy & Reproductive Medicine)',
];
const SORTS       = [
  { value: 'createdAt',  label: 'Newest' },
  { value: 'popular',   label: 'Most Popular' },
  { value: 'rating',    label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc',label: 'Price: High → Low' },
];

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses]   = useState([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const level    = searchParams.get('level')    || '';
  const sort     = searchParams.get('sort')     || 'createdAt';

  useEffect(() => {
    setLoading(true);
    courseApi.getAll({ search, category, level, sort, page, limit: 12 })
      .then(({ data }) => { setCourses(data.courses); setTotal(data.total); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, category, level, sort, page]);

  const set = (key, value) => {
    const p = new URLSearchParams(searchParams);
    value ? p.set(key, value) : p.delete(key);
    setSearchParams(p);
    setPage(1);
  };

  const hasFilters = search || category || level;
  const totalPages = Math.ceil(total / 12);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink">All Courses</h1>
        <p className="text-ink-muted mt-1 text-sm">{total.toLocaleString()} courses available</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
          <input value={search} onChange={(e) => set('search', e.target.value)}
            placeholder="Search courses…" className="field pl-10 w-full" />
        </div>
        <select value={sort} onChange={(e) => set('sort', e.target.value)} className="field w-full sm:w-48">
          {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`btn btn-secondary btn-md flex-shrink-0 ${hasFilters ? 'border-primary-400 text-primary-600' : ''}`}>
          <SlidersHorizontal size={15} /> Filters
          {hasFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
        </button>
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {search && <Chip label={`"${search}"`} onRemove={() => set('search', '')} />}
          {category && <Chip label={category} onRemove={() => set('category', '')} />}
          {level && <Chip label={level} onRemove={() => set('level', '')} />}
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-5 animate-slide-up">
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2.5">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button key={c} onClick={() => set('category', category === c ? '' : c)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${category === c ? 'bg-primary-600 text-white border-primary-600' : 'border-surface-200 text-ink-muted hover:border-primary-300'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2.5">Level</p>
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button key={l} onClick={() => set('level', level === l ? '' : l)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border capitalize transition-all ${level === l ? 'bg-primary-600 text-white border-primary-600' : 'border-surface-200 text-ink-muted hover:border-primary-300'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <PageSpinner />
      ) : courses.length === 0 ? (
        <div className="card p-16 text-center">
          <Search size={44} className="mx-auto mb-4 text-ink-light" />
          <p className="text-ink-muted">No courses found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {courses.map((c) => <CourseCard key={c.id} course={c} />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-10">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn btn-secondary btn-sm disabled:opacity-40">Prev</button>
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const p = i + 1;
            return (
              <button key={p} onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-surface-200 text-ink-muted hover:border-primary-300'}`}>
                {p}
              </button>
            );
          })}
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary btn-sm disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}

function Chip({ label, onRemove }) {
  return (
    <span className="flex items-center gap-1.5 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-primary-900"><X size={12} /></button>
    </span>
  );
}
