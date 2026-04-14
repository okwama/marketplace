import React, { useMemo, useState } from 'react';
import { Package, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import { categories, getListingFromPrice, productHasMultiplePrices } from '../../mockData';
import { MaterialSymbol } from '../MaterialSymbol';
import { VendorProductModal } from './VendorProductModal';

export function VendorProductsPage({
  isDesktop,
  vendor,
  products,
  addVendorProduct,
  updateVendorProduct,
  deleteVendorProduct,
  canVendorMutateProduct,
}) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [editingProduct, setEditingProduct] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (cat !== 'all' && p.category !== cat) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    });
  }, [products, query, cat]);

  const catLabel = (id) => categories.find((c) => c.id === id)?.label ?? id;

  const openAdd = () => {
    setEditingProduct(null);
    setModalMode('add');
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditingProduct(p);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleSave = (payload) => {
    if (modalMode === 'edit' && editingProduct) {
      updateVendorProduct(vendor.id, editingProduct.id, payload);
    } else {
      addVendorProduct(vendor, payload);
    }
  };

  const handleDelete = (p) => {
    if (!canVendorMutateProduct(p, vendor.id)) return;
    if (!window.confirm(`Remove “${p.name}” from your catalog? This cannot be undone in the demo.`)) return;
    deleteVendorProduct(vendor.id, p.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 16 }}>
      <div className="card" style={{ padding: isDesktop ? 22 : 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: '0 0 6px', color: 'var(--text-main)', fontSize: isDesktop ? 20 : 17, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Package size={22} color="var(--primary)" />
              Your catalog
            </h2>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
              Listings for <strong style={{ color: 'var(--text-main)' }}>{vendor.name}</strong>. New products appear in the client shop for this session.
            </p>
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={openAdd}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 18px', borderRadius: 12, fontWeight: 600, fontSize: 14, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={18} />
            Add product
          </button>
        </div>
      </div>

      <div
        className="card"
        style={{
          padding: isDesktop ? 18 : 14,
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
            placeholder="Search your products…"
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
              border: cat === 'all' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
              background: cat === 'all' ? 'rgba(255, 121, 0, 0.12)' : 'white',
              color: cat === 'all' ? 'var(--primary)' : 'var(--text-muted)',
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
                border: cat === c.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: cat === c.id ? 'rgba(255, 121, 0, 0.12)' : 'white',
                color: cat === c.id ? 'var(--primary)' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: cat === c.id ? 600 : 500,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              <MaterialSymbol name={c.materialSymbol} size={18} style={{ color: cat === c.id ? 'var(--primary)' : '#94a3b8' }} />
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {isDesktop ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: 'var(--text-muted)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SKUs</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Source</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }} />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const mutable = canVendorMutateProduct(p, vendor.id);
                const skuCount = p.variants?.length ? p.variants.length : 1;
                return (
                  <tr key={p.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)' }}>{p.name}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{catLabel(p.category)}</td>
                    <td style={{ padding: '14px 16px', color: 'var(--text-main)' }}>{skuCount}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--primary)' }}>
                      {productHasMultiplePrices(p) ? `From KES ${getListingFromPrice(p).toLocaleString()}` : `KES ${p.price.toLocaleString()}`}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                          display: 'inline-block',
                          padding: '4px 10px',
                          borderRadius: 999,
                          fontSize: 11,
                          fontWeight: 600,
                          background: p.inStock ? '#ecfdf5' : '#fee2e2',
                          color: p.inStock ? 'var(--secondary)' : '#b91c1c',
                        }}
                      >
                        {p.inStock ? 'In stock' : 'Out of stock'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: mutable ? 'var(--primary)' : 'var(--text-muted)' }}>
                        {mutable ? 'Your listing' : 'Demo seed'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {mutable ? (
                          <>
                            <button
                              type="button"
                              onClick={() => openEdit(p)}
                              style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Pencil size={14} /> Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(p)}
                              style={{ fontSize: 12, fontWeight: 600, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Read-only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {filtered.map((p) => {
              const mutable = canVendorMutateProduct(p, vendor.id);
              const skuCount = p.variants?.length ? p.variants.length : 1;
              return (
                <li key={p.id} style={{ padding: 16, borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{catLabel(p.category)} · {skuCount} SKU{skuCount === 1 ? '' : 's'}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {productHasMultiplePrices(p) ? `From KES ${getListingFromPrice(p).toLocaleString()}` : `KES ${p.price.toLocaleString()}`}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: p.inStock ? 'var(--secondary)' : '#b91c1c' }}>{p.inStock ? 'In stock' : 'Out'}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: mutable ? 'var(--primary)' : 'var(--text-muted)', marginBottom: 8 }}>
                    {mutable ? 'Your listing' : 'Demo seed · read-only'}
                  </div>
                  {mutable && (
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="button" className="btn-primary" style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => openEdit(p)}>
                        <Pencil size={16} /> Edit
                      </button>
                      <button type="button" style={{ flex: 1, padding: 10, borderRadius: 10, fontSize: 13, fontWeight: 600, border: '1px solid var(--border-color)', background: 'white', color: 'var(--danger)', cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} onClick={() => handleDelete(p)}>
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>No products match your filters.</div>
        )}
      </div>

      {modalOpen && (
        <VendorProductModal
          key={`${modalMode}-${editingProduct?.id ?? 'new'}`}
          mode={modalMode}
          vendor={vendor}
          initialProduct={editingProduct}
          onClose={() => { setModalOpen(false); setEditingProduct(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
