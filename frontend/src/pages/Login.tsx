import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, ArrowRight, KeyRound, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export const Login: React.FC = () => {
  const { signIn, verifyOtp, resendOtp, loading } = useAuth();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // In-place OTP Verification State
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const otpInputRef = useRef<HTMLInputElement | null>(null);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  useEffect(() => {
    if (showOtpStep) {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [showOtpStep]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    try {
      await signIn(username.trim(), password);
      navigate('/');
    } catch (err: any) {
      const msg = err.message || 'Login failed';
      setError(msg);

      // Check if error is due to unverified email
      if (msg.toLowerCase().includes('not verified') || msg.toLowerCase().includes('verify your email')) {
        const guessedEmail = username.includes('@') ? username.trim() : '';
        setUnverifiedEmail(guessedEmail);
        setShowOtpStep(true);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    
    const targetEmail = unverifiedEmail.trim() || (username.includes('@') ? username.trim() : '');
    if (!targetEmail) {
      setOtpError('Please provide your account email address below.');
      return;
    }

    if (otpCode.trim().length !== 6) {
      setOtpError('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      await verifyOtp(targetEmail, otpCode.trim());
      navigate('/');
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired verification code.');
    }
  };

  const handleResendOtp = async () => {
    const targetEmail = unverifiedEmail.trim() || (username.includes('@') ? username.trim() : '');
    if (!targetEmail) {
      setOtpError('Please enter your email address to receive a new code.');
      return;
    }

    if (resendCooldown > 0 || isResending) return;
    setOtpError('');
    try {
      setIsResending(true);
      await resendOtp(targetEmail);
      setResendCooldown(60);
      setOtpSuccess('A fresh 6-digit verification code has been sent to your email!');
      setTimeout(() => setOtpSuccess(''), 5000);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend verification code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border border-border">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img 
            src="/logo.png" 
            alt="619 Islam" 
            className="w-20 h-20 object-contain mb-3 drop-shadow-xl hover:scale-105 transition-transform" 
          />
          <h1 className="text-2xl font-black text-text tracking-tight">
            {showOtpStep ? 'Verify Account' : 'Welcome Back'}
          </h1>
          <p className="text-subtext mt-1 text-xs">
            {showOtpStep 
              ? 'Enter the 6-digit code sent to your email' 
              : 'Sign in to track your prayers, Quran & daily habits'}
          </p>
        </div>

        {/* ── STEP 1: REGULAR LOGIN FORM ── */}
        {!showOtpStep ? (
          <>
            {error && (
              <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-2xl mb-5 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text mb-1 uppercase tracking-wider">
                  Username or Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <User size={18} className="text-muted" />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Username or email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-text mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock size={18} className="text-muted" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-0.5">
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-bold text-primary hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
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
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-subtext">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline font-bold">
                Sign Up
              </Link>
            </div>
          </>
        ) : (
          /* ── STEP 2: IN-PLACE OTP VERIFICATION ── */
          <div className="space-y-4 animate-in fade-in">
            {otpError && (
              <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            {otpSuccess && (
              <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{otpSuccess}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {!unverifiedEmail && (
                <div>
                  <label className="block text-[11px] font-bold text-text mb-1 uppercase tracking-wider">
                    Confirm Account Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail size={17} className="text-muted" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={unverifiedEmail}
                      onChange={(e) => setUnverifiedEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-xl text-text text-xs"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-text mb-1.5 uppercase tracking-wider text-center">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound size={18} className="text-muted" />
                  </div>
                  <input
                    ref={otpInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-11 pr-4 py-3 bg-surface border-2 border-primary/40 focus:border-primary rounded-2xl text-center text-xl tracking-[8px] font-mono font-bold text-text outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpCode.length !== 6}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowOtpStep(false)}
                className="text-subtext hover:text-text font-medium"
              >
                ← Back to Login
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isResending}
                className={`font-bold flex items-center gap-1 ${
                  resendCooldown > 0 || isResending
                    ? 'text-muted cursor-not-allowed'
                    : 'text-primary hover:underline'
                }`}
              >
                <RefreshCw size={12} className={isResending ? 'animate-spin' : ''} />
                <span>{resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
