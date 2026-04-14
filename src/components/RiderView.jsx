import React, { useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Bike, Package, Phone, Store, KeyRound, CheckCircle2, Wallet, TrendingUp, Clock,
} from 'lucide-react';
import { useMarketplaceDemo } from '../context/MarketplaceDemoContext';
import { vendors } from '../mockData';

const RIDER_PICK_KEY = 'mp-demo-rider-id';

const RIDER_TAB_IDS = new Set(['active', 'done', 'earnings']);

/** Demo rider payout per completed delivery: floor % of order GMV with a minimum (not real pricing). */
const RIDER_FEE_MIN_KES = 120;
const RIDER_FEE_RATE = 0.014;

function riderDeliveryFee(order) {
  return Math.max(RIDER_FEE_MIN_KES, Math.round((Number(order.amount) || 0) * RIDER_FEE_RATE));
}

function payoutTs(order) {
  const d = order.payoutDate || order.date;
  if (!d) return null;
  const t = Date.parse(`${d}T12:00:00`);
  return Number.isNaN(t) ? null : t;
}

function readStoredRiderPick() {
  if (typeof window === 'undefined') return '';
  try {
    return sessionStorage.getItem(RIDER_PICK_KEY) || '';
  } catch {
    return '';
  }
}

function persistRiderPick(id) {
  try {
    if (id) sessionStorage.setItem(RIDER_PICK_KEY, id);
    else sessionStorage.removeItem(RIDER_PICK_KEY);
  } catch {
    /* ignore */
  }
}

export function RiderView({ layoutMode = 'mobile' }) {
  const { liveOrders, riders, verifyVendorOtp } = useMarketplaceDemo();
  const isDesktop = layoutMode === 'desktop';
  const activeRiders = useMemo(() => riders.filter((r) => r.active), [riders]);
  const [pickRider, setPickRider] = useState(readStoredRiderPick);
  const [searchParams, setSearchParams] = useSearchParams();
  const riderTabParam = searchParams.get('riderTab');
  const listTab = riderTabParam && RIDER_TAB_IDS.has(riderTabParam) ? riderTabParam : 'active';
  const setListTab = useCallback((id) => {
    setSearchParams((prev) => {
      const n = new URLSearchParams(prev);
      n.set('riderTab', id);
      return n;
    }, { replace: true });
  }, [setSearchParams]);
  const [otpByOrder, setOtpByOrder] = useState({});
  const [otpErrorByOrder, setOtpErrorByOrder] = useState({});

  const riderId = useMemo(() => {
    if (pickRider && activeRiders.some((r) => r.id === pickRider)) return pickRider;
    return activeRiders[0]?.id || '';
  }, [pickRider, activeRiders]);

  const vendorLine = (vendorId) => {
    const v = vendors.find((x) => x.id === vendorId);
    if (!v) return { name: `Vendor #${vendorId}`, phone: '—' };
    return { name: v.name, phone: v.phone };
  };

  const activeJobs = useMemo(
    () => (riderId
      ? liveOrders.filter((o) => o.riderId === riderId && o.status !== 'delivered')
      : []),
    [liveOrders, riderId],
  );

  const riderDelivered = useMemo(
    () => (riderId
      ? liveOrders.filter((o) => o.riderId === riderId && o.status === 'delivered')
      : []),
    [liveOrders, riderId],
  );

  const completedJobs = useMemo(
    () => [...riderDelivered]
      .sort((a, b) => String(b.id).localeCompare(String(a.id)))
      .slice(0, 25),
    [riderDelivered],
  );

  const earningsLifetime = useMemo(
    () => riderDelivered.reduce((s, o) => s + riderDeliveryFee(o), 0),
    [riderDelivered],
  );

  const [last7dCutoffMs] = useState(() => Date.now() - 7 * 86400000);
  const earningsLast7d = useMemo(
    () => riderDelivered
      .filter((o) => {
        const t = payoutTs(o);
        return t != null && t >= last7dCutoffMs;
      })
      .reduce((s, o) => s + riderDeliveryFee(o), 0),
    [riderDelivered, last7dCutoffMs],
  );

  const pendingEstimated = useMemo(
    () => activeJobs.reduce((s, o) => s + riderDeliveryFee(o), 0),
    [activeJobs],
  );

  const recentEarningsRows = useMemo(
    () => [...riderDelivered]
      .sort((a, b) => String(b.payoutDate || b.date || '').localeCompare(String(a.payoutDate || a.date || '')))
      .slice(0, 20),
    [riderDelivered],
  );

  const onRiderSelect = (e) => {
    const v = e.target.value;
    setPickRider(v);
    persistRiderPick(v);
  };

  const pageX = isDesktop ? 'clamp(20px, 3vw, 40px)' : 20;

  const tabBtn = (id, label) => (
    <button
      key={id}
      type="button"
      onClick={() => setListTab(id)}
      style={{
        padding: '8px 14px',
        borderRadius: 999,
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 13,
        fontWeight: listTab === id ? 600 : 500,
        background: listTab === id ? 'rgba(255, 121, 0, 0.12)' : '#f1f5f9',
        color: listTab === id ? 'var(--primary)' : 'var(--text-muted)',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', color: 'var(--text-main)' }}>
      <header style={{ padding: isDesktop ? `24px ${pageX} 18px` : '20px 20px 16px', backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 5 }}>
        <h1 style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bike size={isDesktop ? 24 : 20} color="var(--primary)" /> Rider
        </h1>
        <label htmlFor="demo-rider-select" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13, color: 'var(--text-muted)' }}>
          Acting as
          <select
            id="demo-rider-select"
            value={riderId}
            onChange={onRiderSelect}
            style={{ maxWidth: 320, padding: '10px 12px', borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 14, fontFamily: 'inherit', background: 'white' }}
          >
            {activeRiders.length === 0 && <option value="">No active riders</option>}
            {activeRiders.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
          {tabBtn('active', 'Active')}
          {tabBtn('done', 'Completed')}
          {tabBtn('earnings', 'Earnings')}
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', padding: pageX, paddingBottom: 32 }}>
        {listTab !== 'earnings' && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 20 }}>
            Admin assigns you on <strong>Orders</strong>. Pick up from the vendor, then after hand-off when the job is <strong>In transit</strong>, enter the <strong>customer delivery OTP</strong> they received at checkout — same code the vendor can use to release escrow.
          </p>
        )}

        {listTab === 'active' && (activeJobs.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            No active deliveries for this rider.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activeJobs.map((o) => {
              const pickup = vendorLine(o.vendorId);
              const fee = riderDeliveryFee(o);
              return (
                <div key={o.id} className="card" style={{ padding: isDesktop ? 20 : 16, borderLeft: `4px solid ${o.status === 'dispatched' ? 'var(--primary)' : 'var(--secondary)'}` }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.id}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginTop: 6 }}>{o.product}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                    Est. payout on completion: <strong style={{ color: 'var(--text-main)' }}>KES {fee.toLocaleString()}</strong>
                  </div>

                  <div style={{ marginTop: 14, padding: 12, background: '#f0fdf4', borderRadius: 10, border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 }}>Pick up from</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
                      <Store size={18} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{pickup.name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: 'var(--text-muted)' }}>
                          <Phone size={14} /> {pickup.phone}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>Deliver to: <strong style={{ color: 'var(--text-main)' }}>{o.customerName}</strong></div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                    <Phone size={16} />
                    Customer phone: {o.customerId}
                  </div>
                  <div style={{ marginTop: 12, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                    Status: {o.status === 'confirmed' ? 'Assigned · collect parcel from vendor' : 'In transit · enter customer OTP to complete'}
                  </div>

                  {o.status === 'dispatched' && (
                    <div style={{ marginTop: 16, background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <KeyRound size={16} />
                        Customer OTP (from SMS / checkout summary)
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: isDesktop ? 'nowrap' : 'wrap' }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          value={otpByOrder[o.id] ?? ''}
                          onChange={(e) => {
                            setOtpByOrder((p) => ({ ...p, [o.id]: e.target.value }));
                            setOtpErrorByOrder((p) => ({ ...p, [o.id]: '' }));
                          }}
                          placeholder={o.otpGenerated ? `e.g. ${o.otpGenerated}` : 'Enter OTP'}
                          style={{ flex: '1 1 160px', minWidth: 0, padding: 12, borderRadius: 8, border: '1px solid var(--border-color)', outline: 'none', letterSpacing: 3, fontWeight: 700, fontSize: 16 }}
                        />
                        <button
                          type="button"
                          className="btn-primary"
                          style={{ padding: '12px 18px', borderRadius: 10, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}
                          onClick={() => {
                            const ok = verifyVendorOtp(o.id, otpByOrder[o.id] ?? '');
                            if (!ok) {
                              setOtpErrorByOrder((p) => ({ ...p, [o.id]: 'OTP does not match. Ask the customer to check their message.' }));
                            }
                          }}
                        >
                          <CheckCircle2 size={18} />
                          Verify & complete
                        </button>
                      </div>
                      {otpErrorByOrder[o.id] && (
                        <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 10 }}>{otpErrorByOrder[o.id]}</div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {listTab === 'done' && (completedJobs.length === 0 ? (
          <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckCircle2 size={40} style={{ opacity: 0.3, margin: '0 auto 12px' }} />
            No completed deliveries yet for this rider.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {completedJobs.map((o) => {
              const fee = riderDeliveryFee(o);
              return (
                <li key={o.id} className="card" style={{ padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.id}</div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>{o.product}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{o.customerName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d' }}>Delivered</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }}>+ KES {fee.toLocaleString()}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        ))}

        {listTab === 'earnings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              Earnings are <strong>demo-only</strong>: each completed delivery pays the greater of <strong>KES {RIDER_FEE_MIN_KES}</strong> or <strong>{(RIDER_FEE_RATE * 100).toFixed(1)}%</strong> of order GMV. Real apps would use distance, surge, and platform policy.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isDesktop ? 'repeat(3, minmax(0, 1fr))' : '1fr',
              gap: 12,
            }}
            >
              <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                  <Wallet size={18} color="var(--primary)" /> Lifetime earned
                </div>
                <div style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 800, color: '#15803d' }}>KES {earningsLifetime.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{riderDelivered.length} completed drop-offs</div>
              </div>
              <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                  <TrendingUp size={18} color="var(--primary)" /> Last 7 days
                </div>
                <div style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 800, color: '#0f766e' }}>KES {earningsLast7d.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>By payout / order date</div>
              </div>
              <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>
                  <Clock size={18} color="var(--primary)" /> Pending (est.)
                </div>
                <div style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 800, color: '#c2410c' }}>KES {pendingEstimated.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{activeJobs.length} active job(s) — paid after OTP completion</div>
              </div>
            </div>

            <div className="card" style={{ padding: isDesktop ? 18 : 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wallet size={18} color="var(--primary)" /> Recent payouts
              </h2>
              {recentEarningsRows.length === 0 ? (
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Complete a delivery to see payout rows here.</div>
              ) : isDesktop ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Order</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Customer</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>GMV</th>
                        <th style={{ padding: '8px 10px', fontWeight: 600 }}>Your fee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEarningsRows.map((o) => (
                        <tr key={o.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '10px' }}>{o.payoutDate || o.date || '—'}</td>
                          <td style={{ padding: '10px', fontFamily: 'monospace', fontSize: 12 }}>{o.id}</td>
                          <td style={{ padding: '10px' }}>{o.customerName}</td>
                          <td style={{ padding: '10px' }}>KES {Number(o.amount).toLocaleString()}</td>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#15803d' }}>KES {riderDeliveryFee(o).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {recentEarningsRows.map((o) => (
                    <li key={o.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.payoutDate || o.date}</div>
                      <div style={{ fontWeight: 600, marginTop: 4 }}>{o.customerName}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Fee</span>
                        <span style={{ fontWeight: 800, color: '#15803d' }}>KES {riderDeliveryFee(o).toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
