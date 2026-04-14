import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { categories, getListingFromPrice, productHasMultiplePrices } from '../../mockData';
import { MaterialSymbol } from '../MaterialSymbol';

export function AdminProductsPage({ isDesktop, products }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q)
        || p.vendor.toLowerCase().includes(q)
        || p.category.toLowerCase().includes(q)
      );
    });
  }, [products, query, cat]);

  const catLabel = (id) => categories.find((c) => c.id === id)?.label ?? id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 16 }}>
      <div style={{ background: 'white', padding: isDesktop ? 22 : 16, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: isDesktop ? 20 : 17 }}>Catalog oversight</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>
          Cross-vendor listings, pricing, and visibility. Full moderation tools would ship in production.
        </p>
      </div>

      <div style={{
        background: 'white',
        padding: isDesktop ? 18 : 14,
        borderRadius: 16,
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
        display: 'flex',
        flexDirection: isDesktop ? 'row' : 'column',
        gap: 12,
        alignItems: isDesktop ? 'center' : 'stretch',
        flexWrap: 'wrap',
      }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', padding: '10px 14px', borderRadius: 10, flex: isDesktop ? '1 1 240px' : 'none', minWidth: 0 }}>
          <Search size={18} color="#94a3b8" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, vendor, category…"
            style={{ border: 'none', background: 'transparent', flex: 1, minWidth: 0, fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setCat('all')}
            style={{
              padding: '8px 12px',
              borderRadius: 999,
              border: cat === 'all' ? '1px solid #16a34a' : '1px solid #e2e8f0',
              background: cat === 'all' ? '#dcfce7' : 'white',
              color: cat === 'all' ? '#15803d' : '#64748b',
              fontSize: 12,
              fontWeight: cat === 'all' ? 600 : 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            All categories
          </button>
          {categories.filter((c) => c.id !== 'all').map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 999,
                border: cat === c.id ? '1px solid #16a34a' : '1px solid #e2e8f0',
                background: cat === c.id ? '#dcfce7' : 'white',
                color: cat === c.id ? '#15803d' : '#64748b',
                fontSize: 12,
                fontWeight: cat === c.id ? 600 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <MaterialSymbol name={c.materialSymbol} size={18} style={{ color: cat === c.id ? '#15803d' : '#94a3b8' }} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {isDesktop ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vendor</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Variants</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1e293b' }}>{p.name}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{p.vendor}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{catLabel(p.category)}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{p.variants?.length ?? 1}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#15803d' }}>
                    {productHasMultiplePrices(p) && <span style={{ fontSize: 11, fontWeight: 500, color: '#94a3b8' }}>From </span>}
                    KES {getListingFromPrice(p).toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      background: p.inStock ? '#dcfce7' : '#fee2e2',
                      color: p.inStock ? '#15803d' : '#b91c1c',
                    }}
                    >
                      {p.inStock ? 'Live' : 'Hidden'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {filtered.map((p) => (
              <li key={p.id} style={{ padding: 16, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{p.vendor} · {catLabel(p.category)}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{p.variants?.length ?? 1} variant{(p.variants?.length ?? 1) === 1 ? '' : 's'}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, color: '#15803d' }}>
                    {productHasMultiplePrices(p) ? `From KES ${getListingFromPrice(p).toLocaleString()}` : `KES ${p.price.toLocaleString()}`}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: p.inStock ? '#15803d' : '#b91c1c' }}>{p.inStock ? 'Live' : 'Hidden'}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>No products match your filters.</div>
        )}
      </div>
    </div>
  );
}
