import React, { useState, useCallback } from 'react';
import {
  Star, Share2, Store, Truck, ShieldCheck, Heart, ChevronRight,
} from 'lucide-react';
import {
  categories,
  getDefaultVariant,
  getListingFromPrice,
  productHasMultiplePrices,
} from '../../mockData';
import { motion as Motion } from 'framer-motion';
import { DELIVERY_FEE } from './constants';

export function ProductDetailSection({
  selectedProduct,
  detailQty,
  setDetailQty,
  addToCart,
  setCheckoutPhase,
  setViewState,
  pagePad,
  isDesktop,
  selectedVariantId = null,
  onVariantIdChange,
  wishlist = [],
  toggleWishlist,
  relatedProducts = [],
  openProduct,
}) {
  const [shareNote, setShareNote] = useState('');

  const handleShare = useCallback(async () => {
    if (!selectedProduct) return;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: selectedProduct.name,
          text: selectedProduct.description,
          url,
        });
        return;
      }
    } catch (e) {
      if (e?.name === 'AbortError') return;
    }
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareNote('Link copied');
        window.setTimeout(() => setShareNote(''), 2200);
        return;
      }
    } catch {
      /* fall through */
    }
    setShareNote('Copy the URL from your browser');
    window.setTimeout(() => setShareNote(''), 2200);
  }, [selectedProduct]);

  if (!selectedProduct) return null;

  const p = selectedProduct;

  const variantList = p.variants?.length ? p.variants : [getDefaultVariant(p)];
  const defaultId = (variantList.find((v) => v.inStock) || variantList[0]).id;
  const effectiveId = (selectedVariantId && variantList.some((v) => v.id === selectedVariantId))
    ? selectedVariantId
    : defaultId;
  const sel = variantList.find((v) => v.id === effectiveId) || variantList[0];
  const showVariantPicker = variantList.length > 1 || (variantList.length === 1 && variantList[0].id !== 'default');
  const inStock = sel.inStock !== false && p.inStock !== false;

  const categoryLabel = categories.find((c) => c.id === p.category)?.label ?? p.category;
  const saved = wishlist.includes(p.id);

  const discountPct =
    sel.originalPrice && sel.originalPrice > sel.price
      ? Math.round((1 - sel.price / sel.originalPrice) * 100)
      : null;

  const imageBlock = (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#fff',
        boxShadow: 'var(--shadow-md)',
        marginBottom: isDesktop ? 0 : 20,
      }}
    >
      <div
        style={{
          height: isDesktop ? 380 : 240,
          background: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={p.image} alt="" style={{ maxHeight: '85%', objectFit: 'contain' }} />
      </div>
      {p.badge && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'var(--danger)',
            color: 'white',
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          {p.badge}
        </div>
      )}
      {discountPct != null && discountPct > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'var(--primary)',
            color: 'white',
            fontSize: 12,
            fontWeight: 800,
            padding: '6px 10px',
            borderRadius: 8,
          }}
        >
          −{discountPct}%
        </div>
      )}
    </div>
  );

  return (
    <Motion.div key="detail" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} style={{ padding: pagePad }}>
      <div style={{ maxWidth: isDesktop ? 960 : 'none', margin: isDesktop ? '0 auto' : undefined }}>
        <nav aria-label="Breadcrumb" style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <span>Shop</span>
          <ChevronRight size={14} style={{ opacity: 0.5 }} aria-hidden />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{categoryLabel}</span>
        </nav>

        <div
          style={{
            display: isDesktop ? 'grid' : 'block',
            gridTemplateColumns: isDesktop ? 'minmax(280px, 1fr) minmax(320px, 1fr)' : undefined,
            gap: isDesktop ? 36 : 0,
            alignItems: 'start',
          }}
        >
          <div style={{ position: isDesktop ? 'sticky' : 'static', top: isDesktop ? 88 : undefined }}>
            {imageBlock}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <Star size={16} color="var(--warning)" fill="var(--warning)" />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{p.rating}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>({p.reviews} reviews)</span>
                  <span
                    style={{
                      marginLeft: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: 999,
                      background: inStock ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: inStock ? '#047857' : 'var(--danger)',
                    }}
                  >
                    {inStock ? 'In stock' : 'Out of stock'}
                  </span>
                </div>
                <h2 style={{ fontSize: isDesktop ? 26 : 20, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)', lineHeight: 1.25 }}>
                  {p.name}
                </h2>
                <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Store size={15} strokeWidth={2} aria-hidden />
                  {p.vendor}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button
                  type="button"
                  aria-label={saved ? 'Remove from saved' : 'Save for later'}
                  onClick={() => toggleWishlist?.(p.id)}
                  style={{
                    padding: 10,
                    borderRadius: 10,
                    border: '1px solid var(--border-color)',
                    background: saved ? 'rgba(239, 68, 68, 0.08)' : 'white',
                    cursor: 'pointer',
                  }}
                >
                  <Heart size={18} color={saved ? 'var(--danger)' : 'var(--text-muted)'} fill={saved ? 'var(--danger)' : 'none'} />
                </button>
                <button
                  type="button"
                  aria-label="Share product"
                  onClick={handleShare}
                  style={{ padding: 10, borderRadius: 10, border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer' }}
                >
                  <Share2 size={18} color="var(--text-muted)" />
                </button>
              </div>
            </div>
            {shareNote ? (
              <p style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, margin: '0 0 12px' }}>{shareNote}</p>
            ) : null}

            {showVariantPicker && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10 }}>Options</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {variantList.map((v) => (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!v.inStock}
                      onClick={() => onVariantIdChange(v.id)}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: effectiveId === v.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        background: effectiveId === v.id ? 'rgba(255, 121, 0, 0.08)' : 'white',
                        color: !v.inStock ? 'var(--text-muted)' : 'var(--text-main)',
                        fontSize: 13,
                        fontWeight: effectiveId === v.id ? 600 : 500,
                        cursor: v.inStock ? 'pointer' : 'not-allowed',
                        fontFamily: 'inherit',
                        opacity: v.inStock ? 1 : 0.55,
                      }}
                    >
                      {v.label || 'Standard'}
                      {!v.inStock && ' · Out'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--primary)' }}>KES {sel.price.toLocaleString()}</span>
              {sel.originalPrice && (
                <span style={{ fontSize: 15, textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                  KES {sel.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
            {sel.originalPrice && sel.originalPrice > sel.price && (
              <p style={{ fontSize: 13, color: '#047857', fontWeight: 600, margin: '0 0 16px' }}>
                You save KES {(sel.originalPrice - sel.price).toLocaleString()}
              </p>
            )}

            <div style={{
                background: 'white',
                borderRadius: 12,
                padding: 16,
                marginBottom: 16,
                border: '1px solid var(--border-color)',
                display: 'grid',
                gap: 12,
              }}
            >
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ padding: 8, borderRadius: 10, background: '#f1f5f9' }}>
                  <Truck size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Delivery</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.45 }}>
                    From KES {DELIVERY_FEE.toLocaleString()} nationwide (est.). Exact fee confirmed at checkout.
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ padding: 8, borderRadius: 10, background: '#f1f5f9' }}>
                  <ShieldCheck size={20} color="var(--primary)" />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>Buyer protection</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.45 }}>
                    Pay safely; confirm delivery before funds are released to the vendor (demo flow).
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 20, border: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 8px' }}>
                About this item
              </h3>
              <p style={{ margin: 0, fontSize: 15, color: 'var(--text-main)', lineHeight: 1.55 }}>{p.description}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>Quantity</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f1f5f9', borderRadius: 12, padding: '6px 12px' }}>
                <button
                  type="button"
                  disabled={detailQty <= 1}
                  onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: 'none',
                    background: 'white',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: detailQty <= 1 ? 'not-allowed' : 'pointer',
                    opacity: detailQty <= 1 ? 0.5 : 1,
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: 16, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{detailQty}</span>
                <button
                  type="button"
                  onClick={() => setDetailQty((q) => q + 1)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: 'none',
                    background: 'white',
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', gap: 12 }}>
              <button
                type="button"
                disabled={!inStock}
                onClick={() => { addToCart(p, detailQty, sel); setViewState('cart'); }}
                className="btn-primary"
                style={{ padding: 16, borderRadius: 12, fontSize: 15, fontWeight: 600, opacity: inStock ? 1 : 0.5 }}
              >
                Add to cart · KES {(sel.price * detailQty).toLocaleString()}
              </button>
              <button
                type="button"
                disabled={!inStock}
                onClick={() => {
                  addToCart(p, detailQty, sel);
                  setCheckoutPhase(1);
                  setViewState('checkout');
                }}
                style={{
                  padding: 16,
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 600,
                  background: 'var(--secondary)',
                  color: 'white',
                  border: 'none',
                  cursor: inStock ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit',
                  opacity: inStock ? 1 : 0.5,
                }}
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <section style={{ marginTop: isDesktop ? 40 : 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 14px', color: 'var(--text-main)' }}>You may also like</h3>
            <div
              style={{
                display: 'flex',
                gap: 12,
                overflowX: 'auto',
                paddingBottom: 8,
                scrollbarWidth: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {relatedProducts.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openProduct(item)}
                  style={{
                    flex: '0 0 auto',
                    width: 140,
                    borderRadius: 14,
                    border: '1px solid var(--border-color)',
                    background: 'white',
                    padding: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div
                    style={{
                      height: 96,
                      background: '#f8fafc',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 10,
                    }}
                  >
                    <img src={item.image} alt="" style={{ maxHeight: 80, objectFit: 'contain' }} />
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-main)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: 34,
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginTop: 6 }}>
                    {productHasMultiplePrices(item) && (
                      <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 10 }}>From </span>
                    )}
                    KES {getListingFromPrice(item).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </Motion.div>
  );
}
