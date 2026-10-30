import { Order } from '../types/pos';

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

export function generateReceiptNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `AMP-${year}${month}${day}-${random}`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}

export function exportOrdersToCSV(orders: Order[]) {
  if (!orders || orders.length === 0) {
    alert('Tidak ada data transaksi untuk diekspor');
    return;
  }

  const headers = [
    'No. Struk',
    'Tanggal & Waktu',
    'Tipe Pesanan',
    'Meja / Pelanggan',
    'Kasir',
    'Metode Bayar',
    'Rincian Menu',
    'Subtotal (Rp)',
    'Diskon (Rp)',
    'Pajak (Rp)',
    'Total (Rp)',
    'Status'
  ];

  const rows = orders.map((o) => {
    const itemsSummary = o.items.map((i) => `${i.name} (x${i.qty})`).join('; ');
    return [
      `"${o.receiptNumber}"`,
      `"${formatDateTime(o.createdAt)}"`,
      `"${o.orderType === 'dine_in' ? 'Makan di Tempat' : 'Bungkus'}"`,
      `"${o.tableNumber}${o.customerName ? ` (${o.customerName})` : ''}"`,
      `"${o.cashierName}"`,
      `"${o.paymentMethod.toUpperCase()}"`,
      `"${itemsSummary}"`,
      o.subtotal,
      o.discount,
      o.tax,
      o.total,
      `"${o.status}"`
    ];
  });

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Laporan_Penjualan_Ampera_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
