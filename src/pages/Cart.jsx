import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { Navbar } from '../components/layout/Navbar';
import { MOCK_RESTAURANTS } from '../services/mockData';

export default function Cart() {
  const { 
    cart, 
    updateCartItemQty, 
    updateCartItemInstructions, 
    clearCart, 
    cartSubtotal, 
    timeSlot, 
    setTimeSlot, 
    tablePreference, 
    setTablePreference 
  } = useCart();

  const { user } = useAuth();
  const { createOrder, getRestaurant } = useFirestore();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [customTime, setCustomTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load restaurant metadata
  useEffect(() => {
    if (!cart.restaurantId) return;

    async function loadRestaurant() {
      try {
        let rest = await getRestaurant(cart.restaurantId);
        if (!rest) {
          rest = MOCK_RESTAURANTS.find(r => r.id === cart.restaurantId);
        }
        setRestaurant(rest);
      } catch (err) {
        console.error('Failed to load restaurant info for cart:', err);
        setRestaurant(MOCK_RESTAURANTS.find(r => r.id === cart.restaurantId));
      }
    }
    loadRestaurant();
  }, [cart.restaurantId, getRestaurant]);

  if (cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-bg text-text-primary flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-text-secondary select-none">shopping_cart</span>
          <h2 className="text-2xl font-serif">Your Cart is Empty</h2>
          <p className="text-sm text-text-secondary max-w-xs text-center font-sans">
            Add items from a restaurant's menu to plan your next dine-in experience.
          </p>
          <Link 
            to="/home" 
            className="bg-accent text-white rounded-[6px] px-6 py-2.5 text-sm font-semibold hover:bg-[#B03D24] transition-colors"
          >
            Explore Restaurants
          </Link>
        </main>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    try {
      const finalTimeSlot = timeSlot === 'Custom' ? customTime || 'ASAP' : timeSlot;
      
      const orderPayload = {
        customerId: user.uid,
        customerName: user.displayName || 'Diner',
        customerEmail: user.email,
        restaurantId: cart.restaurantId,
        restaurantName: restaurant?.name || 'Local Restaurant',
        restaurantLocation: restaurant?.location || 'Islamabad',
        items: cart.items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          instructions: item.instructions || ''
        })),
        timeSlot: finalTimeSlot,
        tablePreference,
        subtotal: cartSubtotal,
        status: 'New'
      };

      const orderId = await createOrder(orderPayload);
      
      // Clear cart
      clearCart();
      
      // Navigate to order confirmation
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col pb-24">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-6">
        <h1 className="text-4xl font-serif text-text-primary text-left font-normal">Your Pre-Order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Items & Preferences list */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cart Items List */}
            <div className="bg-white border border-border rounded-lg shadow-card p-6 space-y-6 text-left">
              <h2 className="text-xl font-serif border-b border-border pb-2">
                Items from {restaurant?.name || 'Restaurant'}
              </h2>

              <div className="divide-y divide-border">
                {cart.items.map(item => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      {/* Name & price */}
                      <div className="space-y-1">
                        <h3 className="font-serif text-lg leading-snug">{item.name}</h3>
                        <p className="text-xs text-accent font-semibold">PKR {item.price.toLocaleString()}</p>
                      </div>

                      {/* Qty controls */}
                      <div className="flex items-center border border-border rounded-[6px] overflow-hidden bg-bg shrink-0">
                        <button
                          onClick={() => updateCartItemQty(item.id, item.quantity - 1)}
                          className="px-2 py-1 hover:bg-white text-text-secondary select-none"
                        >
                          <span className="material-symbols-outlined text-sm block">remove</span>
                        </button>
                        <span className="px-3 text-sm font-semibold select-none">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQty(item.id, item.quantity + 1)}
                          className="px-2 py-1 hover:bg-white text-text-secondary select-none"
                        >
                          <span className="material-symbols-outlined text-sm block">add</span>
                        </button>
                      </div>
                    </div>

                    {/* Special Instructions */}
                    <div className="flex flex-col space-y-1">
                      <label className="text-[9px] uppercase tracking-widest font-bold text-text-secondary">
                        Special Instructions
                      </label>
                      <textarea
                        value={item.instructions}
                        onChange={(e) => updateCartItemInstructions(item.id, e.target.value)}
                        placeholder="e.g. Extra spicy, no onions, keep sauces separate..."
                        rows="1"
                        className="w-full text-xs border border-border rounded-[6px] bg-bg px-2.5 py-1.5 focus:outline-none focus:border-accent focus:bg-white resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrival & Seating Preferences */}
            <div className="bg-white border border-border rounded-lg shadow-card p-6 space-y-6 text-left">
              <h2 className="text-xl font-serif border-b border-border pb-2">
                Dine-in Preferences
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Time Slot Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                    Arrival Time Slot
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['ASAP', '30 Min', '1 Hour', 'Custom'].map(slot => {
                      const isSelected = timeSlot === slot;
                      return (
                        <button
                          key={slot}
                          onClick={() => setTimeSlot(slot)}
                          className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold uppercase tracking-wider border transition-colors ${
                            isSelected 
                              ? 'bg-accent border-accent text-white' 
                              : 'bg-white border-border hover:bg-bg text-text-secondary'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                  {timeSlot === 'Custom' && (
                    <input
                      type="time"
                      value={customTime}
                      onChange={(e) => setCustomTime(e.target.value)}
                      required
                      className="mt-2 w-full border border-border rounded-[6px] bg-white px-3 py-1.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                  )}
                </div>

                {/* Table Preference Selection */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">
                    Table Area Preference
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['No preference', 'Window', 'Center', 'Outdoor'].map(pref => {
                      const isSelected = tablePreference === pref;
                      return (
                        <button
                          key={pref}
                          onClick={() => setTablePreference(pref)}
                          className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold uppercase tracking-wider border transition-colors ${
                            isSelected 
                              ? 'bg-accent border-accent text-white' 
                              : 'bg-white border-border hover:bg-bg text-text-secondary'
                          }`}
                        >
                          {pref}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Pricing & Checkout Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-border rounded-lg shadow-card p-6 space-y-4 text-left">
              <h2 className="text-xl font-serif border-b border-border pb-2">Order Summary</h2>
              
              <div className="space-y-2 border-b border-border pb-4">
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-semibold text-text-primary">PKR {cartSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>Dine-in Service Fee</span>
                  <span className="font-semibold text-success uppercase tracking-wider text-xs">Free</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <span className="text-sm font-semibold uppercase tracking-widest text-text-secondary">Total (PKR)</span>
                <span className="text-2xl font-bold text-accent font-serif">PKR {cartSubtotal.toLocaleString()}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full bg-accent text-white rounded-[6px] py-3 text-sm font-semibold hover:bg-[#B03D24] transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span className="material-symbols-outlined text-lg select-none">check_circle</span>
                <span>{isSubmitting ? 'Placing Pre-order...' : 'Confirm Pre-order'}</span>
              </button>
              
              <p className="text-[10px] text-text-secondary text-center leading-relaxed">
                By confirming, you agree to arrive at the selected slot. Payment is made at the venue after dine-in.
              </p>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
