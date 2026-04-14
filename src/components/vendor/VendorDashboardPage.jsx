import React from 'react';
import { DollarSign, TrendingUp, Clock, ShoppingBag, Percent, ChevronRight } from 'lucide-react';

const QUICK_VIEW_MAX = 3;

function statusLabel(status) {
  if (status === 'confirmed') return 'Awaiting rider / hand-off';
  if (status === 'dispatched') return 'In transit · OTP';
  return status;
}

export function VendorDashboardPage({
  isDesktop,
  vendor,
  pendingOrders,
  openOrderCount,
  onViewAllOrders,
}) {
  const preview = pendingOrders.slice(0, QUICK_VIEW_MAX);
  const moreCount = Math.max(0, pendingOrders.length - QUICK_VIEW_MAX);

  return (
    <>
      <h2 style={{ fontSize: isDesktop ? 18 : 16, marginBottom: 15 }}>Financial Overview</h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? 'repeat(4, minmax(0, 1fr))' : '1fr 1fr',
        gap: isDesktop ? 18 : 15,
        marginBottom: 25,
      }}
      >
        <div className="card" style={{ background: 'var(--primary)', color: 'white' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <DollarSign size={20} opacity={0.8} />
            <TrendingUp size={20} opacity={0.8} />
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>Total Revenue</div>
          <div style={{ fontSize: isDesktop ? 22 : 20, fontWeight: 700, marginTop: 4 }}>{`KES ${(vendor.totalRevenue / 1000).toFixed(1)}K`}</div>
        </div>

        <div className="card" style={{ background: 'white', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <Clock size={20} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Funds in Escrow</div>
          <div style={{ fontSize: isDesktop ? 22 : 20, fontWeight: 700, marginTop: 4, color: 'var(--secondary)' }}>{`KES ${vendor.escrowBalance.toLocaleString()}`}</div>
        </div>

        <div className="card" style={{ background: 'white', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <ShoppingBag size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Open orders</div>
          <div style={{ fontSize: isDesktop ? 22 : 20, fontWeight: 700, marginTop: 4 }}>{openOrderCount}</div>
        </div>

        <div className="card" style={{ background: 'white', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <Percent size={20} color="var(--warning)" />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fulfillment rate</div>
          <div style={{ fontSize: isDesktop ? 22 : 20, fontWeight: 700, marginTop: 4 }}>94%</div>
        </div>
      </div>

      <div style={{ background: '#fffbeb', border: '1px dashed #f59e0b', padding: 15, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>Next Automated Payout</div>
          <div style={{ fontSize: 14, color: '#b45309', fontWeight: 700 }}>
            {vendor.nextPayout ? new Date(vendor.nextPayout).toLocaleDateString('en-KE', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#92400e' }}>KES {vendor.escrowBalance.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <h2 style={{ fontSize: isDesktop ? 18 : 16, margin: 0 }}>Orders — quick view</h2>
        <button
          type="button"
          onClick={onViewAllOrders}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '8px 14px',
            borderRadius: 999,
            border: 'none',
            background: 'rgba(255, 121, 0, 0.12)',
            color: 'var(--primary)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          View all
          <ChevronRight size={18} />
        </button>
      </div>
      <p style={{ margin: '0 0 14px', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.45 }}>
        Latest open orders. Hand-off, rider details, and OTP verification are on the <strong>Orders</strong> tab.
      </p>

      {pendingOrders.length === 0 ? (
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          No open orders.
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {preview.map((o) => (
              <li
                key={o.id}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.id}</div>
                  <div style={{ fontWeight: 600, fontSize: 14, marginTop: 4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{o.product}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{o.customerName}</div>
                  <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600, marginTop: 6 }}>{statusLabel(o.status)}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--secondary)', fontSize: 14, flexShrink: 0 }}>KES {o.netVendor.toLocaleString()}</div>
              </li>
            ))}
          </ul>
          {moreCount > 0 && (
            <div style={{ padding: '12px 16px', background: '#f8fafc', fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
              +{moreCount} more open order{moreCount === 1 ? '' : 's'} — <button type="button" onClick={onViewAllOrders} style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>View all</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
