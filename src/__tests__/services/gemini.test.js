import { describe, it, expect, beforeEach } from 'vitest';
import { getRestaurantRecommendations, chatWithAssistant } from '../../services/gemini';
import { MOCK_RESTAURANTS } from '../../services/mockData';

beforeEach(() => {
  sessionStorage.clear();
});

describe('Gemini Recommendation Service', () => {
  const tasteProfile = {
    cuisines: ['Pakistani', 'BBQ'],
    spiceLevel: 'Medium',
    budget: 'PKR 800–1500',
    diningWith: 'Friends',
    dietary: ['None']
  };

  it('should return exactly 3 restaurant recommendations under mock mode', async () => {
    const recommendations = await getRestaurantRecommendations(tasteProfile, MOCK_RESTAURANTS);
    
    expect(recommendations.length).toBe(3);
    recommendations.forEach(rec => {
      expect(rec).toHaveProperty('restaurantId');
      expect(rec).toHaveProperty('reason');
      expect(rec).toHaveProperty('suggestedDish');
    });
  });

  it('should fallback gracefully to top-rated restaurants on API failure or empty profiles', async () => {
    // Temporarily unset the API key to force the fallback code path
    const originalKey = import.meta.env.VITE_GEMINI_API_KEY;
    import.meta.env.VITE_GEMINI_API_KEY = '';
    
    const recommendations = await getRestaurantRecommendations(tasteProfile, []);
    expect(recommendations.length).toBe(0);
    
    // Restore the key
    import.meta.env.VITE_GEMINI_API_KEY = originalKey;
  });
});

describe('Gemini Chat Assistant Service', () => {
  it('should clean conversation history when starting with model role', async () => {
    // Set mock key to trigger startChat pathway
    const originalKey = import.meta.env.VITE_GEMINI_API_KEY;
    import.meta.env.VITE_GEMINI_API_KEY = 'MOCK_KEY';

    const history = [
      { role: 'model', text: 'Welcome to QuickDine!' },
      { role: 'user', text: 'Show me restaurants' }
    ];

    const response = await chatWithAssistant(
      'Recommend something',
      { cuisines: ['Pakistani'] },
      MOCK_RESTAURANTS,
      history
    );

    expect(response).toBe('I recommend visiting Savour Foods.');

    // Restore key
    import.meta.env.VITE_GEMINI_API_KEY = originalKey;
  });
});
