import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './pages/Home';
import Market from './pages/Market';
import Trade from './pages/Trade';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Register from './pages/Register';

// Protected Route Guard for logged-in users only
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-indigo-600 font-bold text-sm animate-pulse">
        Checking session status...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Public Route Guard (prevents logged-in users from seeing login/register)
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center py-20 text-indigo-600 font-bold text-sm animate-pulse">
        Checking session status...
      </div>
    );
  }

  if (user) {
    return <Navigate to="/trade" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-[#edf0f5] text-slate-800 flex selection:bg-indigo-500 selection:text-white font-sans antialiased">
          {/* Left Navigation Sidebar */}
          <Sidebar />

          {/* Right Main Panel */}
          <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
            {/* Top Navigation / Dashboard Info Header */}
            <Header />

            {/* Dashboard Content Pages */}
            <main className="flex-1 px-8 pb-8 flex flex-col">
              <Routes>
                <Route
                  path="/"
                  element={
                    <PublicRoute>
                      <Home />
                    </PublicRoute>
                  }
                />
                <Route path="/market" element={<Market />} />
                <Route
                  path="/trade"
                  element={
                    <ProtectedRoute>
                      <Trade />
                    </ProtectedRoute>
                  }
                />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
