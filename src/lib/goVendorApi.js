const TOKEN_KEY = 'mp-go-vendor-token';

export function getApiBase() {
  const v = import.meta.env.VITE_API_URL;
  return typeof v === 'string' && v.trim() ? v.replace(/\/$/, '') : '';
}

export function getStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export async function vendorLogin(base, email, password) {
  const res = await fetch(`${base}/v1/auth/vendor/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = data?.error || data?.message || text || res.statusText;
    throw new Error(typeof msg === 'string' ? msg : 'Login failed');
  }
  return data;
}

export async function fetchVendorMe(base, token) {
  const res = await fetch(`${base}/v1/vendor/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data?.error || text || res.statusText);
  }
  return data;
}

export async function fetchVendorOrders(base, token) {
  const res = await fetch(`${base}/v1/vendor/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data?.error || text || res.statusText);
  }
  return data.orders || [];
}

export async function fetchVendorProducts(base, token) {
  const res = await fetch(`${base}/v1/vendor/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data?.error || text || res.statusText);
  }
  return data.products || [];
}

export async function fetchVendorImagekitAuth(base, token) {
  const res = await fetch(`${base}/v1/vendor/imagekit/auth`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data?.error || text || res.statusText);
  }
  return data;
}

export async function updateVendorProductImage(base, token, productId, imageUrl) {
  const res = await fetch(`${base}/v1/vendor/products/${encodeURIComponent(productId)}/image-url`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ imageUrl }),
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data?.error || text || res.statusText);
  }
  return data;
}

export async function uploadImageToImageKit(base, token, file, vendorId) {
  if (!(file instanceof File)) {
    throw new Error('Select an image file first');
  }
  const auth = await fetchVendorImagekitAuth(base, token);
  const uploadURL = 'https://upload.imagekit.io/api/v1/files/upload';
  const form = new FormData();
  form.append('file', file);
  form.append('fileName', `${Date.now()}-${file.name || 'product-image'}`);
  form.append('useUniqueFileName', 'true');
  form.append('folder', `/marketplace/vendors/${vendorId}`);
  form.append('publicKey', auth.publicKey);
  form.append('token', auth.token);
  form.append('expire', String(auth.expire));
  form.append('signature', auth.signature);
  const res = await fetch(uploadURL, {
    method: 'POST',
    body: form,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {};
  }
  if (!res.ok) {
    throw new Error(data?.message || text || res.statusText);
  }
  const uploadedURL = data?.url || data?.thumbnailUrl || '';
  if (!uploadedURL) {
    throw new Error('Image upload succeeded but no URL was returned');
  }
  return uploadedURL;
}

/** Map Go API order row to MarketplaceDemoContext order shape. */
export function mapApiOrderToDemo(o) {
  const amount = Math.round(Number(o.totalCents || 0) / 100);
  const commission = Math.round(Number(o.commissionCents || 0) / 100);
  let status = o.status || 'draft';
  if (status === 'pending_payment') status = 'confirmed';
  return {
    id: `go-${o.id}`,
    customerId: o.customerPhone || String(o.customerId ?? ''),
    customerName: o.customerPhone || 'Customer',
    vendorId: Number(o.vendorId),
    product: `Order #${o.id} (${o.escrowState || '—'})`,
    amount,
    commission,
    netVendor: Math.max(0, amount - commission),
    status,
    riderId: o.riderId != null ? String(o.riderId) : null,
    otp: '',
  };
}

/** Map Go API product row to existing demo product shape used by Vendor UI. */
export function mapApiProductToDemo(p, vendorName = 'Vendor') {
  return {
    id: Number(p.id),
    name: p.name || `Product #${p.id}`,
    vendor: vendorName,
    vendorId: Number(p.vendorId),
    price: Math.round(Number(p.priceCents || 0) / 100),
    originalPrice: null,
    category: 'electronics',
    image: p.imageUrl || '',
    rating: 0,
    reviews: 0,
    badge: null,
    description: 'Live product from database.',
    inStock: p.inStock !== false,
    variants: [],
  };
}
