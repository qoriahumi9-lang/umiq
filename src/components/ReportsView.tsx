import React, { useState, useMemo } from 'react';
import { Order } from '../types/pos';
import { formatRupiah, formatDateTime, exportOrdersToCSV } from '../utils/format';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Search, 
  Printer, 
  Receipt, 
  ArrowUpRight, 
  Calendar, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Building2,
  Trash2
} from 'lucide-react';

interface ReportsViewProps {
  orders: Order[];
  onViewReceipt: (order: Order) => void;
  onCancelCompletedOrder: (orderId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  orders,
  onViewReceipt,
  onCancelCompletedOrder,
}) => {
  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'week' | 'all'>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Filter orders by time
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 7 * 86400000;

    return orders.filter((o) => {
      if (o.status !== 'completed') return false;
      const orderTime = new Date(o.createdAt).getTime();

      let matchesTime = true;
      if (timeFilter === 'today') matchesTime = orderTime >= todayStart;
      else if (timeFilter === 'yesterday') matchesTime = orderTime >= yesterdayStart && orderTime < todayStart;
      else if (timeFilter === 'week') matchesTime = orderTime >= weekStart;

      let matchesMethod = methodFilter === 'all' || o.paymentMethod === methodFilter;

      let matchesSearch =
        o.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (o.customerName && o.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesTime && matchesMethod && matchesSearch;
    });
  }, [orders, timeFilter, methodFilter, searchQuery]);

  // Aggregate statistics
  const totalRevenue = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.total, 0),
    [filteredOrders]
  );
  const totalTransactions = filteredOrders.length;
  const avgBasket = totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0;
  const totalItemsSold = useMemo(
    () => filteredOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0),
    [filteredOrders]
  );

  // Top selling menu items ranking
  const topSellingItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const order of filteredOrders) {
      for (const item of order.items) {
        const existing = itemMap.get(item.name) || { name: item.name, qty: 0, revenue: 0 };
        existing.qty += item.qty;
        existing.revenue += item.price * item.qty;
        itemMap.set(item.name, existing);
      }
    }
    return Array.from(itemMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredOrders]);

  // Payment breakdown
  const paymentMethodStats = useMemo(() => {
    const stats = { cash: 0, qris: 0, transfer: 0, card: 0 };
    for (const order of filteredOrders) {
      if (order.paymentMethod in stats) {
        stats[order.paymentMethod as keyof typeof stats] += order.total;
      }
    }
    return stats;
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Top Controls: Filter & Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'today', label: 'Hari Ini' },
            { id: 'yesterday', label: 'Kemarin' },
            { id: 'week', label: '7 Hari Terakhir' },
            { id: 'all', label: 'Semua Data' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTimeFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                timeFilter === tab.id
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => exportOrdersToCSV(filteredOrders)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-bold transition-all"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Ekspor CSV / Excel</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Total Omzet Penjualan
          </span>
          <div className="font-mono tabular-nums text-xl sm:text-2xl font-black text-amber-400 mt-1">
            {formatRupiah(totalRevenue)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Penjualan bersih</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Jumlah Transaksi
          </span>
          <div className="font-mono tabular-nums text-xl sm:text-2xl font-black text-sky-400 mt-1">
            {totalTransactions} <span className="text-xs font-normal text-slate-400">struk</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Transaksi lunas</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Rata-rata Transaksi
          </span>
          <div className="font-mono tabular-nums text-xl sm:text-2xl font-black text-emerald-400 mt-1">
            {formatRupiah(avgBasket)}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Basket size per meja</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
            Total Porsi Terjual
          </span>
          <div className="font-mono tabular-nums text-xl sm:text-2xl font-black text-indigo-400 mt-1">
            {totalItemsSold} <span className="text-xs font-normal text-slate-400">porsi</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Makanan & minuman</p>
        </div>
      </div>

      {/* Middle Row: Top Selling Items & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top 5 Best Sellers */}
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            5 Menu Paling Laris (Top Sellers)
          </h3>

          {topSellingItems.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">Belum ada data penjualan pada periode ini</p>
          ) : (
            <div className="space-y-3">
              {topSellingItems.map((item, index) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-200">
                      {index + 1}. {item.name}
                    </span>
                    <span className="font-mono tabular-nums font-bold text-amber-400">
                      {item.qty} porsi · {formatRupiah(item.revenue)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (item.qty / (topSellingItems[0]?.qty || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Methods Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-2xl">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Distribusi Metode Pembayaran
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Banknote className="w-3.5 h-3.5 text-amber-400" />
                <span>Tunai (Cash)</span>
              </div>
              <div className="font-mono tabular-nums font-bold text-base text-slate-100 mt-1">
                {formatRupiah(paymentMethodStats.cash)}
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <QrCode className="w-3.5 h-3.5 text-sky-400" />
                <span>QRIS</span>
              </div>
              <div className="font-mono tabular-nums font-bold text-base text-slate-100 mt-1">
                {formatRupiah(paymentMethodStats.qris)}
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Transfer Bank</span>
              </div>
              <div className="font-mono tabular-nums font-bold text-base text-slate-100 mt-1">
                {formatRupiah(paymentMethodStats.transfer)}
              </div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kartu Debit/EDC</span>
              </div>
              <div className="font-mono tabular-nums font-bold text-base text-slate-100 mt-1">
                {formatRupiah(paymentMethodStats.card)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-slate-100">Riwayat Transaksi Penjualan</h3>
            <span className="text-xs text-slate-400 font-mono">({filteredOrders.length} transaksi)</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari no struk / meja..."
                className="bg-slate-800 border border-slate-700 text-xs rounded-xl pl-8 pr-3 py-1.5 text-white focus:outline-none focus:border-amber-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-xs text-slate-300 rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">Semua Metode</option>
              <option value="cash">Tunai</option>
              <option value="qris">QRIS</option>
              <option value="transfer">Transfer</option>
              <option value="card">Debit</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-bold">
              <tr>
                <th className="py-3 px-4">No. Struk</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Meja / Tipe</th>
                <th className="py-3 px-4">Menu Dipesan</th>
                <th className="py-3 px-4">Metode</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Tidak ada transaksi yang sesuai
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                      {order.receiptNumber}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap text-slate-400">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-slate-200">{order.tableNumber}</span>
                      <span className="text-[11px] text-slate-400 block">
                        {order.orderType === 'dine_in' ? 'Dine In' : 'Takeaway'}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-300">
                      {order.items.map((i) => `${i.name} (x${i.qty})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 border border-slate-700 text-slate-300">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-amber-400 whitespace-nowrap">
                      {formatRupiah(order.total)}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewReceipt(order)}
                          className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 rounded-lg text-xs font-semibold transition-colors border border-amber-500/20"
                        >
                          Lihat Struk
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Batalkan transaksi ${order.receiptNumber}?`)) {
                              onCancelCompletedOrder(order.id);
                            }
                          }}
                          title="Batalkan transaksi"
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
