import React, { useState, useMemo } from 'react';
import { MenuItem, MenuCategory, OrderItem } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { 
  Search, 
  X, 
  Plus, 
  Flame, 
  Sparkles, 
  Check, 
  Coffee, 
  Soup, 
  Salad, 
  Utensils 
} from 'lucide-react';

interface MenuGridProps {
  menuItems: MenuItem[];
  cartItems: OrderItem[];
  onAddToCart: (item: MenuItem) => void;
}

export const MenuGrid: React.FC<MenuGridProps> = ({
  menuItems,
  cartItems,
  onAddToCart,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'semua'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  // Map of item quantity in cart for instant visual feedback
  const cartQtyMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of cartItems) {
      map.set(item.menuItemId, (map.get(item.menuItemId) || 0) + item.qty);
    }
    return map;
  }, [cartItems]);

  const categories: { id: MenuCategory | 'semua'; label: string; icon: React.ReactNode }[] = [
    { id: 'semua', label: 'Semua Menu', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'utama', label: 'Menu Utama', icon: <Flame className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'sayur', label: 'Aneka Sayur', icon: <Soup className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'sambal', label: 'Sambal & Lalapan', icon: <Salad className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'minuman', label: 'Minuman Segar', icon: <Coffee className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'paket', label: 'Paket Juara', icon: <Sparkles className="w-3.5 h-3.5 text-amber-300" /> },
  ];

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategory === 'semua' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 p-3 sm:p-4 shadow-sm">
      {/* Category selector & Search Bar */}
      <div className="flex flex-col gap-3 pb-3 border-b border-slate-800">
        {/* Search input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari menu (Nasi Liwet, Ayam Bakar, Sayur Asem, Es Teh...)"
            className="w-full bg-slate-800/90 border border-slate-700/80 rounded-xl pl-9 pr-9 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Menu Items */}
      <div className="flex-1 overflow-y-auto pt-3 pr-1">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400">
            <Utensils className="w-10 h-10 mb-2 text-slate-600 stroke-[1.5]" />
            <p className="font-semibold text-sm text-slate-300">Tidak ada menu yang cocok</p>
            <p className="text-xs text-slate-500 mt-1">Coba kata kunci lain atau pilih kategori Semua</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3">
            {filteredItems.map((item) => {
              const inCartQty = cartQtyMap.get(item.id) || 0;
              const isAvailable = item.isAvailable;

              return (
                <div
                  key={item.id}
                  onClick={() => isAvailable && onAddToCart(item)}
                  className={`group relative flex flex-col justify-between text-left p-3 rounded-xl border transition-all select-none ${
                    !isAvailable
                      ? 'bg-slate-800/40 border-slate-800/50 opacity-60 cursor-not-allowed'
                      : inCartQty > 0
                      ? 'bg-slate-800/90 border-amber-500/60 shadow-sm shadow-amber-500/5 cursor-pointer ring-1 ring-amber-500/40'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-slate-600 cursor-pointer active:scale-[0.98]'
                  }`}
                >
                  {/* Top tags: Favorite star & In-cart badge */}
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {item.category === 'utama'
                        ? 'Utama'
                        : item.category === 'sayur'
                        ? 'Sayur'
                        : item.category === 'sambal'
                        ? 'Sambal'
                        : item.category === 'minuman'
                        ? 'Minuman'
                        : 'Paket'}
                    </span>

                    {inCartQty > 0 ? (
                      <span className="bg-amber-500 text-slate-950 font-extrabold text-[11px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                        {inCartQty}x
                      </span>
                    ) : item.isFavorite ? (
                      <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                        <Sparkles className="w-3 h-3" />
                        Juara
                      </span>
                    ) : null}
                  </div>

                  {/* Menu Name */}
                  <div className="mb-2">
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    {item.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Add Button */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-700/40 mt-auto">
                    <span className="font-mono tabular-nums font-bold text-sm text-amber-400">
                      {formatRupiah(item.price)}
                    </span>

                    {isAvailable ? (
                      <span className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 flex items-center justify-center transition-all">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 font-semibold">
                        Habis
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
