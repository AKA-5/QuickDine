import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/layout/Navbar';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { RecommendationCard } from '../components/ai/RecommendationCard';
import { getRestaurantRecommendations } from '../services/gemini';
import { seedFirestore } from '../services/dbSeeder';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import { MOCK_RESTAURANTS } from '../services/mockData';
import ChatAssistant from '../components/ai/ChatAssistant';

export default function CustomerHome() {
  const { user } = useAuth();
  
  const [restaurants, setRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmbiance, setSelectedAmbiance] = useState('All');
  
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Ambiance filters
  const ambianceFilters = ['All', 'Family-Friendly', 'Casual', 'Scenic', 'Romantic', 'Outdoor-Seating', 'Quiet', 'Work-Friendly', 'Upscale'];

  // Seed and fetch restaurants
  useEffect(() => {
    async function loadData() {
      setLoadingRestaurants(true);
      try {
        await seedFirestore();
        const querySnapshot = await getDocs(collection(db, 'restaurants'));
        if (!querySnapshot.empty) {
          const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setRestaurants(list);
        } else {
          setRestaurants(MOCK_RESTAURANTS);
        }
      } catch (err) {
        console.error('Failed to load restaurants from Firestore, falling back to mock:', err);
        setRestaurants(MOCK_RESTAURANTS);
      } finally {
        setLoadingRestaurants(false);
      }
    }
    loadData();
  }, []);

  // Fetch AI Recommendations based on tasteProfile and available restaurants
  useEffect(() => {
    if (restaurants.length === 0) return;
    
    async function fetchAIRecommendations() {
      setLoadingRecommendations(true);
      const tasteProfile = user?.tasteProfile;
      if (!tasteProfile) {
        setLoadingRecommendations(false);
        return;
      }

      try {
        const recs = await getRestaurantRecommendations(tasteProfile, restaurants);
        setRecommendations(recs);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoadingRecommendations(false);
      }
    }

    fetchAIRecommendations();
  }, [restaurants, user?.tasteProfile]);

  // Filter restaurants grid
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Ambiance filter check
    const matchesAmbiance = selectedAmbiance === 'All' || 
      restaurant.ambiance.some(a => a.toLowerCase() === selectedAmbiance.toLowerCase());
    
    // Search query check (name, cuisine, tags, location)
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      restaurant.name.toLowerCase().includes(query) ||
      restaurant.cuisine.toLowerCase().includes(query) ||
      restaurant.location.toLowerCase().includes(query) ||
      restaurant.tags.some(t => t.toLowerCase().includes(query)) ||
      restaurant.popularDish.toLowerCase().includes(query);

    return matchesAmbiance && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col pb-24">
      {/* Navbar with Search capabilities */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 space-y-12">
        
        {/* Welcome Section */}
        <section className="text-left space-y-1">
          <h1 className="text-4xl font-serif font-normal text-text-primary">
            Khush Amdeed, {user?.displayName || 'Diner'}
          </h1>
          <p className="text-sm text-text-secondary">
            Find the perfect dine-in table, pre-order your meals, and avoid restaurant wait times.
          </p>
        </section>

        {/* AI Picks Recommendations (P2 feature, styled cleanly) */}
        {user?.tasteProfile && (
          <section className="space-y-6">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-accent select-none">neurology</span>
              <h2 className="text-2xl font-serif text-text-primary">Your AI Picks</h2>
            </div>
            
            {loadingRecommendations ? (
              // Recommendation Skeletons
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="bg-white rounded-lg border border-border shadow-card overflow-hidden h-[380px] animate-pulse">
                    <div className="bg-bg aspect-[16/10]" />
                    <div className="p-5 space-y-4">
                      <div className="h-4 bg-bg rounded w-1/4" />
                      <div className="h-6 bg-bg rounded w-3/4" />
                      <div className="h-10 bg-bg rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map(rec => {
                  const matchedRest = restaurants.find(r => r.id === rec.restaurantId);
                  return (
                    <RecommendationCard 
                      key={rec.restaurantId} 
                      recommendation={rec} 
                      restaurant={matchedRest} 
                    />
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-text-secondary italic">No AI recommendations available right now.</p>
            )}
          </section>
        )}

        {/* Explore Restaurants Grid */}
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <h2 className="text-2xl font-serif text-text-primary text-left">Explore Restaurants</h2>
            
            {/* Ambiance Filters */}
            <div className="flex flex-wrap gap-2 justify-start md:justify-end overflow-x-auto pb-1 max-w-full">
              {ambianceFilters.map(filter => {
                const isSelected = selectedAmbiance === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setSelectedAmbiance(filter)}
                    className={`px-3 py-1.5 rounded-[6px] text-xs font-semibold uppercase tracking-wider border transition-colors ${
                      isSelected 
                        ? 'bg-accent border-accent text-white' 
                        : 'bg-white border-border hover:bg-bg text-text-secondary'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Restaurant Cards Grid */}
          {loadingRestaurants ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="bg-white rounded-lg border border-border shadow-card overflow-hidden h-[340px] animate-pulse">
                  <div className="bg-bg aspect-[16/10]" />
                  <div className="p-5 space-y-4">
                    <div className="h-4 bg-bg rounded w-1/3" />
                    <div className="h-6 bg-bg rounded w-2/3" />
                    <div className="h-8 bg-bg rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRestaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map(restaurant => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-border rounded-lg bg-white">
              <span className="material-symbols-outlined text-4xl text-text-secondary select-none">search_off</span>
              <p className="mt-2 text-sm text-text-secondary">No restaurants found matching your criteria.</p>
            </div>
          )}
        </section>

      </main>

      {/* Floating AI Assistant (P2 features) */}
      <ChatAssistant restaurants={restaurants} />
    </div>
  );
}
