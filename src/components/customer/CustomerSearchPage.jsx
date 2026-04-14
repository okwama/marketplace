import React, { useMemo, useState } from 'react';
import { Search, Star } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { getListingFromPrice, productHasMultiplePrices } from '../../mockData';

export function CustomerSearchPage({
  isDesktop, pagePad, products, openProduct, addToCart, productGridCols,
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q)
        || p.vendor.toLowerCase().includes(q)
        || p.category.toLowerCase().includes(q),
    );
  }, [products, query]);

  return (
    <Motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div style={{ padding: pagePad, paddingBottom: 12 }}>
        <h2 style={{ fontSize: isDesktop ? 18 : 16, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)' }}>Search</h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45 }}>
          Find products and sellers on the marketplace. Live search is demo-only (no server).
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f1f5f9', padding: isDesktop ? '14px 18px' : '12px 15px', borderRadius: 12 }}>
          <Search size={20} color="var(--text-muted)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a product, brand, or vendor…"
            autoFocus
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: 15, fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)' }}>
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
          {query.trim() ? ` for “${query.trim()}”` : ''}
        </div>
      </div>

      <div style={{ padding: pagePad, paddingTop: 0, display: 'grid', gridTemplateColumns: productGridCols, gap: isDesktop ? 20 : 15 }}>
        {filtered.map((product) => (
          <div key={product.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <button
              type="button"
              onClick={() => openProduct(product)}
              style={{
                border: 'none', padding: 0, margin: 0, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', background: 'transparent', display: 'block', width: '100%',
              }}
            >
              <div style={{ position: 'relative', height: isDesktop ? 160 : 130, background: '#f8fafc', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={product.image} alt="" style={{ maxHeight: isDesktop ? 130 : 105, objectFit: 'contain' }} />
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                  <Star size={12} color="var(--warning)" fill="var(--warning)" />
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{product.rating}</span>
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 600, margin: '0 0 4px', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{product.vendor}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                  {productHasMultiplePrices(product) && <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>From </span>}
                  KES {getListingFromPrice(product).toLocaleString()}
                </div>
                {product.variants?.length > 1 && (
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>{product.variants.length} options</div>
                )}
              </div>
            </button>
            <div style={{ padding: '0 12px 12px' }}>
              <button
                type="button"
                onClick={() => addToCart(product, 1)}
                style={{ width: '100%', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Add to cart
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ padding: `24px ${pagePad} 40px`, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          No matches. Try another keyword or browse categories from Shop.
        </div>
      )}
    </Motion.div>
  );
}
