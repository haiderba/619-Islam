import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setToken } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { 
  Mail, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  RotateCcw, 
  Eye, 
  EyeOff,
  AlertCircle,
  ShieldCheck 
} from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  // Step state: 'email' | 'reset'
  const [step, setStep] = useState<'email' | 'reset'>('email');

  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // 60-second cooldown timer for resend
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const codeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let timer: any;
    if (step === 'reset' && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    } else if (cooldown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

  useEffect(() => {
    if (step === 'reset') {
      setTimeout(() => codeInputRef.current?.focus(), 150);
    }
  }, [step]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normEmail = email.trim().toLowerCase();
    if (!normEmail || !normEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/forgot-password', {
        email: normEmail,
        origin_url: window.location.origin
      });

      if (res.data.status === 'success') {
        setStep('reset');
        setCooldown(60);
        setCanResend(false);
        setSuccessMsg(`We sent a 6-digit password reset code to ${normEmail}`);
      } else {
        setError(res.data.message || 'Failed to send reset code');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send reset code. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normEmail = email.trim().toLowerCase();
    const cleanCode = resetCode.trim();

    if (cleanCode.length !== 6) {
      setError('Please enter the full 6-digit reset code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/reset-password', {
        email: normEmail,
        token: cleanCode,
        new_password: newPassword
      });

      if (res.data.access_token) {
        setToken(res.data.access_token);
        if (updateUser) updateUser(res.data.user);
      }

      setSuccessMsg('Password updated successfully! Logging you in...');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid or expired reset code. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || loading) return;
    setError('');
    const normEmail = email.trim().toLowerCase();

    try {
      setLoading(true);
      await api.post('/forgot-password', {
        email: normEmail,
        origin_url: window.location.origin
      });
      setCooldown(60);
      setCanResend(false);
      setSuccessMsg('A fresh 6-digit reset code has been sent to your email!');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to resend reset code.');
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
            <span>{step === 'reset' ? 'Set New Password' : 'Reset Password'}</span>
            <ShieldCheck size={22} className="text-amber-500" />
          </h1>
          <p className="text-subtext mt-1 text-xs max-w-xs">
            {step === 'reset' 
              ? `Enter the 6-digit code sent to ${email} & choose your new password.` 
              : 'Enter your account email and we will send you a 6-digit password reset code.'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-2xl mb-5 text-xs font-medium leading-relaxed flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-2xl mb-5 text-xs font-medium leading-relaxed flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── STEP 1: REQUEST 6-DIGIT CODE ── */}
        {step === 'email' ? (
          <form onSubmit={handleRequestCode} className="space-y-4">
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
                  <span>Send 6-Digit Reset Code</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── STEP 2: ENTER CODE & SET NEW PASSWORD ── */
          <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in">
            {/* 6-Digit Reset Code */}
            <div>
              <label className="block text-xs font-bold text-text mb-1.5 uppercase tracking-wider text-center">
                6-Digit Reset Code
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <KeyRound size={18} className="text-muted" />
                </div>
                <input
                  ref={codeInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  placeholder="000000"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-11 pr-4 py-3 bg-surface border-2 border-primary/40 focus:border-primary rounded-2xl text-center text-xl tracking-[8px] font-mono font-bold text-text outline-none"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-text mb-1 uppercase tracking-wider">
                New Password (Min 6 Characters)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-muted" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-text mb-1 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-muted" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || resetCode.length !== 6}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Reset Password & Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Resend Code & Switch Email */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-subtext hover:text-text font-medium"
              >
                ← Change Email
              </button>

              <button
                type="button"
                onClick={handleResendCode}
                disabled={!canResend || loading}
                className={`font-bold flex items-center gap-1 ${
                  canResend 
                    ? 'text-primary hover:underline cursor-pointer' 
                    : 'text-muted cursor-not-allowed'
                }`}
              >
                <RotateCcw size={12} />
                <span>{canResend ? 'Resend Code' : `Resend in ${cooldown}s`}</span>
              </button>
            </div>
          </form>
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
