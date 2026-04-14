import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Package, TrendingUp, ShieldAlert, CheckCircle2, Store, ClipboardList } from 'lucide-react';
import { vendors } from '../mockData';
import { useMarketplaceDemo } from '../context/MarketplaceDemoContext';
import { useVendorCatalog } from '../context/VendorCatalogContext';
import * as goVendorApi from '../lib/goVendorApi';
import { MaterialSymbol } from './MaterialSymbol';
import { VendorDashboardPage } from './vendor/VendorDashboardPage';
import { VendorProductsPage } from './vendor/VendorProductsPage';
import { VendorCompliancePage } from './vendor/VendorCompliancePage';
import { VendorOrdersPage } from './vendor/VendorOrdersPage';

const VENDOR_PICK_KEY = 'mp-demo-vendor-id';

const VENDOR_TAB_IDS = new Set(['dashboard', 'orders', 'products', 'compliance']);

function initialVendorId() {
  try {
    const raw = sessionStorage.getItem(VENDOR_PICK_KEY);
    const n = Number(raw);
    const approved = vendors.filter((v) => v.status === 'approved');
    if (approved.some((v) => v.id === n)) return n;
  } catch {
    /* ignore */
  }
  return vendors.find((v) => v.status === 'approved')?.id ?? vendors[0].id;
}

export function VendorView({ layoutMode = 'mobile' }) {
  const navigate = useNavigate();
  const {
    allProducts,
    addVendorProduct,
    updateVendorProduct,
    deleteVendorProduct,
    canVendorMutateProduct,
  } = useVendorCatalog();
  const {
    liveOrders,
    getVendorEffectiveStatus,
    getRiderById,
    vendorHandoffToRider,
    verifyVendorOtp,
  } = useMarketplaceDemo();
  const isDesktop = layoutMode === 'desktop';
  const [searchParams, setSearchParams] = useSearchParams();
  const vendorTabParam = searchParams.get('vendorTab');
  const activeTab = vendorTabParam && VENDOR_TAB_IDS.has(vendorTabParam) ? vendorTabParam : 'dashboard';
  const setVendorTab = useCallback((id) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('vendorTab', id);
      return next;
    }, { replace: true });
  }, [setSearchParams]);
  const [pickVendor, setPickVendor] = useState(initialVendorId);
  const apiBase = useMemo(() => goVendorApi.getApiBase(), []);
  const [apiToken, setApiToken] = useState('');
  const [apiVendorId, setApiVendorId] = useState(null);
  const [apiVendorMeta, setApiVendorMeta] = useState(null);
  const [apiOrdersRaw, setApiOrdersRaw] = useState(null);
  const approvedVendors = useMemo(
    () => vendors.filter((v) => getVendorEffectiveStatus(v) === 'approved'),
    [getVendorEffectiveStatus],
  );
  const demoVendorId = approvedVendors.some((v) => v.id === pickVendor)
    ? pickVendor
    : (approvedVendors[0]?.id ?? vendors[0].id);
  const vendorId = apiToken && apiVendorId != null ? apiVendorId : demoVendorId;

  const vendor = useMemo(() => {
    const fromMock = vendors.find((v) => v.id === vendorId);
    if (fromMock) return fromMock;
    if (apiVendorMeta && Number(apiVendorMeta.id) === Number(vendorId)) {
      return {
        id: Number(apiVendorMeta.id),
        name: apiVendorMeta.name,
        status: apiVendorMeta.status || 'approved',
        kycLevel: 1,
      };
    }
    return vendors[0];
  }, [vendorId, apiVendorMeta]);

  useEffect(() => {
    if (!apiBase) return;
    const t = goVendorApi.getStoredToken();
    if (!t) return;
    setApiToken(t);
    (async () => {
      try {
        const me = await goVendorApi.fetchVendorMe(apiBase, t);
        setApiVendorMeta(me);
        setApiVendorId(Number(me.id));
        const orders = await goVendorApi.fetchVendorOrders(apiBase, t);
        setApiOrdersRaw(orders);
      } catch {
        goVendorApi.setStoredToken('');
        setApiToken('');
        setApiVendorMeta(null);
        setApiVendorId(null);
        setApiOrdersRaw(null);
      }
    })();
  }, [apiBase]);

  const handleApiLogout = () => {
    goVendorApi.setStoredToken('');
    setApiToken('');
    setApiVendorId(null);
    setApiVendorMeta(null);
    setApiOrdersRaw(null);
    navigate('/vendor/login', { replace: true });
  };

  useEffect(() => {
    try {
      sessionStorage.setItem(VENDOR_PICK_KEY, String(vendorId));
    } catch {
      /* ignore */
    }
  }, [vendorId]);

  const vendorOrders = useMemo(() => {
    if (apiBase && apiToken && apiOrdersRaw != null && apiVendorId === vendor.id) {
      return apiOrdersRaw.map(goVendorApi.mapApiOrderToDemo);
    }
    return liveOrders.filter((o) => o.vendorId === vendor.id);
  }, [apiBase, apiToken, apiOrdersRaw, apiVendorId, vendor.id, liveOrders]);
  const pendingOrders = useMemo(
    () => vendorOrders
      .filter((o) => o.status !== 'delivered')
      .slice()
      .sort((a, b) => String(b.id).localeCompare(String(a.id))),
    [vendorOrders],
  );
  const openOrderCount = pendingOrders.length;

  const vendorProducts = useMemo(
    () => allProducts.filter((p) => p.vendorId === vendor.id),
    [vendor.id, allProducts],
  );

  const pageX = isDesktop ? 'clamp(20px, 3vw, 40px)' : 20;

  const navItems = [
    { id: 'dashboard', label: 'Home', Icon: TrendingUp },
    { id: 'orders', label: 'Orders', Icon: ClipboardList },
    { id: 'products', label: 'Products', Icon: Package },
    { id: 'compliance', label: 'Compliance', Icon: ShieldAlert },
  ];

  const NavButton = ({ id, label, Icon, vertical }) => (
    <button
      type="button"
      onClick={() => setVendorTab(id)}
      style={{
        display: 'flex',
        flexDirection: vertical ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: vertical ? undefined : 'center',
        gap: vertical ? 4 : 8,
        padding: vertical ? '8px 4px' : '10px 16px',
        borderRadius: vertical ? 8 : 999,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: vertical ? 10 : 13,
        fontWeight: activeTab === id ? 600 : 500,
        background: activeTab === id ? (vertical ? 'transparent' : 'rgba(255, 121, 0, 0.12)') : (vertical ? 'transparent' : '#f1f5f9'),
        color: activeTab === id ? 'var(--primary)' : 'var(--text-muted)',
        flex: vertical ? 1 : 'none',
      }}
    >
      <Icon size={vertical ? 22 : 18} />
      {label}
    </button>
  );

  return (
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', color: 'var(--text-main)' }}>
      <header style={{ padding: isDesktop ? `24px ${pageX} 18px` : '25px 20px 20px', backgroundColor: 'var(--surface-color)', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0, flex: '1 1 200px' }}>
            <h1 style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 700, margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Store size={isDesktop ? 22 : 18} color="var(--primary)" /> WhatsApp Marketplace Vendor
            </h1>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <MaterialSymbol name="storefront" size={18} style={{ color: 'var(--text-muted)' }} />
              <label htmlFor="demo-vendor-select" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500, color: 'var(--text-main)' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Acting as</span>
                <select
                  id="demo-vendor-select"
                  value={vendorId}
                  disabled={Boolean(apiToken)}
                  onChange={(e) => setPickVendor(Number(e.target.value))}
                  style={{
                    maxWidth: isDesktop ? 280 : 200,
                    padding: '8px 10px',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                    fontSize: 13,
                    fontFamily: 'inherit',
                    background: apiToken ? '#f1f5f9' : 'white',
                    color: 'var(--text-main)',
                    cursor: apiToken ? 'not-allowed' : 'pointer',
                  }}
                >
                  {approvedVendors.map((v) => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {isDesktop && (
              <nav style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {navItems.map(({ id, label, Icon }) => (
                  <NavButton key={id} id={id} label={label} Icon={Icon} vertical={false} />
                ))}
              </nav>
            )}
            <div style={{ background: '#ecfdf5', color: 'var(--secondary)', padding: '5px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <CheckCircle2 size={14} /> Approved
            </div>
          </div>
        </div>
      </header>

      {apiBase && apiToken ? (
        <div className="card" style={{ margin: `0 ${pageX} 12px`, padding: 12, borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
            <span>
              API session:
              {' '}
              <strong style={{ color: 'var(--text-main)' }}>{apiVendorMeta?.email || apiVendorMeta?.name || 'vendor'}</strong>
              {' '}
              — orders from Postgres.
            </span>
            <button type="button" onClick={handleApiLogout} style={{ marginLeft: 'auto', padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}>
              Log out
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ background: 'var(--text-main)', color: 'white', padding: `12px ${pageX}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldAlert size={16} color="var(--warning)" />
          <span style={{ fontSize: 12 }}>{`KYC Level ${vendor.kycLevel ?? 1}: Action needed for higher limits`}</span>
        </div>
        <button type="button" style={{ color: 'var(--primary-light)', fontSize: 12, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Upgrade</button>
      </div>

      <main style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: pageX,
        paddingBottom: isDesktop ? 28 : `calc(72px + env(safe-area-inset-bottom, 0px))`,
      }}
      >
        {activeTab === 'dashboard' && (
          <VendorDashboardPage
            isDesktop={isDesktop}
            vendor={vendor}
            pendingOrders={pendingOrders}
            openOrderCount={openOrderCount}
            onViewAllOrders={() => setVendorTab('orders')}
          />
        )}
        {activeTab === 'orders' && (
          <VendorOrdersPage
            isDesktop={isDesktop}
            vendorOrders={vendorOrders}
            getRiderById={getRiderById}
            vendorHandoffToRider={vendorHandoffToRider}
            verifyVendorOtp={verifyVendorOtp}
          />
        )}
        {activeTab === 'products' && (
          <VendorProductsPage
            isDesktop={isDesktop}
            vendor={vendor}
            products={vendorProducts}
            addVendorProduct={addVendorProduct}
            updateVendorProduct={updateVendorProduct}
            deleteVendorProduct={deleteVendorProduct}
            canVendorMutateProduct={canVendorMutateProduct}
          />
        )}
        {activeTab === 'compliance' && (
          <VendorCompliancePage isDesktop={isDesktop} vendor={vendor} />
        )}
      </main>

      {!isDesktop && (
        <nav style={{ background: 'var(--surface-color)', padding: '10px 20px calc(20px + env(safe-area-inset-bottom, 0px))', display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border-color)' }}>
          {navItems.map(({ id, label, Icon }) => (
            <NavButton key={id} id={id} label={label} Icon={Icon} vertical />
          ))}
        </nav>
      )}
    </div>
  );
}
