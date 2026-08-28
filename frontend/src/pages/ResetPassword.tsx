import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api, setToken } from '../config/api';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const rawToken = searchParams.get('token') || '';
  const rawEmail = searchParams.get('email') || '';

  const token = decodeURIComponent(rawToken).trim();
  const email = decodeURIComponent(rawEmail).trim().toLowerCase();

  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validate token on component mount
  useEffect(() => {
    const checkToken = async () => {
      if (!token || !email) {
        setTokenError('Invalid or missing password reset link. Please request a new one.');
        setVerifying(false);
        return;
      }

      try {
        await api.get(`/verify-reset-token?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
        setTokenValid(true);
      } catch (err: any) {
        setTokenError(err.response?.data?.detail || 'This reset link has expired (15-minute limit) or has already been used.');
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, [token, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/reset-password', {
        email: email.trim().toLowerCase(),
        token: token.trim(),
        new_password: newPassword
      });

      // Save token and auto-login
      if (res.data.access_token) {
        setToken(res.data.access_token);
        if (updateUser) updateUser(res.data.user);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-subtext">Verifying security token...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-md rounded-3xl bg-card p-6 sm:p-8 shadow-2xl border border-border">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img 
            src="/logo.png" 
            alt="619 Islam" 
            className="w-20 h-20 object-contain mb-3 drop-shadow-xl" 
          />
          <h1 className="text-2xl font-black text-text tracking-tight flex items-center gap-2">
            <span>Set New Password</span>
            <ShieldCheck size={22} className="text-amber-500" />
          </h1>
          <p className="text-subtext mt-1 text-xs max-w-xs">
            {email ? `Updating security credentials for ${email}` : 'Enter your new password below.'}
          </p>
        </div>

        {/* Error Banner */}
        {(error || tokenError) && (
          <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-3 rounded-2xl mb-5 text-xs font-medium leading-relaxed flex items-start gap-2.5">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error || tokenError}</span>
          </div>
        )}

        {/* Success Banner */}
        {success ? (
          <div className="p-6 bg-success/10 border border-success/30 rounded-2xl text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-base font-black text-text">Password Updated!</h3>
            <p className="text-xs text-subtext leading-relaxed">
              Your password has been changed successfully. Logging you into your dashboard...
            </p>
          </div>
        ) : !tokenValid ? (
          /* Invalid / Expired Token View */
          <div className="space-y-4 text-center">
            <p className="text-xs text-subtext leading-relaxed">
              This password reset link is either invalid, already used, or has exceeded its 15-minute security limit.
            </p>
            <Link
              to="/forgot-password"
              className="inline-flex items-center justify-center w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-primary/20 transition-all text-xs"
            >
              Request a New Reset Link
            </Link>
          </div>
        ) : (
          /* Valid Token -> Password Reset Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text mb-1.5 uppercase tracking-wider">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-muted" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
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

            <div>
              <label className="block text-xs font-bold text-text mb-1.5 uppercase tracking-wider">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={18} className="text-muted" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-text text-sm"
                />
              </div>
            </div>

            {/* Validation Feedback */}
            {newPassword && confirmPassword && (
              <div className="text-[11px] font-semibold flex items-center gap-1.5">
                {newPassword === confirmPassword ? (
                  <span className="text-success flex items-center gap-1">
                    <CheckCircle2 size={13} /> Passwords match
                  </span>
                ) : (
                  <span className="text-danger flex items-center gap-1">
                    <AlertCircle size={13} /> Passwords do not match
                  </span>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || newPassword !== confirmPassword || newPassword.length < 6}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 px-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-95 disabled:opacity-50 text-sm"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Change Password & Sign In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <div className="mt-6 pt-5 border-t border-border/60 text-center">
          <Link 
            to="/login" 
            className="text-xs font-bold text-subtext hover:text-text transition-colors"
          >
            Back to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;
