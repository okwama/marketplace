import {
  ShoppingCart, Search, MessageCircle, Phone, Store, Truck, MapPin, User,
  CheckCircle2,
} from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { DELIVERY_FEE } from './constants';
import { useMarketplaceDemo } from '../../context/MarketplaceDemoContext';

export { BrowseSection } from './BrowseSection';
export { ProductDetailSection } from './ProductDetailSection';

export function CartSection({
  cart, cartTotal, orderTotal, openProduct, removeFromCart, proceedToCheckout, setViewState, pagePad, isDesktop,
}) {
  return (
    <Motion.div key="cart" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: pagePad, maxWidth: isDesktop ? 720 : 'none', margin: isDesktop ? '0 auto' : undefined, width: '100%' }}>
      <h2 style={{ fontSize: isDesktop ? 26 : 20, marginBottom: 20 }}>Your order</h2>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 15px' }} />
          <p>Your cart is empty.</p>
          <button type="button" className="btn-primary" style={{ marginTop: 15 }} onClick={() => setViewState('browse')}>Continue shopping</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'minmax(0, 1fr) minmax(280px, 360px)' : '1fr', gap: isDesktop ? 24 : 0, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
            {cart.map(item => (
              <div key={item.cartLineId ?? item.id} style={{ display: 'flex', gap: 15, background: 'white', padding: isDesktop ? 16 : 12, borderRadius: 10, boxShadow: 'var(--shadow-sm)' }}>
                <button type="button" onClick={() => openProduct(item)} style={{ border: 'none', padding: 0, background: 'none', cursor: 'pointer' }}>
                  <img src={item.image} alt="" style={{ width: isDesktop ? 72 : 60, height: isDesktop ? 72 : 60, objectFit: 'contain', background: '#f8fafc', borderRadius: 8 }} />
                </button>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px', fontSize: isDesktop ? 15 : 14 }}>{item.name}</h4>
                  {item.variantLabel ? (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{item.variantLabel}</div>
                  ) : null}
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>KES {item.price.toLocaleString()}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15, background: '#f1f5f9', borderRadius: 20, padding: '2px 10px' }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>Qty: {item.qty}</span>
                    </div>
                    <button type="button" onClick={() => removeFromCart(item.cartLineId ?? item.id)} style={{ color: 'var(--danger)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', padding: isDesktop ? 24 : 20, borderRadius: 10, marginTop: isDesktop ? 0 : 20, boxShadow: 'var(--shadow-md)', position: isDesktop ? 'sticky' : 'static', top: isDesktop ? 16 : undefined }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span>KES {cartTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15, color: 'var(--text-muted)' }}>
              <span>Delivery (est.)</span>
              <span>KES {DELIVERY_FEE.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: 15, fontSize: 18, fontWeight: 700 }}>
              <span>Total</span>
              <span>KES {orderTotal.toLocaleString()}</span>
            </div>

            <button type="button" className="btn-primary" style={{ width: '100%', marginTop: 20, padding: 15, fontSize: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }} onClick={proceedToCheckout}>
              <Truck size={20} />
              Proceed to checkout
            </button>
          </div>
        </div>
      )}
    </Motion.div>
  );
}

export function CheckoutSection({
  checkoutPhase, setCheckoutPhase, deliveryForm, setDeliveryForm, deliveryValid,
  cart, cartTotal, orderTotal, startMpesaPayment, isDesktop, pagePad,
}) {
  return (
    <Motion.div key="checkout" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ padding: pagePad, maxWidth: isDesktop ? 560 : 'none', margin: isDesktop ? '0 auto' : undefined }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[1, 2].map(step => (
          <div
            key={step}
            style={{
              flex: 1, height: 4, borderRadius: 2,
              background: checkoutPhase >= step ? 'var(--primary)' : '#e2e8f0',
            }}
          />
        ))}
      </div>

      {checkoutPhase === 1 && (
        <>
          <h2 style={{ fontSize: isDesktop ? 22 : 18, marginBottom: 8 }}>Delivery details</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 20 }}>We will use your phone number for M-Pesa and delivery updates.</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={14} /> Full name</span>
              <input
                value={deliveryForm.fullName}
                onChange={e => setDeliveryForm(f => ({ ...f, fullName: e.target.value }))}
                placeholder="e.g. Jane Wanjiku"
                style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> M-Pesa phone</span>
              <input
                value={deliveryForm.phone}
                onChange={e => setDeliveryForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="07XX XXX XXX"
                inputMode="tel"
                style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> Address line</span>
              <input
                value={deliveryForm.line1}
                onChange={e => setDeliveryForm(f => ({ ...f, line1: e.target.value }))}
                placeholder="Street, building, estate"
                style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit' }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>
              City
              <input
                value={deliveryForm.city}
                onChange={e => setDeliveryForm(f => ({ ...f, city: e.target.value }))}
                style={{ padding: 12, borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 15, fontFamily: 'inherit' }}
              />
            </label>
          </div>

          <button
            type="button"
            disabled={!deliveryValid}
            className="btn-primary"
            style={{ width: '100%', marginTop: 24, padding: 15, fontSize: 16, opacity: deliveryValid ? 1 : 0.5 }}
            onClick={() => setCheckoutPhase(2)}
          >
            Continue to review
          </button>
        </>
      )}

      {checkoutPhase === 2 && (
        <>
          <h2 style={{ fontSize: isDesktop ? 22 : 18, marginBottom: 20 }}>Review & pay</h2>

          <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Ship to</div>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{deliveryForm.fullName || '—'}</p>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>{deliveryForm.line1}, {deliveryForm.city}</p>
            <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--text-muted)' }}>{deliveryForm.phone}</p>
            <button type="button" onClick={() => setCheckoutPhase(1)} style={{ marginTop: 12, background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>
              Edit details
            </button>
          </div>

          <div style={{ background: 'white', borderRadius: 12, padding: 16, marginBottom: 16, border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Items</div>
            {cart.map(item => (
              <div key={item.cartLineId ?? item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, gap: 12 }}>
                <span style={{ minWidth: 0 }}>
                  {item.name}
                  {item.variantLabel ? ` · ${item.variantLabel}` : ''}
                  {' '}× {item.qty}
                </span>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>KES {(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 12, marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 14, marginBottom: 6 }}>
                <span>Subtotal</span>
                <span>KES {cartTotal.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: 14, marginBottom: 6 }}>
                <span>Delivery</span>
                <span>KES {DELIVERY_FEE.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, marginTop: 8 }}>
                <span>Total</span>
                <span>KES {orderTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 14px', lineHeight: 1.45 }}>
            Demo only — simulated M-Pesa. No real money is charged.
          </p>
          <button
            type="button"
            disabled={cart.length === 0}
            className="btn-wa"
            style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 15, fontSize: 16, opacity: cart.length === 0 ? 0.5 : 1 }}
            onClick={startMpesaPayment}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/M-PESA_LOGO-01.svg" alt="" style={{ height: 20, filter: 'brightness(0) invert(1)' }} />
            Pay KES {orderTotal.toLocaleString()} with M-Pesa
          </button>
        </>
      )}
    </Motion.div>
  );
}

export function PaymentSection({ mpesaStep, orderTotal, isDesktop = false, pagePad = 20 }) {
  return (
    <Motion.div
      key="payment"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: pagePad,
        paddingTop: isDesktop ? 40 : 30,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: isDesktop ? 360 : 280,
        maxWidth: isDesktop ? 480 : 'none',
        margin: isDesktop ? '0 auto' : undefined,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(37, 211, 102, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
        <Phone size={40} color="var(--wa-green)" />
      </div>
      <h2 style={{ marginBottom: 10 }}>Check your phone</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, maxWidth: 320 }}>
        {mpesaStep === 1 && 'We\'ve sent an M-Pesa STK push. Please wait for the prompt...'}
        {mpesaStep === 2 && `Enter your M-Pesa PIN to pay KES ${orderTotal.toLocaleString()}.`}
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 14, maxWidth: 340, lineHeight: 1.45 }}>
        Demo only: this screen does not connect to Safaricom or move real funds.
      </p>
      <div style={{ marginTop: 40, width: 40, height: 40, border: '3px solid #f3f3f3', borderTop: '3px solid var(--primary)', borderRadius: '50%', animation: 'custSpin 1s linear infinite' }} />
      <style>{`@keyframes custSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </Motion.div>
  );
}

export function SuccessSection({ setViewState, setSelectedProduct, setHomeTab, isDesktop = false, pagePad = 20 }) {
  const { lastDemoCheckout } = useMarketplaceDemo();
  const otp = lastDemoCheckout?.primaryOtp ?? '7281';

  return (
    <Motion.div
      key="success"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        padding: pagePad,
        paddingTop: isDesktop ? 40 : 30,
        textAlign: 'center',
        maxWidth: isDesktop ? 520 : 'none',
        margin: isDesktop ? '0 auto' : undefined,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <CheckCircle2 size={70} color="var(--wa-green)" style={{ margin: '20px auto' }} />
      <h2 style={{ marginBottom: 10, fontSize: 24 }}>Payment secured</h2>
      <p style={{ color: 'var(--text-muted)', fontSize: 15, marginBottom: 12 }}>
        Your money is held in escrow until you confirm delivery.
      </p>
      <p style={{ color: 'var(--text-muted)', fontSize: 12, marginBottom: 24, lineHeight: 1.45 }}>
        Demo simulation — not a live payment or escrow contract.
      </p>

      <div style={{ background: '#0F172A', color: 'white', padding: 25, borderRadius: 15, marginTop: 20 }}>
        <p style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8, marginBottom: 10 }}>Delivery safety code (OTP)</p>
        <div style={{ fontSize: 42, fontWeight: 800, letterSpacing: 4, color: 'var(--primary-light)' }}>{otp}</div>
        <p style={{ fontSize: 13, marginTop: 15, opacity: 0.8 }}>Only share this with the rider after you have received your order.</p>
      </div>

      <button
        type="button"
        onClick={() => { setViewState('browse'); setSelectedProduct(null); setHomeTab?.('shop'); }}
        style={{ marginTop: 30, padding: 15, background: 'white', border: '1px solid var(--border-color)', borderRadius: 10, width: '100%', maxWidth: isDesktop ? 400 : 'none', marginLeft: 'auto', marginRight: 'auto', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
      >
        Back to store
      </button>
    </Motion.div>
  );
}

export function MobileBrowseNav({ activeTab, onTabChange }) {
  const item = (id, Icon, label) => {
    const on = activeTab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onTabChange(id)}
        style={{
          color: on ? 'var(--primary)' : 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontFamily: 'inherit',
          flex: 1,
          maxWidth: 120,
        }}
      >
        <Icon size={24} strokeWidth={on ? 2.25 : 2} />
        <span style={{ fontSize: 10, fontWeight: on ? 600 : 400 }}>{label}</span>
      </button>
    );
  };

  return (
    <nav style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, background: 'var(--surface-color)', padding: '10px 12px calc(12px + env(safe-area-inset-bottom, 0px))', display: 'flex', justifyContent: 'space-around', alignItems: 'center', borderTop: '1px solid var(--border-color)' }}>
      {item('shop', Store, 'Shop')}
      {item('search', Search, 'Search')}
      {item('chat', MessageCircle, 'Chat')}
    </nav>
  );
}
