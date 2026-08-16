import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';
import { 
  User, 
  Lock, 
  MapPin, 
  BookOpen, 
  LogOut, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  Bell, 
  RotateCcw, 
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppUpdate } from '../context/UpdateContext';

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

const QURAN_TRANSLATIONS = [
  { id: "85", label: "English (M.A.S. Abdel Haleem)" },
  { id: "20", label: "English (Saheeh International)" },
  { id: "234", label: "Urdu (Fatah Muhammad Jalandhari)" },
  { id: "158", label: "Urdu (Dr. Israr Ahmad - Bayan-ul-Quran)" },
  { id: "54", label: "Urdu (Maulana Muhammad Junagarhi)" },
  { id: "831", label: "Roman Urdu (Abul Ala Maududi)" },
  { id: "118", label: "Pashto / پښتو (Zakaria Abulsalam)" },
  { id: "238", label: "Sindhi / سنڌي (Taj Mehmood Amroti)" },
  { id: "122", label: "Hindi / हिन्दी (Maulana Azizul Haque)" },
  { id: "31", label: "French (Muhammad Hamidullah)" },
  { id: "83", label: "Spanish (Sheikh Isa Garcia)" },
];

const Settings: React.FC = () => {
  const { user, signOut, updateUser } = useAuth();
  const navigate = useNavigate();
  const { 
    updateAvailable, 
    applyingUpdate, 
    applyUpdate, 
    currentVersion, 
    setShowWhatsNew,
    checkForUpdates,
    isCheckingUpdates,
    serverVersion,
    requiresReinstall,
    reinstallApp,
    notificationPermission,
    requestNotificationPermission
  } = useAppUpdate();
  
  const [fiqh, setFiqh] = useState(user?.fiqh || FIQH_OPTIONS[0]);
  const [quranTranslation, setQuranTranslation] = useState(user?.quran_translation || QURAN_TRANSLATIONS[0].id);
  const [lat, setLat] = useState(user?.latitude || '');
  const [lng, setLng] = useState(user?.longitude || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  // Update local state if user context updates late
  useEffect(() => {
    if (user) {
      setFiqh(user.fiqh);
      setQuranTranslation(user.quran_translation || QURAN_TRANSLATIONS[0].id);
      setLat(user.latitude || '');
      setLng(user.longitude || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      const res = await api.put('/user/me', {
        fiqh,
        quran_translation: quranTranslation,
        latitude: lat,
        longitude: lng
      });
      // Update AuthContext user 
      if (updateUser) updateUser(res.data);
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.response?.data?.detail || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setMessage({ text: 'Please fill in both password fields', type: 'error' });
      return;
    }
    try {
      setLoading(true);
      setMessage({ text: '', type: '' });
      await api.put('/user/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setMessage({ text: 'Password changed successfully', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setMessage({ text: err.response?.data?.detail || 'Failed to change password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ text: 'Geolocation is not supported by your browser', type: 'error' });
      return;
    }
    
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        setLocationLoading(false);
      },
      (_err) => {
        setLocationLoading(false);
        setMessage({ text: 'Could not fetch location. Please ensure permissions are granted.', type: 'error' });
      }
    );
  };

  const handleManualCheckUpdates = async () => {
    setUpdateFeedback(null);
    const res = await checkForUpdates(true);
    if (res.hasUpdate) {
      setUpdateFeedback(`✨ New update found: v${res.serverVersion}! Ready to apply.`);
    } else {
      setUpdateFeedback(`✅ You're up to date! 619 Islam is on the latest version (v${currentVersion}).`);
      setTimeout(() => setUpdateFeedback(null), 5000);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setMessage({ text: '🔔 Automatic update notifications enabled!', type: 'success' });
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="p-4 sm:p-6 pb-36 max-w-5xl mx-auto w-full space-y-4 sm:space-y-5">
      <header className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">Profile & Settings</h1>
        <p className="text-subtext text-xs sm:text-sm mt-0.5">Manage your account, preferences, updates, and notifications.</p>
      </header>

      {message.text && (
        <div className={`p-3.5 rounded-xl flex items-start gap-2.5 ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span className="font-medium text-xs sm:text-sm leading-snug">{message.text}</span>
        </div>
      )}

      {/* ── RESPONSIVE 2-COLUMN GRID FOR SETTINGS ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-start">
        
        {/* Left Column: Profile & App Preferences */}
        <div className="space-y-4 sm:space-y-5">
          {/* Profile Card */}
          <section className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 bg-primary/15 rounded-full flex items-center justify-center text-primary shrink-0">
                <User size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-bold text-text truncate">{user?.username}</h2>
                <p className="text-subtext text-xs truncate">{user?.email}</p>
              </div>
            </div>
          </section>

          {/* App Settings */}
          <section className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm space-y-3.5">
            <h3 className="font-bold text-sm sm:text-base text-text flex items-center gap-2">
              <BookOpen size={16} className="text-primary" /> Fiqh, Location & Quran
            </h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-subtext mb-1 uppercase tracking-wider">Islamic Fiqh</label>
                <select
                  value={fiqh}
                  onChange={(e) => setFiqh(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-text text-sm"
                >
                  {FIQH_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <p className="text-[11px] text-muted mt-1">Updates Namaz calculation methods.</p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-subtext mb-1 uppercase tracking-wider">Quran Translation</label>
                <select
                  value={quranTranslation}
                  onChange={(e) => setQuranTranslation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-text text-sm"
                >
                  {QURAN_TRANSLATIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-[11px] text-muted mt-1">Select your preferred language/scholar.</p>
              </div>
            </div>

            <div className="pt-1">
              <label className="block text-[11px] font-semibold text-subtext mb-1 uppercase tracking-wider">Location (Latitude & Longitude)</label>
              <div className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  placeholder="Latitude (e.g. 24.8607)"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  className="w-full min-w-0 px-3.5 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-text text-sm"
                />
                <input 
                  type="text" 
                  placeholder="Longitude (e.g. 67.0011)"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  className="w-full min-w-0 px-3.5 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-text text-sm"
                />
              </div>
              <button 
                onClick={handleGetLocation}
                disabled={locationLoading}
                className="w-full py-2 bg-primary/10 text-primary rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-primary/20 transition-colors active:scale-95"
              >
                {locationLoading ? <Loader2 size={14} className="animate-spin" /> : <MapPin size={14} />}
                Get Current Location
              </button>
            </div>

            <button 
              onClick={handleUpdateProfile}
              disabled={loading}
              className="w-full mt-2 bg-primary text-white py-2.5 sm:py-3 rounded-xl text-sm font-bold hover:bg-primary-dark transition-all active:scale-95 shadow-md shadow-primary/20"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </section>
        </div>

        {/* Right Column: Updates, Alerts & Security */}
        <div className="space-y-4 sm:space-y-5">
          {/* 🚀 App Version, Update Checker & Reinstall */}
          <section className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-text flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" /> App Version & Updates
              </h3>
              <span className="font-bold text-xs text-text bg-surface px-2.5 py-1 rounded-lg border border-border">
                v{currentVersion}
              </span>
            </div>

            {/* Dynamic Update Feedback message */}
            {updateFeedback && (
              <div className="p-3 bg-surface rounded-xl border border-border text-xs text-text flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{updateFeedback}</span>
              </div>
            )}

            {/* If an update is available -> show prominent update / reinstall button */}
            {updateAvailable ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-text">New Version Available: v{serverVersion}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500 text-black shadow-sm">
                    Update Ready
                  </span>
                </div>
                
                <p className="text-[11px] text-subtext leading-relaxed">
                  {requiresReinstall 
                    ? 'This update includes major core database changes. A clean app reinstall/refresh is recommended.'
                    : 'A fresh update for 619 Islam is ready to install with latest enhancements.'}
                </p>

                {requiresReinstall ? (
                  <button
                    onClick={reinstallApp}
                    disabled={applyingUpdate}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:from-rose-700 text-white py-3 rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                  >
                    <RotateCcw size={14} className={applyingUpdate ? "animate-spin" : ""} />
                    <span>{applyingUpdate ? 'Reinstalling...' : 'Reinstall & Update App'}</span>
                  </button>
                ) : (
                  <button
                    onClick={applyUpdate}
                    disabled={applyingUpdate}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black py-3 rounded-xl text-xs font-black shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70"
                  >
                    <Download size={14} className={applyingUpdate ? "animate-spin" : ""} />
                    <span>{applyingUpdate ? 'Applying Update...' : 'Install Update Now'}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted">You are on the latest version.</span>
                <button
                  onClick={() => setShowWhatsNew(true)}
                  className="text-xs font-bold text-amber-500 hover:underline transition-colors"
                >
                  What's New in v{currentVersion}
                </button>
              </div>
            )}

            {/* Action Buttons: Check for Updates & Reinstall App */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-border/60">
              <button
                onClick={handleManualCheckUpdates}
                disabled={isCheckingUpdates}
                className="w-full py-2.5 px-3 bg-surface hover:bg-card border border-border text-text rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <RefreshCw size={13} className={isCheckingUpdates ? "animate-spin text-amber-400" : ""} />
                <span>{isCheckingUpdates ? 'Checking Server...' : 'Check for Updates'}</span>
              </button>

              <button
                onClick={reinstallApp}
                disabled={applyingUpdate}
                className="w-full py-2.5 px-3 bg-surface hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 border border-border text-subtext rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                title="Purges stale cached files and reloads clean app from server"
              >
                <RotateCcw size={13} />
                <span>Reinstall / Reset Cache</span>
              </button>
            </div>
          </section>

          {/* 🔔 Mobile Push Notifications for Updates */}
          <section className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-text flex items-center gap-2">
                <Bell size={16} className="text-amber-500" /> Update Alerts
              </h3>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                notificationPermission === 'granted'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                  : 'bg-surface text-muted border-border'
              }`}>
                {notificationPermission === 'granted' ? '🔔 Enabled' : 'Off'}
              </span>
            </div>

            <p className="text-xs text-subtext leading-relaxed">
              Receive automatic push notifications on your device whenever new Islamic features or app updates arrive.
            </p>

            {notificationPermission !== 'granted' && (
              <button
                onClick={handleEnableNotifications}
                className="w-full py-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Bell size={14} />
                <span>Enable Update Push Notifications</span>
              </button>
            )}
          </section>

          {/* Security */}
          <section className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm space-y-3">
            <h3 className="font-bold text-sm sm:text-base text-text flex items-center gap-2">
              <Lock size={16} className="text-primary" /> Security
            </h3>
            
            <input
              type="password"
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-text text-sm"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-primary outline-none text-text text-sm"
            />
            
            <button 
              onClick={handleChangePassword}
              disabled={loading}
              className="w-full bg-surface border border-border text-text py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-border transition-colors active:scale-95"
            >
              Update Password
            </button>
          </section>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="w-full bg-danger/10 text-danger py-3 rounded-xl text-sm font-bold hover:bg-danger/20 transition-colors flex items-center justify-center gap-2 active:scale-95"
          >
            <LogOut size={18} />
            Log Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
