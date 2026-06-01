import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { RestaurantCard } from '../../../../src/components/restaurant/RestaurantCard';

// Mock useNavigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('RestaurantCard Component', () => {
  const restaurantMock = {
    id: 'r1',
    name: 'Savour Foods',
    cuisine: 'Pakistani',
    location: 'Blue Area, Islamabad',
    rating: 4.6,
    priceRange: 'PKR 800–1500',
    ambiance: ['family-friendly', 'casual'],
    popularDish: 'Peshawari Karahi',
    avgWaitMinutes: 25
  };

  it('renders restaurant details correctly', () => {
    render(
      <MemoryRouter>
        <RestaurantCard restaurant={restaurantMock} />
      </MemoryRouter>
    );

    // Verify name, cuisine, rating, and location
    expect(screen.getByText('Savour Foods')).toBeInTheDocument();
    expect(screen.getByText('Pakistani')).toBeInTheDocument();
    expect(screen.getByText('4.6')).toBeInTheDocument();
    expect(screen.getByText('Blue Area, Islamabad')).toBeInTheDocument();
    expect(screen.getByText('25 mins wait')).toBeInTheDocument();
  });

  it('navigates to the restaurant detail page when pre-order button is clicked', () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    render(
      <MemoryRouter>
        <RestaurantCard restaurant={restaurantMock} />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /pre-order & reserve/i });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith('/restaurant/r1');
  });
});
