import { Star, Heart, Sparkles, Truck } from 'lucide-react';
import { categories, getListingFromPrice, productHasMultiplePrices } from '../../mockData';
import { motion as Motion } from 'framer-motion';
import { MaterialSymbol } from '../MaterialSymbol';

const SORT_OPTIONS = [
  { id: 'featured', label: 'Featured' },
  { id: 'rating', label: 'Top rated' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

function HorizontalProductRail({ title, products, openProduct, pagePad }) {
  if (!products?.length) return null;
  return (
    <>
      {title ? (
        <div style={{ paddingLeft: pagePad, paddingRight: pagePad, paddingTop: 8, paddingBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>{title}</span>
        </div>
      ) : null}
      <div
        style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingLeft: pagePad,
          paddingRight: pagePad,
          paddingTop: title ? 0 : 4,
          paddingBottom: 16,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {products.map((product) => (
          <button
            key={product.id}
            type="button"
            onClick={() => openProduct(product)}
            style={{
              flex: '0 0 auto',
              width: 132,
              borderRadius: 14,
              border: '1px solid var(--border-color)',
              background: 'white',
              padding: 10,
              cursor: 'pointer',
              textAlign: 'left',
              fontFamily: 'inherit',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <div
              style={{
                height: 88,
                background: '#f8fafc',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 8,
              }}
            >
              <img src={product.image} alt="" style={{ maxHeight: 72, objectFit: 'contain' }} />
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
                minHeight: 32,
              }}
            >
              {product.name}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginTop: 6 }}>
              {productHasMultiplePrices(product) && (
                <span style={{ fontWeight: 500, color: 'var(--text-muted)', fontSize: 10 }}>From </span>
              )}
              KES {getListingFromPrice(product).toLocaleString()}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}

function PromoStrip({ pagePad, isDesktop }) {
  const promos = [
    { title: 'Free delivery', sub: 'On orders over KES 5,000', icon: Truck, tone: 'rgba(255, 121, 0, 0.12)' },
    { title: 'Weekend deals', sub: 'Extra 10% off electronics', icon: Sparkles, tone: 'rgba(37, 99, 235, 0.1)' },
    { title: 'Shop local', sub: 'Trusted vendors near you', icon: Sparkles, tone: 'rgba(16, 185, 129, 0.12)' },
  ];
  return (
    <div
      style={{
        display: 'flex',
        gap: 12,
        overflowX: 'auto',
        paddingLeft: pagePad,
        paddingRight: pagePad,
        paddingTop: 4,
        paddingBottom: 8,
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {promos.map(({ title, sub, icon: Icon, tone }) => (
        <div
          key={title}
          style={{
            flex: isDesktop ? '1 1 0' : '0 0 auto',
            minWidth: isDesktop ? 0 : 240,
            background: tone,
            borderRadius: 14,
            padding: '14px 16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ padding: 8, borderRadius: 10, background: 'white', boxShadow: 'var(--shadow-sm)' }}>
            <Icon size={20} color="var(--primary)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>{title}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.35 }}>{sub}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BrowseSection({
  activeTab,
  setActiveTab,
  filteredProducts,
  openProduct,
  addToCart,
  pagePad,
  productGridCols,
  isDesktop,
  shopSort,
  setShopSort,
  wishlist,
  toggleWishlist,
  popularProducts,
  savedProducts = [],
  recentProducts = [],
}) {
  return (
    <Motion.div key="browse" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div
        style={{
          padding: '15px 0 5px',
          display: 'flex',
          overflowX: isDesktop ? 'visible' : 'auto',
          flexWrap: isDesktop ? 'wrap' : 'nowrap',
          gap: 15,
          paddingLeft: pagePad,
          paddingRight: pagePad,
          scrollbarWidth: 'none',
        }}
      >
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveTab(cat.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
              opacity: activeTab === cat.id ? 1 : 0.6,
              transform: activeTab === cat.id ? 'scale(1.05)' : 'scale(1)',
              transition: 'all 0.2s',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <div
              style={{
                background: activeTab === cat.id ? 'var(--primary-light)' : 'white',
                width: 50,
                height: 50,
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: activeTab === cat.id ? 'white' : 'var(--primary)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <MaterialSymbol
                name={cat.materialSymbol}
                size={26}
                style={{ color: activeTab === cat.id ? 'white' : 'var(--primary)' }}
              />
            </div>
            <span style={{ fontSize: 12, fontWeight: activeTab === cat.id ? 600 : 400 }}>{cat.label}</span>
          </button>
        ))}
      </div>

      <PromoStrip pagePad={pagePad} isDesktop={isDesktop} />

      <HorizontalProductRail title="Saved for later" products={savedProducts} openProduct={openProduct} pagePad={pagePad} />
      <HorizontalProductRail title="Recently viewed" products={recentProducts} openProduct={openProduct} pagePad={pagePad} />

      <div
        style={{
          paddingLeft: pagePad,
          paddingRight: pagePad,
          paddingTop: 8,
          paddingBottom: 4,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)' }}>Popular picks</span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          <span style={{ fontWeight: 600 }}>Sort</span>
          <select
            value={shopSort}
            onChange={(e) => setShopSort(e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              fontSize: 13,
              fontFamily: 'inherit',
              background: 'white',
              color: 'var(--text-main)',
              maxWidth: isDesktop ? 220 : 180,
            }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <HorizontalProductRail title="" products={popularProducts} openProduct={openProduct} pagePad={pagePad} />

      <div style={{ padding: pagePad, display: 'grid', gridTemplateColumns: productGridCols, gap: isDesktop ? 20 : 15 }}>
        {filteredProducts.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '36px 20px',
              color: 'var(--text-muted)',
              background: 'white',
              borderRadius: 12,
              border: '1px dashed var(--border-color)',
            }}
          >
            No products match your filters. Try another category or clear your search.
          </div>
        ) : (
          filteredProducts.map((product) => {
            const saved = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                className="card"
                style={{ position: 'relative', padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
              >
                <button
                  type="button"
                  aria-label={`View ${product.name}`}
                  onClick={() => openProduct(product)}
                  style={{
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    background: 'transparent',
                    display: 'block',
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      position: 'relative',
                      height: isDesktop ? 180 : 140,
                      background: '#f8fafc',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img src={product.image} alt="" style={{ maxHeight: isDesktop ? 150 : 120, objectFit: 'contain' }} />
                    {product.badge && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 10,
                          left: 10,
                          background: 'var(--danger)',
                          color: 'white',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 4,
                          textTransform: 'uppercase',
                        }}
                      >
                        {product.badge}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                      <Star size={12} color="var(--warning)" fill="var(--warning)" />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{product.rating}</span>
                    </div>
                    <h3
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        margin: '0 0 4px',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        flex: 1,
                        color: 'var(--text-main)',
                      }}
                    >
                      {product.name}
                    </h3>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{product.vendor}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
                          {productHasMultiplePrices(product) && (
                            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-muted)' }}>From </span>
                          )}
                          KES {getListingFromPrice(product).toLocaleString()}
                        </div>
                        {!productHasMultiplePrices(product) && product.originalPrice && (
                          <div style={{ fontSize: 11, textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                            KES {product.originalPrice.toLocaleString()}
                          </div>
                        )}
                        {product.variants?.length > 1 && (
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{product.variants.length} options</div>
                        )}
                      </div>
                      <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>View</span>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  aria-label={saved ? 'Remove from saved' : 'Save for later'}
                  onClick={() => toggleWishlist(product.id)}
                  style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: 'none',
                    background: 'white',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 2,
                  }}
                >
                  <Heart size={18} color={saved ? 'var(--danger)' : 'var(--text-muted)'} fill={saved ? 'var(--danger)' : 'none'} />
                </button>
                <div style={{ padding: '0 12px 12px' }}>
                  <button
                    type="button"
                    onClick={() => addToCart(product, 1)}
                    style={{
                      width: '100%',
                      background: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 8,
                      padding: '10px',
                      fontWeight: 600,
                      fontSize: 13,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Add to cart
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Motion.div>
  );
}
