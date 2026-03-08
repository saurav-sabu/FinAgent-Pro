import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import Analytics from './pages/Analytics';
import News from './pages/News';
import Portfolio from './pages/Portfolio';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import Register from './pages/Register';
import { Loader2 } from 'lucide-react';
import Tour from './components/Tour';
import { useToast } from './context/ToastContext';
import ToastContainer from './components/ToastContainer';

import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-fin-accent animate-spin mb-4" />
        <p className="text-fin-muted animate-pulse font-medium">Verifying Credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

import { marketAPI, injectToast } from './services/api';

function App() {
  const { showToast } = useToast();

  // Inject toast function into API layer for interceptors
  React.useEffect(() => {
    injectToast(showToast);
  }, [showToast]);

  return (
    <Router>
      <div className="min-h-screen flex flex-col pt-16">
        <Navbar />
        <Tour />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/assistant" element={<ProtectedRoute><Assistant /></ProtectedRoute>} />
              <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
            </Routes>
          </ErrorBoundary>
        </main>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
