import React, { useState } from 'react';
import { X } from 'lucide-react';
import { categories } from '../../mockData';
import samsungImg from '../../assets/samsung.jpg';
import jblImg from '../../assets/jbl.jpg';
import masaaiImg from '../../assets/masaai.jpg';
import jogooImg from '../../assets/jogoo.jpg';
import budsImg from '../../assets/buds.jpg';
import kitengeImg from '../../assets/kitenge.jpg';

const IMAGE_PRESETS = [
  { id: 'samsung', label: 'Phone / tech', src: samsungImg },
  { id: 'jbl', label: 'Speaker', src: jblImg },
  { id: 'masaai', label: 'Fashion craft', src: masaaiImg },
  { id: 'jogoo', label: 'Grocery', src: jogooImg },
  { id: 'buds', label: 'Accessories', src: budsImg },
  { id: 'kitenge', label: 'Apparel', src: kitengeImg },
];

const categoryOptions = categories.filter((c) => c.id !== 'all');

function emptyForm() {
  return {
    name: '',
    category: categoryOptions[0]?.id ?? 'electronics',
    price: '',
    originalPrice: '',
    description: '',
    badge: '',
    inStock: true,
    imageKey: 'buds',
  };
}

function buildInitialForm(mode, initialProduct) {
  if (mode === 'edit' && initialProduct) {
    const matchPreset = IMAGE_PRESETS.find((p) => p.src === initialProduct.image);
    return {
      name: initialProduct.name ?? '',
      category: initialProduct.category ?? 'electronics',
      price: String(initialProduct.price ?? ''),
      originalPrice: initialProduct.originalPrice != null ? String(initialProduct.originalPrice) : '',
      description: initialProduct.description ?? '',
      badge: initialProduct.badge ?? '',
      inStock: initialProduct.inStock !== false,
      imageKey: matchPreset?.id ?? 'buds',
    };
  }
  return emptyForm();
}

export function VendorProductModal({
  mode,
  vendor,
  initialProduct,
  onClose,
  onSave,
  enableImageUpload = false,
}) {
  const [form, setForm] = useState(() => buildInitialForm(mode, initialProduct));
  const [imageFile, setImageFile] = useState(null);
  const [imageURL, setImageURL] = useState(initialProduct?.image || '');
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const preset = IMAGE_PRESETS.find((p) => p.id === form.imageKey) || IMAGE_PRESETS[4];
    try {
      const result = await onSave({
        name: form.name,
        category: form.category,
        price: form.price,
        originalPrice: form.originalPrice.trim() === '' ? null : form.originalPrice,
        description: form.description,
        badge: form.badge.trim() === '' ? null : form.badge,
        inStock: form.inStock,
        image: enableImageUpload ? (imageURL.trim() || initialProduct?.image || '') : preset.src,
        imageFile,
      });
      if (result !== false) {
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="vendor-product-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        padding: 0,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: 'var(--surface-color)',
          width: '100%',
          maxWidth: 520,
          maxHeight: '92vh',
          overflow: 'auto',
          borderRadius: '16px 16px 0 0',
          boxShadow: 'var(--shadow-md)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 18px', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, background: 'var(--surface-color)', zIndex: 1 }}>
          <h2 id="vendor-product-modal-title" style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>
            {mode === 'edit' ? 'Edit listing' : 'New listing'}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose} style={{ padding: 8, border: 'none', background: '#f1f5f9', borderRadius: 10, cursor: 'pointer', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 }}>
            Listing as <strong style={{ color: 'var(--text-main)' }}>{vendor?.name}</strong>.
            {' '}
            {enableImageUpload ? 'Image uploads go to ImageKit and save to Postgres.' : 'Demo only — stored in this browser session.'}
          </p>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
            Product name
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Organic honey 500g"
              style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
            Category
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit' }}
            >
              {categoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              Price (KES)
              <input
                required
                inputMode="decimal"
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="1999"
                style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              Compare at (optional)
              <input
                inputMode="decimal"
                value={form.originalPrice}
                onChange={(e) => set('originalPrice', e.target.value)}
                placeholder="2499"
                style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit' }}
              />
            </label>
          </div>

          {enableImageUpload ? (
            <fieldset style={{ margin: 0, padding: 0, border: 'none', display: 'grid', gap: 10 }}>
              <legend style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Listing image (ImageKit)</legend>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                Upload image file
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 14, fontFamily: 'inherit', background: 'white' }}
                />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
                Or paste image URL
                <input
                  type="url"
                  value={imageURL}
                  onChange={(e) => setImageURL(e.target.value)}
                  placeholder="https://ik.imagekit.io/..."
                  style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit' }}
                />
              </label>
            </fieldset>
          ) : (
            <fieldset style={{ margin: 0, padding: 0, border: 'none' }}>
              <legend style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>Listing image (preset)</legend>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {IMAGE_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => set('imageKey', p.id)}
                    style={{
                      padding: 8,
                      borderRadius: 10,
                      border: form.imageKey === p.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      background: form.imageKey === p.id ? 'rgba(255, 121, 0, 0.08)' : 'white',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 11,
                      width: 76,
                      textAlign: 'center',
                    }}
                  >
                    <img src={p.src} alt="" style={{ width: 56, height: 56, objectFit: 'contain', display: 'block', margin: '0 auto 4px' }} />
                    {p.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
            Badge (optional)
            <input
              value={form.badge}
              onChange={(e) => set('badge', e.target.value)}
              placeholder="e.g. New"
              style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
            Description
            <textarea
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              rows={3}
              placeholder="What buyers should know…"
              style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit', resize: 'vertical' }}
            />
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.inStock} onChange={(e) => set('inStock', e.target.checked)} />
            In stock
          </label>

          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" disabled={submitting} onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 12, border: '1px solid var(--border-color)', background: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ flex: 1, padding: 14, borderRadius: 12, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Saving...' : (mode === 'edit' ? 'Save changes' : 'Publish listing')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
