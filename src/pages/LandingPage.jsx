import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getUnsplashUrl } from '../utils/imageHelper';

export default function LandingPage() {
  const { user, loginWithGoogle, loginWithEmail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'restaurant') {
        navigate('/restaurant-dashboard');
      } else {
        if (!user.tasteProfile) {
          navigate('/onboarding');
        } else {
          navigate('/home');
        }
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleCustomerLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEmailLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);

    try {
      await loginWithEmail(email, password);
      // Redirect will be handled by useEffect
    } catch (err) {
      console.error(err);
      setLoginError('Invalid email or password. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Helper to fill demo credentials
  const fillDemoCreds = (type) => {
    if (type === 'restaurant') {
      setEmail('restaurant@quickdine.demo');
      setPassword('demo1234');
    } else {
      setEmail('customer@quickdine.demo');
      setPassword('demo1234');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col justify-between selection:bg-accent/10 selection:text-accent">
      
      {/* Upper Brand Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 flex items-center justify-between">
        <span className="font-serif text-3xl font-bold tracking-tight text-accent">QuickDine</span>
        <button
          onClick={() => setShowLoginModal(true)}
          className="text-xs uppercase tracking-widest font-semibold border border-accent/40 bg-white text-accent rounded-[6px] px-4 py-2 hover:bg-accent hover:text-white transition-colors shadow-sm cursor-pointer"
        >
          Staff Sign In
        </button>
      </header>

      {/* Hero Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 flex flex-col lg:flex-row items-center gap-12 flex-1">
        
        {/* Left text column */}
        <div className="flex-1 space-y-8 text-left">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest font-medium text-text-secondary">Skip the Wait</span>
            <h1 className="text-5xl md:text-6xl font-serif text-text-primary leading-tight font-normal">
              Eat what you love, <br/>
              <span className="text-accent italic">exactly</span> when you arrive.
            </h1>
            <p className="text-text-secondary text-lg max-w-xl font-sans">
              Dine-in in cities like Islamabad, Lahore, and Karachi shouldn't mean wasting 45 minutes waiting for a table or food. QuickDine AI matches your taste profile, books your preferred table, and pre-orders your meal so it's served steaming hot the minute you walk in.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <button
              onClick={handleCustomerLogin}
              className="bg-accent text-white rounded-[6px] px-8 py-3.5 text-sm font-semibold hover:bg-[#B03D24] transition-all hover:scale-[1.01] shadow-md flex items-center justify-center space-x-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">login</span>
              <span>Dine as Customer</span>
            </button>
            <button
              onClick={() => {
                setShowLoginModal(true);
                fillDemoCreds('customer');
              }}
              className="border border-accent/40 text-accent bg-white rounded-[6px] px-8 py-3.5 text-sm font-semibold hover:bg-accent-light transition-all hover:scale-[1.01] flex items-center justify-center space-x-2 cursor-pointer shadow-sm"
            >
              <span>Dine with Demo Account</span>
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
            <div>
              <p className="font-serif text-3xl font-bold text-accent">40m</p>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-medium mt-1">Saved per meal</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-text-primary">6+</p>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-medium mt-1">Islamabad Venues</p>
            </div>
            <div>
              <p className="font-serif text-3xl font-bold text-text-primary">Gemini</p>
              <p className="text-xs text-text-secondary uppercase tracking-widest font-medium mt-1">Taste Matching</p>
            </div>
          </div>
        </div>

        {/* Right image column */}
        <div className="flex-1 w-full">
          <div className="relative rounded-lg overflow-hidden border border-border shadow-card aspect-[4/3] w-full">
            <img 
              src={getUnsplashUrl(800, 600, 'pakistani food')} 
              alt="Delicious Pakistani food table setting" 
              className="object-cover w-full h-full"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-xs uppercase tracking-widest font-medium opacity-80">Local Taste Redefined</p>
              <p className="font-serif text-lg">Fresh Karahi, Tikka & Continental Specialties</p>
            </div>
          </div>
        </div>
      </main>

      {/* How it Works Section */}
      <section className="bg-white border-t border-b border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-serif text-center mb-12">How QuickDine Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent">
                <span className="material-symbols-outlined text-2xl">restaurant_menu</span>
              </div>
              <h3 className="text-xl font-serif">1. Define Your Taste</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto">
                Complete a 1-minute taste profile quiz. Our AI understands your budget, spice level, and preferred cuisines.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent">
                <span className="material-symbols-outlined text-2xl">event_seat</span>
              </div>
              <h3 className="text-xl font-serif">2. Pre-order & Reserve</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto">
                Browse localized menus. Pre-order meals, select table preferences (e.g. scenic view, quiet corner), and book arrival slots.
              </p>
            </div>
            <div className="text-center space-y-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent">
                <span className="material-symbols-outlined text-2xl">bolt</span>
              </div>
              <h3 className="text-xl font-serif">3. Dine Instantly</h3>
              <p className="text-sm text-text-secondary max-w-xs mx-auto">
                Walk straight to your pre-reserved table. Your meal is served cooked-to-order, ready when you are. No queues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg py-8 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-text-secondary uppercase tracking-widest font-medium">
          &copy; {new Date().getFullYear()} QuickDine AI. Built for Gen AI Academy APAC "Meet the Builders".
        </div>
      </footer>

      {/* Staff Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg border border-border shadow-card p-8 max-w-md w-full relative space-y-6">
            <button 
              onClick={() => {
                setShowLoginModal(false);
                setLoginError('');
              }}
              className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="space-y-2">
              <h2 className="text-2xl font-serif text-text-primary">Diner / Restaurant Sign In</h2>
              <p className="text-xs text-text-secondary uppercase tracking-widest">
                Log in to access your pre-orders and kitchen boards.
              </p>
            </div>

            {loginError && (
              <div className="bg-accent-light border border-accent/20 rounded-[6px] p-3 text-xs text-accent font-medium">
                {loginError}
              </div>
            )}

            <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest font-medium text-text-secondary block">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@quickdine.demo"
                  required
                  className="w-full border border-border rounded-[6px] bg-white px-3 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase tracking-widest font-medium text-text-secondary block">
                  Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border border-border rounded-[6px] bg-white pl-3 pr-10 py-2 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3 text-text-secondary hover:text-text-primary focus:outline-none select-none cursor-pointer flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoCreds('restaurant')}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-[6px] border border-border bg-white hover:border-accent hover:text-accent text-text-secondary transition-all cursor-pointer shadow-sm"
                >
                  Demo Restaurant
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCreds('customer')}
                  className="flex-1 text-center py-2 text-xs font-semibold rounded-[6px] border border-border bg-white hover:border-accent hover:text-accent text-text-secondary transition-all cursor-pointer shadow-sm"
                >
                  Demo Customer
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-accent text-white rounded-[6px] py-2.5 text-sm font-semibold hover:bg-[#B03D24] transition-colors disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
