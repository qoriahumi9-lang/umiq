/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MenuItem, OrderItem, Order, OrderType } from './types/pos';
import { DEFAULT_MENU_ITEMS } from './data/defaultMenu';
import { Header } from './components/Header';
import { MenuGrid } from './components/MenuGrid';
import { OrderCart } from './components/OrderCart';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ActiveOrdersView } from './components/ActiveOrdersView';
import { ReportsView } from './components/ReportsView';
import { MenuManager } from './components/MenuManagerModal';
import { AuthenticMenuModal } from './components/AuthenticMenuModal';
import { generateReceiptNumber } from './utils/format';

const STORAGE_KEYS = {
  MENU: 'ampera_pos_menu_v1',
  ACTIVE_ORDERS: 'ampera_pos_active_orders_v1',
  COMPLETED_ORDERS: 'ampera_pos_history_v1',
  CASHIER: 'ampera_pos_cashier_v1',
};

// Seed 3 realistic completed transactions from today for instant analytics feel
const SEED_TRANSACTIONS: Order[] = [
  {
    id: 'TRX-SEED-1',
    receiptNumber: 'AMP-20261029-1024',
    tableNumber: 'Meja 2',
    customerName: 'Kang Dedi',
    orderType: 'dine_in',
    items: [
      { id: 'c-1', menuItemId: 'utama-1', name: 'Nasi Liwet', price: 18000, qty: 2, category: 'utama' },
      { id: 'c-2', menuItemId: 'utama-5', name: 'Ayam Bakar', price: 20000, qty: 2, notes: 'Bakar kering', category: 'utama' },
      { id: 'c-3', menuItemId: 'sayur-1', name: 'Sayur Asem', price: 8000, qty: 1, category: 'sayur' },
      { id: 'c-4', menuItemId: 'sambal-2', name: 'Sambal Dadak', price: 5000, qty: 1, category: 'sambal' },
      { id: 'c-5', menuItemId: 'sambal-4', name: 'Lalapan (Timun, Selada, Kol)', price: 5000, qty: 1, category: 'sambal' },
      { id: 'c-6', menuItemId: 'minum-1', name: 'Es Teh Manis', price: 5000, qty: 2, category: 'minuman' },
    ],
    subtotal: 94000,
    discount: 0,
    tax: 0,
    taxRate: 0,
    total: 94000,
    paymentMethod: 'cash',
    amountPaid: 100000,
    change: 6000,
    status: 'completed',
    cashierName: 'Teh Siti',
    createdAt: new Date(Date.now() - 3600000 * 3.5).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 3.4).toISOString(),
  },
  {
    id: 'TRX-SEED-2',
    receiptNumber: 'AMP-20261029-1152',
    tableNumber: 'Meja 5',
    customerName: 'Ibu Nenden',
    orderType: 'dine_in',
    items: [
      { id: 'c-7', menuItemId: 'utama-6', name: 'Ikan Gurame Goreng', price: 35000, qty: 1, category: 'utama' },
      { id: 'c-8', menuItemId: 'utama-2', name: 'Nasi Tutug Oncom', price: 17000, qty: 2, category: 'utama' },
      { id: 'c-9', menuItemId: 'sayur-3', name: 'Kangkung Terasi', price: 10000, qty: 1, category: 'sayur' },
      { id: 'c-10', menuItemId: 'sambal-1', name: 'Sambal Terasi', price: 5000, qty: 1, category: 'sambal' },
      { id: 'c-11', menuItemId: 'minum-5', name: 'Jeruk Es', price: 8000, qty: 2, category: 'minuman' },
    ],
    subtotal: 92000,
    discount: 5000,
    tax: 0,
    taxRate: 0,
    total: 87000,
    paymentMethod: 'qris',
    amountPaid: 87000,
    change: 0,
    status: 'completed',
    cashierName: 'Teh Siti',
    createdAt: new Date(Date.now() - 3600000 * 1.8).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 1.7).toISOString(),
  },
  {
    id: 'TRX-SEED-3',
    receiptNumber: 'AMP-20261029-1420',
    tableNumber: 'Bungkus',
    customerName: 'Pak Hendra (Takeaway)',
    orderType: 'takeaway',
    items: [
      { id: 'c-12', menuItemId: 'paket-1', name: 'Paket Liwet Juara', price: 45000, qty: 2, notes: 'Sambal pisah', category: 'paket' },
      { id: 'c-13', menuItemId: 'minum-9', name: 'Es Durian', price: 15000, qty: 1, category: 'minuman' },
    ],
    subtotal: 105000,
    discount: 0,
    tax: 0,
    taxRate: 0,
    total: 105000,
    paymentMethod: 'transfer',
    amountPaid: 105000,
    change: 0,
    status: 'completed',
    cashierName: 'Teh Siti',
    createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    completedAt: new Date(Date.now() - 3600000 * 0.7).toISOString(),
  },
];

export default function App() {
  // Navigation tab
  const [currentTab, setCurrentTab] = useState<'pos' | 'active_orders' | 'reports' | 'menu'>('pos');

  // Menu items list
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MENU);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_MENU_ITEMS;
  });

  // Current order in cart
  const [cartItems, setCartItems] = useState<OrderItem[]>([]);
  const [orderType, setOrderType] = useState<OrderType>('dine_in');
  const [tableNumber, setTableNumber] = useState<string>('Meja 1');
  const [customerName, setCustomerName] = useState<string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);

  // Active parked table orders (dine-in tables eating)
  const [activeOrders, setActiveOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_ORDERS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'ORDER-ACTIVE-1',
        receiptNumber: 'AMP-20261029-ACTIVE-01',
        tableNumber: 'Meja 4',
        customerName: 'Keluarga Bpk. Ridwan',
        orderType: 'dine_in',
        items: [
          { id: 'ca-1', menuItemId: 'utama-1', name: 'Nasi Liwet', price: 18000, qty: 3, category: 'utama' },
          { id: 'ca-2', menuItemId: 'utama-4', name: 'Ayam Goreng', price: 18000, qty: 2, category: 'utama' },
          { id: 'ca-3', menuItemId: 'utama-10', name: 'Empal Goreng', price: 22000, qty: 1, category: 'utama' },
          { id: 'ca-4', menuItemId: 'sayur-1', name: 'Sayur Asem', price: 8000, qty: 2, category: 'sayur' },
          { id: 'ca-5', menuItemId: 'sambal-2', name: 'Sambal Dadak', price: 5000, qty: 2, notes: 'Sangat pedas', category: 'sambal' },
          { id: 'ca-6', menuItemId: 'sambal-4', name: 'Lalapan (Timun, Selada, Kol)', price: 5000, qty: 2, category: 'sambal' },
          { id: 'ca-7', menuItemId: 'minum-1', name: 'Es Teh Manis', price: 5000, qty: 3, category: 'minuman' },
        ],
        subtotal: 161000,
        discount: 0,
        tax: 0,
        taxRate: 0,
        total: 161000,
        paymentMethod: 'cash',
        amountPaid: 0,
        change: 0,
        status: 'active',
        cashierName: 'Teh Siti',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
      },
    ];
  });

  // Completed transactions
  const [completedOrders, setCompletedOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPLETED_ORDERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return SEED_TRANSACTIONS;
  });

  // Cashier profile
  const [cashierName, setCashierName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CASHIER);
      if (saved) return saved;
    } catch {}
    return 'Teh Siti (Shift 1)';
  });

  // Modals state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [currentReceiptOrder, setCurrentReceiptOrder] = useState<Order | null>(null);
  const [isAuthenticMenuModalOpen, setIsAuthenticMenuModalOpen] = useState(false);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MENU, JSON.stringify(menuItems));
    } catch {}
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ORDERS, JSON.stringify(activeOrders));
    } catch {}
  }, [activeOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_ORDERS, JSON.stringify(completedOrders));
    } catch {}
  }, [completedOrders]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CASHIER, cashierName);
    } catch {}
  }, [cashierName]);

  // Keyboard shortcut listener (F9 for Payment)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F9') {
        e.preventDefault();
        if (cartItems.length > 0 && !isPaymentModalOpen && !isReceiptModalOpen) {
          setIsPaymentModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cartItems, isPaymentModalOpen, isReceiptModalOpen]);

  // Cart operations
  const handleAddToCart = (item: MenuItem) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex((i) => i.menuItemId === item.id && !i.notes);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          qty: updated[existingIdx].qty + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          id: 'cart-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
          category: item.category,
        },
      ];
    });
  };

  const handleUpdateQty = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === cartItemId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as OrderItem[]
    );
  };

  const handleRemoveItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== cartItemId));
  };

  const handleUpdateNotes = (cartItemId: string, notes: string) => {
    setCartItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, notes: notes || undefined } : i))
    );
  };

  const handleClearCart = () => {
    if (cartItems.length === 0) return;
    if (confirm('Kosongkan semua daftar pesanan di keranjang?')) {
      setCartItems([]);
      setDiscount(0);
      setCustomerName('');
    }
  };

  // Financial totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = Math.round(discountedSubtotal * taxRate);
  const total = discountedSubtotal + tax;

  // Hold order (Save to Active Orders table)
  const handleHoldOrder = () => {
    if (cartItems.length === 0) return;

    // Check if table already has an active order
    const existingIdx = activeOrders.findIndex((o) => o.tableNumber === tableNumber);

    const heldOrder: Order = {
      id: existingIdx > -1 ? activeOrders[existingIdx].id : 'ORDER-' + Date.now(),
      receiptNumber: existingIdx > -1 ? activeOrders[existingIdx].receiptNumber : generateReceiptNumber(),
      tableNumber,
      customerName: customerName || undefined,
      orderType,
      items: cartItems,
      subtotal,
      discount,
      tax,
      taxRate,
      total,
      paymentMethod: 'cash',
      amountPaid: 0,
      change: 0,
      status: 'active',
      cashierName,
      createdAt: existingIdx > -1 ? activeOrders[existingIdx].createdAt : new Date().toISOString(),
    };

    if (existingIdx > -1) {
      const updated = [...activeOrders];
      updated[existingIdx] = heldOrder;
      setActiveOrders(updated);
    } else {
      setActiveOrders([heldOrder, ...activeOrders]);
    }

    // Reset current active cart
    setCartItems([]);
    setDiscount(0);
    setCustomerName('');
    // Advance to next table
    setTableNumber('Meja 1');
    setCurrentTab('active_orders');
  };

  // Resume order from Active Orders view into cart
  const handleResumeOrder = (order: Order) => {
    setCartItems(order.items);
    setOrderType(order.orderType);
    setTableNumber(order.tableNumber);
    setCustomerName(order.customerName || '');
    setDiscount(order.discount);
    setTaxRate(order.taxRate);

    // Remove from active orders since it's now being edited in cart
    setActiveOrders((prev) => prev.filter((o) => o.id !== order.id));
    setCurrentTab('pos');
  };

  // Direct Pay from Active Orders
  const handleDirectPay = (order: Order) => {
    setCartItems(order.items);
    setOrderType(order.orderType);
    setTableNumber(order.tableNumber);
    setCustomerName(order.customerName || '');
    setDiscount(order.discount);
    setTaxRate(order.taxRate);

    // Remove from active orders
    setActiveOrders((prev) => prev.filter((o) => o.id !== order.id));
    setIsPaymentModalOpen(true);
  };

  const handleCancelActiveOrder = (orderId: string) => {
    if (confirm('Batalkan pesanan meja ini?')) {
      setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
    }
  };

  const handleStartNewOrderForTable = (table: string) => {
    setTableNumber(table);
    setOrderType(table === 'Bungkus' ? 'takeaway' : 'dine_in');
    setCartItems([]);
    setDiscount(0);
    setCustomerName('');
    setCurrentTab('pos');
  };

  // Payment completed
  const handlePaymentSuccess = (completedOrder: Order) => {
    setCompletedOrders((prev) => [completedOrder, ...prev]);
    // Also remove from active orders if it was parked
    setActiveOrders((prev) => prev.filter((o) => o.tableNumber !== completedOrder.tableNumber));

    // Clear cart
    setCartItems([]);
    setDiscount(0);
    setCustomerName('');

    setIsPaymentModalOpen(false);
    setCurrentReceiptOrder(completedOrder);
    setIsReceiptModalOpen(true);
  };

  const handleNewOrder = () => {
    setIsReceiptModalOpen(false);
    setCurrentReceiptOrder(null);
    setCartItems([]);
    setDiscount(0);
    setCustomerName('');
    setTableNumber('Meja 1');
    setOrderType('dine_in');
    setCurrentTab('pos');
  };

  const handleCancelCompletedOrder = (orderId: string) => {
    setCompletedOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Menu management operations
  const handleToggleAvailability = (itemId: string) => {
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i))
    );
  };

  const handleUpdatePrice = (itemId: string, newPrice: number) => {
    setMenuItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, price: newPrice } : i))
    );
  };

  const handleAddMenuItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...item,
      id: 'menu-' + Date.now(),
    };
    setMenuItems((prev) => [...prev, newItem]);
  };

  const handleDeleteMenuItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleResetToDefaultMenu = () => {
    setMenuItems(DEFAULT_MENU_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.MENU);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        activeOrdersCount={activeOrders.length}
        cashierName={cashierName}
        onChangeCashier={setCashierName}
        onOpenAuthenticMenu={() => setIsAuthenticMenuModalOpen(true)}
      />

      {/* Main Work Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 no-print">
        {currentTab === 'pos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-5.5rem)] min-h-[600px]">
            {/* Left Column: Menu Items & Search (7 or 8 cols) */}
            <div className="lg:col-span-7 xl:col-span-8 h-full overflow-hidden flex flex-col">
              <MenuGrid
                menuItems={menuItems}
                cartItems={cartItems}
                onAddToCart={handleAddToCart}
              />
            </div>

            {/* Right Column: Order Bill Cart (5 or 4 cols) */}
            <div className="lg:col-span-5 xl:col-span-4 h-full overflow-hidden flex flex-col">
              <OrderCart
                items={cartItems}
                orderType={orderType}
                tableNumber={tableNumber}
                customerName={customerName}
                discount={discount}
                taxRate={taxRate}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                onUpdateNotes={handleUpdateNotes}
                onClearCart={handleClearCart}
                onSetOrderType={setOrderType}
                onSetTableNumber={setTableNumber}
                onSetCustomerName={setCustomerName}
                onSetDiscount={setDiscount}
                onSetTaxRate={setTaxRate}
                onHoldOrder={handleHoldOrder}
                onProceedToPayment={() => setIsPaymentModalOpen(true)}
              />
            </div>
          </div>
        )}

        {currentTab === 'active_orders' && (
          <ActiveOrdersView
            activeOrders={activeOrders}
            onResumeOrder={handleResumeOrder}
            onDirectPay={handleDirectPay}
            onCancelOrder={handleCancelActiveOrder}
            onStartNewOrderForTable={handleStartNewOrderForTable}
          />
        )}

        {currentTab === 'reports' && (
          <ReportsView
            orders={completedOrders}
            onViewReceipt={(order) => {
              setCurrentReceiptOrder(order);
              setIsReceiptModalOpen(true);
            }}
            onCancelCompletedOrder={handleCancelCompletedOrder}
          />
        )}

        {currentTab === 'menu' && (
          <MenuManager
            menuItems={menuItems}
            onToggleAvailability={handleToggleAvailability}
            onUpdatePrice={handleUpdatePrice}
            onAddItem={handleAddMenuItem}
            onDeleteItem={handleDeleteMenuItem}
            onResetToDefault={handleResetToDefaultMenu}
          />
        )}
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        items={cartItems}
        orderType={orderType}
        tableNumber={tableNumber}
        customerName={customerName}
        subtotal={subtotal}
        discount={discount}
        tax={tax}
        taxRate={taxRate}
        total={total}
        cashierName={cashierName}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Thermal Receipt Preview & Print Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        order={currentReceiptOrder}
        onClose={() => setIsReceiptModalOpen(false)}
        onNewOrder={handleNewOrder}
      />

      {/* Authentic Menu Lightbox Modal */}
      <AuthenticMenuModal
        isOpen={isAuthenticMenuModalOpen}
        onClose={() => setIsAuthenticMenuModalOpen(false)}
      />
    </div>
  );
}
