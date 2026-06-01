import { getUnsplashUrl } from '../../utils/imageHelper';

export function MenuItemCard({ item, onAdd, countInCart }) {
  const { name, price, description, spiceLevel } = item;

  const getSpiceBadgeStyle = (spice) => {
    switch (spice?.toLowerCase()) {
      case 'mild':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'hot':
      case 'extra hot':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return null;
    }
  };

  const badgeStyle = getSpiceBadgeStyle(spiceLevel);

  return (
    <div className="bg-white rounded-lg border border-border p-4 flex gap-4 items-center justify-between shadow-sm hover:shadow-card transition-shadow">
      
      {/* Left Details */}
      <div className="flex-1 text-left space-y-2">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h4 className="font-serif text-lg font-normal text-text-primary leading-snug">
              {name}
            </h4>
            {spiceLevel && badgeStyle && (
              <span className={`text-[9px] uppercase tracking-wider font-semibold border rounded px-1.5 py-0.5 select-none ${badgeStyle}`}>
                {spiceLevel}
              </span>
            )}
          </div>
          <p className="text-xs text-text-secondary line-clamp-2 max-w-md font-sans">
            {description}
          </p>
        </div>
        <p className="text-sm font-semibold text-accent font-sans">
          PKR {price.toLocaleString()}
        </p>
      </div>

      {/* Right Image & Actions */}
      <div className="flex flex-col items-center space-y-3 relative shrink-0">
        <div className="w-20 h-20 rounded-md overflow-hidden bg-bg border border-border">
          <img
            src={getUnsplashUrl(200, 200, name + ' food')}
            alt={`${name} dish`}
            className="object-cover w-full h-full"
            loading="lazy"
          />
        </div>

        <button
          onClick={() => onAdd(item)}
          className="absolute -bottom-2 bg-accent hover:bg-[#B03D24] text-white rounded-full h-7 px-3 text-xs font-semibold shadow-sm flex items-center justify-center space-x-0.5 hover:scale-105 transition-all"
        >
          <span className="material-symbols-outlined text-sm select-none">add</span>
          <span>Add</span>
          {countInCart > 0 && (
            <span className="ml-1 bg-white/20 text-white rounded-full px-1 text-[10px]">
              {countInCart}
            </span>
          )}
        </button>
      </div>

    </div>
  );
}
