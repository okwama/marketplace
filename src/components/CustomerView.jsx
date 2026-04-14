import React, { useState, useCallback, useMemo } from 'react';
import { ShoppingCart, Search, Menu, MessageCircle, Store, ArrowLeft, X } from 'lucide-react';
import { getDefaultVariant, getListingFromPrice } from '../mockData';
import { useVendorCatalog } from '../context/VendorCatalogContext';
import { AnimatePresence } from 'framer-motion';
import { useMarketplaceDemo } from '../context/MarketplaceDemoContext';
import { DELIVERY_FEE } from './customer/constants';
import {
  BrowseSection,
  ProductDetailSection,
  CartSection,
  CheckoutSection,
  PaymentSection,
  SuccessSection,
  MobileBrowseNav,
} from './customer/CustomerScreens';
import { CustomerSearchPage } from './customer/CustomerSearchPage';
import { CustomerChatPage } from './customer/CustomerChatPage';

const WISHLIST_KEY = 'wm-customer-wishlist';
const RECENT_KEY = 'wm-customer-recent';
const RECENT_MAX = 12;

function readWishlist() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(WISHLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
}

function readRecentIds() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(Number).filter((n) => !Number.isNaN(n)) : [];
  } catch {
    return [];
  }
}

export function CustomerView({ layoutMode = 'mobile' }) {
  const { allProducts: products } = useVendorCatalog();
  const { recordDemoOrdersFromCheckout } = useMarketplaceDemo();
  const isDesktop = layoutMode === 'desktop';
  const [activeTab, setActiveTab] = useState('all');
  const [homeTab, setHomeTab] = useState('shop');
  const [cart, setCart] = useState([]);
  const [viewState, setViewState] = useState('browse');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailVariantId, setDetailVariantId] = useState(null);
  const [detailQty, setDetailQty] = useState(1);
  const [checkoutPhase, setCheckoutPhase] = useState(1);
  const [deliveryForm, setDeliveryForm] = useState({
    fullName: '',
    phone: '',
    line1: '',
    city: 'Nairobi',
  });
  const [mpesaStep, setMpesaStep] = useState(0);
  const [shopQuery, setShopQuery] = useState('');
  const [shopSort, setShopSort] = useState('featured');
  const [wishlist, setWishlist] = useState(readWishlist);
  const [recentIds, setRecentIds] = useState(readRecentIds);

  const filteredProducts = useMemo(() => {
    let list = activeTab === 'all' ? products : products.filter((p) => p.category === activeTab);
    const q = shopQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.vendor.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)),
      );
    }
    const sorted = [...list];
    if (shopSort === 'price-asc') {
      sorted.sort((a, b) => getListingFromPrice(a) - getListingFromPrice(b));
    } else if (shopSort === 'price-desc') {
      sorted.sort((a, b) => getListingFromPrice(b) - getListingFromPrice(a));
    } else if (shopSort === 'rating') {
      sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    }
    return sorted;
  }, [activeTab, shopQuery, shopSort, products]);

  const popularPicks = useMemo(
    () => [...products].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, 8),
    [products],
  );

  const savedProducts = useMemo(
    () => wishlist.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    [wishlist, products],
  );

  const recentProducts = useMemo(
    () => recentIds.map((id) => products.find((p) => p.id === id)).filter(Boolean),
    [recentIds, products],
  );

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    const id = selectedProduct.id;
    const cat = selectedProduct.category;
    const sameCat = products.filter((x) => x.id !== id && x.category === cat);
    const other = products.filter((x) => x.id !== id && x.category !== cat);
    return [...sameCat, ...other].slice(0, 6);
  }, [selectedProduct, products]);

  const recordProductView = useCallback((productId) => {
    setRecentIds((prev) => {
      const next = [productId, ...prev.filter((id) => id !== productId)].slice(0, RECENT_MAX);
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(RECENT_KEY, JSON.stringify(next));
        }
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem(WISHLIST_KEY, JSON.stringify(next));
        }
      } catch {
        /* ignore quota / private mode */
      }
      return next;
    });
  }, []);

  const addToCart = useCallback((product, qty = 1, variant) => {
    const v = variant ?? getDefaultVariant(product);
    const cartLineId = `${product.id}::${v.id}`;
    setCart((prev) => {
      const existing = prev.find((item) => item.cartLineId === cartLineId);
      if (existing) {
        return prev.map((item) =>
          item.cartLineId === cartLineId ? { ...item, qty: item.qty + qty } : item,
        );
      }
      return [...prev, {
        ...product,
        cartLineId,
        variantId: v.id,
        variantLabel: v.label,
        price: v.price,
        originalPrice: v.originalPrice ?? product.originalPrice,
        qty,
      }];
    });
  }, []);

  const removeFromCart = (cartLineId) => {
    setCart((prev) => prev.filter((item) => (item.cartLineId ?? item.id) !== cartLineId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const orderTotal = cartTotal + DELIVERY_FEE;

  const openProduct = useCallback((ref) => {
    const catalog = products.find((p) => p.id === ref.id) ?? ref;
    recordProductView(catalog.id);
    setSelectedProduct(catalog);
    setDetailQty(1);
    setDetailVariantId(ref.variantId ?? null);
    setViewState('productDetail');
  }, [recordProductView, products]);

  const goBack = () => {
    if (viewState === 'productDetail') {
      setSelectedProduct(null);
      setDetailVariantId(null);
      setViewState('browse');
    } else if (viewState === 'checkout') {
      if (checkoutPhase === 2) setCheckoutPhase(1);
      else setViewState('cart');
    } else if (viewState === 'payment') {
      setMpesaStep(0);
      setViewState('checkout');
      setCheckoutPhase(2);
    }
  };

  const proceedToCheckout = () => {
    setCheckoutPhase(1);
    setViewState('checkout');
  };

  const startMpesaPayment = () => {
    const cartSnapshot = [...cart];
    const formSnapshot = { ...deliveryForm };
    setViewState('payment');
    setMpesaStep(1);
    setTimeout(() => {
      setMpesaStep(2);
      setTimeout(() => {
        recordDemoOrdersFromCheckout(cartSnapshot, formSnapshot);
        setViewState('success');
        setCart([]);
        setCheckoutPhase(1);
        setMpesaStep(0);
      }, 3000);
    }, 4000);
  };

  const deliveryValid =
    deliveryForm.fullName.trim().length > 1 &&
    deliveryForm.phone.replace(/\D/g, '').length >= 9 &&
    deliveryForm.line1.trim().length > 3;

  const pagePad = isDesktop ? 'clamp(16px, 3vw, 32px)' : 20;
  const productGridCols = isDesktop
    ? 'repeat(auto-fill, minmax(220px, 1fr))'
    : '1fr 1fr';
  const contentMaxWidth = isDesktop ? 1200 : 'none';

  const headerTitle = (() => {
    if (viewState === 'browse') {
      if (homeTab === 'search') return 'Search';
      if (homeTab === 'chat') return 'Chats';
    }
    if (viewState === 'productDetail' && selectedProduct) {
      const t = selectedProduct.name;
      return t.length > 28 ? `${t.slice(0, 26)}…` : t;
    }
    if (viewState === 'checkout') return 'Checkout';
    if (viewState === 'payment') return 'M-Pesa';
    if (viewState === 'cart') return 'Your cart';
    return 'WhatsApp Marketplace';
  })();

  const showSearch = viewState === 'browse' && homeTab === 'shop';
  const showDesktopShopNav = isDesktop && viewState === 'browse';
  const leftIsBack = viewState === 'productDetail' || viewState === 'checkout' || viewState === 'payment';

  return (
    <div
      style={{
        width: '100%',
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f8fafc',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >

      <header style={{ flexShrink: 0, padding: isDesktop ? '20px clamp(20px, 4vw, 40px) 16px' : '20px 20px 15px', backgroundColor: 'var(--surface-color)', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: contentMaxWidth, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isDesktop ? 12 : 15, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            {leftIsBack ? (
              <button
                type="button"
                onClick={goBack}
                aria-label="Go back"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8, background: '#f1f5f9', borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0 }}
              >
                <ArrowLeft size={22} color="var(--text-main)" />
              </button>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Menu size={24} color="var(--text-main)" />
              </span>
            )}
            <h1 style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 700, margin: 0, color: 'var(--primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {headerTitle}
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: isDesktop ? 16 : 0 }}>
            {showDesktopShopNav && (
              <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
                {[
                  { id: 'shop', label: 'Shop', Icon: Store },
                  { id: 'search', label: 'Search', Icon: Search },
                  { id: 'chat', label: 'Chat', Icon: MessageCircle },
                ].map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setHomeTab(id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 14px',
                      borderRadius: 999,
                      background: homeTab === id ? 'rgba(255, 121, 0, 0.12)' : '#f1f5f9',
                      color: homeTab === id ? 'var(--primary)' : 'var(--text-muted)',
                      fontSize: 13,
                      fontWeight: homeTab === id ? 600 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                ))}
              </nav>
            )}
            {viewState !== 'checkout' && viewState !== 'payment' && (
              <button
                type="button"
                onClick={() => {
                  if (viewState === 'cart') setViewState('browse');
                  else setViewState('cart');
                }}
                style={{ position: 'relative', padding: 8, background: '#f1f5f9', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
              >
                {viewState === 'cart' ? <X size={20} /> : <ShoppingCart size={20} />}
                {cartCount > 0 && viewState !== 'cart' && (
                  <span style={{ position: 'absolute', top: -5, right: -5, background: 'var(--primary)', color: 'white', borderRadius: 10, padding: '0 6px', fontSize: 12, fontWeight: 'bold' }}>
                    {cartCount}
                  </span>
                )}
              </button>
            )}
          </div>
          </div>

        {showSearch && (
          <div style={{ display: 'flex', background: '#f1f5f9', padding: isDesktop ? '12px 18px' : '10px 15px', borderRadius: 10, alignItems: 'center', gap: 10, maxWidth: isDesktop ? 560 : 'none', width: isDesktop ? '100%' : 'none' }}>
            <Search size={18} color="var(--text-muted)" />
            <input
              value={shopQuery}
              onChange={(e) => setShopQuery(e.target.value)}
              placeholder="Search products, vendors..."
              aria-label="Search products and vendors"
              style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: 14 }}
            />
          </div>
        )}
        </div>
      </header>

      <main
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          paddingBottom: viewState === 'browse' && !isDesktop ? `calc(80px + env(safe-area-inset-bottom, 0px))` : 24,
        }}
      >
        <div style={{ maxWidth: contentMaxWidth, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
          <AnimatePresence mode="wait">
          {viewState === 'browse' && homeTab === 'shop' && (
            <BrowseSection
              key="tab-shop"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              filteredProducts={filteredProducts}
              openProduct={openProduct}
              addToCart={addToCart}
              pagePad={pagePad}
              productGridCols={productGridCols}
              isDesktop={isDesktop}
              shopSort={shopSort}
              setShopSort={setShopSort}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              popularProducts={popularPicks}
              savedProducts={savedProducts}
              recentProducts={recentProducts}
            />
          )}
          {viewState === 'browse' && homeTab === 'search' && (
            <CustomerSearchPage
              key="tab-search"
              isDesktop={isDesktop}
              pagePad={pagePad}
              products={products}
              openProduct={openProduct}
              addToCart={addToCart}
              productGridCols={productGridCols}
            />
          )}
          {viewState === 'browse' && homeTab === 'chat' && (
            <CustomerChatPage key="tab-chat" isDesktop={isDesktop} pagePad={pagePad} />
          )}
          {viewState === 'productDetail' && (
            <ProductDetailSection
              key="flow-detail"
              selectedProduct={selectedProduct}
              detailQty={detailQty}
              setDetailQty={setDetailQty}
              addToCart={addToCart}
              setCheckoutPhase={setCheckoutPhase}
              setViewState={setViewState}
              pagePad={pagePad}
              isDesktop={isDesktop}
              selectedVariantId={detailVariantId}
              onVariantIdChange={setDetailVariantId}
              wishlist={wishlist}
              toggleWishlist={toggleWishlist}
              relatedProducts={relatedProducts}
              openProduct={openProduct}
            />
          )}
          {viewState === 'cart' && (
            <CartSection
              key="flow-cart"
              cart={cart}
              cartTotal={cartTotal}
              orderTotal={orderTotal}
              openProduct={openProduct}
              removeFromCart={removeFromCart}
              proceedToCheckout={proceedToCheckout}
              setViewState={setViewState}
              pagePad={pagePad}
              isDesktop={isDesktop}
            />
          )}
          {viewState === 'checkout' && (
            <CheckoutSection
              key="flow-checkout"
              checkoutPhase={checkoutPhase}
              setCheckoutPhase={setCheckoutPhase}
              deliveryForm={deliveryForm}
              setDeliveryForm={setDeliveryForm}
              deliveryValid={deliveryValid}
              cart={cart}
              cartTotal={cartTotal}
              orderTotal={orderTotal}
              startMpesaPayment={startMpesaPayment}
              isDesktop={isDesktop}
              pagePad={pagePad}
            />
          )}
          {viewState === 'payment' && (
            <PaymentSection key="flow-payment" mpesaStep={mpesaStep} orderTotal={orderTotal} isDesktop={isDesktop} pagePad={pagePad} />
          )}
          {viewState === 'success' && (
            <SuccessSection key="flow-success" setViewState={setViewState} setSelectedProduct={setSelectedProduct} setHomeTab={setHomeTab} isDesktop={isDesktop} pagePad={pagePad} />
          )}
          </AnimatePresence>
        </div>
      </main>

      {viewState === 'browse' && !isDesktop && (
        <MobileBrowseNav activeTab={homeTab} onTabChange={setHomeTab} />
      )}
    </div>
  );
}
