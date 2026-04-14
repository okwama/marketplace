import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { orders as seedOrders } from '../mockData';

const MarketplaceDemoContext = createContext(null);

const STORAGE_ORDERS = 'mp-demo-live-orders';
const STORAGE_CHECKOUT = 'mp-demo-last-checkout';
const STORAGE_VENDOR_STATUS = 'mp-demo-vendor-status';
const STORAGE_RIDERS = 'mp-demo-riders';

function readSessionJson(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw == null) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function normalizeOrder(o) {
  return {
    ...o,
    riderId: o.riderId ?? null,
  };
}

function initialLiveOrders() {
  const persisted = readSessionJson(STORAGE_ORDERS);
  if (Array.isArray(persisted) && persisted.length > 0) {
    return persisted.map((o) => normalizeOrder({ ...o }));
  }
  return seedOrders.map((o) => normalizeOrder({ ...o }));
}

function initialLastCheckout() {
  const v = readSessionJson(STORAGE_CHECKOUT);
  if (v && typeof v === 'object' && v !== null) return v;
  return null;
}

function initialVendorStatusById() {
  const v = readSessionJson(STORAGE_VENDOR_STATUS);
  if (v && typeof v === 'object' && v !== null && !Array.isArray(v)) {
    const out = {};
    Object.entries(v).forEach(([k, val]) => {
      const id = Number(k);
      if (!Number.isNaN(id) && ['approved', 'pending', 'suspended'].includes(val)) {
        out[id] = val;
      }
    });
    return out;
  }
  return {};
}

function initialRiders() {
  const p = readSessionJson(STORAGE_RIDERS);
  if (Array.isArray(p) && p.length > 0) {
    return p.filter((r) => r && r.id && r.name);
  }
  return [
    { id: 'r-seed-1', name: 'Peter Otieno', phone: '+254711000001', active: true },
    { id: 'r-seed-2', name: 'Mary Wambui', phone: '+254722000002', active: true },
  ];
}

function buildOrdersFromCheckout(cart, deliveryForm) {
  const base = Date.now();
  const byVendor = {};
  cart.forEach((item) => {
    const vid = item.vendorId;
    if (!byVendor[vid]) byVendor[vid] = [];
    byVendor[vid].push(item);
  });

  return Object.entries(byVendor).map(([vid, items]) => {
    const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
    const commission = Math.round(subtotal * 0.05);
    const netVendor = subtotal - commission;
    const formatLine = (i) => {
      const line = i.variantLabel ? `${i.name} (${i.variantLabel})` : i.name;
      return i.qty > 1 ? `${line} ×${i.qty}` : line;
    };
    const productLabel = items.length === 1
      ? formatLine(items[0])
      : `${formatLine(items[0])} (+${items.length - 1} more)`;
    const otp = String(Math.floor(1000 + Math.random() * 9000));
    return normalizeOrder({
      id: `MSK-DEMO-${base}-${vid}`,
      customerId: deliveryForm.phone.replace(/\s/g, ''),
      customerName: deliveryForm.fullName.trim(),
      vendorId: Number(vid),
      product: productLabel,
      amount: subtotal,
      commission,
      netVendor,
      status: 'confirmed',
      escrowStatus: 'held',
      otpGenerated: otp,
      otpConfirmed: false,
      date: new Date().toISOString().slice(0, 10),
      payoutDate: null,
      riderId: null,
    });
  });
}

export function MarketplaceDemoProvider({ children }) {
  const [liveOrders, setLiveOrders] = useState(initialLiveOrders);
  const [lastDemoCheckout, setLastDemoCheckout] = useState(initialLastCheckout);
  const [vendorStatusById, setVendorStatusById] = useState(initialVendorStatusById);
  const [riders, setRiders] = useState(initialRiders);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_ORDERS, JSON.stringify(liveOrders));
      if (lastDemoCheckout) {
        sessionStorage.setItem(STORAGE_CHECKOUT, JSON.stringify(lastDemoCheckout));
      } else {
        sessionStorage.removeItem(STORAGE_CHECKOUT);
      }
      sessionStorage.setItem(STORAGE_VENDOR_STATUS, JSON.stringify(vendorStatusById));
      sessionStorage.setItem(STORAGE_RIDERS, JSON.stringify(riders));
    } catch {
      /* storage full or disabled */
    }
  }, [liveOrders, lastDemoCheckout, vendorStatusById, riders]);

  const getVendorEffectiveStatus = useCallback(
    (vendor) => (vendorStatusById[vendor.id] !== undefined ? vendorStatusById[vendor.id] : vendor.status),
    [vendorStatusById],
  );

  const setVendorStatus = useCallback((vendorId, status) => {
    if (!['approved', 'pending', 'suspended'].includes(status)) return;
    setVendorStatusById((prev) => ({ ...prev, [vendorId]: status }));
  }, []);

  const clearVendorOverride = useCallback((vendorId) => {
    setVendorStatusById((prev) => {
      const next = { ...prev };
      delete next[vendorId];
      return next;
    });
  }, []);

  const addRider = useCallback((payload) => {
    const id = `r-${Date.now()}`;
    setRiders((prev) => [...prev, {
      id,
      name: payload.name.trim(),
      phone: payload.phone.trim(),
      active: true,
    }]);
  }, []);

  const toggleRiderActive = useCallback((riderId) => {
    setRiders((prev) => prev.map((r) => (r.id === riderId ? { ...r, active: !r.active } : r)));
  }, []);

  const removeRider = useCallback((riderId) => {
    setRiders((prev) => prev.filter((r) => r.id !== riderId));
    setLiveOrders((prev) => prev.map((o) => (o.riderId === riderId ? { ...o, riderId: null } : o)));
  }, []);

  const getRiderById = useCallback(
    (id) => (id ? riders.find((r) => r.id === id) : undefined),
    [riders],
  );

  const assignRiderToOrder = useCallback((orderId, riderId) => {
    setLiveOrders((prev) => prev.map((o) => (o.id === orderId
      ? { ...o, riderId: riderId || null }
      : o)));
  }, []);

  const vendorHandoffToRider = useCallback((orderId) => {
    setLiveOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      if (!o.riderId || o.status !== 'confirmed') return o;
      return { ...o, status: 'dispatched' };
    }));
  }, []);

  const verifyVendorOtp = useCallback((orderId, otp) => {
    let matched = false;
    const trimmed = String(otp).trim();
    setLiveOrders((prev) => prev.map((o) => {
      if (o.id !== orderId) return o;
      if (trimmed !== String(o.otpGenerated)) return o;
      matched = true;
      return {
        ...o,
        status: 'delivered',
        escrowStatus: 'released',
        otpConfirmed: true,
        payoutDate: new Date().toISOString().slice(0, 10),
      };
    }));
    return matched;
  }, []);

  const recordDemoOrdersFromCheckout = useCallback((cart, deliveryForm) => {
    if (!cart?.length) return;
    const rows = buildOrdersFromCheckout(cart, deliveryForm);
    setLiveOrders((prev) => [...rows, ...prev]);
    setLastDemoCheckout({
      primaryOtp: rows[0]?.otpGenerated ?? '7281',
      newOrderIds: rows.map((r) => r.id),
      customerName: deliveryForm.fullName?.trim(),
    });
  }, []);

  const value = useMemo(() => ({
    liveOrders,
    recordDemoOrdersFromCheckout,
    lastDemoCheckout,
    liveOrderCount: liveOrders.length,
    liveGmv: liveOrders.reduce((s, o) => s + o.amount, 0),
    liveEscrowHeld: liveOrders
      .filter((o) => o.escrowStatus === 'held' && o.status !== 'delivered')
      .reduce((s, o) => s + o.netVendor, 0),
    vendorStatusById,
    setVendorStatus,
    clearVendorOverride,
    getVendorEffectiveStatus,
    riders,
    addRider,
    toggleRiderActive,
    removeRider,
    getRiderById,
    assignRiderToOrder,
    vendorHandoffToRider,
    verifyVendorOtp,
  }), [
    liveOrders,
    lastDemoCheckout,
    recordDemoOrdersFromCheckout,
    vendorStatusById,
    setVendorStatus,
    clearVendorOverride,
    getVendorEffectiveStatus,
    riders,
    addRider,
    toggleRiderActive,
    removeRider,
    getRiderById,
    assignRiderToOrder,
    vendorHandoffToRider,
    verifyVendorOtp,
  ]);

  return (
    <MarketplaceDemoContext.Provider value={value}>
      {children}
    </MarketplaceDemoContext.Provider>
  );
}

export function useMarketplaceDemo() {
  const ctx = useContext(MarketplaceDemoContext);
  if (!ctx) {
    throw new Error('useMarketplaceDemo must be used within MarketplaceDemoProvider');
  }
  return ctx;
}
