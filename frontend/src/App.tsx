import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UpdateProvider } from './context/UpdateContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Namaz from './pages/Namaz';
import Tasbeeh from './pages/Tasbeeh';
import Quran from './pages/Quran';
import SurahReader from './pages/SurahReader';
import Habits from './pages/Habits';
import Qibla from './pages/Qibla';
import Duas from './pages/Duas';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetail from './pages/BookDetail';
import BookReader from './pages/BookReader';
import PdfReader from './pages/PdfReader';
import MyLibrary from './pages/MyLibrary';
import { NamesOfAllah } from './pages/NamesOfAllah';
import { AllFeatures } from './pages/AllFeatures';
import { ZakatCalculator } from './pages/ZakatCalculator';
import { HadithExplorer } from './pages/HadithExplorer';
import { KhatamPlanner } from './pages/KhatamPlanner';
import { MasjidFinder } from './pages/MasjidFinder';
import { RuqyahStation } from './pages/RuqyahStation';
import { IslamicQuiz } from './pages/IslamicQuiz';
import Layout from './components/ui/Layout';
import InstallPrompt from './components/ui/InstallPrompt';
import PWAUpdatePrompt from './components/ui/PWAUpdatePrompt';
import SplashScreen from './components/ui/SplashScreen';

// Route Persistence Listener: Saves active route so background/re-opened apps restore where user left off
const RoutePersistenceListener: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Avoid saving auth pages as resume points
    const ignorePaths = ['/login', '/signup', '/forgot-password', '/reset-password'];
    if (!ignorePaths.includes(location.pathname)) {
      localStorage.setItem('619_last_active_route', location.pathname + location.search);
    }
  }, [location]);

  return null;
};

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#062426]">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <>
      <RoutePersistenceListener />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Full screen readers */}
        <Route path="/books/:id/read" element={<ProtectedRoute><BookReader /></ProtectedRoute>} />
        <Route path="/books/:id/pdf" element={<ProtectedRoute><PdfReader /></ProtectedRoute>} />
        
        {/* Protected App Routes inside a Layout */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="namaz" element={<Namaz />} />
          <Route path="tasbeeh" element={<Tasbeeh />} />
          <Route path="quran" element={<Quran />} />
          <Route path="quran/:id" element={<SurahReader />} />
          <Route path="names-of-allah" element={<NamesOfAllah />} />
          <Route path="features" element={<AllFeatures />} />
          <Route path="zakat" element={<ZakatCalculator />} />
          <Route path="hadith" element={<HadithExplorer />} />
          <Route path="khatam" element={<KhatamPlanner />} />
          <Route path="masjid-finder" element={<MasjidFinder />} />
          <Route path="ruqyah" element={<RuqyahStation />} />
          <Route path="quiz" element={<IslamicQuiz />} />
          <Route path="books" element={<Books />} />
          <Route path="books/:id" element={<BookDetail />} />
          <Route path="library" element={<MyLibrary />} />
          <Route path="habits" element={<Habits />} />
          <Route path="qibla" element={<Qibla />} />
          <Route path="duas" element={<Duas />} />
          <Route path="settings" element={<Settings />} />
          <Route path="admin" element={<Admin />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  // Only play splash once per active browser / mobile app session (persists on pull-to-refresh & background switches)
  const [showSplash, setShowSplash] = useState(() => {
    try {
      const shownInSession = sessionStorage.getItem('619_splash_shown_in_session');
      return !shownInSession;
    } catch {
      return true;
    }
  });

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem('619_splash_shown_in_session', 'true');
    } catch {}
    setShowSplash(false);
  };

  return (
    <AuthProvider>
      <UpdateProvider>
        {showSplash && (
          <SplashScreen 
            message="Preparing 619 Islam..." 
            onComplete={handleSplashComplete} 
          />
        )}
        <BrowserRouter>
          <PWAUpdatePrompt />
          <InstallPrompt />
          <AppRoutes />
        </BrowserRouter>
      </UpdateProvider>
    </AuthProvider>
  );
}

export default App;
