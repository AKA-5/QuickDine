import { useApp } from '../context/AppContext';

export function useCart() {
  const {
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
  } = useApp();

  return {
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
  };
}
