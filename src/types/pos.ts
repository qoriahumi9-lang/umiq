export type MenuCategory = 'utama' | 'sayur' | 'sambal' | 'minuman' | 'paket';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  isAvailable: boolean;
  description?: string;
  isFavorite?: boolean;
}

export interface OrderItem {
  id: string; // unique cart item id
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
  notes?: string;
  category: MenuCategory;
}

export type OrderType = 'dine_in' | 'takeaway';
export type PaymentMethod = 'cash' | 'qris' | 'transfer' | 'card';

export interface Order {
  id: string; // e.g. TRX-20261029-001
  receiptNumber: string;
  tableNumber: string; // e.g. "Meja 03" or "Bungkus"
  customerName?: string;
  orderType: OrderType;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  taxRate: number; // e.g. 0 or 0.10
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  status: 'active' | 'completed' | 'cancelled';
  cashierName: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
}

export interface ShiftInfo {
  cashierName: string;
  shiftDate: string;
  initialCash: number;
}
