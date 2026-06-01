import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function ProtectedRoute({ children, allowedRole }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent"></div>
          <p className="text-sm font-medium text-text-secondary uppercase tracking-widest">Loading QuickDine...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    if (user?.role === 'restaurant') {
      return <Navigate to="/restaurant-dashboard" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  // Redirect customer to onboarding if tasteProfile is missing
  if (user?.role === 'customer' && !user?.tasteProfile && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
