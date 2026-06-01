import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import CustomerHome from './pages/CustomerHome';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import OrderConfirmation from './pages/OrderConfirmation';
import RestaurantDashboard from './pages/RestaurantDashboard';
import TasteOnboarding from './pages/TasteOnboarding';
import OrderHistory from './pages/OrderHistory';

function App() {
  return (
    <Router>
      <AppProvider>
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
      </AppProvider>
    </Router>
  );
}

export default App;
