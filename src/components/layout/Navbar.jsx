import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export function Navbar({ searchQuery, setSearchQuery }) {
  const { user, logout, isCustomer } = useAuth();
  const { cartTotalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to={user?.role === 'restaurant' ? '/restaurant-dashboard' : '/home'} 
              className="font-serif text-2xl font-bold tracking-tight text-accent hover:text-accent/90"
            >
              QuickDine
            </Link>
          </div>

          {/* Search bar (only for customer home page if query function is provided) */}
          {isCustomer && setSearchQuery !== undefined && (
            <div className="flex max-w-md flex-1 items-center rounded-md border border-border bg-bg px-3 py-1.5 focus-within:border-accent focus-within:ring-1 focus-within:ring-accent">
              <span className="material-symbols-outlined text-text-secondary select-none">search</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cuisines, dishes, or restaurants..."
                className="ml-2 w-full bg-transparent text-sm text-text-primary focus:outline-none"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isCustomer && (
              <>
                <Link 
                  to="/order-history" 
                  className="flex items-center text-text-secondary hover:text-text-primary"
                  title="Order History"
                >
                  <span className="material-symbols-outlined text-2xl">history</span>
                </Link>

                <Link 
                  to="/cart" 
                  className="relative flex items-center text-text-secondary hover:text-text-primary"
                  title="Cart"
                >
                  <span className="material-symbols-outlined text-2xl">shopping_cart</span>
                  {cartTotalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white">
                      {cartTotalItems}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user && (
              <div className="flex items-center space-x-3 border-l border-border pl-4">
                <div className="hidden text-right md:block">
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                    {user.role === 'restaurant' ? 'Partner Dashboard' : 'Diner'}
                  </p>
                  <p className="max-w-[120px] truncate text-sm font-medium text-text-primary">
                    {user.displayName || user.email}
                  </p>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center rounded-md border border-border bg-white p-2 text-text-secondary hover:bg-bg hover:text-text-primary transition-colors"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
