import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, ArrowRight, BookOpen, KeyRound, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const FIQH_OPTIONS = [
  "Sunni (Hanafi)",
  "Sunni (Shafi)",
  "Sunni (Maliki)",
  "Sunni (Hanbali)",
  "Shia (Jafari)",
  "Shia (Zaydi)",
  "Shia (Ismaili)",
  "Ibadi",
  "Salafi / Ahle Hadith"
];

const Signup: React.FC = () => {
  const { signUp, verifyOtp, resendOtp, loading } = useAuth();
  const navigate = useNavigate();
  
  // Step State: 'form' | 'otp'
  const [step, setStep] = useState<'form' | 'otp'>('form');
  
  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fiqh, setFiqh] = useState(FIQH_OPTIONS[0]);
  
  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
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

  // Focus OTP input when switching to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 150);
    }
  }, [step]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (!username || !email || !password || !fiqh) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await signUp(email, password, username, name || username, fiqh);
      setStep('otp');
      setResendCooldown(60);
      setSuccessMsg(`Verification code sent to ${email}`);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (otpCode.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    try {
      await verifyOtp(email, otpCode);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired verification code');
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setError('');
    try {
      setIsResending(true);
      await resendOtp(email);
      setResendCooldown(60);
      setSuccessMsg('New verification code sent to your email!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm rounded-3xl bg-card p-7 sm:p-8 shadow-2xl border border-border relative overflow-hidden">
        
        {/* Top Logo and Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img src="/logo.png" alt="619 Islam" className="w-20 h-20 object-contain mb-2 drop-shadow-xl hover:scale-105 transition-transform" />
          <h1 className="text-2xl font-black text-text tracking-tight">
            {step === 'otp' ? 'Verify Your Email' : 'Create Account'}
          </h1>
          <p className="text-subtext mt-1 text-xs">
            {step === 'otp'
              ? `We sent a 6-digit code to ${email}`
              : 'Join 619 Islam to track prayers, Quran & daily habits'}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-2xl mb-5 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-2xl mb-5 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* ── STEP 1: SIGNUP FORM ── */}
        {step === 'form' ? (
          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={17} className="text-muted" />
                </div>
                <input
                  type="text"
                  placeholder="Full Name (Optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <span className="text-muted font-bold text-sm">@</span>
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={17} className="text-muted" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm"
                />
              </div>
            </div>
            
            {/* Password */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={17} className="text-muted" />
                </div>
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm"
                />
              </div>
            </div>

            {/* Fiqh / School */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <BookOpen size={17} className="text-muted" />
                </div>
                <select
                  value={fiqh}
                  onChange={(e) => setFiqh(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm appearance-none cursor-pointer"
                >
                  {FIQH_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-muted mt-1 px-1">Used for accurate prayer timings calculation.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-70 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* ── STEP 2: 6-DIGIT OTP VERIFICATION ── */
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="flex flex-col items-center">
              <label className="text-xs font-bold text-subtext uppercase tracking-wider mb-2">
                Enter 6-Digit Code
              </label>

              <div className="relative w-full">
                <input
                  ref={otpInputRef}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="••••••"
                  className="w-full text-center text-3xl font-black tracking-[14px] py-4 bg-surface border-2 border-primary/40 focus:border-primary rounded-2xl outline-none text-text transition-all shadow-inner placeholder:tracking-[10px]"
                />
              </div>
              <p className="text-[11px] text-muted mt-2 text-center">
                Code expires in 10 minutes.
              </p>
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <KeyRound size={17} />
                  <span>Verify & Login</span>
                </>
              )}
            </button>

            {/* Resend Code & Back */}
            <div className="pt-2 flex flex-col items-center gap-2.5 text-xs text-subtext">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || isResending}
                className="flex items-center gap-1.5 text-primary hover:underline font-bold disabled:text-muted disabled:no-underline transition-colors"
              >
                <RefreshCw size={13} className={isResending ? 'animate-spin' : ''} />
                <span>
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : 'Resend verification code'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setError('');
                }}
                className="text-muted hover:text-text transition-colors mt-1"
              >
                ← Edit email address
              </button>
            </div>
          </form>
        )}

        {/* Footer Link to Login */}
        <div className="mt-6 pt-4 border-t border-border/60 text-center text-xs text-subtext">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
