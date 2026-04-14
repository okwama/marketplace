import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react';
import { products as seedProducts } from '../mockData';

const VendorCatalogContext = createContext(null);

const STORAGE_KEY = 'mp-vendor-listings';

/** Vendor-created rows use ids ≥ this so they stay distinct from seed data. */
const MIN_VENDOR_PRODUCT_ID = 100_000;
export { MIN_VENDOR_PRODUCT_ID };

function readStoredVendorProducts() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (p) => p && typeof p === 'object' && typeof p.id === 'number' && p.id >= MIN_VENDOR_PRODUCT_ID,
    );
  } catch {
    return [];
  }
}

export function VendorCatalogProvider({ children }) {
  const [vendorProducts, setVendorProducts] = useState(readStoredVendorProducts);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(vendorProducts));
    } catch {
      /* quota / private mode */
    }
  }, [vendorProducts]);

  const allProducts = useMemo(() => [...seedProducts, ...vendorProducts], [vendorProducts]);

  const canVendorMutateProduct = useCallback((product, vendorId) => {
    if (!product || product.vendorId !== vendorId) return false;
    return vendorProducts.some((p) => p.id === product.id);
  }, [vendorProducts]);

  const addVendorProduct = useCallback((vendor, payload) => {
    setVendorProducts((prev) => {
      const combined = [...seedProducts, ...prev];
      const maxId = combined.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0);
      const id = Math.max(maxId + 1, MIN_VENDOR_PRODUCT_ID);
      const row = {
        id,
        name: payload.name.trim(),
        vendor: vendor.name,
        vendorId: vendor.id,
        price: Number(payload.price),
        originalPrice: payload.originalPrice != null && payload.originalPrice !== ''
          ? Number(payload.originalPrice)
          : null,
        category: payload.category,
        image: payload.image,
        rating: 4.5,
        reviews: 0,
        badge: payload.badge?.trim() || null,
        description: (payload.description || '').trim() || 'No description yet.',
        inStock: payload.inStock !== false,
        variants: [],
      };
      return [...prev, row];
    });
  }, []);

  const updateVendorProduct = useCallback((vendorId, productId, payload) => {
    setVendorProducts((prev) => prev.map((p) => {
      if (p.id !== productId || p.vendorId !== vendorId) return p;
      return {
        ...p,
        name: payload.name.trim(),
        price: Number(payload.price),
        originalPrice: payload.originalPrice != null && payload.originalPrice !== ''
          ? Number(payload.originalPrice)
          : null,
        category: payload.category,
        image: payload.image,
        badge: payload.badge?.trim() || null,
        description: (payload.description || '').trim() || 'No description yet.',
        inStock: payload.inStock !== false,
      };
    }));
  }, []);

  const deleteVendorProduct = useCallback((vendorId, productId) => {
    setVendorProducts((prev) => prev.filter((p) => !(p.id === productId && p.vendorId === vendorId)));
  }, []);

  const value = useMemo(() => ({
    seedProducts,
    vendorProducts,
    allProducts,
    addVendorProduct,
    updateVendorProduct,
    deleteVendorProduct,
    canVendorMutateProduct,
  }), [
    vendorProducts,
    allProducts,
    addVendorProduct,
    updateVendorProduct,
    deleteVendorProduct,
    canVendorMutateProduct,
  ]);

  return (
    <VendorCatalogContext.Provider value={value}>
      {children}
    </VendorCatalogContext.Provider>
  );
}

export function useVendorCatalog() {
  const ctx = useContext(VendorCatalogContext);
  if (!ctx) {
    throw new Error('useVendorCatalog must be used within VendorCatalogProvider');
  }
  return ctx;
}
