import { useState } from 'react';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc,
  getDocs,
  updateDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebase';

export function useFirestore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getRestaurant = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'restaurants', id);
      const snap = await getDoc(docRef);
      setLoading(false);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getMenu = async (restaurantId) => {
    setLoading(true);
    setError(null);
    try {
      const colRef = collection(db, 'menus', restaurantId, 'items');
      const snap = await getDocs(colRef);
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLoading(false);
      return items;
    } catch (err) {
      console.error('Error fetching menu:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const createOrder = async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const colRef = collection(db, 'orders');
      const docRef = await addDoc(colRef, {
        ...orderData,
        status: 'New', // New, Accepted, Ready, Completed
        createdAt: serverTimestamp(),
      });
      setLoading(false);
      return docRef.id;
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'orders', orderId);
      await updateDoc(docRef, { 
        status, 
        updatedAt: serverTimestamp() 
      });
      setLoading(false);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    getRestaurant,
    getMenu,
    createOrder,
    updateOrderStatus
  };
}
