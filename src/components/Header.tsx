import React, { useState, useEffect } from 'react';
import { 
  Store, 
  UtensilsCrossed, 
  ReceiptText, 
  BarChart3, 
  Settings2, 
  Image as ImageIcon,
  Clock, 
  UserCircle2,
  Table as TableIcon
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'pos' | 'active_orders' | 'reports' | 'menu';
  onTabChange: (tab: 'pos' | 'active_orders' | 'reports' | 'menu') => void;
  activeOrdersCount: number;
  cashierName: string;
  onChangeCashier: (name: string) => void;
  onOpenAuthenticMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  activeOrdersCount,
  cashierName,
  onChangeCashier,
  onOpenAuthenticMenu,
}) => {
  const [time, setTime] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isEditingCashier, setIsEditingCashier] = useState(false);
  const [tempCashier, setTempCashier] = useState(cashierName);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveCashier = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempCashier.trim()) {
      onChangeCashier(tempCashier.trim());
      setIsEditingCashier(false);
    }
  };

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 select-none shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-amber-400">
                Warung Nasi Ampera
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                POS Kasir
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Masakan Sunda, Rasa Juara · <span className="text-amber-200/70 italic">Enaknya Bikin Kangen</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 overflow-x-auto">
          <button
            onClick={() => onTabChange('pos')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'pos'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <UtensilsCrossed className="w-3.5 h-3.5" />
            <span>Kasir & Menu</span>
          </button>

          <button
            onClick={() => onTabChange('active_orders')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap relative ${
              currentTab === 'active_orders'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Pesanan Meja</span>
            {activeOrdersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                currentTab === 'active_orders'
                  ? 'bg-slate-950 text-amber-400'
                  : 'bg-amber-500 text-slate-950'
              }`}>
                {activeOrdersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('reports')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'reports'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Laporan & Rekap</span>
          </button>

          <button
            onClick={() => onTabChange('menu')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              currentTab === 'menu'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Kelola Menu</span>
          </button>
        </nav>

        {/* Right Info: Time, Authentic Menu preview button & Cashier */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenAuthenticMenu}
            title="Lihat foto papan menu asli Warung Nasi Ampera"
            className="flex items-center gap-1.5 text-xs text-amber-300/90 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1.5 rounded-lg border border-amber-500/30 transition-all font-medium"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Plang Menu Asli</span>
          </button>

          <div className="hidden lg:flex flex-col items-end text-xs font-mono tabular-nums text-slate-300 border-l border-slate-800 pl-3">
            <span className="font-semibold text-amber-300 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              {time}
            </span>
            <span className="text-[11px] text-slate-400">{dateStr}</span>
          </div>

          {/* Cashier Badge */}
          <div className="relative">
            {isEditingCashier ? (
              <form onSubmit={handleSaveCashier} className="flex items-center gap-1">
                <input
                  type="text"
                  value={tempCashier}
                  onChange={(e) => setTempCashier(e.target.value)}
                  className="bg-slate-800 border border-amber-500 text-xs px-2 py-1 rounded text-white focus:outline-none w-28"
                  placeholder="Nama Kasir"
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-amber-500 text-slate-950 font-bold text-xs px-2 py-1 rounded hover:bg-amber-400"
                >
                  OK
                </button>
              </form>
            ) : (
              <button
                onClick={() => {
                  setTempCashier(cashierName);
                  setIsEditingCashier(true);
                }}
                title="Klik untuk ubah nama kasir"
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-700 text-slate-200 transition-colors"
              >
                <UserCircle2 className="w-3.5 h-3.5 text-amber-400" />
                <span className="truncate max-w-[90px] font-medium">{cashierName}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
