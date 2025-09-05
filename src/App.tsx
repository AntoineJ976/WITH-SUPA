import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import { LandingPage } from './components/Landing/LandingPage';

function App() {
  const AppContent: React.FC = () => {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </div>
        </div>
      );
    }

    if (user) {
      return <MainLayout />;
    }

    return <LandingPage />;
  };

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;