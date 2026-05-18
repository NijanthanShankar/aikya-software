import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, BookOpen, DollarSign, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { courseApi } from '../api';

const LEVELS     = ['beginner','intermediate','advanced'];
const CATEGORIES = [
  'Post-Doctoral Fellowship in Reproductive Medicine',
  'Fellowship in Reproductive Medicine',
  'Master Advanced OB-GYN Skills',
  'Fellowship in Gynecological Laparoscopy',
  'Certification Courses in Gynec/Obstetrics',
  'Certification Course for Clinicians (Endoscopy & Reproductive Medicine)',
];

export default function CreateCourse() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', shortDescription: '',
    category: '', level: 'beginner', language: 'English',
    price: '', discountPrice: '', isFree: false,
  });
  const [thumbnail, setThumbnail]   = useState(null);
  const [preview, setPreview]       = useState('');
  const [loading, setLoading]       = useState(false);

  const F = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleThumb = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnail(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return toast.error('Title and description are required');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (thumbnail) fd.append('thumbnail', thumbnail);
      const { data } = await courseApi.create(fd);
      toast.success('Course created! Add modules and lessons.');
      navigate(`/instructor/edit-course/${data.course.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink">Create New Course</h1>
        <p className="text-ink-muted mt-1 text-sm">Fill in the details to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic info */}
        <Section title="Basic Information" icon={BookOpen}>
          <div>
            <label className="label">Course Title *</label>
            <input value={form.title} onChange={F('title')} className="field" placeholder="e.g. Complete React Developer Course 2024" required />
          </div>
          <div>
            <label className="label">Short Description <span className="text-ink-light font-normal">(shown on card)</span></label>
            <input value={form.shortDescription} onChange={F('shortDescription')} className="field" placeholder="One-line hook for your course" maxLength={200} />
          </div>
          <div>
            <label className="label">Full Description *</label>
            <textarea value={form.description} onChange={F('description')} className="field min-h-[120px] resize-y" placeholder="What will students learn and achieve?" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={F('category')} className="field">
                <option value="">Select…</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Level</label>
              <select value={form.level} onChange={F('level')} className="field">
                {LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l[0].toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Language</label>
            <input value={form.language} onChange={F('language')} className="field" />
          </div>
        </Section>

        {/* Thumbnail */}
        <Section title="Course Thumbnail" icon={Tag}>
          {preview ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-surface-100">
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => { setThumbnail(null); setPreview(''); }}
                className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50">
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-surface-200 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <Upload size={28} className="text-ink-light mb-2" />
              <p className="text-sm text-ink-muted">Click to upload thumbnail</p>
              <p className="text-xs text-ink-light mt-1">JPG, PNG, WebP · max 5 MB</p>
              <input type="file" accept="image/*" onChange={handleThumb} className="hidden" />
            </label>
          )}
        </Section>

        {/* Pricing */}
        <Section title="Pricing" icon={DollarSign}>
          <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" onClick={() => setForm({ ...form, isFree: !form.isFree, price: !form.isFree ? '0' : form.price })}
              className={`relative w-11 h-6 rounded-full transition-colors ${form.isFree ? 'bg-primary-600' : 'bg-surface-200'}`}>
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isFree ? 'left-6' : 'left-1'}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-ink">Free course</p>
              <p className="text-xs text-ink-muted">Students can enroll at no cost</p>
            </div>
          </label>

          {!form.isFree && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Price (₹)</label>
                <input type="number" value={form.price} onChange={F('price')} className="field" placeholder="999" min="0" />
              </div>
              <div>
                <label className="label">Discount Price (₹) <span className="text-ink-light font-normal">optional</span></label>
                <input type="number" value={form.discountPrice} onChange={F('discountPrice')} className="field" placeholder="799" min="0" />
              </div>
            </div>
          )}
        </Section>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={() => navigate('/instructor')} className="btn btn-secondary btn-md">Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary btn-md px-8">
            {loading ? 'Creating…' : 'Create Course & Add Content'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-semibold text-ink flex items-center gap-2">
        <Icon size={16} className="text-primary-600" />{title}
      </h2>
      {children}
    </div>
  );
}
