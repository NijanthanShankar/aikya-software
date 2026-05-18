import { useState } from 'react';
import { User, Mail, Shield, Edit2, Lock, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [infoLoading, setInfoLoading] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleInfoSave = async () => {
    if (!infoForm.name.trim()) return toast.error('Name is required');
    setInfoLoading(true);
    try {
      const { data } = await authApi.updateProfile({ name: infoForm.name, bio: infoForm.bio });
      updateUser(data.user);
      setEditingInfo(false);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setInfoLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-extrabold text-ink mb-8">My Profile</h1>

      {/* Avatar + basic info */}
      <div className="card-padded mb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-white text-2xl font-extrabold shadow-md">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-ink text-lg">{user?.name}</p>
              <p className="text-sm text-ink-muted">{user?.email}</p>
              <span className="badge badge-blue mt-1 capitalize">{user?.role}</span>
            </div>
          </div>
          {!editingInfo && (
            <button onClick={() => setEditingInfo(true)} className="btn btn-secondary btn-sm">
              <Edit2 size={14} /> Edit
            </button>
          )}
        </div>

        {editingInfo ? (
          <div className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="field" value={infoForm.name}
                onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea className="field resize-none" rows={3} value={infoForm.bio}
                placeholder="Tell us about yourself..."
                onChange={(e) => setInfoForm({ ...infoForm, bio: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <button onClick={handleInfoSave} disabled={infoLoading} className="btn btn-primary btn-sm">
                <Save size={14} /> {infoLoading ? 'Saving…' : 'Save'}
              </button>
              <button onClick={() => { setEditingInfo(false); setInfoForm({ name: user?.name || '', bio: user?.bio || '' }); }}
                className="btn btn-secondary btn-sm">
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <User size={14} /> <span>{user?.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Mail size={14} /> <span>{user?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-muted">
              <Shield size={14} /> <span className="capitalize">{user?.role}</span>
            </div>
            {user?.bio && <p className="text-sm text-ink-muted mt-2 leading-relaxed">{user.bio}</p>}
          </div>
        )}
      </div>

      {/* Change password */}
      <div className="card-padded">
        <h2 className="font-bold text-ink mb-5 flex items-center gap-2"><Lock size={16} /> Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="field" value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="field" value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input type="password" className="field" value={pwForm.confirmPassword}
              onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
          </div>
          <button type="submit" disabled={pwLoading} className="btn btn-primary btn-md">
            {pwLoading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
