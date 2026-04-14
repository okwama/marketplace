import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { Store, LogIn } from 'lucide-react';
import * as goVendorApi from '../lib/goVendorApi';
import { DEMO_VENDOR_EMAIL, DEMO_VENDOR_PASSWORD } from '../constants/demoCredentials';

export function VendorLoginPage() {
  const { layoutMode } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = layoutMode === 'desktop';
  const apiBase = useMemo(() => goVendorApi.getApiBase(), []);

  const [email, setEmail] = useState(DEMO_VENDOR_EMAIL);
  const [password, setPassword] = useState(DEMO_VENDOR_PASSWORD);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const goPortal = useCallback(() => {
    navigate({ pathname: '/vendor/portal', search: location.search }, { replace: false });
  }, [navigate, location.search]);

  useEffect(() => {
    if (!apiBase) return;
    const t = goVendorApi.getStoredToken();
    if (t) goPortal();
  }, [apiBase, goPortal]);

  const applyDemoCredentials = () => {
    setEmail(DEMO_VENDOR_EMAIL);
    setPassword(DEMO_VENDOR_PASSWORD);
    setErr('');
  };

  const handleSignIn = async () => {
    if (!apiBase) return;
    setErr('');
    setBusy(true);
    try {
      const data = await goVendorApi.vendorLogin(apiBase, email, password);
      const tok = data.token;
      if (!tok) throw new Error('No token');
      goVendorApi.setStoredToken(tok);
      goPortal();
    } catch (e) {
      setErr(e?.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  };

  const pad = isDesktop ? 40 : 24;

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: pad,
        background: 'linear-gradient(165deg, #f8fafc 0%, #e0f2fe 45%, #f0fdf4 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(15,23, 42, 0.08)',
          border: '1px solid #e2e8f0',
          padding: isDesktop ? 32 : 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ background: '#fff7ed', padding: 10, borderRadius: 12, display: 'flex' }}>
            <Store size={24} color="#ea580c" />
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: isDesktop ? 22 : 18, fontWeight: 700, color: '#0f172a' }}>Vendor Portal</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Sign in to manage your shop</p>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#64748b', margin: '16px 0 12px', lineHeight: 1.5 }}>
          Demo fields are pre-filled. Use <strong>Sign in with API</strong> when <code style={{ fontSize: 11 }}>VITE_API_URL</code> points at your Go server, or continue with local demo data.
        </p>

        <button
          type="button"
          onClick={applyDemoCredentials}
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: '#0f766e',
            background: '#ccfbf1',
            border: '1px solid #99f6e4',
            borderRadius: 8,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Reset demo email &amp; password
        </button>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 12 }}>
          Email
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 400,
            }}
          />
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 16 }}>
          Password
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="current-password"
            style={{
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #cbd5e1',
              fontFamily: 'inherit',
              fontSize: 14,
              fontWeight: 400,
            }}
          />
        </label>

        {err ? (
          <div style={{ fontSize: 13, color: '#b91c1c', marginBottom: 12 }}>{err}</div>
        ) : null}

        {apiBase ? (
          <button
            type="button"
            disabled={busy}
            onClick={handleSignIn}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#ea580c',
              color: 'white',
              fontWeight: 700,
              fontSize: 14,
              cursor: busy ? 'wait' : 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <LogIn size={18} />
            {busy ? 'Signing in…' : 'Sign in with API'}
          </button>
        ) : null}

        <button
          type="button"
          onClick={goPortal}
          style={{
            width: '100%',
            marginTop: apiBase ? 10 : 0,
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #cbd5e1',
            background: 'white',
            color: '#475569',
            fontWeight: 600,
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Continue with demo data (no API)
        </button>

        {!apiBase ? (
          <p style={{ margin: '14px 0 0', fontSize: 11, color: '#94a3b8' }}>
            Set <code>VITE_API_URL</code> to enable live Postgres orders after sign-in.
          </p>
        ) : null}
      </div>
    </div>
  );
}
