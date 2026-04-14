import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { Shield, LogIn } from 'lucide-react';
import * as goAdminApi from '../lib/goAdminApi';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../constants/demoCredentials';

export function AdminLoginPage() {
  const { layoutMode } = useOutletContext();
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = layoutMode === 'desktop';
  const apiBase = useMemo(() => goAdminApi.getApiBase(), []);

  const [email, setEmail] = useState(DEMO_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEMO_ADMIN_PASSWORD);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const goPortal = useCallback(() => {
    navigate({ pathname: '/admin/portal', search: location.search }, { replace: false });
  }, [navigate, location.search]);

  useEffect(() => {
    if (!apiBase) return;
    const t = goAdminApi.getStoredAdminToken();
    if (t) goPortal();
  }, [apiBase, goPortal]);

  const applyDemoCredentials = () => {
    setEmail(DEMO_ADMIN_EMAIL);
    setPassword(DEMO_ADMIN_PASSWORD);
    setErr('');
  };

  const handleSignIn = async () => {
    if (!apiBase) return;
    setErr('');
    setBusy(true);
    try {
      const data = await goAdminApi.adminLogin(apiBase, email, password);
      const tok = data.token;
      if (!tok) throw new Error('No token');
      goAdminApi.setStoredAdminToken(tok);
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
        background: 'linear-gradient(165deg, #f0fdf4 0%, #ecfdf5 40%, #f8fafc 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'white',
          borderRadius: 16,
          boxShadow: '0 10px 40px rgba(20, 83, 45, 0.12)',
          border: '1px solid #bbf7d0',
          padding: isDesktop ? 32 : 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ background: '#14532d', padding: 10, borderRadius: 12, display: 'flex' }}>
            <Shield size={24} color="#86efac" />
          </span>
          <div>
            <h1 style={{ margin: 0, fontSize: isDesktop ? 22 : 18, fontWeight: 700, color: '#14532d' }}>Admin Dashboard</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Platform operator sign-in</p>
          </div>
        </div>

        <p style={{ fontSize: 12, color: '#64748b', margin: '16px 0 12px', lineHeight: 1.5 }}>
          Demo credentials are pre-filled. Sign in with the API for live disputes and audit data, or open the dashboard with mock data only.
        </p>

        <button
          type="button"
          onClick={applyDemoCredentials}
          style={{
            marginBottom: 16,
            padding: '8px 12px',
            fontSize: 12,
            fontWeight: 600,
            color: '#14532d',
            background: '#dcfce7',
            border: '1px solid #86efac',
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
              background: '#15803d',
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
            border: '1px solid #bbf7d0',
            background: '#f0fdf4',
            color: '#14532d',
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
            Set <code>VITE_API_URL</code> for Postgres-backed admin features.
          </p>
        ) : null}
      </div>
    </div>
  );
}
