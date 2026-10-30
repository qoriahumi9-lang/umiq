import React from 'react';
import { Order } from '../types/pos';
import { formatRupiah, formatDateTime } from '../utils/format';
import { 
  Users, 
  Clock, 
  ShoppingBag, 
  ArrowRight, 
  Trash2, 
  Plus, 
  UtensilsCrossed, 
  CheckCircle2, 
  Package 
} from 'lucide-react';

interface ActiveOrdersViewProps {
  activeOrders: Order[];
  onResumeOrder: (order: Order) => void;
  onDirectPay: (order: Order) => void;
  onCancelOrder: (orderId: string) => void;
  onStartNewOrderForTable: (tableNumber: string) => void;
}

export const ActiveOrdersView: React.FC<ActiveOrdersViewProps> = ({
  activeOrders,
  onResumeOrder,
  onDirectPay,
  onCancelOrder,
  onStartNewOrderForTable,
}) => {
  // Predefined tables in Warung Nasi Ampera
  const allTables = [
    'Meja 1', 'Meja 2', 'Meja 3', 'Meja 4', 'Meja 5',
    'Meja 6', 'Meja 7', 'Meja 8', 'Lesehan 1', 'Lesehan 2',
    'VIP 1', 'Bungkus'
  ];

  // Map of active order by table
  const occupiedTableMap = new Map<string, Order>();
  for (const o of activeOrders) {
    occupiedTableMap.set(o.tableNumber, o);
  }

  const occupiedCount = activeOrders.length;
  const totalTables = allTables.length;
  const totalActiveRevenue = activeOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Meja Terisi
            </span>
            <div className="font-mono tabular-nums text-2xl font-black text-amber-400 mt-0.5">
              {occupiedCount} <span className="text-sm font-normal text-slate-500">/ {totalTables} Meja</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Estimasi Tagihan Aktif
            </span>
            <div className="font-mono tabular-nums text-2xl font-black text-emerald-400 mt-0.5">
              {formatRupiah(totalActiveRevenue)}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              Meja Tersedia (Kosong)
            </span>
            <div className="font-mono tabular-nums text-2xl font-black text-sky-400 mt-0.5">
              {totalTables - occupiedCount} Meja
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grid of All Tables & Occupancy */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-amber-400" />
            Denah & Daftar Meja Warung Nasi Ampera
          </h2>
          <span className="text-xs text-slate-400">
            Klik meja kosong untuk membuat pesanan baru, atau pilih meja aktif untuk tambah menu / bayar
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {allTables.map((tableName) => {
            const activeOrder = occupiedTableMap.get(tableName);
            const isOccupied = !!activeOrder;

            if (isOccupied && activeOrder) {
              return (
                <div
                  key={tableName}
                  className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-4 shadow-lg flex flex-col justify-between space-y-3 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-3 py-0.5 rounded-bl-lg">
                    Terisi · Makan
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-black text-lg text-amber-400">{tableName}</h3>
                      {activeOrder.customerName && (
                        <span className="text-xs text-slate-300 font-medium truncate">
                          ({activeOrder.customerName})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{formatDateTime(activeOrder.createdAt)}</span>
                    </div>
                  </div>

                  {/* Summary of ordered items */}
                  <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 text-xs space-y-1">
                    <div className="text-slate-400 font-medium">
                      {activeOrder.items.reduce((s, i) => s + i.qty, 0)} Porsi Dipesan:
                    </div>
                    <div className="text-slate-200 line-clamp-2 leading-relaxed">
                      {activeOrder.items.map((i) => `${i.name} (${i.qty}x)`).join(', ')}
                    </div>
                  </div>

                  {/* Bill Amount */}
                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-800">
                    <span className="text-xs text-slate-400 font-medium">Total Tagihan:</span>
                    <span className="font-mono tabular-nums font-black text-lg text-amber-400">
                      {formatRupiah(activeOrder.total)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onResumeOrder(activeOrder)}
                      className="py-2 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Ubah Menu</span>
                    </button>
                    <button
                      onClick={() => onDirectPay(activeOrder)}
                      className="py-2 px-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors shadow-sm"
                    >
                      <span>Bayar (F9)</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            // Empty table
            return (
              <div
                key={tableName}
                onClick={() => onStartNewOrderForTable(tableName)}
                className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all group min-h-[190px]"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 group-hover:bg-amber-500/10 text-slate-400 group-hover:text-amber-400 flex items-center justify-center mb-2.5 transition-colors">
                  {tableName === 'Bungkus' ? <Package className="w-6 h-6" /> : <Users className="w-6 h-6" />}
                </div>
                <h3 className="font-extrabold text-base text-slate-200 group-hover:text-white">
                  {tableName}
                </h3>
                <span className="text-xs text-emerald-400 font-semibold mt-0.5">
                  Tersedia / Kosong
                </span>
                <button className="mt-3 text-xs text-amber-400/90 font-bold flex items-center gap-1 bg-slate-800/80 group-hover:bg-amber-500 group-hover:text-slate-950 px-3 py-1.5 rounded-lg transition-all">
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Buka Pesanan</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
