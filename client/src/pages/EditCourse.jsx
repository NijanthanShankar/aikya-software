import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronUp, Upload, Video, FileText, HelpCircle, GripVertical, Settings, BookOpen, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { moduleApi, lessonApi, courseApi } from '../api';
import { PageSpinner } from '../components/common/Spinner';

const LEVELS     = ['beginner', 'intermediate', 'advanced'];
const CATEGORIES = [
  'Post-Doctoral Fellowship in Reproductive Medicine',
  'Fellowship in Reproductive Medicine',
  'Master Advanced OB-GYN Skills',
  'Fellowship in Gynecological Laparoscopy',
  'Certification Courses in Gynec/Obstetrics',
  'Certification Course for Clinicians (Endoscopy & Reproductive Medicine)',
];

export default function EditCourse() {
  const { courseId } = useParams();
  const navigate     = useNavigate();
  const [course, setCourse]         = useState(null);
  const [modules, setModules]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('content');
  const [expanded, setExpanded]     = useState({});
  const [newModTitle, setNewModTitle] = useState('');
  const [addingMod, setAddingMod]   = useState(false);
  const [addingLesson, setAddingLesson] = useState({});
  const [lessonForms, setLessonForms]   = useState({});
  const [settingsForm, setSettingsForm] = useState({ title: '', shortDescription: '', description: '', category: '', level: 'beginner', language: 'English', isFree: false, price: '', discountPrice: '' });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${courseId}/full`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then(({ course }) => {
        setCourse(course);
        setModules(course?.modules || []);
        setSettingsForm({
          title:            course?.title || '',
          shortDescription: course?.shortDescription || '',
          description:      course?.description || '',
          category:         course?.category || '',
          level:            course?.level || 'beginner',
          language:         course?.language || 'English',
          isFree:           course?.isFree || false,
          price:            course?.price != null ? String(course.price) : '',
          discountPrice:    course?.discountPrice != null ? String(course.discountPrice) : '',
        });
      })
      .catch(() => toast.error('Failed to load course'))
      .finally(() => setLoading(false));
  }, [courseId]);

  const SF = (key) => (e) => setSettingsForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!settingsForm.title.trim()) return toast.error('Title is required');
    setSavingSettings(true);
    try {
      const payload = new FormData();
      Object.entries(settingsForm).forEach(([k, v]) => payload.append(k, v));
      const { data } = await courseApi.update(courseId, payload);
      setCourse(data.course);
      toast.success('Course settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const addModule = async (e) => {
    e.preventDefault();
    if (!newModTitle.trim()) return;
    try {
      const { data } = await moduleApi.create(courseId, { title: newModTitle });
      setModules((p) => [...p, { ...data.module, lessons: [] }]);
      setNewModTitle('');
      setAddingMod(false);
      toast.success('Module added');
    } catch { toast.error('Failed to add module'); }
  };

  const deleteModule = async (id) => {
    if (!confirm('Delete this module and all its lessons?')) return;
    try {
      await moduleApi.delete(id);
      setModules((p) => p.filter((m) => m.id !== id));
      toast.success('Module deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const addLesson = async (moduleId) => {
    const f = lessonForms[moduleId] || {};
    if (!f.title?.trim()) return toast.error('Lesson title required');
    try {
      const fd = new FormData();
      fd.append('title', f.title);
      fd.append('type', f.type || 'video');
      fd.append('isFreePreview', f.isFreePreview ? 'true' : 'false');
      if (f.description) fd.append('description', f.description);
      if (f.video) fd.append('video', f.video);
      if (f.content) fd.append('content', f.content);

      const { data } = await lessonApi.create(moduleId, fd);
      setModules((p) => p.map((m) => m.id === moduleId ? { ...m, lessons: [...(m.lessons || []), data.lesson] } : m));
      setLessonForms((p) => ({ ...p, [moduleId]: {} }));
      setAddingLesson((p) => ({ ...p, [moduleId]: false }));
      toast.success('Lesson added');
    } catch { toast.error('Failed to add lesson'); }
  };

  const deleteLesson = async (moduleId, lessonId) => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await lessonApi.delete(lessonId);
      setModules((p) => p.map((m) => m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m));
      toast.success('Lesson deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const lf = (moduleId) => lessonForms[moduleId] || {};
  const setLF = (moduleId, updates) => setLessonForms((p) => ({ ...p, [moduleId]: { ...p[moduleId], ...updates } }));

  const LessonIcon = ({ type }) =>
    type === 'quiz' ? <HelpCircle size={13} className="text-violet-500" />
    : type === 'text' ? <FileText size={13} className="text-blue-500" />
    : <Video size={13} className="text-emerald-500" />;

  if (loading) return <PageSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Edit Course</h1>
          {course && <p className="text-ink-muted mt-1 text-sm">{course.title}</p>}
        </div>
        <button onClick={() => navigate('/instructor')} className="btn btn-secondary btn-md">← Back</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface-100 rounded-xl p-1 w-fit">
        <button onClick={() => setTab('content')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'content' ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}>
          <BookOpen size={14} /> Content
        </button>
        <button onClick={() => setTab('settings')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'settings' ? 'bg-white shadow-sm text-ink' : 'text-ink-muted hover:text-ink'}`}>
          <Settings size={14} /> Settings & Pricing
        </button>
      </div>

      {/* Settings panel */}
      {tab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-5">
          {/* Basic info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-ink flex items-center gap-2"><BookOpen size={16} className="text-primary-600" />Basic Information</h2>
            <div>
              <label className="label">Course Title *</label>
              <input value={settingsForm.title} onChange={SF('title')} className="field" required />
            </div>
            <div>
              <label className="label">Short Description <span className="text-ink-light font-normal">(shown on card)</span></label>
              <input value={settingsForm.shortDescription} onChange={SF('shortDescription')} className="field" maxLength={200} />
            </div>
            <div>
              <label className="label">Full Description *</label>
              <textarea value={settingsForm.description} onChange={SF('description')} className="field min-h-[100px] resize-y" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Category</label>
                <select value={settingsForm.category} onChange={SF('category')} className="field">
                  <option value="">Select…</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Level</label>
                <select value={settingsForm.level} onChange={SF('level')} className="field">
                  {LEVELS.map((l) => <option key={l} value={l} className="capitalize">{l[0].toUpperCase() + l.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Language</label>
              <input value={settingsForm.language} onChange={SF('language')} className="field" />
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-ink flex items-center gap-2"><DollarSign size={16} className="text-primary-600" />Pricing</h2>
            <label className="flex items-center gap-3 cursor-pointer">
              <button type="button"
                onClick={() => setSettingsForm((p) => ({ ...p, isFree: !p.isFree, price: !p.isFree ? '0' : p.price }))}
                className={`relative w-11 h-6 rounded-full transition-colors ${settingsForm.isFree ? 'bg-primary-600' : 'bg-surface-200'}`}>
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settingsForm.isFree ? 'left-6' : 'left-1'}`} />
              </button>
              <div>
                <p className="text-sm font-medium text-ink">Free course</p>
                <p className="text-xs text-ink-muted">Students can enroll at no cost</p>
              </div>
            </label>

            {!settingsForm.isFree && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price (₹)</label>
                  <input type="number" value={settingsForm.price} onChange={SF('price')} className="field" placeholder="999" min="0" />
                </div>
                <div>
                  <label className="label">Discount Price (₹) <span className="text-ink-light font-normal">optional</span></label>
                  <input type="number" value={settingsForm.discountPrice} onChange={SF('discountPrice')} className="field" placeholder="799" min="0" />
                </div>
              </div>
            )}

            {/* Price preview */}
            {!settingsForm.isFree && settingsForm.price && (
              <div className="flex items-baseline gap-2 p-3 bg-surface-50 rounded-xl">
                <span className="text-lg font-bold text-ink">
                  ₹{Number(settingsForm.discountPrice || settingsForm.price).toLocaleString('en-IN')}
                </span>
                {settingsForm.discountPrice && parseFloat(settingsForm.discountPrice) < parseFloat(settingsForm.price) && (
                  <>
                    <span className="text-sm text-ink-light line-through">₹{Number(settingsForm.price).toLocaleString('en-IN')}</span>
                    <span className="badge badge-red">
                      {Math.round((1 - parseFloat(settingsForm.discountPrice) / parseFloat(settingsForm.price)) * 100)}% off
                    </span>
                  </>
                )}
              </div>
            )}
            {settingsForm.isFree && (
              <div className="p-3 bg-emerald-50 rounded-xl">
                <span className="text-lg font-bold text-emerald-600">Free</span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={savingSettings} className="btn btn-primary btn-md px-8">
              {savingSettings ? 'Saving…' : 'Save Settings'}
            </button>
          </div>
        </form>
      )}

      {/* Content panel */}
      {tab === 'content' && <div className="space-y-3">
        {modules.map((mod, mi) => (
          <div key={mod.id} className="card overflow-hidden">
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-surface-50 transition-colors"
              onClick={() => setExpanded((p) => ({ ...p, [mod.id]: !p[mod.id] }))}
            >
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-ink-light" />
                <span className="font-semibold text-ink text-sm">Module {mi + 1}: {mod.title}</span>
                <span className="badge badge-gray">{mod.lessons?.length || 0} lessons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={(e) => { e.stopPropagation(); deleteModule(mod.id); }}
                  className="btn btn-ghost p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50" title="Delete module">
                  <Trash2 size={14} />
                </button>
                {expanded[mod.id] ? <ChevronUp size={16} className="text-ink-muted" /> : <ChevronDown size={16} className="text-ink-muted" />}
              </div>
            </div>

            {expanded[mod.id] && (
              <div className="border-t border-surface-100">
                {mod.lessons?.map((lesson) => (
                  <div key={lesson.id} className="flex items-center justify-between px-5 py-3 hover:bg-surface-50 border-b border-surface-50 last:border-0">
                    <div className="flex items-center gap-2.5">
                      <LessonIcon type={lesson.type} />
                      <span className="text-sm text-ink">{lesson.title}</span>
                      {lesson.isFreePreview && <span className="badge badge-green text-[10px]">Preview</span>}
                    </div>
                    <button onClick={() => deleteLesson(mod.id, lesson.id)}
                      className="btn btn-ghost p-1 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}

                {addingLesson[mod.id] ? (
                  <div className="p-4 bg-primary-50 space-y-3 border-t border-primary-100">
                    <input placeholder="Lesson title *" value={lf(mod.id).title || ''}
                      onChange={(e) => setLF(mod.id, { title: e.target.value })}
                      className="field text-sm" />
                    <div className="flex flex-wrap gap-3 items-center">
                      <select value={lf(mod.id).type || 'video'} onChange={(e) => setLF(mod.id, { type: e.target.value })}
                        className="field text-sm w-36">
                        <option value="video">📹 Video</option>
                        <option value="text">📝 Text</option>
                        <option value="quiz">❓ Quiz</option>
                      </select>
                      <label className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={lf(mod.id).isFreePreview || false}
                          onChange={(e) => setLF(mod.id, { isFreePreview: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded" />
                        Free Preview
                      </label>
                    </div>

                    {(lf(mod.id).type || 'video') === 'video' && (
                      <label className="flex items-center gap-2.5 text-sm text-ink-muted cursor-pointer bg-white border border-dashed border-surface-200 rounded-xl px-4 py-3 hover:border-primary-300 hover:text-primary-600">
                        <Upload size={15} />
                        {lf(mod.id).video ? lf(mod.id).video.name : 'Upload video file (mp4, webm…)'}
                        <input type="file" accept="video/*" className="hidden"
                          onChange={(e) => setLF(mod.id, { video: e.target.files[0] })} />
                      </label>
                    )}
                    {lf(mod.id).type === 'text' && (
                      <textarea placeholder="Lesson content…" value={lf(mod.id).content || ''}
                        onChange={(e) => setLF(mod.id, { content: e.target.value })}
                        className="field text-sm min-h-[70px]" />
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => addLesson(mod.id)} className="btn btn-primary btn-sm">Add Lesson</button>
                      <button onClick={() => setAddingLesson((p) => ({ ...p, [mod.id]: false }))} className="btn btn-secondary btn-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setAddingLesson((p) => ({ ...p, [mod.id]: true }))}
                    className="w-full py-3 text-sm text-primary-600 hover:bg-primary-50 flex items-center justify-center gap-2 transition-colors border-t border-surface-100">
                    <Plus size={15} /> Add Lesson
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Add module */}
        {addingMod ? (
          <form onSubmit={addModule} className="card p-4 flex gap-3">
            <input autoFocus value={newModTitle} onChange={(e) => setNewModTitle(e.target.value)}
              placeholder="Module title…" className="field flex-1" />
            <button type="submit" className="btn btn-primary btn-md">Add</button>
            <button type="button" onClick={() => setAddingMod(false)} className="btn btn-secondary btn-md">Cancel</button>
          </form>
        ) : (
          <button onClick={() => setAddingMod(true)}
            className="w-full card py-4 text-primary-600 hover:bg-primary-50 flex items-center justify-center gap-2 font-semibold text-sm transition-colors border-2 border-dashed border-primary-200">
            <Plus size={17} /> Add Module
          </button>
        )}
      </div>}
    </div>
  );
}
