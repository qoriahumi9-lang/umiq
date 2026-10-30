import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { OrderItem, OrderType, PaymentMethod, Order } from '../types/pos';
import { formatRupiah, generateReceiptNumber } from '../utils/format';
import { 
  X, 
  Banknote, 
  QrCode, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  orderType: OrderType;
  tableNumber: string;
  customerName?: string;
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number;
  total: number;
  cashierName: string;
  onPaymentSuccess: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  items,
  orderType,
  tableNumber,
  customerName,
  subtotal,
  discount,
  tax,
  taxRate,
  total,
  cashierName,
  onPaymentSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashGiven, setCashGiven] = useState<number>(total);
  const [customCashInput, setCustomCashInput] = useState<string>(total.toString());
  const [cardRef, setCardRef] = useState<string>('');
  const [copiedVA, setCopiedVA] = useState(false);

  if (!isOpen) return null;

  const change = Math.max(0, cashGiven - total);
  const isCashSufficient = paymentMethod !== 'cash' || cashGiven >= total;
  const shortage = total - cashGiven;

  const handleQuickCash = (amount: number) => {
    setCashGiven(amount);
    setCustomCashInput(amount.toString());
  };

  const handleAddCash = (increment: number) => {
    const newVal = cashGiven + increment;
    setCashGiven(newVal);
    setCustomCashInput(newVal.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const num = parseInt(raw, 10) || 0;
    setCustomCashInput(raw);
    setCashGiven(num);
  };

  const handleCompletePayment = () => {
    if (!isCashSufficient) return;

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // fallback
    }

    const newOrder: Order = {
      id: 'TRX-' + Date.now(),
      receiptNumber: generateReceiptNumber(),
      tableNumber,
      customerName,
      orderType,
      items,
      subtotal,
      discount,
      tax,
      taxRate,
      total,
      paymentMethod,
      amountPaid: paymentMethod === 'cash' ? cashGiven : total,
      change: paymentMethod === 'cash' ? change : 0,
      status: 'completed',
      cashierName,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      notes: paymentMethod !== 'cash' && cardRef ? `Ref: ${cardRef}` : undefined,
    };

    onPaymentSuccess(newOrder);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-100 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-800/40">
          <div>
            <h2 className="font-extrabold text-lg text-amber-400">Pembayaran Kasir</h2>
            <p className="text-xs text-slate-400">
              {tableNumber} · {orderType === 'dine_in' ? 'Makan di Tempat' : 'Bungkus'} · {items.length} Menu
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total to pay highlighted banner */}
        <div className="px-5 py-4 bg-amber-500/10 border-b border-amber-500/20 flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-amber-300/80 tracking-wider">
              Total Tagihan
            </span>
            <div className="font-mono tabular-nums font-black text-2xl sm:text-3xl text-amber-400">
              {formatRupiah(total)}
            </div>
          </div>
          <div className="text-right text-xs text-slate-400">
            <div>Subtotal: {formatRupiah(subtotal)}</div>
            {discount > 0 && <div className="text-emerald-400">Diskon: -{formatRupiah(discount)}</div>}
            {tax > 0 && <div>PB1 (10%): {formatRupiah(tax)}</div>}
          </div>
        </div>

        {/* Payment Methods tabs */}
        <div className="p-5 space-y-4">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Metode Pembayaran
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'cash', label: 'Tunai', icon: <Banknote className="w-4 h-4" /> },
              { id: 'qris', label: 'QRIS', icon: <QrCode className="w-4 h-4" /> },
              { id: 'transfer', label: 'Transfer', icon: <Building2 className="w-4 h-4" /> },
              { id: 'card', label: 'Debit/EDC', icon: <CreditCard className="w-4 h-4" /> },
            ].map((method) => {
              const active = paymentMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => {
                    setPaymentMethod(method.id as PaymentMethod);
                    if (method.id === 'cash') {
                      setCashGiven(total);
                      setCustomCashInput(total.toString());
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs font-bold border transition-all ${
                    active
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/10'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {method.icon}
                  <span>{method.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Tunai (Cash) */}
          {paymentMethod === 'cash' && (
            <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Uang Tunai Diterima (Rp)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={customCashInput ? parseInt(customCashInput, 10).toLocaleString('id-ID') : ''}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 font-mono tabular-nums text-lg font-bold text-white focus:outline-none focus:border-amber-500"
                    placeholder="0"
                    autoFocus
                  />
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-slate-400">Pilihan Cepat Uang Pas & Pecahan:</span>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  <button
                    onClick={() => handleQuickCash(total)}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg py-1.5 text-xs font-bold transition-all"
                  >
                    Uang Pas
                  </button>
                  <button
                    onClick={() => handleQuickCash(50000)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg py-1.5 text-xs font-mono font-medium"
                  >
                    50.000
                  </button>
                  <button
                    onClick={() => handleQuickCash(100000)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg py-1.5 text-xs font-mono font-medium"
                  >
                    100.000
                  </button>
                  <button
                    onClick={() => handleQuickCash(200000)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg py-1.5 text-xs font-mono font-medium"
                  >
                    200.000
                  </button>
                  <button
                    onClick={() => handleAddCash(10000)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg py-1.5 text-xs font-mono"
                  >
                    +10.000
                  </button>
                  <button
                    onClick={() => handleAddCash(20000)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg py-1.5 text-xs font-mono"
                  >
                    +20.000
                  </button>
                  <button
                    onClick={() => handleAddCash(50000)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg py-1.5 text-xs font-mono"
                  >
                    +50.000
                  </button>
                  <button
                    onClick={() => handleAddCash(100000)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg py-1.5 text-xs font-mono"
                  >
                    +100.000
                  </button>
                </div>
              </div>

              {/* Kembalian / Status */}
              <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">
                  {cashGiven >= total ? 'Kembalian:' : 'Uang Kurang:'}
                </span>
                <span
                  className={`font-mono tabular-nums font-black text-xl ${
                    cashGiven >= total ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {cashGiven >= total ? formatRupiah(change) : `-${formatRupiah(shortage)}`}
                </span>
              </div>
            </div>
          )}

          {/* Tab 2: QRIS */}
          {paymentMethod === 'qris' && (
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-col items-center text-center space-y-3">
              <div className="bg-white p-3 rounded-xl shadow-lg inline-block">
                {/* Simulated QR Code with high resolution SVG styling */}
                <svg className="w-40 h-40 text-slate-950" viewBox="0 0 100 100" fill="currentColor">
                  {/* Position markers */}
                  <rect x="5" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="11" y="11" width="13" height="13" />
                  <rect x="70" y="5" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="76" y="11" width="13" height="13" />
                  <rect x="5" y="70" width="25" height="25" fill="none" stroke="currentColor" strokeWidth="4" />
                  <rect x="11" y="76" width="13" height="13" />

                  {/* QR Pattern dots */}
                  <rect x="35" y="8" width="6" height="6" />
                  <rect x="45" y="8" width="6" height="6" />
                  <rect x="55" y="12" width="6" height="6" />
                  <rect x="35" y="22" width="6" height="6" />
                  <rect x="48" y="22" width="6" height="6" />
                  <rect x="10" y="40" width="6" height="6" />
                  <rect x="22" y="40" width="6" height="6" />
                  <rect x="35" y="40" width="8" height="8" />
                  <rect x="50" y="40" width="6" height="6" />
                  <rect x="65" y="40" width="6" height="6" />
                  <rect x="80" y="40" width="6" height="6" />
                  <rect x="40" y="55" width="6" height="6" />
                  <rect x="55" y="55" width="8" height="8" />
                  <rect x="70" y="55" width="6" height="6" />
                  <rect x="85" y="55" width="6" height="6" />
                  <rect x="40" y="72" width="6" height="6" />
                  <rect x="52" y="72" width="6" height="6" />
                  <rect x="68" y="72" width="8" height="8" />
                  <rect x="82" y="80" width="6" height="6" />
                  <rect x="40" y="85" width="6" height="6" />
                  <rect x="55" y="85" width="6" height="6" />
                </svg>
              </div>

              <div>
                <p className="font-extrabold text-sm text-slate-100">WARUNG NASI AMPERA</p>
                <p className="text-xs text-slate-400">NMID: ID102938472910 · A.N. AMPERA SUNDA JUARA</p>
                <p className="text-[11px] text-amber-300 font-mono mt-1">
                  Mendukung BCA, Mandiri, BRI, BNI, GoPay, OVO, ShopeePay & Dana
                </p>
              </div>
            </div>
          )}

          {/* Tab 3: Transfer Bank */}
          {paymentMethod === 'transfer' && (
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">BCA Virtual Account</span>
                  <span className="font-mono tabular-nums font-bold text-amber-400 text-base">
                    88029 0812 9948 21
                  </span>
                  <span className="text-[10px] text-slate-400 block">a.n. Warung Nasi Ampera</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText('880290812994821');
                    setCopiedVA(true);
                    setTimeout(() => setCopiedVA(false), 2000);
                  }}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs flex items-center gap-1 border border-slate-700"
                >
                  {copiedVA ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedVA ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Nomor Referensi Transfer / Nama Pengirim
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="Contoh: REF-BCA-9821 atau Bpk. Hendi"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          {/* Tab 4: Kartu Debit / EDC */}
          {paymentMethod === 'card' && (
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
              <div className="text-xs text-slate-300">
                Gesek atau tap kartu pada mesin EDC Kasir, lalu catat nomor otorisasi/approval code.
              </div>
              <div>
                <label className="block text-xs text-slate-300 font-semibold mb-1">
                  Kode Otorisasi EDC / 4 Digit Terakhir Kartu
                </label>
                <input
                  type="text"
                  value={cardRef}
                  onChange={(e) => setCardRef(e.target.value)}
                  placeholder="Contoh: APPR-4891 / Kartu Mandiri 8812"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer & Submit */}
        <div className="p-5 border-t border-slate-800 bg-slate-900 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Kembali
          </button>

          <button
            disabled={!isCashSufficient}
            onClick={handleCompletePayment}
            className={`flex-1 py-3 px-5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
              isCashSufficient
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-[0.99] shadow-amber-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            <span>Selesaikan & Cetak Struk</span>
          </button>
        </div>
      </div>
    </div>
  );
};
