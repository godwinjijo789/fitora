import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Dumbbell } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#070708] text-white">
        <Dumbbell className="w-12 h-12 text-red-600 animate-spin mb-4 animate-bounce" />
        <p className="text-zinc-400 font-medium tracking-widest animate-pulse max-w-sm text-center font-mono">
          AUTHENTICATING CREDENTIALS...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!isAdmin) {
    sessionStorage.setItem('accessDeniedTriggered', 'true');
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};
