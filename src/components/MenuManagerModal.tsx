import React, { useState } from 'react';
import { MenuItem, MenuCategory } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { 
  Plus, 
  RotateCcw, 
  Check, 
  X, 
  Trash2, 
  Edit2, 
  Search, 
  Sparkles,
  Utensils
} from 'lucide-react';

interface MenuManagerProps {
  menuItems: MenuItem[];
  onToggleAvailability: (itemId: string) => void;
  onUpdatePrice: (itemId: string, newPrice: number) => void;
  onAddItem: (item: Omit<MenuItem, 'id'>) => void;
  onDeleteItem: (itemId: string) => void;
  onResetToDefault: () => void;
}

export const MenuManager: React.FC<MenuManagerProps> = ({
  menuItems,
  onToggleAvailability,
  onUpdatePrice,
  onAddItem,
  onDeleteItem,
  onResetToDefault,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<MenuCategory | 'all'>('all');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New item form state
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCategory, setNewCategory] = useState<MenuCategory>('utama');
  const [newDesc, setNewDesc] = useState('');

  // Editing price state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editPriceInput, setEditPriceInput] = useState('');

  const filteredItems = menuItems.filter((item) => {
    const matchCat = selectedCat === 'all' || item.category === selectedCat;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleStartEditPrice = (item: MenuItem) => {
    setEditingItemId(item.id);
    setEditPriceInput(item.price.toString());
  };

  const handleSavePrice = (itemId: string) => {
    const val = parseInt(editPriceInput.replace(/\D/g, ''), 10);
    if (!isNaN(val) && val > 0) {
      onUpdatePrice(itemId, val);
    }
    setEditingItemId(null);
  };

  const handleSubmitNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const priceNum = parseInt(newPrice.replace(/\D/g, ''), 10) || 0;
    if (priceNum <= 0) return;

    onAddItem({
      name: newName.trim(),
      price: priceNum,
      category: newCategory,
      description: newDesc.trim() || undefined,
      isAvailable: true,
      isFavorite: false,
    });

    setNewName('');
    setNewPrice('');
    setNewDesc('');
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-5">
      {/* Top action toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari daftar menu..."
              className="w-full bg-slate-800 border border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-xl px-3 py-2 focus:outline-none"
          >
            <option value="all">Semua Kategori</option>
            <option value="utama">Menu Utama</option>
            <option value="sayur">Aneka Sayur</option>
            <option value="sambal">Sambal & Lalapan</option>
            <option value="minuman">Minuman</option>
            <option value="paket">Paket Juara</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Menu Baru</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Kembalikan semua menu ke daftar menu asli Warung Nasi Ampera?')) {
                onResetToDefault();
              }
            }}
            title="Reset daftar menu ke menu asli plang foto"
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Menu Asli</span>
          </button>
        </div>
      </div>

      {/* Add New Item Form Drawer/Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
                <Utensils className="w-4 h-4" />
                Tambah Menu Baru Warung Nasi Ampera
              </h3>
              <button
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitNewItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Menu</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Bebek Goreng Sambal Ijo"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Kategori</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as MenuCategory)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="utama">Menu Utama</option>
                    <option value="sayur">Aneka Sayur</option>
                    <option value="sambal">Sambal & Lalapan</option>
                    <option value="minuman">Minuman</option>
                    <option value="paket">Paket Juara</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Harga Jual (Rp)</label>
                  <input
                    type="number"
                    required
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="25000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Deskripsi Singkat (Opsional)</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Keterangan bumbu atau sajian..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-sm"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table of Menu Items */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="py-3 px-4">Nama Menu</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Harga</th>
                <th className="py-3 px-4 text-center">Status Stok</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span>{item.name}</span>
                      {item.isFavorite && (
                        <span className="text-[10px] text-amber-400 font-normal flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" />
                          Juara
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <span className="text-[11px] text-slate-400 font-normal block max-w-sm truncate">
                        {item.description}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {item.category === 'utama'
                        ? 'Menu Utama'
                        : item.category === 'sayur'
                        ? 'Aneka Sayur'
                        : item.category === 'sambal'
                        ? 'Sambal & Lalap'
                        : item.category === 'minuman'
                        ? 'Minuman'
                        : 'Paket'}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-400">
                    {editingItemId === item.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editPriceInput}
                          onChange={(e) => setEditPriceInput(e.target.value)}
                          className="w-24 bg-slate-800 border border-amber-500 rounded px-2 py-1 text-xs text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSavePrice(item.id)}
                          className="bg-amber-500 text-slate-950 p-1 rounded"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="text-slate-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{formatRupiah(item.price)}</span>
                        <button
                          onClick={() => handleStartEditPrice(item)}
                          title="Ubah harga menu"
                          className="text-slate-500 hover:text-amber-400"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onToggleAvailability(item.id)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                        item.isAvailable
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.isAvailable ? 'Tersedia' : 'Habis'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => {
                        if (confirm(`Hapus menu "${item.name}"?`)) {
                          onDeleteItem(item.id);
                        }
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
