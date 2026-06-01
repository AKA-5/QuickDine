import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnsplashUrl } from '../../utils/imageHelper';

export function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();
  const { id, name, cuisine, location, rating, priceRange, avgWaitMinutes } = restaurant;

  const handlePreOrder = () => {
    navigate(`/restaurant/${id}`);
  };

  return (
    <div className="bg-white rounded-lg border border-border shadow-card overflow-hidden flex flex-col justify-between group h-full">
      <div className="relative aspect-[16/10] overflow-hidden bg-bg">
        <img
          src={getUnsplashUrl(400, 250, cuisine + ' restaurant')}
          alt={`${name} restaurant exterior`}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-[4px] border border-border flex items-center space-x-1">
          <span className="material-symbols-outlined text-warning text-sm select-none">star</span>
          <span className="text-xs font-semibold text-text-primary">{rating.toFixed(1)}</span>
        </div>
        <div className="absolute bottom-3 right-3 bg-accent text-white px-2.5 py-1 rounded-[4px] text-xs font-medium">
          {avgWaitMinutes} mins wait
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-text-secondary">
              {cuisine}
            </span>
            <span className="text-xs font-medium text-text-secondary">
              {priceRange}
            </span>
          </div>
          <h3 className="font-serif text-xl font-normal text-text-primary leading-snug truncate">
            {name}
          </h3>
          <p className="text-xs text-text-secondary flex items-center">
            <span className="material-symbols-outlined text-xs mr-1 text-text-secondary select-none">location_on</span>
            <span className="truncate">{location}</span>
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
