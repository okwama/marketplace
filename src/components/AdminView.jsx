import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, MessageSquare, BarChart3,
  ArrowUpRight, ArrowDownRight, MoreHorizontal,
  CheckSquare, Bell, UserCheck, Bike, ClipboardList, Scale,
  Menu, X,
} from 'lucide-react';
import { useMarketplaceDemo } from '../context/MarketplaceDemoContext';
import { MaterialSymbol } from './MaterialSymbol';
import { vendors, disputes as mockDisputes } from '../mockData';
import * as goAdminApi from '../lib/goAdminApi';
import { useVendorCatalog } from '../context/VendorCatalogContext';
import { VendorSnapshotSection } from './admin/VendorSnapshotSection';
import { AdminProductsPage } from './admin/AdminProductsPage';
import { AdminChatsPage } from './admin/AdminChatsPage';
import { AdminReportsPage } from './admin/AdminReportsPage';
import { AdminVendorApprovalsPage } from './admin/AdminVendorApprovalsPage';
import { AdminFleetPage } from './admin/AdminFleetPage';
import { AdminOrdersPage } from './admin/AdminOrdersPage';
import { AdminDisputesPage } from './admin/AdminDisputesPage';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
} from 'recharts';

const escrowData = [
  { name: 'Mon', gmv: 42000, commission: 2100 },
  { name: 'Tue', gmv: 38000, commission: 1900 },
  { name: 'Wed', gmv: 55000, commission: 2750 },
  { name: 'Thu', gmv: 61000, commission: 3050 },
  { name: 'Fri', gmv: 82000, commission: 4100 },
  { name: 'Sat', gmv: 95000, commission: 4750 },
  { name: 'Sun', gmv: 110000, commission: 5500 },
];

const salesData = [
  { name: 'Apr 11', sales: 40 },
  { name: 'Apr 12', sales: 30 },
  { name: 'Apr 13', sales: 60 },
  { name: 'Apr 14', sales: 80 },
  { name: 'Apr 15', sales: 50 },
  { name: 'Apr 16', sales: 90 },
  { name: 'Apr 17', sales: 110 },
];

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', Icon: LayoutDashboard },
  { id: 'vendors', label: 'Vendors', Icon: UserCheck },
  { id: 'fleet', label: 'Riders', Icon: Bike },
  { id: 'orders', label: 'Orders', Icon: ClipboardList },
  { id: 'disputes', label: 'Disputes', Icon: Scale },
  { id: 'products', label: 'Products', Icon: ShoppingBag },
  { id: 'chats', label: 'Chats', Icon: MessageSquare },
  { id: 'reports', label: 'Reports', Icon: BarChart3 },
];

const ADMIN_TAB_IDS = new Set(NAV_ITEMS.map((i) => i.id));

export function AdminView({ layoutMode = 'mobile' }) {
  const navigate = useNavigate();
  const { allProducts: products } = useVendorCatalog();
  const {
    liveOrders,
    liveOrderCount,
    liveGmv,
    getVendorEffectiveStatus,
    setVendorStatus,
    clearVendorOverride,
    riders,
    addRider,
    toggleRiderActive,
    removeRider,
    assignRiderToOrder,
    getRiderById,
  } = useMarketplaceDemo();
  const isDesktop = layoutMode === 'desktop';
  const [searchParams, setSearchParams] = useSearchParams();
  const adminTabParam = searchParams.get('adminTab');
  const activeTab = adminTabParam && ADMIN_TAB_IDS.has(adminTabParam) ? adminTabParam : 'dashboard';
  const setActiveTab = useCallback((id) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('adminTab', id);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const apiBase = useMemo(() => goAdminApi.getApiBase(), []);
  const [adminApiToken, setAdminApiToken] = useState('');
  const [adminApiMeta, setAdminApiMeta] = useState(null);
  const [adminDisputes, setAdminDisputes] = useState([]);
  const [adminDisputesLoading, setAdminDisputesLoading] = useState(false);
  const [adminDisputesErr, setAdminDisputesErr] = useState('');
  const adminApiMode = Boolean(apiBase && adminApiToken);

  const loadAdminDisputes = useCallback(async (token) => {
    if (!apiBase || !token) return;
    setAdminDisputesErr('');
    setAdminDisputesLoading(true);
    try {
      const rows = await goAdminApi.fetchAdminDisputes(apiBase, token);
      setAdminDisputes(rows.map(goAdminApi.mapApiDisputeToUi));
    } catch (e) {
      setAdminDisputesErr(e?.message || 'Failed to load disputes');
      setAdminDisputes([]);
    } finally {
      setAdminDisputesLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    if (!apiBase) return;
    const t = goAdminApi.getStoredAdminToken();
    if (!t) return;
    setAdminApiToken(t);
    (async () => {
      try {
        setAdminDisputesLoading(true);
        const rows = await goAdminApi.fetchAdminDisputes(apiBase, t);
        setAdminDisputes(rows.map(goAdminApi.mapApiDisputeToUi));
      } catch {
        goAdminApi.setStoredAdminToken('');
        setAdminApiToken('');
        setAdminDisputes([]);
        setAdminApiMeta(null);
      } finally {
        setAdminDisputesLoading(false);
      }
    })();
  }, [apiBase]);

  const handleAdminApiLogout = () => {
    goAdminApi.setStoredAdminToken('');
    setAdminApiToken('');
    setAdminApiMeta(null);
    setAdminDisputes([]);
    setAdminDisputesErr('');
    navigate('/admin/login', { replace: true });
  };

  const disputesForUi = useMemo(() => {
    if (adminApiMode) return adminDisputes;
    return mockDisputes;
  }, [adminApiMode, adminDisputes]);

  const recentLive = useMemo(
    () => liveOrders.filter((o) => String(o.id).includes('DEMO')).slice(0, 5),
    [liveOrders],
  );

  const approvedVendorCount = useMemo(
    () => vendors.filter((v) => getVendorEffectiveStatus(v) === 'approved').length,
    [getVendorEffectiveStatus],
  );

  const ledgerDataIssueOrderCount = useMemo(() => {
    const vidSet = new Set(vendors.map((v) => v.id));
    let n = 0;
    liveOrders.forEach((o) => {
      if (!vidSet.has(o.vendorId)) {
        n += 1;
        return;
      }
      const v = vendors.find((x) => x.id === o.vendorId);
      if (v && !v.region) n += 1;
    });
    return n;
  }, [liveOrders]);

  const openDisputesCount = useMemo(
    () => disputesForUi.filter((d) => d.status === 'open').length,
    [disputesForUi],
  );

  const mainPad = isDesktop ? 30 : 16;
  const chartH = isDesktop ? 300 : 220;
  const barH = isDesktop ? 220 : 200;
  const DESKTOP_DRAWER_W = 280;

  const [desktopDrawerOpen, setDesktopDrawerOpen] = useState(true);

  useEffect(() => {
    if (!isDesktop) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setDesktopDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isDesktop]);

  const renderDesktopNavButtons = () => NAV_ITEMS.map(({ id, label, Icon }) => {
    const reportBadge = id === 'reports' && ledgerDataIssueOrderCount > 0;
    const disputeBadge = id === 'disputes' && openDisputesCount > 0;
    const badgeCount = reportBadge ? ledgerDataIssueOrderCount : (disputeBadge ? openDisputesCount : 0);
    const showBadge = reportBadge || disputeBadge;
    return (
      <button
        key={id}
        type="button"
        onClick={() => setActiveTab(id)}
        style={{
          width: '100%',
          padding: '15px 25px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          background: activeTab === id ? '#166534' : 'transparent',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          textAlign: 'left',
          borderLeft: activeTab === id ? '4px solid #4ade80' : '4px solid transparent',
          transition: 'all 0.2s',
          fontFamily: 'inherit',
        }}
      >
        <Icon size={20} />
        <span style={{ flex: 1, fontWeight: activeTab === id ? '600' : '400' }}>{label}</span>
        {showBadge && (
          <span style={{
            background: id === 'disputes' ? '#f97316' : '#ea580c',
            color: 'white',
            fontSize: 10,
            fontWeight: 800,
            minWidth: 20,
            height: 20,
            padding: '0 6px',
            borderRadius: 10,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          >
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </button>
    );
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      flex: 1,
      minHeight: 0,
      backgroundColor: '#f0fdf4',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
    }}
    >
      {isDesktop && (
        <header
          style={{
            flexShrink: 0,
            height: 56,
            padding: '0 16px 0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            background: '#14532d',
            color: 'white',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
            position: 'relative',
            zIndex: 5,
          }}
        >
          <button
            type="button"
            onClick={() => setDesktopDrawerOpen((o) => !o)}
            aria-expanded={desktopDrawerOpen}
            aria-controls="admin-desktop-drawer"
            aria-label={desktopDrawerOpen ? 'Close navigation' : 'Open navigation'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 10,
              border: 'none',
              background: desktopDrawerOpen ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {desktopDrawerOpen ? <X size={22} strokeWidth={2} aria-hidden /> : <Menu size={22} strokeWidth={2} aria-hidden />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <span style={{ background: '#22c55e', padding: '6px', borderRadius: '8px', display: 'flex', flexShrink: 0 }}>
              <MaterialSymbol name="public" size={20} style={{ color: '#14532d' }} />
            </span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Admin</div>
              <div style={{ fontSize: 11, color: '#86efac' }}>Marketplace Manager</div>
            </div>
          </div>
          <button
            type="button"
            style={{
              background: 'rgba(255,255,255,0.12)',
              border: 'none',
              borderRadius: 10,
              padding: 10,
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              flexShrink: 0,
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
          </button>
        </header>
      )}

      {!isDesktop && (
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: '#14532d',
          color: 'white',
          flexShrink: 0,
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ background: '#22c55e', padding: '6px 8px', borderRadius: '8px', display: 'flex' }}>
              <MaterialSymbol name="public" size={20} style={{ color: '#14532d' }} />
            </span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Admin</div>
              <div style={{ fontSize: 11, color: '#86efac' }}>Marketplace</div>
            </div>
          </div>
          <button type="button" style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 10, padding: 10, color: 'white', cursor: 'pointer', display: 'flex' }}>
            <Bell size={20} />
          </button>
        </header>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {isDesktop && (
          <div
            id="admin-desktop-drawer"
            role="navigation"
            aria-label="Admin sections"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: DESKTOP_DRAWER_W,
              backgroundColor: '#14532d',
              color: 'white',
              padding: '16px 0 24px',
              borderTopRightRadius: 20,
              borderBottomRightRadius: 20,
              boxShadow: desktopDrawerOpen ? '8px 0 32px rgba(0,0,0,0.18)' : 'none',
              transform: desktopDrawerOpen ? 'translateX(0)' : 'translateX(calc(-100% - 8px))',
              transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s ease',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              pointerEvents: desktopDrawerOpen ? 'auto' : 'none',
            }}
          >
            <p style={{
              margin: '0 20px 12px',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.06em',
              color: '#86efac',
              textTransform: 'uppercase',
            }}
            >
              Navigation
            </p>
            <nav style={{ flex: 1, overflowY: 'auto' }}>
              {renderDesktopNavButtons()}
            </nav>
          </div>
        )}

        <main style={{
          flex: 1,
          minHeight: 0,
          paddingTop: mainPad,
          paddingRight: mainPad,
          paddingBottom: !isDesktop ? 88 : mainPad,
          paddingLeft: isDesktop && desktopDrawerOpen ? DESKTOP_DRAWER_W + mainPad : mainPad,
          overflowY: 'auto',
          minWidth: 0,
          position: 'relative',
          zIndex: 1,
          transition: isDesktop ? 'padding-left 0.28s cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
        }}
        >
        {apiBase && adminApiToken ? (
          <div style={{
            marginBottom: mainPad,
            padding: 12,
            borderRadius: 14,
            background: 'white',
            border: '1px solid #bbf7d0',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, fontSize: 12, color: '#475569' }}>
              <span>
                API session:
                {' '}
                <strong style={{ color: '#1e293b' }}>{adminApiMeta?.email || 'admin'}</strong>
                {' '}
                — disputes from Postgres.
              </span>
              <button
                type="button"
                onClick={handleAdminApiLogout}
                style={{
                  marginLeft: 'auto',
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid #bbf7d0',
                  background: '#f0fdf4',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#14532d',
                }}
              >
                Log out
              </button>
            </div>
          </div>
        ) : null}

        {activeTab === 'vendors' && (
          <AdminVendorApprovalsPage
            isDesktop={isDesktop}
            vendors={vendors}
            getVendorEffectiveStatus={getVendorEffectiveStatus}
            setVendorStatus={setVendorStatus}
            clearVendorOverride={clearVendorOverride}
          />
        )}
        {activeTab === 'fleet' && (
          <AdminFleetPage
            isDesktop={isDesktop}
            riders={riders}
            addRider={addRider}
            toggleRiderActive={toggleRiderActive}
            removeRider={removeRider}
          />
        )}
        {activeTab === 'orders' && (
          <AdminOrdersPage
            isDesktop={isDesktop}
            liveOrders={liveOrders}
            vendors={vendors}
            riders={riders}
            assignRiderToOrder={assignRiderToOrder}
            getRiderById={getRiderById}
          />
        )}
        {activeTab === 'disputes' && (
          <AdminDisputesPage
            isDesktop={isDesktop}
            disputes={disputesForUi}
            apiMode={adminApiMode}
            apiBase={apiBase}
            apiToken={adminApiToken}
            listLoading={adminApiMode && adminDisputesLoading}
            listError={adminApiMode ? adminDisputesErr : ''}
            onRefresh={() => loadAdminDisputes(adminApiToken)}
          />
        )}
        {activeTab === 'products' && (
          <AdminProductsPage isDesktop={isDesktop} products={products} />
        )}
        {activeTab === 'chats' && (
          <AdminChatsPage isDesktop={isDesktop} />
        )}
        {activeTab === 'reports' && (
          <AdminReportsPage
            isDesktop={isDesktop}
            liveOrders={liveOrders}
            liveGmv={liveGmv}
            liveOrderCount={liveOrderCount}
            vendors={vendors}
          />
        )}

        {activeTab === 'dashboard' && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(4, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
              gap: isDesktop ? 20 : 12,
              marginBottom: 25,
            }}
            >
              <KPICard title="Vendors selling" value={String(approvedVendorCount)} symbol="storefront" trend="+20%" isPositive={true} compact={!isDesktop} />
              <KPICard title="GMV (demo ledger)" value={`KES ${liveGmv.toLocaleString()}`} symbol="payments" trend="+15%" isPositive={true} compact={!isDesktop} />
              <KPICard title="Orders (ledger)" value={String(liveOrderCount)} symbol="inventory_2" trend="+10%" isPositive={true} compact={!isDesktop} />
              <KPICard title="Active Chats" value="75" symbol="chat" trend="-5%" isPositive={false} compact={!isDesktop} />
            </div>

            {ledgerDataIssueOrderCount > 0 && (
              <div style={{
                marginBottom: 20,
                padding: 14,
                borderRadius: 14,
                background: '#fff7ed',
                border: '1px solid #fdba74',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
              >
                <span style={{ fontSize: 13, color: '#9a3412', fontWeight: 600 }}>
                  Ledger data quality: {ledgerDataIssueOrderCount} order row(s) have unknown vendor or missing region — reports may be skewed.
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  style={{
                    padding: '8px 14px',
                    borderRadius: 10,
                    border: 'none',
                    background: '#ea580c',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Open Reports
                </button>
              </div>
            )}

            {recentLive.length > 0 && (
              <div style={{ background: 'white', padding: 16, borderRadius: 16, marginBottom: 20, border: '1px solid #bbf7d0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: '#15803d', fontWeight: 700, fontSize: 14 }}>
                  <MaterialSymbol name="sync_alt" size={20} />
                  Live demo — new checkouts from client
                </div>
                <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                  {recentLive.map((o) => (
                    <li key={o.id}>{o.id} · {o.customerName} · {o.product} · KES {o.amount.toLocaleString()}</li>
                  ))}
                </ul>
              </div>
            )}

            <VendorSnapshotSection vendors={vendors} liveOrders={liveOrders} isDesktop={isDesktop} getVendorEffectiveStatus={getVendorEffectiveStatus} />

            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? '2fr 1fr' : '1fr',
              gap: 25,
            }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
                <div style={{ background: 'white', padding: isDesktop ? 25 : 18, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                    <h3 style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: 8, fontSize: isDesktop ? 16 : 14 }}>
                      <LayoutDashboard size={18} color="#16a34a" /> Platform Escrow & Commission
                    </h3>
                    <div style={{ display: 'flex', gap: 15 }}>
                      <span style={{ fontSize: 12, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }} /> GMV
                      </span>
                      <span style={{ fontSize: 12, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0f172a' }} /> Commission
                      </span>
                    </div>
                  </div>
                  <div style={{ height: chartH }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={escrowData} margin={{ top: 10, right: 0, left: isDesktop ? 0 : -12, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0f172a" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#0f172a" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} width={isDesktop ? undefined : 36} />
                        <Tooltip contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="gmv" stroke="#4ade80" fillOpacity={1} fill="url(#colorGmv)" />
                        <Area type="monotone" dataKey="commission" stroke="#0f172a" fillOpacity={1} fill="url(#colorComm)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isDesktop ? '1.5fr 1fr' : '1fr',
                  gap: 25,
                }}
                >
                  <div style={{ background: 'white', padding: isDesktop ? 25 : 18, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 20px', color: '#334155', fontSize: isDesktop ? 16 : 14 }}>Sales Performance</h3>
                    <div style={{ height: barH }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salesData} margin={{ top: 0, right: 0, left: isDesktop ? -20 : -28, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={isDesktop ? undefined : 28} />
                          <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                          <Bar dataKey="sales" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={isDesktop ? 24 : 18} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: isDesktop ? 25 : 18, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 20px', color: '#334155', display: 'flex', alignItems: 'center', gap: 8, fontSize: isDesktop ? 16 : 14 }}>
                      <MaterialSymbol name="star" size={22} filled style={{ color: '#ca8a04' }} />
                      Best Sellers
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                      <BestSellerItem name="Samsung A34 5G" sold="330 sold" price="KES 33,200" trend="+22%" />
                      <BestSellerItem name="Noise Cancelling HP" sold="124 sold" price="KES 3,500" trend="+12%" />
                      <BestSellerItem name="Apple Watch SE" sold="89 sold" price="KES 44,000" trend="+5%" />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 25 }}>
                <div style={{ background: 'white', padding: isDesktop ? 25 : 18, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0, color: '#334155', display: 'flex', alignItems: 'center', gap: 8, fontSize: isDesktop ? 16 : 14 }}>
                      <MessageSquare size={18} color="#16a34a" /> Chat Inbox
                    </h3>
                    <MoreHorizontal size={20} color="#94a3b8" />
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginBottom: 20, overflowX: 'auto', paddingBottom: 5 }}>
                    <span style={{ padding: '4px 12px', background: '#dcfce7', color: '#16a34a', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>New Lead</span>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#64748b', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>New Order</span>
                    <span style={{ padding: '4px 12px', background: '#f1f5f9', color: '#64748b', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>Inquiry</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                    <ChatItem name="David Kamau" msg="Is my order out for delivery?" time="0:05" alerts={7} />
                    <ChatItem name="Priscilla Onyango" msg="I'd like to buy a new smartphone." time="16:07" alerts={16} />
                    <ChatItem name="Yusuf Ali" msg="Hi! Do you sell Smart TVs?" time="April 10" alerts={50} />
                    <ChatItem name="John Mwangi" msg="What time is my delivery?" time="April 18" alerts={2} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 15 }}>
                  <div style={{ background: 'white', padding: 20, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 15px', color: '#334155', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <CheckSquare size={16} color="#16a34a" /> To-Do List
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#475569' }}>
                      <label style={{ display: 'flex', gap: 8, cursor: 'pointer' }}><input type="checkbox" /> Send order confirmations</label>
                      <label style={{ display: 'flex', gap: 8, cursor: 'pointer' }}><input type="checkbox" /> Check low stock products</label>
                      <label style={{ display: 'flex', gap: 8, cursor: 'pointer' }}><input type="checkbox" /> Review new leads</label>
                    </div>
                  </div>

                  <div style={{ background: 'white', padding: 20, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 15px', color: '#334155', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
                      <BarChart3 size={16} color="#16a34a" /> Stats Summary
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                      <div>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px', fontWeight: 'bold', color: '#1e293b', fontSize: 13 }}>1.5K</div>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Orders</span>
                      </div>
                      <div>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #2dd4bf', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 5px', fontWeight: 'bold', color: '#1e293b', fontSize: 13 }}>420</div>
                        <span style={{ fontSize: 11, color: '#64748b' }}>Chats</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      </div>

      {!isDesktop && (
        <nav style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '10px 8px calc(10px + env(safe-area-inset-bottom, 0px))',
          background: 'white',
          borderTop: '1px solid #bbf7d0',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
        }}
        >
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const reportBadge = id === 'reports' && ledgerDataIssueOrderCount > 0;
            const disputeBadge = id === 'disputes' && openDisputesCount > 0;
            const badgeCount = reportBadge ? ledgerDataIssueOrderCount : (disputeBadge ? openDisputesCount : 0);
            const showBadge = reportBadge || disputeBadge;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  padding: '6px 2px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  color: activeTab === id ? '#15803d' : '#94a3b8',
                  fontSize: 9,
                  fontWeight: activeTab === id ? 700 : 500,
                  maxWidth: 72,
                  position: 'relative',
                  minWidth: 0,
                }}
              >
                <span style={{ position: 'relative', display: 'flex' }}>
                  <Icon size={20} strokeWidth={activeTab === id ? 2.25 : 2} />
                  {showBadge && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -8,
                      background: id === 'disputes' ? '#f97316' : '#ea580c',
                      color: 'white',
                      fontSize: 8,
                      fontWeight: 800,
                      minWidth: 14,
                      height: 14,
                      borderRadius: 7,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                    }}
                    >
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  )}
                </span>
                {label}
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

function KPICard({ title, value, symbol, trend, isPositive, compact }) {
  return (
    <div style={{ background: 'white', padding: compact ? '14px 12px' : 20, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: compact ? 6 : 10 }}>
        <MaterialSymbol name={symbol} size={compact ? 20 : 26} style={{ color: '#64748b' }} />
        <span style={{ color: '#64748b', fontSize: compact ? 11 : 14, fontWeight: 600 }}>{title}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: compact ? 20 : 28, fontWeight: 700, color: '#1e293b', lineHeight: 1 }}>{value}</span>
        <span style={{ display: 'flex', alignItems: 'center', fontSize: 12, fontWeight: 600, color: isPositive ? '#16a34a' : '#ef4444' }}>
          {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {trend}
        </span>
      </div>
    </div>
  );
}

function ChatItem({ name, msg, time, alerts }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', flexShrink: 0, overflow: 'hidden' }}>
        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`} alt={name} style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, gap: 8 }}>
          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{name}</span>
          <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{time}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg}</p>
      </div>
      <div style={{ background: '#22c55e', color: 'white', fontSize: 11, fontWeight: 'bold', padding: '2px 6px', borderRadius: 10, flexShrink: 0 }}>
        {alerts}
      </div>
    </div>
  );
}

function BestSellerItem({ name, sold, price, trend }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #f1f5f9', paddingBottom: 10 }}>
      <div style={{ width: 40, height: 40, background: '#f1f5f9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <MaterialSymbol name="inventory_2" size={22} style={{ color: '#64748b' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: '#1e293b', fontSize: 13 }}>{name}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>Sold: {sold}</div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 600, color: '#16a34a', fontSize: 13 }}>{trend}</div>
        <div style={{ fontSize: 11, color: '#94a3b8' }}>{price}</div>
      </div>
    </div>
  );
}
