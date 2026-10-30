import React, { useState } from 'react';
import { OrderItem, OrderType } from '../types/pos';
import { formatRupiah } from '../utils/format';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  Percent, 
  Check, 
  MessageSquare, 
  ArrowRight, 
  BookmarkPlus, 
  Users, 
  Package 
} from 'lucide-react';

interface OrderCartProps {
  items: OrderItem[];
  orderType: OrderType;
  tableNumber: string;
  customerName: string;
  discount: number;
  taxRate: number;
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onUpdateNotes: (cartItemId: string, notes: string) => void;
  onClearCart: () => void;
  onSetOrderType: (type: OrderType) => void;
  onSetTableNumber: (table: string) => void;
  onSetCustomerName: (name: string) => void;
  onSetDiscount: (discount: number) => void;
  onSetTaxRate: (rate: number) => void;
  onHoldOrder: () => void;
  onProceedToPayment: () => void;
}

export const OrderCart: React.FC<OrderCartProps> = ({
  items,
  orderType,
  tableNumber,
  customerName,
  discount,
  taxRate,
  onUpdateQty,
  onRemoveItem,
  onUpdateNotes,
  onClearCart,
  onSetOrderType,
  onSetTableNumber,
  onSetCustomerName,
  onSetDiscount,
  onSetTaxRate,
  onHoldOrder,
  onProceedToPayment,
}) => {
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [customDiscount, setCustomDiscount] = useState('');

  // Quick preset tables for Sundanese restaurant
  const tablePresets = [
    'Meja 1', 'Meja 2', 'Meja 3', 'Meja 4', 'Meja 5',
    'Meja 6', 'Meja 7', 'Meja 8', 'Lesehan 1', 'Lesehan 2',
    'VIP 1', 'Bungkus'
  ];

  // Quick note tags
  const noteTags = [
    'Sambal Pisah',
    'Pedas Nampol',
    'Pedas Sedang',
    'Bakar Kering',
    'Goreng Garing',
    'Tanpa Es',
    'Es Sedikit',
    'Nasi Tambah'
  ];

  // Financial calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = Math.round(discountedSubtotal * taxRate);
  const total = discountedSubtotal + tax;

  const handleStartNote = (item: OrderItem) => {
    setEditingNoteId(item.id);
    setNoteInput(item.notes || '');
  };

  const handleSaveNote = (cartItemId: string) => {
    onUpdateNotes(cartItemId, noteInput.trim());
    setEditingNoteId(null);
  };

  const handleApplyPresetDiscountPercent = (percent: number) => {
    const disc = Math.round((subtotal * percent) / 100);
    onSetDiscount(disc);
    setShowDiscountModal(false);
  };

  const handleApplyCustomDiscount = () => {
    const val = parseInt(customDiscount.replace(/\D/g, ''), 10) || 0;
    onSetDiscount(val);
    setShowDiscountModal(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
      {/* Top Configuration: Order Type & Table */}
      <div className="space-y-3 pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl border border-slate-700/60 w-full">
            <button
              onClick={() => {
                onSetOrderType('dine_in');
                if (tableNumber === 'Bungkus') onSetTableNumber('Meja 1');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                orderType === 'dine_in'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Makan di Tempat</span>
            </button>

            <button
              onClick={() => {
                onSetOrderType('takeaway');
                onSetTableNumber('Bungkus');
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                orderType === 'takeaway'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Bungkus / Bawa Pulang</span>
            </button>
          </div>
        </div>

        {/* Table Selector & Customer Name */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Nomor Meja
            </label>
            <select
              value={tableNumber}
              onChange={(e) => onSetTableNumber(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-xs font-medium text-slate-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            >
              {tablePresets.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-slate-100">
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Nama Pelanggan (Opsional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => onSetCustomerName(e.target.value)}
              placeholder="Contoh: Pak Budi"
              className="w-full bg-slate-800 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500">
            <ShoppingBag className="w-10 h-10 mb-2 text-slate-600 stroke-[1.5]" />
            <p className="font-semibold text-sm text-slate-300">Pesanan Masih Kosong</p>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Klik menu masakan Sunda di sebelah kiri untuk menambahkan pesanan
            </p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 text-xs text-slate-200 transition-all hover:border-slate-600"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <h4 className="font-bold text-slate-100 text-sm">{item.name}</h4>
                    <span className="font-mono tabular-nums font-bold text-amber-400">
                      {formatRupiah(item.price * item.qty)}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {formatRupiah(item.price)} × {item.qty}
                  </div>

                  {/* Notes badge or input */}
                  {editingNoteId === item.id ? (
                    <div className="mt-2 space-y-1.5 bg-slate-900/90 p-2 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Catatan khusus (misal: sambal pisah)"
                          className="flex-1 bg-slate-800 text-[11px] text-slate-100 border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-amber-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveNote(item.id)}
                          className="bg-amber-500 text-slate-950 font-bold text-[10px] px-2 py-1 rounded hover:bg-amber-400"
                        >
                          Simpan
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {noteTags.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setNoteInput(tag)}
                            className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700/60"
                          >
                            +{tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : item.notes ? (
                    <div
                      onClick={() => handleStartNote(item)}
                      className="mt-1 flex items-center gap-1 text-[11px] text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded cursor-pointer hover:bg-amber-500/20"
                    >
                      <MessageSquare className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="italic truncate">{item.notes}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleStartNote(item)}
                      className="mt-1 text-[10px] text-slate-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
                    >
                      <MessageSquare className="w-2.5 h-2.5" />
                      <span>+ Tambah catatan</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Quantity Stepper & Remove */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-700/40">
                <button
                  onClick={() => onRemoveItem(item.id)}
                  title="Hapus dari pesanan"
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-2 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                  <button
                    onClick={() => onUpdateQty(item.id, -1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="font-mono tabular-nums font-bold text-xs text-white min-w-[18px] text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.id, 1)}
                    className="w-5 h-5 rounded flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-slate-800 active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Financial Breakdown */}
      <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
        <div className="flex justify-between text-slate-400">
          <span>Subtotal ({items.reduce((s, i) => s + i.qty, 0)} item)</span>
          <span className="font-mono tabular-nums text-slate-200">{formatRupiah(subtotal)}</span>
        </div>

        {/* Discount Row */}
        <div className="flex justify-between items-center text-slate-400">
          <div className="flex items-center gap-1">
            <span>Diskon</span>
            <button
              onClick={() => setShowDiscountModal(true)}
              className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5 ml-1"
            >
              <Tag className="w-3 h-3" />
              <span>{discount > 0 ? formatRupiah(discount) : '+ Beri Diskon'}</span>
            </button>
          </div>
          <span className="font-mono tabular-nums text-emerald-400">
            {discount > 0 ? `-${formatRupiah(discount)}` : 'Rp 0'}
          </span>
        </div>

        {/* PB1 / Pajak Resto */}
        <div className="flex justify-between items-center text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>PB1 Restoran</span>
            <button
              onClick={() => onSetTaxRate(taxRate === 0 ? 0.1 : 0)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                taxRate > 0
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {taxRate > 0 ? '10% Aktif' : '0% Nonaktif'}
            </button>
          </div>
          <span className="font-mono tabular-nums text-slate-200">{formatRupiah(tax)}</span>
        </div>

        {/* Grand Total */}
        <div className="flex justify-between items-baseline pt-2 border-t border-slate-700/60">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Tagihan</span>
            <span className="block text-[10px] text-amber-400/80">Warung Nasi Ampera</span>
          </div>
          <span className="font-mono tabular-nums font-black text-xl text-amber-400">
            {formatRupiah(total)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={onHoldOrder}
              title="Simpan pesanan di daftar meja aktif (bayar nanti)"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl transition-all"
            >
              <BookmarkPlus className="w-4 h-4 text-amber-400" />
              <span>Simpan Meja</span>
            </button>
          )}

          {items.length > 0 && (
            <button
              onClick={onClearCart}
              title="Kosongkan keranjang pesanan"
              className="py-2.5 px-3 bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          disabled={items.length === 0}
          onClick={onProceedToPayment}
          className={`w-full py-3 px-4 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            items.length > 0
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-[0.99] shadow-amber-500/20'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/40'
          }`}
        >
          <span>Bayar Sekarang (F9)</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Discount modal */}
      {showDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-sm w-full shadow-2xl text-slate-100">
            <h3 className="font-bold text-base text-amber-400 flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Beri Diskon Pesanan
            </h3>
            <p className="text-xs text-slate-400 mt-1">Pilih potongan persen atau masukkan nominal rupiah</p>

            <div className="grid grid-cols-4 gap-2 mt-4">
              {[5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  onClick={() => handleApplyPresetDiscountPercent(pct)}
                  className="bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-bold py-2 rounded-lg border border-slate-700 transition-colors"
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div className="mt-3">
              <label className="text-xs text-slate-400 block mb-1">Nominal Diskon (Rp)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  placeholder="Contoh: 10000"
                  className="flex-1 bg-slate-800 border border-slate-700 text-sm px-3 py-1.5 rounded-lg text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={handleApplyCustomDiscount}
                  className="bg-amber-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs"
                >
                  Terapkan
                </button>
              </div>
            </div>

            <div className="flex justify-between gap-2 mt-5">
              <button
                onClick={() => {
                  onSetDiscount(0);
                  setShowDiscountModal(false);
                }}
                className="text-xs text-rose-400 hover:underline"
              >
                Hapus Diskon
              </button>
              <button
                onClick={() => setShowDiscountModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
