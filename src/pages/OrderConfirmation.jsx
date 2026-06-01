import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Navbar } from '../components/layout/Navbar';
import ReviewModal from '../components/restaurant/ReviewModal';

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Real-time Firestore order listener
  useEffect(() => {
    if (!orderId) return;

    const docRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const orderData = docSnap.data();
        setOrder({ id: docSnap.id, ...orderData });
        
        // Open review modal if order just transitioned to Completed
        if (orderData.status === 'Completed') {
          setShowReviewModal(true);
        }
      }
      setLoading(false);
    }, (err) => {
      console.error('Error listening to order:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent"></div>
          <p className="text-sm font-medium text-text-secondary uppercase tracking-widest">Loading Order Details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-bg text-text-primary flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-text-secondary select-none">error</span>
          <h2 className="text-2xl font-serif">Order Not Found</h2>
          <Link to="/home" className="text-accent underline text-sm">Return Home</Link>
        </main>
      </div>
    );
  }

  const getStatusDetails = (status) => {
    switch (status) {
      case 'New':
        return {
          title: 'Awaiting Confirmation',
          description: 'The restaurant is reviewing your pre-order and table request.',
          icon: 'hourglass_empty',
          color: 'text-warning bg-warning-light border-warning/20',
          step: 1
        };
      case 'Accepted':
        return {
          title: 'Order Confirmed',
          description: 'Your table has been reserved, and the kitchen is preparing your meals.',
          icon: 'restaurant',
          color: 'text-accent bg-accent-light border-accent/20',
          step: 2
        };
      case 'Ready':
        return {
          title: 'Ready for Dine-in',
          description: 'Your table is set, and food is ready to be served upon your arrival!',
          icon: 'check_circle',
          color: 'text-success bg-green-50 border-success/20 animate-pulse',
          step: 3
        };
      case 'Completed':
        return {
          title: 'Dine-in Completed',
          description: 'Thank you for dining with QuickDine! Please share your review below.',
          icon: 'done_all',
          color: 'text-text-secondary bg-bg border-border',
          step: 4
        };
      default:
        return {
          title: 'Processing',
          description: 'Updating status...',
          icon: 'sync',
          color: 'text-text-secondary bg-bg border-border',
          step: 1
        };
    }
  };

  const statusInfo = getStatusDetails(order.status);

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col pb-24">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-12 space-y-8">
        
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-50 border border-success/20 text-success">
            <span className="material-symbols-outlined text-4xl select-none">check_circle</span>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-serif font-normal">Pre-Order Placed!</h1>
            <p className="text-sm text-text-secondary">
              Order ID: <span className="font-semibold text-text-primary font-mono">{order.id}</span>
            </p>
          </div>
        </div>

        {/* Live Status Tracker */}
        <div className="bg-white border border-border rounded-lg shadow-card p-6 space-y-6 text-left">
          <h2 className="text-xl font-serif border-b border-border pb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent select-none">radar</span>
            <span>Live Order Status</span>
          </h2>

          <div className="flex items-start gap-4 bg-bg border border-border/50 p-4 rounded-md">
            <div className={`p-2 rounded-full border shrink-0 ${statusInfo.color.split(' ')[0]} ${statusInfo.color.split(' ')[1]}`}>
              <span className="material-symbols-outlined text-2xl select-none block">{statusInfo.icon}</span>
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg leading-snug">{statusInfo.title}</h3>
              <p className="text-xs text-text-secondary font-sans leading-relaxed">
                {statusInfo.description}
              </p>
            </div>
          </div>

          {/* Progress stepper */}
          <div className="relative pt-4">
            <div className="absolute top-8 left-4 right-4 h-0.5 bg-border -z-10" />
            <div 
              className="absolute top-8 left-4 h-0.5 bg-accent -z-10 transition-all duration-500" 
              style={{ width: `${((statusInfo.step - 1) / 3) * 100}%` }}
            />
            
            <div className="flex justify-between items-center">
              {[
                { name: 'Sent', step: 1, icon: 'send' },
                { name: 'Accepted', step: 2, icon: 'restaurant' },
                { name: 'Ready', step: 3, icon: 'room_service' },
                { name: 'Done', step: 4, icon: 'done_all' }
              ].map(s => {
                const isActive = statusInfo.step >= s.step;
                return (
                  <div key={s.name} className="flex flex-col items-center space-y-2">
                    <div className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-accent border-accent text-white' 
                        : 'bg-white border-border text-text-secondary'
                    }`}>
                      <span className="material-symbols-outlined text-sm select-none">{s.icon}</span>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold ${
                      isActive ? 'text-accent' : 'text-text-secondary'
                    }`}>{s.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details Summary Card */}
        <div className="bg-white border border-border rounded-lg shadow-card p-6 space-y-6 text-left">
          <h2 className="text-xl font-serif border-b border-border pb-2">Dine-in details</h2>
          
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Restaurant</p>
              <p className="font-serif text-base mt-1 text-text-primary">{order.restaurantName}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Location</p>
              <p className="font-serif text-base mt-1 text-text-primary flex items-center">
                <span className="truncate">{order.restaurantLocation}</span>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.restaurantLocation)}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-accent flex items-center hover:underline"
                  title="Open in Google Maps"
                >
                  <span className="material-symbols-outlined text-sm select-none">map</span>
                </a>
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Arrival Slot</p>
              <p className="font-serif text-base mt-1 text-text-primary">{order.timeSlot}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Table Preference</p>
              <p className="font-serif text-base mt-1 text-text-primary">{order.tablePreference}</p>
            </div>
          </div>

          {/* Items Sublist */}
          <div className="border-t border-border pt-4">
            <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary mb-3">Dishes Ordered</p>
            <div className="divide-y divide-border/50">
              {order.items.map(item => (
                <div key={item.id} className="py-2.5 flex justify-between text-sm">
                  <div>
                    <span className="font-semibold">{item.quantity}x</span> {item.name}
                    {item.instructions && (
                      <p className="text-xs text-text-secondary italic mt-0.5">"{item.instructions}"</p>
                    )}
                  </div>
                  <span className="font-semibold text-text-primary">PKR {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4 flex justify-between items-end">
            <span className="text-sm font-semibold uppercase tracking-widest text-text-secondary font-sans">Amount Due (PKR)</span>
            <span className="text-xl font-bold text-accent font-serif">PKR {order.subtotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Actions Navigation */}
        <div className="flex gap-4">
          <Link 
            to="/home" 
            className="flex-1 text-center border border-border bg-white rounded-[6px] py-3 text-sm font-semibold hover:bg-bg transition-colors"
          >
            Go Back Home
          </Link>
          {order.status === 'Completed' && (
            <button
              onClick={() => setShowReviewModal(true)}
              className="flex-1 bg-accent text-white rounded-[6px] py-3 text-sm font-semibold hover:bg-[#B03D24] transition-colors flex items-center justify-center space-x-1"
            >
              <span className="material-symbols-outlined text-lg select-none">star</span>
              <span>Leave a Review</span>
            </button>
          )}
        </div>

      </main>

      {/* Review Modal (P3 Polish feature) */}
      {showReviewModal && (
        <ReviewModal 
          order={order} 
          onClose={() => setShowReviewModal(false)} 
        />
      )}
    </div>
  );
}
