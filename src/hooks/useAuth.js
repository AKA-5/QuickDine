import { useApp } from '../context/AppContext';

export function useAuth() {
  const { user, loading, loginWithGoogle, loginWithEmail, logout } = useApp();
  
  return {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    logout,
    isAuthenticated: !!user,
    isRestaurant: user?.role === 'restaurant',
    isCustomer: user?.role === 'customer',
  };
}
