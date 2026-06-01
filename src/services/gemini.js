import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || 'MOCK_KEY');

export async function getRestaurantRecommendations(tasteProfile, availableRestaurants) {
  // Check session storage first
  const cacheKey = `recommendations_${JSON.stringify(tasteProfile)}`;
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.error('Failed to parse cached recommendations', e);
    }
  }

  // Fallback if API key is not present (e.g. testing or local dev before setup)
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    const fallback = getFallbackRecommendations(availableRestaurants);
    sessionStorage.setItem(cacheKey, JSON.stringify(fallback));
    return fallback;
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
You are a friendly restaurant recommendation assistant for QuickDine, an app used in Pakistan.

User taste profile:
- Cuisine preferences: ${tasteProfile.cuisines?.join(', ')}
- Spice level: ${tasteProfile.spiceLevel}
- Budget per person (PKR): ${tasteProfile.budget}
- Dietary restrictions: ${tasteProfile.dietary?.join(', ') || 'none'}
- Dining with: ${tasteProfile.diningWith}

Available restaurants:
${JSON.stringify(availableRestaurants, null, 2)}

Return a JSON array of exactly 3 restaurant recommendations with this structure:
[{ "restaurantId": "...", "reason": "one short sentence explaining why", "suggestedDish": "specific dish name" }]
Return ONLY the JSON array, no markdown, no explanation.
  `.trim();

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Strip markdown formatting if any (e.g. ```json ... ```)
    const jsonText = text.replace(/^```json/, '').replace(/```$/, '').trim();
    const recommendations = JSON.parse(jsonText);
    sessionStorage.setItem(cacheKey, JSON.stringify(recommendations));
    return recommendations;
  } catch (err) {
    console.error('Gemini recommendation error:', err);
    // Fallback: return top 3 by rating
    const fallback = getFallbackRecommendations(availableRestaurants);
    sessionStorage.setItem(cacheKey, JSON.stringify(fallback));
    return fallback;
  }
}

function getFallbackRecommendations(availableRestaurants) {
  return availableRestaurants
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
    .map(r => ({
      restaurantId: r.id,
      reason: 'Highly rated by local diners matching your general preferences.',
      suggestedDish: r.popularDish
    }));
}

export async function chatWithAssistant(userMessage, tasteProfile, restaurants, conversationHistory) {
  if (!import.meta.env.VITE_GEMINI_API_KEY) {
    return "I'm currently running in mock mode. Please configure the VITE_GEMINI_API_KEY environment variable to chat with me!";
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const systemContext = `
You are QuickDine's helpful assistant. Help users find restaurants and meals in Pakistan.
You ONLY give recommendations — you never place orders automatically.
User preferences: ${JSON.stringify(tasteProfile)}.
Available restaurants: ${JSON.stringify(restaurants.map(r => ({ id: r.id, name: r.name, cuisine: r.cuisine, priceRange: r.priceRange, rating: r.rating, popularDish: r.popularDish })))}.
Be concise and friendly. No markdown formatting in your response.
  `.trim();

  // Filter history to ensure it starts with a 'user' message as required by Gemini API
  const firstUserIdx = conversationHistory.findIndex(m => m.role === 'user');
  const cleanHistory = firstUserIdx !== -1 ? conversationHistory.slice(firstUserIdx) : [];

  const chat = model.startChat({
    history: cleanHistory.map(m => ({
      role: m.role,
      parts: [{ text: m.text }],
    })),
    systemInstruction: systemContext,
  });

  try {
    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (err) {
    console.error('Gemini chat error:', err);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
}
