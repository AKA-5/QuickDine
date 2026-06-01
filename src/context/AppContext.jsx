import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../services/firebase';

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('qd_cart');
    return saved ? JSON.parse(saved) : { restaurantId: null, items: [] };
  });
  const [timeSlot, setTimeSlot] = useState('ASAP');
  const [tablePreference, setTablePreference] = useState('No preference');

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('qd_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        let userDocSnap = await getDoc(userDocRef);
        
        let profileData = {};
        if (!userDocSnap.exists()) {
          // New user (likely Google sign-in or first-time email login)
          if (firebaseUser.email === 'restaurant@quickdine.demo') {
            profileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: 'Savour Foods (Demo)',
              role: 'restaurant',
              restaurantId: 'r1'
            };
          } else {
            profileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || 'Diner',
              role: 'customer',
              tasteProfile: null
            };
          }
          await setDoc(userDocRef, profileData);
        } else {
          profileData = userDocSnap.data();
          // Ensure correct role and restaurant ID for the demo restaurant user if previously misconfigured
          if (firebaseUser.email === 'restaurant@quickdine.demo' && (profileData.role !== 'restaurant' || !profileData.restaurantId)) {
            profileData.role = 'restaurant';
            profileData.restaurantId = 'r1';
            profileData.displayName = 'Savour Foods (Demo)';
            await setDoc(userDocRef, profileData);
          }
        }
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || profileData.displayName || 'User',
          ...profileData
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google login error:', err);
      setLoading(false);
      throw err;
    }
  };

  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.error('Email login error:', err);
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setCart({ restaurantId: null, items: [] });
      setTimeSlot('ASAP');
      setTablePreference('No preference');
    } catch (err) {
      console.error('Logout error:', err);
      setLoading(false);
    }
  };

  const addToCart = (restaurantId, item) => {
    setCart((prevCart) => {
      // If adding from a different restaurant, reset cart
      const currentRestaurantId = prevCart.restaurantId;
      const isDifferentRestaurant = currentRestaurantId && currentRestaurantId !== restaurantId;
      
      const items = isDifferentRestaurant ? [] : [...prevCart.items];
      const existingItemIndex = items.findIndex((i) => i.id === item.id);

      if (existingItemIndex > -1) {
        items[existingItemIndex] = {
          ...items[existingItemIndex],
          quantity: items[existingItemIndex].quantity + 1,
        };
      } else {
        items.push({
          ...item,
          quantity: 1,
          instructions: '',
        });
      }

      return {
        restaurantId,
        items,
      };
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const items = prevCart.items
        .map((i) => {
          if (i.id === itemId) {
            return { ...i, quantity: i.quantity - 1 };
          }
          return i;
        })
        .filter((i) => i.quantity > 0);

      const restaurantId = items.length === 0 ? null : prevCart.restaurantId;
      return {
        restaurantId,
        items,
      };
    });
  };

  const updateCartItemQty = (itemId, quantity) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        const items = prevCart.items.filter((i) => i.id !== itemId);
        const restaurantId = items.length === 0 ? null : prevCart.restaurantId;
        return { restaurantId, items };
      }

      const items = prevCart.items.map((i) => {
        if (i.id === itemId) {
          return { ...i, quantity };
        }
        return i;
      });

      return {
        ...prevCart,
        items,
      };
    });
  };

  const updateCartItemInstructions = (itemId, instructions) => {
    setCart((prevCart) => {
      const items = prevCart.items.map((i) => {
        if (i.id === itemId) {
          return { ...i, instructions };
        }
        return i;
      });

      return {
        ...prevCart,
        items,
      };
    });
  };

  const clearCart = () => {
    setCart({ restaurantId: null, items: [] });
    setTimeSlot('ASAP');
    setTablePreference('No preference');
  };

  const cartSubtotal = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartTotalItems = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        logout,
        cart,
        addToCart,
        removeFromCart,
        updateCartItemQty,
        updateCartItemInstructions,
        clearCart,
        cartSubtotal,
        cartTotalItems,
        timeSlot,
        setTimeSlot,
        tablePreference,
        setTablePreference,
        setUser
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
