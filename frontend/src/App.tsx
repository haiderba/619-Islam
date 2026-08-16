import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UpdateProvider } from './context/UpdateContext';

// Pages (to be created)
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
import Layout from './components/ui/Layout';
import InstallPrompt from './components/ui/InstallPrompt';
import PWAUpdatePrompt from './components/ui/PWAUpdatePrompt';

import SplashScreen from './components/ui/SplashScreen';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <SplashScreen message="Preparing your daily companion..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
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
  );
};

function App() {
  return (
    <AuthProvider>
      <UpdateProvider>
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
