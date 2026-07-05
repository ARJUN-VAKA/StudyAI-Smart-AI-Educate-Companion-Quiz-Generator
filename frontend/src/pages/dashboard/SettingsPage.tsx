import React, { useState } from 'react';
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store';
import { HiUser, HiLockClosed, HiDownload, HiTrash, HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'data'>('profile');
  const [loading, setLoading] = useState(false);

  // Profile Form
  const [name, setName] = useState(user?.displayName || '');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await updateProfile(user, { displayName: name });
      setUser({ ...user, displayName: name } as typeof user);
      toast.success('Profile updated successfully.');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user.email) return;
    if (newPassword.length < 6) { toast.error('Password must be at least 6 characters.'); return; }
    
    setLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Password updated successfully.');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || 'Failed to update password. Check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    toast.success('Data export started. You will receive an email shortly.');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is disabled in this demo environment.');
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">Settings</h1>
        <p className="text-sm text-[#64748B] mt-1">Manage your account preferences and security.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar tabs */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-1">
          {[
            { id: 'profile', label: 'Profile', icon: HiUser },
            { id: 'security', label: 'Security', icon: HiLockClosed },
            { id: 'data', label: 'Data & Privacy', icon: HiDownload },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'}`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'profile' && (
            <div className="card overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E2E8F0]">
                <h2 className="text-base font-semibold text-[#0F172A]">Profile Information</h2>
                <p className="text-xs text-[#64748B] mt-1">Update your personal information.</p>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{name.charAt(0).toUpperCase() || 'S'}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{user?.email}</p>
                    <p className="text-xs text-[#64748B] mt-0.5">Account ID: {user?.uid.slice(0, 8)}...</p>
                  </div>
                </div>

                <div>
                  <label className="label">Full Name</label>
                  <input type="text" className="input-field max-w-md" value={name} onChange={e => setName(e.target.value)} required />
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <input type="email" className="input-field max-w-md bg-[#F1F5F9] text-[#64748B] cursor-not-allowed" value={user?.email || ''} disabled />
                  <p className="text-xs text-[#94A3B8] mt-1.5 flex items-center gap-1">
                    <HiCheckCircle className="w-3.5 h-3.5 text-success" /> Email is verified
                  </p>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="card overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E2E8F0]">
                <h2 className="text-base font-semibold text-[#0F172A]">Update Password</h2>
                <p className="text-xs text-[#64748B] mt-1">Ensure your account is using a long, random password to stay secure.</p>
              </div>
              <form onSubmit={handleUpdatePassword} className="p-6 space-y-4 max-w-md">
                <div>
                  <label className="label">Current Password</label>
                  <input type="password" className="input-field" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input type="password" className="input-field" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="card overflow-hidden">
                <div className="px-6 py-5 border-b border-[#E2E8F0]">
                  <h2 className="text-base font-semibold text-[#0F172A]">Export Data</h2>
                  <p className="text-xs text-[#64748B] mt-1">Download all your study materials, flashcards, quizzes, and analytics.</p>
                </div>
                <div className="p-6">
                  <button onClick={handleExportData} className="btn-secondary">
                    <HiDownload className="w-4 h-4" /> Request Data Export
                  </button>
                </div>
              </div>

              <div className="card overflow-hidden border-danger/30">
                <div className="px-6 py-5 border-b border-danger/20 bg-red-50/50">
                  <h2 className="text-base font-semibold text-danger">Delete Account</h2>
                  <p className="text-xs text-red-600/70 mt-1">Permanently delete your account and all associated data.</p>
                </div>
                <div className="p-6">
                  <p className="text-sm text-[#64748B] mb-4">
                    Once your account is deleted, all of your study materials and progress will be permanently erased. This action cannot be undone.
                  </p>
                  <button onClick={handleDeleteAccount} className="btn-primary bg-danger hover:bg-red-600 active:bg-red-700 border-danger">
                    <HiTrash className="w-4 h-4" /> Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
