import { describe, it, expect } from 'vitest';
import { MOCK_RESTAURANTS, MOCK_MENUS } from '../../services/mockData';

describe('Mock Data Validation', () => {
  it('should verify that all 6 restaurants have required fields', () => {
    expect(MOCK_RESTAURANTS.length).toBe(6);
    
    MOCK_RESTAURANTS.forEach(restaurant => {
      expect(restaurant).toHaveProperty('id');
      expect(restaurant).toHaveProperty('name');
      expect(restaurant).toHaveProperty('cuisine');
      expect(restaurant).toHaveProperty('location');
      expect(restaurant).toHaveProperty('rating');
      expect(restaurant).toHaveProperty('priceRange');
      expect(restaurant).toHaveProperty('ambiance');
      expect(restaurant).toHaveProperty('popularDish');
      
      expect(typeof restaurant.id).toBe('string');
      expect(typeof restaurant.name).toBe('string');
      expect(typeof restaurant.cuisine).toBe('string');
      expect(typeof restaurant.location).toBe('string');
      expect(typeof restaurant.rating).toBe('number');
      expect(restaurant.rating).toBeGreaterThanOrEqual(0);
      expect(restaurant.rating).toBeLessThanOrEqual(5);
      expect(Array.isArray(restaurant.ambiance)).toBe(true);
    });
  });

  it('should verify all menu items have a price greater than 0', () => {
    Object.keys(MOCK_MENUS).forEach(restaurantId => {
      const menuItems = MOCK_MENUS[restaurantId];
      expect(menuItems.length).toBeGreaterThan(0);
      
      menuItems.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('price');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('category');
        
        expect(typeof item.price).toBe('number');
        expect(item.price).toBeGreaterThan(0);
      });
    });
  });
});
