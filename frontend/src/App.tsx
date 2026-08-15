import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages (to be created)
import Login from './pages/Login';
import Signup from './pages/Signup';
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
import Layout from './components/ui/Layout';
import InstallPrompt from './components/ui/InstallPrompt';

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
      
      {/* Protected App Routes inside a Layout */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="namaz" element={<Namaz />} />
        <Route path="tasbeeh" element={<Tasbeeh />} />
        <Route path="quran" element={<Quran />} />
        <Route path="quran/:id" element={<SurahReader />} />
        <Route path="habits" element={<Habits />} />
        <Route path="qibla" element={<Qibla />} />
        <Route path="duas" element={<Duas />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin" element={<Admin />} />
        {/* Add more routes here later */}
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <InstallPrompt />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
