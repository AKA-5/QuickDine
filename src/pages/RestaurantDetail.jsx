import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFirestore } from '../hooks/useFirestore';
import { useCart } from '../hooks/useCart';
import { Navbar } from '../components/layout/Navbar';
import { MenuItemCard } from '../components/restaurant/MenuItemCard';
import { getUnsplashUrl } from '../utils/imageHelper';
import { MOCK_RESTAURANTS, MOCK_MENUS } from '../services/mockData';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getRestaurant, getMenu } = useFirestore();
  const { cart, addToCart, removeFromCart, cartSubtotal, cartTotalItems } = useCart();

  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch restaurant and menu items
  useEffect(() => {
    async function loadRestaurantAndMenu() {
      setLoading(true);
      try {
        // Fetch restaurant details
        let restData = await getRestaurant(id);
        if (!restData) {
          restData = MOCK_RESTAURANTS.find(r => r.id === id);
        }
        setRestaurant(restData);

        // Fetch menu details
        if (restData) {
          let menuItems = await getMenu(id);
          if (!menuItems || menuItems.length === 0) {
            menuItems = MOCK_MENUS[id] || [];
          }
          setMenu(menuItems);
        }
      } catch (err) {
        console.error('Failed to load restaurant/menu:', err);
        // Fallback
        const fallbackRest = MOCK_RESTAURANTS.find(r => r.id === id);
        setRestaurant(fallbackRest);
        setMenu(MOCK_MENUS[id] || []);
      } finally {
        setLoading(false);
      }
    }

    loadRestaurantAndMenu();
  }, [id, getRestaurant, getMenu]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-border border-t-accent"></div>
          <p className="text-sm font-medium text-text-secondary uppercase tracking-widest">Loading Menu...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-bg text-text-primary flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center space-y-4">
          <span className="material-symbols-outlined text-4xl text-text-secondary select-none">error</span>
          <h2 className="text-2xl font-serif">Restaurant Not Found</h2>
          <Link to="/home" className="text-accent underline text-sm">Return Home</Link>
        </main>
      </div>
    );
  }

  // Group menu by category
  const categories = ['Starter', 'Main', 'Dessert', 'Drinks'];
  const groupedMenu = menu.reduce((groups, item) => {
    const category = item.category || 'Main';
    if (!groups[category]) groups[category] = [];
    groups[category].push(item);
    return groups;
  }, {});

  const handleAdd = (item) => {
    addToCart(restaurant.id, item);
  };

  const handleRemove = (item) => {
    removeFromCart(item.id);
  };

  const getCountInCart = (itemId) => {
    if (cart.restaurantId !== restaurant.id) return 0;
    const cartItem = cart.items.find(i => i.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary flex flex-col pb-32">
      <Navbar />

      {/* Hero Banner Header */}
      <div className="relative h-64 md:h-80 w-full overflow-hidden bg-black">
        <img
          src={getUnsplashUrl(1200, 400, restaurant.cuisine + ' restaurant')}
          alt={`${restaurant.name} banner`}
          className="object-cover w-full h-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 md:pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 text-white text-left">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-widest font-semibold text-accent-light bg-accent/25 border border-accent/20 px-2 py-0.5 rounded-[4px] select-none">
              {restaurant.cuisine}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif font-normal leading-tight text-white">
              {restaurant.name}
            </h1>
            <p className="text-xs text-white/80 flex items-center">
              <span className="material-symbols-outlined text-xs mr-1 text-accent select-none">location_on</span>
              <span>{restaurant.location}</span>
            </p>
          </div>

          <div className="flex items-center space-x-4 text-sm font-medium">
            <div className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-warning select-none">star</span>
              <span className="font-bold">{restaurant.rating.toFixed(1)}</span>
              <span className="text-white/60">Rating</span>
            </div>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center space-x-1">
              <span className="material-symbols-outlined text-accent-light select-none">schedule</span>
              <span>{restaurant.avgWaitMinutes} mins</span>
              <span className="text-white/60">Avg Wait</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 flex flex-col md:flex-row gap-8">
        
        {/* Category sticky nav */}
        <aside className="w-full md:w-48 shrink-0 md:sticky md:top-24 h-fit text-left">
          <h3 className="text-xs uppercase tracking-widest font-bold text-text-secondary border-b border-border pb-2 mb-4">
            Menu Sections
          </h3>
          <div className="flex flex-row md:flex-col overflow-x-auto gap-2 pb-2 md:pb-0">
            {categories.map(cat => {
              const count = groupedMenu[cat]?.length || 0;
              if (count === 0) return null;
              return (
                <a
                  key={cat}
                  href={`#${cat.toLowerCase()}`}
                  className="px-3 py-1.5 md:py-2 md:px-0 text-sm font-semibold uppercase tracking-wider text-text-secondary hover:text-accent transition-colors shrink-0"
                >
                  {cat} ({count})
                </a>
              );
            })}
          </div>
        </aside>

        {/* Menu Items Container */}
        <div className="flex-1 space-y-12">
          {categories.map(cat => {
            const items = groupedMenu[cat] || [];
            if (items.length === 0) return null;
            return (
              <section key={cat} id={cat.toLowerCase()} className="space-y-6 scroll-mt-24">
                <h2 className="text-2xl font-serif text-text-primary text-left border-b border-border pb-2">
                  {cat}s
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {items.map(item => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      onAdd={handleAdd}
                      onRemove={handleRemove}
                      countInCart={getCountInCart(item.id)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Sticky Bottom View Cart Bar */}
      {cartTotalItems > 0 && cart.restaurantId === restaurant.id && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border shadow-2xl z-40 py-4 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs uppercase tracking-widest font-semibold text-text-secondary">
                Pre-ordering from {restaurant.name}
              </p>
              <p className="text-lg font-bold text-text-primary font-serif">
                {cartTotalItems} {cartTotalItems === 1 ? 'item' : 'items'} • PKR {cartSubtotal.toLocaleString()}
              </p>
            </div>
            
            <button
              onClick={() => navigate('/cart')}
              className="bg-accent text-white rounded-[6px] px-8 py-3 text-sm font-semibold hover:bg-[#B03D24] transition-colors flex items-center space-x-2"
            >
              <span>View Cart</span>
              <span className="material-symbols-outlined text-lg select-none">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
