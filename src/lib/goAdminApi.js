const TOKEN_KEY = 'mp-go-admin-token';

export function getApiBase() {
  const v = import.meta.env.VITE_API_URL;
  return typeof v === 'string' && v.trim() ? v.replace(/\/$/, '') : '';
}

export function getStoredAdminToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredAdminToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function adminLogin(base, email, password) {
  const res = await fetch(`${base}/v1/auth/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data?.message || text || res.statusText || 'Login failed');
  }
  return data;
}

export async function fetchAdminDisputes(base, token) {
  const res = await fetch(`${base}/v1/admin/disputes`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) throw new Error(data?.error || text || res.statusText);
  return data.disputes || [];
}

export async function patchDispute(base, token, id, body) {
  const res = await fetch(`${base}/v1/admin/disputes/${id}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try {
      const j = JSON.parse(text);
      msg = j?.message || j?.error || text;
    } catch {
      /* use text */
    }
    throw new Error(msg || res.statusText);
  }
  return text ? JSON.parse(text) : {};
}

/** Map API dispute row to AdminDisputesPage shape. */
export function mapApiDisputeToUi(d) {
  return {
    id: `go-${d.id}`,
    orderId: d.orderId,
    raisedBy: d.raisedBy || 'customer',
    vendor: d.vendor || '—',
    amount: Number(d.amount) || 0,
    status: d.status,
    date: d.date || '',
    reason: d.reason || '—',
    resolutionNotes: d.resolutionNotes || '',
    _apiId: d.id,
  };
}
