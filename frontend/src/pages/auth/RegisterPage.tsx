import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { HiAcademicCap, HiMail, HiLockClosed, HiUser, HiEye, HiEyeOff } from 'react-icons/hi';
import toast from 'react-hot-toast';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(user, { displayName: form.name });
      toast.success('Account created! Welcome to StudyAI.');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Registration failed';
      setError(
        message.includes('email-already-in-use')
          ? 'An account with this email already exists.'
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary flex-col items-center justify-center p-12">
        <div className="max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6">
            <HiAcademicCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Start Learning Smarter</h1>
          <p className="text-primary-100 leading-relaxed">
            Create your free account and unlock AI-powered summaries, flashcards, quizzes, and personalized study plans.
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-page">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <HiAcademicCap className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-[var(--text-main)]">StudyAI</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-main)] mb-1">Create Account</h2>
            <p className="text-sm text-[var(--text-muted)]">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-5">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full name</label>
              <div className="relative">
                <HiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="text"
                  className="input-field pl-11"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Email address</label>
              <div className="relative">
                <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  className="input-field pl-11"
                  placeholder="you@university.edu"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input type={showPassword ? 'text' : 'password'} className="input-field pl-10 pr-10"
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]">
                  {showPassword ? <HiEyeOff className="w-4 h-4" /> : <HiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <HiLockClosed className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <input type="password" className="input-field pl-10" placeholder="Repeat password"
                  value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
