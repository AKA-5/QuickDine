import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../../pages/Cart';
import { AppContext } from '../../context/AppContext';

// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'u1', displayName: 'Ali', email: 'ali@quickdine.demo', role: 'customer' },
    loading: false,
    isAuthenticated: true
  })
}));

describe('Cart Page', () => {
  it('renders cart items and updates price total when modifying quantities', () => {
    const mockUpdateCartItemQty = vi.fn();
    const mockUpdateCartItemInstructions = vi.fn();
    const mockClearCart = vi.fn();

    const providerValue = {
      user: { uid: 'u1', displayName: 'Ali', email: 'ali@quickdine.demo', role: 'customer' },
      loading: false,
      cart: {
        restaurantId: 'r1',
        items: [
          { id: 'm1_1', name: 'Peshawari Karahi', price: 1200, quantity: 1, instructions: '' },
          { id: 'm1_2', name: 'Chapli Kebab', price: 450, quantity: 2, instructions: '' }
        ]
      },
      cartSubtotal: 2100, // 1200 + 2*450
      cartTotalItems: 3,
      timeSlot: 'ASAP',
      setTimeSlot: vi.fn(),
      tablePreference: 'No preference',
      setTablePreference: vi.fn(),
      updateCartItemQty: mockUpdateCartItemQty,
      updateCartItemInstructions: mockUpdateCartItemInstructions,
      clearCart: mockClearCart
    };

    render(
      <MemoryRouter>
        <AppContext.Provider value={providerValue}>
          <Cart />
        </AppContext.Provider>
      </MemoryRouter>
    );

    // Verify item renders
    expect(screen.getByText('Peshawari Karahi')).toBeInTheDocument();
    expect(screen.getByText('Chapli Kebab')).toBeInTheDocument();
    
    // Check that we have PKR 2,100 displayed on the screen (allowing multiple instances)
    expect(screen.getAllByText('PKR 2,100').length).toBeGreaterThan(0);

    // Click increment button on first item (index 0)
    // The increment button is the plus sign inside quantity controls
    const plusButtons = screen.getAllByText('add');
    fireEvent.click(plusButtons[0]);

    // Check quantity updater was triggered
    expect(mockUpdateCartItemQty).toHaveBeenCalledWith('m1_1', 2);
  });
});
