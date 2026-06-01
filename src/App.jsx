import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Lazy load page components for route-based code splitting
const LandingPage = lazy(() => import('./pages/LandingPage'));
const CustomerHome = lazy(() => import('./pages/CustomerHome'));
const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const RestaurantDashboard = lazy(() => import('./pages/RestaurantDashboard'));
const TasteOnboarding = lazy(() => import('./pages/TasteOnboarding'));
const OrderHistory = lazy(() => import('./pages/OrderHistory'));

function App() {
  return (
    <Router>
      <AppProvider>
        <Suspense fallback={
          <div className="min-h-screen bg-bg flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-border border-t-accent"></div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-widest font-sans">Loading QuickDine...</p>
            </div>
          </div>
        }>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />

            {/* Customer Protected Routes */}
            <Route 
              path="/home" 
              element={
                <ProtectedRoute allowedRole="customer">
                  <CustomerHome />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/onboarding" 
              element={
                <ProtectedRoute allowedRole="customer">
                  <TasteOnboarding />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/restaurant/:id" 
              element={
                <ProtectedRoute allowedRole="customer">
                  <RestaurantDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cart" 
              element={
                <ProtectedRoute allowedRole="customer">
                  <Cart />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-confirmation/:orderId" 
              element={
                <ProtectedRoute allowedRole="customer">
                  <OrderConfirmation />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/order-history" 
              element={
                <ProtectedRoute allowedRole="customer">
                  <OrderHistory />
                </ProtectedRoute>
              } 
            />

            {/* Restaurant Protected Routes */}
            <Route 
              path="/restaurant-dashboard" 
              element={
                <ProtectedRoute allowedRole="restaurant">
                  <RestaurantDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </AppProvider>
    </Router>
  );
}

export default App;
