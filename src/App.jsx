import React, { useEffect, useRef, useCallback, useLayoutEffect, useMemo } from 'react';
import {
  useSearchParams,
  useNavigate,
  useLocation,
  Routes,
  Route,
  Outlet,
  Navigate,
  useOutletContext,
} from 'react-router-dom';
import { CustomerView } from './components/CustomerView';
import { VendorView } from './components/VendorView';
import { AdminView } from './components/AdminView';
import { RiderView } from './components/RiderView';
import { DemoSessionBanner } from './components/DemoSessionBanner';
import { VendorPortalGuard, AdminPortalGuard } from './components/portal/PortalGuards';
import { VendorLoginPage } from './pages/VendorLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { Store, Shield, Bike, Smartphone, Monitor, SlidersHorizontal, ChevronDown, ShoppingBag } from 'lucide-react';
import './App.css';

/** Match `isDesktop` breakpoints in views (~900px). */
const DESKTOP_MQ = '(min-width: 900px)';

const PERSONA_PATHS = {
  customer: '/',
  vendor: '/vendor',
  admin: '/admin',
  rider: '/rider',
};

function layoutFromViewport() {
  if (typeof window === 'undefined') return 'mobile';
  return window.matchMedia(DESKTOP_MQ).matches ? 'desktop' : 'mobile';
}

/** Migrate bookmarks using ?persona= to path-based routes. */
function LegacyPersonaRedirect() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    const persona = searchParams.get('persona');
    if (!persona) return;
    const next = new URLSearchParams(searchParams);
    next.delete('persona');
    const tail = next.toString();
    const suffix = tail ? `?${tail}` : '';
    const target = PERSONA_PATHS[persona];
    if (!target) {
      navigate(`/${suffix}`, { replace: true });
      return;
    }
    const withLogin = persona === 'vendor' || persona === 'admin'
      ? `${target}/login`
      : target;
    navigate(`${withLogin}${suffix}`, { replace: true });
  }, [searchParams, navigate]);

  return null;
}

function StorefrontPage() {
  const { layoutMode } = useOutletContext();
  return <CustomerView layoutMode={layoutMode} />;
}

function VendorSectionOutlet() {
  const { layoutMode } = useOutletContext();
  return <Outlet context={{ layoutMode }} />;
}

function AdminSectionOutlet() {
  const { layoutMode } = useOutletContext();
  return <Outlet context={{ layoutMode }} />;
}

function RiderPage() {
  const { layoutMode } = useOutletContext();
  return <RiderView layoutMode={layoutMode} />;
}

function VendorPortalPage() {
  const { layoutMode } = useOutletContext();
  return (
    <VendorPortalGuard>
      <VendorView layoutMode={layoutMode} />
    </VendorPortalGuard>
  );
}

function AdminPortalPage() {
  const { layoutMode } = useOutletContext();
  return (
    <AdminPortalGuard>
      <AdminView layoutMode={layoutMode} />
    </AdminPortalGuard>
  );
}

function DemoLayout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const layoutUserPicked = useRef(false);
  const [demoPanelOpen, setDemoPanelOpen] = React.useState(true);

  const layoutParam = searchParams.get('layout');
  const layoutMode = layoutParam === 'desktop' || layoutParam === 'mobile'
    ? layoutParam
    : layoutFromViewport();

  const persona = useMemo(() => {
    const p = location.pathname;
    if (p.startsWith('/vendor')) return 'vendor';
    if (p.startsWith('/admin')) return 'admin';
    if (p.startsWith('/rider')) return 'rider';
    return 'customer';
  }, [location.pathname]);

  useEffect(() => {
    const l = searchParams.get('layout');
    if (l === 'desktop' || l === 'mobile') return;
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev);
      n.set('layout', layoutFromViewport());
      return n;
    }, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const onChange = () => {
      if (!layoutUserPicked.current) {
        setSearchParams((prev) => {
          const n = new URLSearchParams(prev);
          n.set('layout', mq.matches ? 'desktop' : 'mobile');
          return n;
        }, { replace: true });
      }
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [setSearchParams]);

  const pickLayoutMode = useCallback((mode) => {
    layoutUserPicked.current = true;
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev);
      n.set('layout', mode);
      return n;
    }, { replace: true });
  }, [setSearchParams]);

  const pickPersona = useCallback((next) => {
    const params = new URLSearchParams(searchParams);
    params.delete('persona');
    if (next !== 'admin') params.delete('adminTab');
    if (next !== 'vendor') params.delete('vendorTab');
    if (next !== 'rider') params.delete('riderTab');
    const tail = params.toString();
    const base = PERSONA_PATHS[next] || '/';
    const pathname = (next === 'vendor' || next === 'admin') ? `${base}/login` : base;
    navigate({
      pathname,
      search: tail ? `?${tail}` : '',
    }, { replace: true });
  }, [navigate, searchParams]);

  return (
    <div className="app-preview-root">
      <LegacyPersonaRedirect />
      <div className="demo-controls-stack">
        {demoPanelOpen ? (
          <>
            <div className="demo-floating-panel">
              <div className="demo-floating-panel-header">
                <span className="demo-floating-panel-label">Demo</span>
              </div>
              <p className="demo-panel-section-title">Portal</p>
              <div className="demo-toggle-row">
                <button
                  type="button"
                  className={`demo-btn ${persona === 'customer' ? 'demo-btn--active' : ''}`}
                  onClick={() => pickPersona('customer')}
                >
                  <ShoppingBag size={16} /> Storefront
                </button>
                <button
                  type="button"
                  className={`demo-btn ${persona === 'vendor' ? 'demo-btn--active' : ''}`}
                  onClick={() => pickPersona('vendor')}
                >
                  <Store size={16} /> Vendor
                </button>
                <button
                  type="button"
                  className={`demo-btn ${persona === 'admin' ? 'demo-btn--active' : ''}`}
                  onClick={() => pickPersona('admin')}
                >
                  <Shield size={16} /> Admin
                </button>
                <button
                  type="button"
                  className={`demo-btn ${persona === 'rider' ? 'demo-btn--active' : ''}`}
                  onClick={() => pickPersona('rider')}
                >
                  <Bike size={16} /> Rider
                </button>
              </div>

              <p className="demo-panel-section-title">Preview</p>
              <div className="demo-toggle-row demo-toggle-row--horizontal">
                <button
                  type="button"
                  className={`demo-btn ${layoutMode === 'mobile' ? 'demo-btn--active' : ''}`}
                  onClick={() => pickLayoutMode('mobile')}
                >
                  <Smartphone size={16} /> Mobile
                </button>
                <button
                  type="button"
                  className={`demo-btn ${layoutMode === 'desktop' ? 'demo-btn--active' : ''}`}
                  onClick={() => pickLayoutMode('desktop')}
                >
                  <Monitor size={16} /> Desktop
                </button>
              </div>
            </div>
            <button
              type="button"
              className="demo-panel-collapse-fab"
              onClick={() => setDemoPanelOpen(false)}
              aria-label="Hide demo controls"
            >
              <ChevronDown size={20} strokeWidth={2.25} />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="demo-floating-panel-reopen"
            onClick={() => setDemoPanelOpen(true)}
            aria-label="Show demo controls"
          >
            <SlidersHorizontal size={20} />
          </button>
        )}
      </div>

      <div className="preview-shell">
        <DemoSessionBanner />
        <div className="preview-shell-main">
          <Outlet context={{ layoutMode }} />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<DemoLayout />}>
        <Route index element={<StorefrontPage />} />
        <Route path="vendor" element={<VendorSectionOutlet />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<VendorLoginPage />} />
          <Route path="portal" element={<VendorPortalPage />} />
        </Route>
        <Route path="admin" element={<AdminSectionOutlet />}>
          <Route index element={<Navigate to="login" replace />} />
          <Route path="login" element={<AdminLoginPage />} />
          <Route path="portal" element={<AdminPortalPage />} />
        </Route>
        <Route path="rider" element={<RiderPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
