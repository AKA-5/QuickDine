import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Navbar } from '../components/layout/Navbar';
import { getUnsplashUrl } from '../utils/imageHelper';
import { MOCK_RESTAURANTS } from '../services/mockData';
import ReviewModal from '../components/restaurant/ReviewModal';

export default function OrderHistory() {
  const { user } = useAuth();
  const { addToCart, clearCart } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    async function fetchOrderHistory() {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'orders'),
          where('customerId', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by date client-side
        list.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });

        setOrders(list);
      } catch (err) {
        console.error('Failed to load order history:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrderHistory();
  }, [user?.uid]);

  const handleReorder = (order) => {
    // Clear cart first
    clearCart();
    
    // Add all items from past order
    order.items.forEach(item => {
      // Re-create the item structure matching what addToCart expects
      const menuItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        description: item.description || ''
      };
      // Loop to match the quantity
      for (let i = 0; i < item.quantity; i++) {
        addToCart(order.restaurantId, menuItem);
      }
    });

    // Navigate to cart
    navigate('/cart');
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'New':
        return 'bg-amber-50 text-warning border-warning/20';
      case 'Accepted':
        return 'bg-orange-50 text-accent border-accent/20';
      case 'Ready':
        return 'bg-green-50 text-success border-success/20 font-bold';
      case 'Completed':
        return 'bg-bg text-text-secondary border-border';
      default:
        return 'bg-bg text-text-secondary border-border';
    }
  };

  const getRestaurantCuisine = (restId) => {
    const rest = MOCK_RESTAURANTS.find(r => r.id === restId);
    return rest ? rest.cuisine : 'Cuisine';
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent"></div>
          <p className="text-sm font-medium text-text-secondary uppercase tracking-widest">Loading Order History...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col pb-24">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-6">
        <h1 className="text-4xl font-serif text-text-primary text-left font-normal">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-lg shadow-card space-y-4">
            <span className="material-symbols-outlined text-4xl text-text-secondary select-none">history</span>
            <h2 className="text-2xl font-serif">No Pre-Orders Yet</h2>
            <p className="text-sm text-text-secondary max-w-xs mx-auto font-sans leading-relaxed">
              When you reserve tables and pre-order food, your receipts and tracking history will appear here.
            </p>
            <Link 
              to="/home" 
              className="inline-block bg-accent text-white rounded-[6px] px-6 py-2.5 text-sm font-semibold hover:bg-[#B03D24] transition-colors"
            >
              Order Food Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const cuisine = getRestaurantCuisine(order.restaurantId);
              const itemsSummary = order.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
              const orderDate = order.createdAt?.seconds 
                ? new Date(order.createdAt.seconds * 1000).toLocaleDateString(undefined, { 
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                  }) 
                : 'Recent';

              return (
                <div 
                  key={order.id} 
                  className="bg-white border border-border rounded-lg shadow-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 text-left"
                >
                  {/* Restaurant details */}
                  <div className="flex gap-4 items-center flex-1 min-w-0">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-bg border border-border shrink-0">
                      <img
                        src={getUnsplashUrl(100, 100, cuisine + ' restaurant')}
                        alt="Restaurant"
                        className="object-cover w-full h-full"
                        loading="lazy"
                      />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-lg leading-snug truncate text-text-primary">
                          {order.restaurantName}
                        </h3>
                        <span className={`text-[9px] uppercase tracking-wider font-semibold border rounded px-1.5 py-0.5 select-none ${getStatusBadgeStyle(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold font-sans">
                        {orderDate}
                      </p>
                      <p className="text-xs text-text-secondary truncate font-sans">
                        {itemsSummary}
                      </p>
                    </div>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 border-border pt-4 md:pt-0 shrink-0">
                    <div className="text-left md:text-right">
                      <p className="text-[9px] uppercase tracking-widest font-bold text-text-secondary">Amount</p>
                      <p className="text-base font-bold text-accent font-serif">PKR {order.subtotal.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      {order.status === 'Completed' && (
                        <button
                          onClick={() => setSelectedOrderForReview(order)}
                          className="border border-border text-text-primary bg-white hover:bg-bg rounded-[6px] px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1"
                        >
                          <span className="material-symbols-outlined text-sm select-none">star</span>
                          <span>Review</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleReorder(order)}
                        className="bg-accent hover:bg-[#B03D24] text-white rounded-[6px] px-3.5 py-1.5 text-xs font-semibold flex items-center space-x-1"
                      >
                        <span className="material-symbols-outlined text-sm select-none">replay</span>
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* Review Modal */}
      {selectedOrderForReview && (
        <ReviewModal
          order={selectedOrderForReview}
          onClose={() => setSelectedOrderForReview(null)}
        />
      )}
    </div>
  );
}
