import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnsplashUrl } from '../../utils/imageHelper';

export function RecommendationCard({ recommendation, restaurant }) {
  const navigate = useNavigate();

  if (!restaurant) return null;

  const { name, cuisine, rating, priceRange } = restaurant;
  const { reason, suggestedDish } = recommendation;

  const handlePreOrder = () => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  return (
    <div className="bg-white rounded-lg border border-accent/20 shadow-card overflow-hidden flex flex-col justify-between group h-full relative ring-1 ring-accent/10">
      
      {/* Top Banner Tag */}
      <div className="absolute top-3 right-3 z-10 bg-accent text-white px-2.5 py-1 rounded-[4px] text-[10px] uppercase tracking-widest font-semibold flex items-center space-x-1">
        <span className="material-symbols-outlined text-xs select-none">smart_toy</span>
        <span>AI Pick</span>
      </div>

      <div className="relative aspect-[16/10] overflow-hidden bg-bg">
        <img
          src={getUnsplashUrl(400, 250, cuisine + ' restaurant')}
          alt={`${name} restaurant interior`}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-[4px] border border-border flex items-center space-x-1">
          <span className="material-symbols-outlined text-warning text-sm select-none">star</span>
          <span className="text-xs font-semibold text-text-primary">{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary">
              {cuisine} • {priceRange}
            </span>
          </div>
          <h3 className="font-serif text-xl font-normal text-text-primary leading-snug truncate">
            {name}
          </h3>
          
          {/* Suggested Dish */}
          {suggestedDish && (
            <div className="bg-accent-light border border-accent/15 rounded-[6px] p-2.5 flex items-start space-x-2">
              <span className="material-symbols-outlined text-accent text-base select-none mt-0.5">restaurant</span>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-widest font-bold text-accent">Suggested Dish</p>
                <p className="text-xs font-semibold text-text-primary">{suggestedDish}</p>
              </div>
            </div>
          )}

          {/* Reason */}
          <p className="text-xs text-text-secondary italic text-left bg-bg border border-border/50 p-2.5 rounded-[6px] leading-relaxed">
            "{reason}"
          </p>
        </div>

        <button
          onClick={handlePreOrder}
          className="w-full text-center bg-accent text-white rounded-[6px] py-2 text-sm font-medium hover:bg-[#B03D24] transition-colors flex items-center justify-center space-x-1"
        >
          <span className="material-symbols-outlined text-base">schedule</span>
          <span>Pre-order & Reserve</span>
        </button>
      </div>
    </div>
  );
}
