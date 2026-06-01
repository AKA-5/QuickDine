import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase SDK
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    currentUser: null,
  })),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn((auth, cb) => {
    cb(null); // default to signed out
    return () => {};
  }),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: vi.fn(),
  setDoc: vi.fn(),
  getDoc: vi.fn(() => ({
    exists: () => false,
  })),
  getDocs: vi.fn(() => ({
    empty: true,
    docs: [],
  })),
  updateDoc: vi.fn(),
  onSnapshot: vi.fn((query, cb) => {
    cb({ docs: [] });
    return () => {};
  }),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  runTransaction: vi.fn(),
}));

// Mock Google Generative AI SDK using a real JS Class
class MockGoogleGenerativeAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
  }
  getGenerativeModel() {
    return {
      generateContent: async () => ({
        response: {
          text: () => JSON.stringify([
            { restaurantId: 'r1', reason: 'Recommended based on taste', suggestedDish: 'Biryani' },
            { restaurantId: 'r2', reason: 'Fine scenic dining', suggestedDish: 'Karahi' },
            { restaurantId: 'r3', reason: 'Traditional Pakistani BBQ', suggestedDish: 'Kebab' }
          ])
        }
      }),
      startChat: () => ({
        sendMessage: async () => ({
          response: {
            text: () => "I recommend visiting Savour Foods."
          }
        })
      })
    };
  }
}

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: MockGoogleGenerativeAI
}));
