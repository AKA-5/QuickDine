import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestore } from '../hooks/useFirestore';
import { Navbar } from '../components/layout/Navbar';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function RestaurantDashboard() {
  const { user } = useAuth();
  const { updateOrderStatus } = useFirestore();

  const [orders, setOrders] = useState([]);
  const [restaurantData, setRestaurantData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load restaurant metadata and subscribe to orders
  useEffect(() => {
    if (!user?.restaurantId) {
      setLoading(false);
      return;
    }

    // Fetch restaurant metadata (e.g. rating)
    const restDocRef = doc(db, 'restaurants', user.restaurantId);
    getDoc(restDocRef).then((snap) => {
      if (snap.exists()) {
        setRestaurantData(snap.data());
      }
    }).catch(err => console.error('Error fetching restaurant data:', err));

    // Listen to orders matching restaurantId in real-time
    const q = query(
      collection(db, 'orders'),
      where('restaurantId', '==', user.restaurantId)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by createdAt client-side to prevent Firestore composite index issues
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA; // Newest first
      });

      setOrders(list);
      setLoading(false);
    }, (err) => {
      console.error('Error subscribing to orders:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.restaurantId]);

  // Status transitions
  const handleTransition = async (orderId, currentStatus) => {
    let nextStatus = '';
    if (currentStatus === 'New') nextStatus = 'Accepted';
    else if (currentStatus === 'Accepted') nextStatus = 'Ready';
    else if (currentStatus === 'Ready') nextStatus = 'Completed';
    else return;

    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (err) {
      console.error('Failed to transition order:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent"></div>
          <p className="text-sm font-medium text-text-secondary uppercase tracking-widest">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  // Analytics helper calculations
  const today = new Date().setHours(0, 0, 0, 0);
  const todaysOrders = orders.filter(o => {
    const oDate = o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).setHours(0, 0, 0, 0) : today;
    return oDate === today;
  });

  const todaysRevenue = todaysOrders
    .filter(o => o.status === 'Completed' || o.status === 'Ready' || o.status === 'Accepted')
    .reduce((sum, o) => sum + (o.subtotal || 0), 0);

  // Most ordered item calculator
  const itemCounts = {};
  orders.forEach(o => {
    o.items?.forEach(i => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.quantity;
    });
  });
  const mostOrderedItem = Object.entries(itemCounts).reduce((max, curr) => curr[1] > max[1] ? curr : max, ['', 0])[0] || 'None';

  // Group orders for Kanban
  const columns = {
    New: { title: 'New Orders', color: 'border-t-warning', bg: 'bg-amber-50/20', icon: 'pending_actions', action: 'Accept' },
    Accepted: { title: 'Preparing', color: 'border-t-accent', bg: 'bg-orange-50/10', icon: 'restaurant', action: 'Mark Ready' },
    Ready: { title: 'Ready to Serve', color: 'border-t-success', bg: 'bg-green-50/10', icon: 'room_service', action: 'Complete' },
    Completed: { title: 'Completed', color: 'border-t-text-secondary', bg: 'bg-bg', icon: 'check_circle', action: null }
  };

  const groupedOrders = {
    New: [],
    Accepted: [],
    Ready: [],
    Completed: []
  };

  orders.forEach(o => {
    if (groupedOrders[o.status]) {
      groupedOrders[o.status].push(o);
    }
  });

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-8 flex-1 flex flex-col">
        
        {/* Title & Restaurant Header */}
        <section className="text-left space-y-1">
          <span className="text-xs uppercase tracking-widest font-semibold text-text-secondary">
            Live operations
          </span>
          <h1 className="text-4xl font-serif font-normal text-text-primary">
            {restaurantData?.name || 'Partner'} Kitchen Board
          </h1>
        </section>

        {/* Analytics Row */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-border rounded-lg shadow-card p-5 text-left space-y-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Today's orders</p>
            <p className="font-serif text-3xl text-text-primary">{todaysOrders.length}</p>
          </div>
          <div className="bg-white border border-border rounded-lg shadow-card p-5 text-left space-y-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Today's Revenue</p>
            <p className="font-serif text-3xl text-accent">PKR {todaysRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white border border-border rounded-lg shadow-card p-5 text-left space-y-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Signature dish</p>
            <p className="font-serif text-xl text-text-primary truncate" title={mostOrderedItem}>
              {mostOrderedItem}
            </p>
          </div>
          <div className="bg-white border border-border rounded-lg shadow-card p-5 text-left space-y-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-text-secondary">Average rating</p>
            <div className="flex items-center space-x-1.5 mt-1">
              <span className="material-symbols-outlined text-warning select-none text-2xl">star</span>
              <span className="font-serif text-3xl text-text-primary">
                {restaurantData?.rating ? restaurantData.rating.toFixed(1) : '4.5'}
              </span>
            </div>
          </div>
        </section>

        {/* Kanban Board columns */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 items-stretch pb-12">
          {Object.entries(columns).map(([colStatus, colInfo]) => {
            const list = groupedOrders[colStatus] || [];
            return (
              <div 
                key={colStatus} 
                className={`rounded-lg border border-border bg-white flex flex-col max-h-[70vh] ${colInfo.bg}`}
              >
                {/* Column header */}
                <div className={`p-4 border-b border-border border-t-4 ${colInfo.color} flex justify-between items-center bg-white`}>
                  <div className="flex items-center space-x-2">
                    <span className="material-symbols-outlined text-text-secondary select-none text-xl">
                      {colInfo.icon}
                    </span>
                    <h3 className="font-serif text-base font-semibold">{colInfo.title}</h3>
                  </div>
                  <span className="bg-bg text-text-secondary px-2 py-0.5 rounded-full text-xs font-semibold">
                    {list.length}
                  </span>
                </div>

                {/* Orders sublist */}
                <div className="p-4 overflow-y-auto space-y-4 flex-1">
                  {list.length === 0 ? (
                    <div className="h-24 flex items-center justify-center border border-dashed border-border/80 rounded-md text-text-secondary/50 text-xs font-medium">
                      No orders
                    </div>
                  ) : (
                    list.map(order => (
                      <div 
                        key={order.id} 
                        className="bg-white border border-border rounded-[6px] shadow-sm p-4 space-y-3 text-left hover:shadow-card transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-serif font-semibold text-text-primary text-sm">{order.customerName}</p>
                            <p className="text-[10px] text-text-secondary truncate max-w-[120px]">{order.customerEmail}</p>
                          </div>
                          <span className="text-[9px] font-mono font-semibold text-text-secondary uppercase">
                            #{order.id.slice(-6)}
                          </span>
                        </div>

                        {/* Items list */}
                        <div className="border-t border-border/50 pt-2 pb-1 space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="text-xs text-text-primary space-y-0.5">
                              <div className="flex justify-between">
                                <span>
                                  <span className="font-semibold text-accent">{item.quantity}x</span> {item.name}
                                </span>
                                <span className="text-text-secondary font-mono">PKR {(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                              {item.instructions && (
                                <p className="text-[10px] text-accent italic pl-4 font-sans font-medium">
                                  * {item.instructions}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Booking info */}
                        <div className="border-t border-border/50 pt-2 text-[10px] uppercase tracking-wider font-semibold text-text-secondary grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-[8px] font-bold">Arrival</p>
                            <p className="text-text-primary font-serif font-normal text-xs normal-case">{order.timeSlot}</p>
                          </div>
                          <div>
                            <p className="text-[8px] font-bold">Seating</p>
                            <p className="text-text-primary font-serif font-normal text-xs normal-case">{order.tablePreference}</p>
                          </div>
                        </div>

                        <div className="border-t border-border/50 pt-2 flex justify-between items-center">
                          <span className="text-xs font-semibold text-text-primary">PKR {order.subtotal?.toLocaleString()}</span>
                          {colInfo.action && (
                            <button
                              onClick={() => handleTransition(order.id, order.status)}
                              className="bg-accent hover:bg-[#B03D24] text-white text-xs font-semibold rounded-[4px] px-3 py-1.5 transition-colors flex items-center space-x-1"
                            >
                              <span>{colInfo.action}</span>
                              <span className="material-symbols-outlined text-sm select-none">arrow_forward</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </section>

      </main>
    </div>
  );
}
