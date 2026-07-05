import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { HiAcademicCap, HiMail, HiArrowLeft, HiCheckCircle } from 'react-icons/hi';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email.'); return; }
    setError('');
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSent(true);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center px-6 py-12">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <HiAcademicCap className="text-white w-5 h-5" />
        </div>
        <span className="font-bold text-[#0F172A]">StudyAI</span>
      </div>

      <div className="card w-full max-w-sm p-8">
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <HiCheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-2">Check your email</h2>
            <p className="text-sm text-[#64748B] mb-6">
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
            <Link to="/login" className="btn-primary w-full justify-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#0F172A] mb-1">Forgot Password?</h2>
              <p className="text-sm text-[#64748B]">
                Enter your email and we'll send a reset link.
              </p>
            </div>

            {error && <div className="alert alert-error mb-4"><span>{error}</span></div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <div className="relative">
                  <HiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                  <input type="email" className="input-field pl-10" placeholder="you@university.edu"
                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </button>
            </form>

            <Link to="/login" className="flex items-center justify-center gap-1.5 mt-5 text-sm text-[#64748B] hover:text-[#0F172A]">
              <HiArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
