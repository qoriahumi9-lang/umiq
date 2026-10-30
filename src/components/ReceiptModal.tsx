import React, { useState } from 'react';
import { Order } from '../types/pos';
import { formatRupiah, formatDateTime } from '../utils/format';
import { 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  PlusCircle, 
  X,
  FileCheck
} from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onNewOrder: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  order,
  onClose,
  onNewOrder,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const generateReceiptPlainText = () => {
    const lines = [
      '================================',
      '      WARUNG NASI AMPERA        ',
      '   Masakan Sunda, Rasa Juara    ',
      '    "Enaknya Bikin Kangen..."   ',
      '================================',
      `No. Struk : ${order.receiptNumber}`,
      `Tanggal   : ${formatDateTime(order.createdAt)}`,
      `Kasir     : ${order.cashierName}`,
      `Pesanan   : ${order.tableNumber} (${order.orderType === 'dine_in' ? 'Makan di Tempat' : 'Bungkus'})`,
      order.customerName ? `Pelanggan : ${order.customerName}` : null,
      '--------------------------------',
      ...order.items.map(
        (i) => `${i.name}\n  ${i.qty} x ${formatRupiah(i.price)} = ${formatRupiah(i.price * i.qty)}${i.notes ? ` (${i.notes})` : ''}`
      ),
      '--------------------------------',
      `Subtotal  : ${formatRupiah(order.subtotal)}`,
      order.discount > 0 ? `Diskon    : -${formatRupiah(order.discount)}` : null,
      order.tax > 0 ? `PB1 (10%) : ${formatRupiah(order.tax)}` : null,
      `TOTAL     : ${formatRupiah(order.total)}`,
      '--------------------------------',
      `Bayar (${order.paymentMethod.toUpperCase()}): ${formatRupiah(order.amountPaid)}`,
      order.paymentMethod === 'cash' ? `Kembalian : ${formatRupiah(order.change)}` : null,
      '================================',
      '  Hatur Nuhun Kasumpinganana!   ',
      '  Semoga Berkah & Nikmat Selalu ',
      '================================',
    ].filter(Boolean);

    return lines.join('\n');
  };

  const handleCopyText = () => {
    const text = generateReceiptPlainText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(generateReceiptPlainText());
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <>
      {/* Invisible on screen, styled specifically for thermal printer when window.print() is called */}
      <div id="printable-receipt" className="hidden print-only font-mono text-black p-2">
        <div className="text-center font-bold text-sm">WARUNG NASI AMPERA</div>
        <div className="text-center text-xs">Masakan Sunda, Rasa Juara</div>
        <div className="text-center text-[10px] italic">Enaknya Bikin Kangen...</div>
        <div className="border-b border-black border-dashed my-2"></div>
        <div className="text-xs">
          <div>No: {order.receiptNumber}</div>
          <div>Tgl: {formatDateTime(order.createdAt)}</div>
          <div>Kasir: {order.cashierName}</div>
          <div>Tipe: {order.tableNumber} ({order.orderType === 'dine_in' ? 'Dine In' : 'Takeaway'})</div>
          {order.customerName && <div>Pelanggan: {order.customerName}</div>}
        </div>
        <div className="border-b border-black border-dashed my-2"></div>
        <div className="text-xs space-y-1">
          {order.items.map((i) => (
            <div key={i.id} className="flex justify-between">
              <div>
                <div>{i.name}</div>
                <div className="text-[10px] text-gray-700">
                  {i.qty} x {formatRupiah(i.price)}
                </div>
              </div>
              <div className="font-bold">{formatRupiah(i.price * i.qty)}</div>
            </div>
          ))}
        </div>
        <div className="border-b border-black border-dashed my-2"></div>
        <div className="text-xs space-y-0.5">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatRupiah(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between">
              <span>Diskon:</span>
              <span>-{formatRupiah(order.discount)}</span>
            </div>
          )}
          {order.tax > 0 && (
            <div className="flex justify-between">
              <span>PB1 (10%):</span>
              <span>{formatRupiah(order.tax)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm pt-1 border-t border-black">
            <span>TOTAL:</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span>Bayar ({order.paymentMethod.toUpperCase()}):</span>
            <span>{formatRupiah(order.amountPaid)}</span>
          </div>
          {order.paymentMethod === 'cash' && (
            <div className="flex justify-between font-bold">
              <span>Kembalian:</span>
              <span>{formatRupiah(order.change)}</span>
            </div>
          )}
        </div>
        <div className="border-b border-black border-dashed my-2"></div>
        <div className="text-center text-xs font-semibold">Hatur Nuhun Kasumpinganana!</div>
        <div className="text-center text-[10px]">Enaknya Bikin Kangen...</div>
      </div>

      {/* Screen Modal view */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 no-print overflow-y-auto">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full shadow-2xl flex flex-col overflow-hidden text-slate-100 my-auto">
          {/* Top Bar */}
          <div className="px-5 py-3.5 bg-slate-800/80 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-slate-100">Transaksi Berhasil</h3>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Thermal Receipt Visual Paper */}
          <div className="p-4 sm:p-5 flex justify-center bg-slate-950/60 overflow-y-auto max-h-[60vh]">
            <div className="w-full max-w-[340px] bg-amber-50/95 text-slate-900 p-5 rounded-lg shadow-xl font-mono text-xs border border-amber-200/60 selection:bg-amber-300">
              {/* Paper Header */}
              <div className="text-center space-y-0.5 pb-3 border-b border-dashed border-slate-400">
                <h2 className="font-extrabold text-base tracking-tight text-slate-950">
                  WARUNG NASI AMPERA
                </h2>
                <p className="text-[11px] font-semibold text-slate-700">Masakan Sunda, Rasa Juara</p>
                <p className="text-[10px] italic text-amber-800">"Enaknya Bikin Kangen..."</p>
              </div>

              {/* Metadata */}
              <div className="py-2.5 text-[11px] space-y-0.5 border-b border-dashed border-slate-400 text-slate-800">
                <div className="flex justify-between">
                  <span>No. Struk:</span>
                  <span className="font-bold">{order.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tanggal:</span>
                  <span>{formatDateTime(order.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{order.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tipe:</span>
                  <span className="font-bold">
                    {order.tableNumber} · {order.orderType === 'dine_in' ? 'Dine In' : 'Takeaway'}
                  </span>
                </div>
                {order.customerName && (
                  <div className="flex justify-between">
                    <span>Pelanggan:</span>
                    <span>{order.customerName}</span>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="py-2.5 space-y-2 border-b border-dashed border-slate-400">
                {order.items.map((i) => (
                  <div key={i.id} className="text-[11px]">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{i.name}</span>
                      <span>{formatRupiah(i.price * i.qty)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 text-[10px]">
                      <span>{i.qty} x {formatRupiah(i.price)}</span>
                      {i.notes && <span className="italic text-amber-900">({i.notes})</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="py-2.5 text-[11px] space-y-1 border-b border-dashed border-slate-400">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal</span>
                  <span>{formatRupiah(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>Diskon</span>
                    <span>-{formatRupiah(order.discount)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-slate-700">
                    <span>PB1 Resto (10%)</span>
                    <span>{formatRupiah(order.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-900 text-slate-950">
                  <span>TOTAL</span>
                  <span>{formatRupiah(order.total)}</span>
                </div>
                <div className="flex justify-between text-slate-800 pt-0.5">
                  <span>Bayar ({order.paymentMethod.toUpperCase()})</span>
                  <span>{formatRupiah(order.amountPaid)}</span>
                </div>
                {order.paymentMethod === 'cash' && (
                  <div className="flex justify-between font-bold text-emerald-900">
                    <span>KEMBALIAN</span>
                    <span>{formatRupiah(order.change)}</span>
                  </div>
                )}
              </div>

              {/* Footer Note */}
              <div className="pt-3 text-center text-[10px] text-slate-700 space-y-0.5">
                <p className="font-bold">Hatur Nuhun Kasumpinganana!</p>
                <p className="italic">"Masakan Sunda, Rasa Juara"</p>
                <p className="text-[9px] text-slate-500 pt-1">Simpan struk ini sebagai bukti pembayaran sah.</p>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>

              <button
                onClick={handleShareWhatsApp}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={handleCopyText}
                className="flex items-center justify-center gap-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold rounded-xl text-xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
              </button>
            </div>

            <button
              onClick={onNewOrder}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Mulai Transaksi Baru</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
