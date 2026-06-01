import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TasteOnboarding from '../../../../src/pages/TasteOnboarding';
import { AppContext } from '../../../../src/context/AppContext';

// Mock useAuth
vi.mock('../../../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'u1', email: 'diner@quickdine.demo', role: 'customer', tasteProfile: null },
    loading: false,
    isAuthenticated: true
  })
}));

describe('TasteOnboarding Quiz Page', () => {
  const mockSetUser = vi.fn();
  
  const providerValue = {
    user: { uid: 'u1', email: 'diner@quickdine.demo', role: 'customer', tasteProfile: null },
    setUser: mockSetUser,
    loading: false
  };

  it('renders and steps through questions sequentially', async () => {
    render(
      <MemoryRouter>
        <AppContext.Provider value={providerValue}>
          <TasteOnboarding />
        </AppContext.Provider>
      </MemoryRouter>
    );

    // Question 1: Cuisines
    expect(screen.getByText('Which cuisines do you crave?')).toBeInTheDocument();
    
    // Select a cuisine (Pakistani)
    const cuisineChip = screen.getByText('Pakistani');
    fireEvent.click(cuisineChip);

    // Click continue
    const continueBtn = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(continueBtn);

    // Question 2: Spice level
    expect(screen.getByText('Select your preferred spice level')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Question 3: Budget
    expect(screen.getByText('What is your budget per person?')).toBeInTheDocument();
    
    // Select under PKR 800
    const budgetOption = screen.getByText('Under PKR 800');
    fireEvent.click(budgetOption);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Question 4: Dining with
    expect(screen.getByText('Who do you usually dine with?')).toBeInTheDocument();
    
    // Select Couple
    const diningOption = screen.getByText('Couple');
    fireEvent.click(diningOption);
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Question 5: Dietary restrictions
    expect(screen.getByText('Any dietary preferences or restrictions?')).toBeInTheDocument();
    
    // Check finish button is present
    const finishBtn = screen.getByRole('button', { name: /finish setup/i });
    expect(finishBtn).toBeInTheDocument();
  });
});
