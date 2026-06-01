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
    console.warn('Gemini API call failed, falling back to smart local response:', err);
    return getLocalChatFallback(userMessage, tasteProfile, restaurants);
  }
}

function getLocalChatFallback(userMessage, tasteProfile, restaurants) {
  const query = userMessage.toLowerCase();
  
  // 1. Budget Query
  const budgetMatch = query.match(/(?:under|below|pkr|budget)\s*(\d+)/i) || query.match(/(\d+)\s*(?:pkr|rupees)/i);
  if (budgetMatch) {
    const limit = parseInt(budgetMatch[1], 10);
    const cheapOptions = [];
    
    const MOCK_MENUS = {
      r1: [
        { name: 'Peshawari Karahi', price: 1200, category: 'Main' },
        { name: 'Chapli Kebab', price: 450, category: 'Starter' },
        { name: 'Biryani', price: 650, category: 'Main' },
      ],
      r2: [
        { name: 'Grilled Chicken Platter', price: 1850, category: 'Main' },
        { name: 'Cheese Naan', price: 350, category: 'Starter' },
        { name: 'Molten Lava Cake', price: 600, category: 'Dessert' },
      ],
      r3: [
        { name: 'Seekh Kebab', price: 800, category: 'Main' },
        { name: 'Chicken Boti', price: 900, category: 'Main' },
        { name: 'Garlic Naan', price: 120, category: 'Starter' },
      ],
      r4: [
        { name: 'Truffle Mushroom Pasta', price: 2200, category: 'Main' },
        { name: 'Margherita Pizza', price: 1500, category: 'Main' },
        { name: 'Caesar Salad', price: 850, category: 'Starter' },
      ],
      r5: [
        { name: 'Loaded Fries', price: 750, category: 'Starter' },
        { name: 'Beef Smash Burger', price: 1100, category: 'Main' },
        { name: 'Mint Margarita', price: 350, category: 'Drinks' },
      ],
      r6: [
        { name: 'Kung Pao Chicken', price: 1400, category: 'Main' },
        { name: 'Egg Fried Rice', price: 800, category: 'Main' },
        { name: 'Chicken Corn Soup', price: 450, category: 'Starter' },
      ],
    };

    restaurants.forEach(r => {
      const menu = MOCK_MENUS[r.id] || [];
      const fits = menu.filter(item => item.price <= limit);
      if (fits.length > 0) {
        cheapOptions.push({
          restaurantName: r.name,
          items: fits.slice(0, 2).map(i => `${i.name} (PKR ${i.price})`)
        });
      }
    });

    if (cheapOptions.length > 0) {
      const recommendations = cheapOptions
        .slice(0, 3)
        .map(opt => `${opt.restaurantName}: ${opt.items.join(', ')}`)
        .join('. ');
      return `Here are some great options under PKR ${limit}: ${recommendations}. You can pre-order them right now to skip the wait!`;
    } else {
      return `I couldn't find items specifically under PKR ${limit}, but Street 1 Cafe has loaded fries and drinks that are very affordable.`;
    }
  }

  // 2. Ambiance / Category Query
  if (query.includes('family') || query.includes('kids')) {
    const familyRests = restaurants.filter(r => r.ambiance?.includes('family-friendly')).map(r => r.name);
    return `For a family outing, I highly recommend ${familyRests.join(' or ')}. They offer spacious dine-in areas and family-friendly menus!`;
  }
  
  if (query.includes('scenic') || query.includes('view') || query.includes('hills')) {
    const scenicRests = restaurants.filter(r => r.ambiance?.includes('scenic') || r.tags?.includes('view')).map(r => r.name);
    return `If you want scenic views, ${scenicRests.join(', ') || 'Monal Restaurant'} is the perfect spot. Highly recommended for a dinner with a view!`;
  }

  if (query.includes('romantic') || query.includes('date')) {
    return `For a romantic dinner, Tuscany Courtyard in F-6 or Monal Restaurant on Margalla Hills offer a wonderful, cozy ambiance.`;
  }

  // 3. Default friendly response matching user's tasteProfile
  const userCuisines = tasteProfile?.cuisines || [];
  if (userCuisines.length > 0) {
    const matched = restaurants.filter(r => userCuisines.some(c => r.cuisine.toLowerCase().includes(c.toLowerCase()))).map(r => r.name);
    if (matched.length > 0) {
      return `Based on your taste profile craving ${userCuisines.join(', ')}, you should try ${matched.slice(0, 2).join(' or ')}!`;
    }
  }

  return "I recommend Savour Foods for authentic Pakistani Pulao and Kebabs, or Tuscany Courtyard if you are craving Italian pasta or pizza!";
}
