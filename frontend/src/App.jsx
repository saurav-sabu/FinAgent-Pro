import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Assistant from './pages/Assistant';
import News from './pages/News';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col pt-16">
        <Navbar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/news" element={<News />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </Router>
  );
}

export default App;
