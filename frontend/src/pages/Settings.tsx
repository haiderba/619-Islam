import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../config/api';
import { User, Lock, MapPin, BookOpen, LogOut, Loader2, CheckCircle2, AlertCircle, Sparkles, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  { id: "31", label: "French (Muhammad Hamidullah)" },
  { id: "83", label: "Spanish (Sheikh Isa Garcia)" },
];

const Settings: React.FC = () => {
  const { user, signOut, updateUser } = useAuth();
  const navigate = useNavigate();
  
  const [fiqh, setFiqh] = useState(user?.fiqh || FIQH_OPTIONS[0]);
  const [quranTranslation, setQuranTranslation] = useState(user?.quran_translation || QURAN_TRANSLATIONS[0].id);
  const [lat, setLat] = useState(user?.latitude || '');
  const [lng, setLng] = useState(user?.longitude || '');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const [message, setMessage] = useState({ text: '', type: '' });

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

  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleCheckUpdates = async () => {
    setCheckingUpdate(true);
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.update();
        }
      }
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }
      setMessage({ text: 'Checking latest version and refreshing app...', type: 'success' });
      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (err) {
      window.location.reload();
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="p-4 sm:p-6 pb-36 max-w-lg mx-auto space-y-4 sm:space-y-5">
      <header className="pt-2">
        <h1 className="text-2xl sm:text-3xl font-black text-text tracking-tight">Profile & Settings</h1>
        <p className="text-subtext text-xs sm:text-sm mt-0.5">Manage your account, preferences, and location.</p>
      </header>

      {message.text && (
        <div className={`p-3.5 rounded-xl flex items-start gap-2.5 ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
          <span className="font-medium text-xs sm:text-sm leading-snug">{message.text}</span>
        </div>
      )}

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

      {/* App Version & Cache Updates */}
      <section className="bg-card p-4 sm:p-5 rounded-2xl border border-border shadow-sm space-y-3">
        <h3 className="font-bold text-sm sm:text-base text-text flex items-center gap-2">
          <Sparkles size={16} className="text-amber-500" /> App Updates & Cache
        </h3>
        
        <div className="flex items-center justify-between text-xs text-subtext pt-1">
          <span>Installed Build</span>
          <span className="font-bold text-text bg-surface px-2.5 py-1 rounded-lg border border-border">v1.2.0</span>
        </div>

        <button 
          onClick={handleCheckUpdates}
          disabled={checkingUpdate}
          className="w-full bg-surface border border-border text-text py-2.5 rounded-xl text-xs sm:text-sm font-bold hover:bg-border transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          {checkingUpdate ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          <span>Check for Updates & Refresh App</span>
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
  );
};

export default Settings;
