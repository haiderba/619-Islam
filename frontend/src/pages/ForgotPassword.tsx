import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../config/api';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, Clock, RotateCcw, Sparkles } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);
  
  // 60-second cooldown timer for resend
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer: any;
    if (isSent && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else if (cooldown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [isSent, cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/forgot-password', {
        email: email.trim().toLowerCase(),
        origin_url: window.location.origin
      });

      if (res.data.status === 'success') {
        setIsSent(true);
        setCooldown(60);
        setCanResend(false);
      } else {
        setError(res.data.message || 'Failed to send reset link');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset link. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    try {
      setLoading(true);
      await api.post('/forgot-password', {
        email: email.trim().toLowerCase(),
        origin_url: window.location.origin
      });
      setCooldown(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border border-border">
        
        {/* Header Branding */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img 
            src="/logo.png" 
            alt="619 Islam" 
            className="w-20 h-20 object-contain mb-3 drop-shadow-xl hover:scale-105 transition-transform" 
          />
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2">
            <span>Reset Password</span>
            <Sparkles size={20} className="text-amber-500" />
          </h1>
          <p className="text-subtext mt-1 text-xs max-w-xs">
            {isSent 
              ? 'Check your email inbox for your secure 5-minute reset link.' 
              : 'Enter your account email and we will send you a password reset link.'}
          </p>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-2xl mb-5 text-xs font-medium leading-relaxed animate-in fade-in">
            {error}
          </div>
        )}

        {!isSent ? (
          /* Step 1: Input Email */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text mb-1.5 uppercase tracking-wider">
                Account Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={18} className="text-muted" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="e.g. yourname@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-70 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Email Dispatched Screen */
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                <CheckCircle2 size={22} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-text">Reset Link Dispatched</p>
                <p className="text-[11px] text-subtext truncate">{email}</p>
              </div>
            </div>

            {/* 5-minute Expiry Alert Box */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3">
              <Clock size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-300">Valid for 5 Minutes</p>
                <p className="text-[11px] text-subtext mt-0.5 leading-relaxed">
                  For your security, the reset link expires in 5 minutes. Please open your email and click the button now.
                </p>
              </div>
            </div>

            {/* Resend Action with Cooldown */}
            <div className="pt-2 text-center">
              <button
                onClick={handleResend}
                disabled={!canResend || loading}
                className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors ${
                  canResend 
                    ? 'text-primary hover:underline cursor-pointer' 
                    : 'text-muted cursor-not-allowed'
                }`}
              >
                <RotateCcw size={14} />
                <span>{canResend ? 'Resend reset link' : `Resend link in ${cooldown}s`}</span>
              </button>
            </div>
          </div>
        )}

        {/* Back to Login */}
        <div className="mt-6 pt-5 border-t border-border/60 text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-subtext hover:text-text transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;
