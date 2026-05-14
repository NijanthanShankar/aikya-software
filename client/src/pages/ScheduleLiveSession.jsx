import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Calendar, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { liveApi } from '../api';

export default function ScheduleLiveSession() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    duration: 60,
    maxParticipants: 100,
    isPublic: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.scheduledAt) return toast.error('Title and scheduled time are required');
    if (new Date(form.scheduledAt) < new Date()) return toast.error('Scheduled time must be in the future');

    setLoading(true);
    try {
      await liveApi.create(form);
      toast.success('Live session scheduled!');
      navigate('/instructor');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule session');
    } finally {
      setLoading(false);
    }
  };

  const minDateTime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-ink">Schedule a Live Session</h1>
        <p className="text-ink-muted mt-1 text-sm">Set up a live class for your students</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-ink text-base flex items-center gap-2">
            <Video size={18} className="text-primary-600" /> Session Details
          </h2>

          <div>
            <label className="label">Session Title *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="field" placeholder="e.g. Introduction to React Hooks" required />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="field min-h-[90px] resize-y" placeholder="What will students learn in this session?" />
          </div>
        </div>

        <div className="card p-6 space-y-5">
          <h2 className="font-semibold text-ink text-base flex items-center gap-2">
            <Calendar size={18} className="text-primary-600" /> Scheduling
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Date & Time *</label>
              <div className="relative">
                <Calendar size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
                <input type="datetime-local" value={form.scheduledAt} min={minDateTime}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                  className="field pl-10" required />
              </div>
            </div>

            <div>
              <label className="label">Duration (minutes)</label>
              <div className="relative">
                <Clock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
                <select value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })}
                  className="field pl-10">
                  {[30, 45, 60, 90, 120, 180].map((d) => (
                    <option key={d} value={d}>{d} minutes</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Max Participants</label>
              <div className="relative">
                <Users size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-light" />
                <input type="number" value={form.maxParticipants} min={2} max={500}
                  onChange={(e) => setForm({ ...form, maxParticipants: parseInt(e.target.value) })}
                  className="field pl-10" />
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublic ? 'bg-primary-600' : 'bg-surface-200'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isPublic ? 'left-6' : 'left-1'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-ink">Public session</p>
                  <p className="text-xs text-ink-muted">{form.isPublic ? 'Visible to all users' : 'Private / invite-only'}</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Preview */}
        {form.scheduledAt && (
          <div className="card p-4 bg-primary-50 border-primary-100">
            <p className="text-xs font-semibold text-primary-700 mb-1">Session Preview</p>
            <p className="text-sm text-primary-900 font-medium">{form.title || 'Untitled Session'}</p>
            <p className="text-xs text-primary-600 mt-1">
              {new Date(form.scheduledAt).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })} · {form.duration} min
            </p>
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/instructor')} className="btn btn-secondary btn-md">Cancel</button>
          <button type="submit" disabled={loading} className="btn btn-primary btn-md">
            {loading ? 'Scheduling…' : 'Schedule Session'}
          </button>
        </div>
      </form>
    </div>
  );
}
