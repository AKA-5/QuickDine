export function getUnsplashUrl(width, height, keyword) {
  // A curated list of beautiful, high-resolution Unsplash photo IDs for the food app
  const keywordMap = {
    'pakistani food': 'photo-1606491956689-2ea866880c84', // Tikka & BBQ platter
    'pakistani restaurant': 'photo-1517248135467-4c7edcad34c4', // Beautiful interior
    'restaurant': 'photo-1517248135467-4c7edcad34c4',
    'biryani': 'photo-1633945274405-b6c8069047b0', // Biryani dish
    'karahi': 'photo-1601050690597-df056fb4ce78', // Desi karahi cooking
    'kebab': 'photo-1561758033-d89a9ad46330', // Kebabs
    'pasta': 'photo-1563379091339-03b21ab4a4f8', // Truffle pasta
    'pizza': 'photo-1513104890138-7c749659a591', // Margherita pizza
    'salad': 'photo-1512621776951-a57141f2eefd', // Caesar salad
    'burger': 'photo-1568901346375-23c9450c58cd', // Gourmet burger
    'soup': 'photo-1547592180-85f173990554', // Chinese soup
    'fries': 'photo-1573080496219-bb080dd4f877', // Loaded fries
    'margarita': 'photo-1513558161293-cdaf765ed2fd', // Mint mocktail
    'lava cake': 'photo-1606313564200-e75d5e30476c', // Chocolate dessert
    'italian': 'photo-1551183053-bf91a1d81141', // Italian food
    'bbq': 'photo-1555939594-58d7cb561ad1', // BBQ grill
    'chinese': 'photo-1563245372-f21724e3856d', // Chinese stir fry
    'cafe': 'photo-1554118811-1e0d58224f24', // Cozy cafe setting
    'family-friendly': 'photo-1543007630-9710e4a00a20',
    'view': 'photo-1464822759023-fed622ff2c3b', // Margalla hills feel
    'scenic': 'photo-1464822759023-fed622ff2c3b',
    'quiet': 'photo-1517248135467-4c7edcad34c4',
    'romantic': 'photo-1514933651103-005eec06c04b',
    'outdoor-seating': 'photo-1533777857889-4be7c70b33f7',
    'upscale': 'photo-1514933651103-005eec06c04b',
    'default': 'photo-1504674900247-0877df9cc836' // General food
  };
  
  const cleanKeyword = keyword ? keyword.toLowerCase().trim() : 'default';
  let photoId = null;
  
  // Try to find a matching keyword from map
  for (const [key, val] of Object.entries(keywordMap)) {
    if (cleanKeyword.includes(key)) {
      photoId = val;
      break;
    }
  }
  
  if (!photoId) {
    photoId = keywordMap['default'];
  }
  
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=${width}&h=${height}&q=80`;
}
