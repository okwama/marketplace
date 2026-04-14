import React, { useMemo } from 'react';
import { MaterialSymbol } from '../MaterialSymbol';

function statusBadge(status) {
  if (status === 'approved') {
    return { label: 'Active · selling', short: 'Active', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' };
  }
  if (status === 'pending') {
    return { label: 'Pending review', short: 'Pending', bg: '#ffedd5', color: '#c2410c', dot: '#fb923c' };
  }
  return { label: 'Suspended', short: 'Suspended', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' };
}

export function VendorSnapshotSection({ vendors, liveOrders, isDesktop, getVendorEffectiveStatus }) {
  const rows = useMemo(() => vendors.map((v) => {
    const effective = getVendorEffectiveStatus(v);
    const vo = liveOrders.filter((o) => o.vendorId === v.id);
    const delivered = vo.filter((o) => o.status === 'delivered').length;
    const openPipeline = vo.filter((o) => o.status !== 'delivered').length;
    const gmv = vo.reduce((s, o) => s + o.amount, 0);
    return {
      vendor: v,
      effectiveStatus: effective,
      productsListed: v.products,
      orderCount: vo.length,
      soldDelivered: delivered,
      openPipeline,
      gmv,
      badge: statusBadge(effective),
    };
  }), [vendors, liveOrders, getVendorEffectiveStatus]);

  const selling = rows.filter((r) => r.effectiveStatus === 'approved').length;
  const pending = rows.filter((r) => r.effectiveStatus === 'pending').length;

  return (
    <div style={{ marginBottom: 25 }}>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 12,
        marginBottom: 14,
        padding: '12px 16px',
        background: 'white',
        borderRadius: 14,
        border: '1px solid #bbf7d0',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
      }}
      >
        <MaterialSymbol name="manage_accounts" size={22} style={{ color: '#15803d' }} />
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontWeight: 700, color: '#14532d', fontSize: 14 }}>Signed in · Platform operator</div>
          <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
            Demo console (single seat). Below: seller accounts — who can list, catalogue size, and sales from the shared demo ledger.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, padding: '6px 10px', background: '#dcfce7', color: '#166534', borderRadius: 999, fontWeight: 600 }}>
            {selling} selling
          </span>
          <span style={{ fontSize: 12, padding: '6px 10px', background: '#ffedd5', color: '#9a3412', borderRadius: 999, fontWeight: 600 }}>
            {pending} pending
          </span>
        </div>
      </div>

      <div style={{ background: 'white', padding: isDesktop ? 22 : 16, borderRadius: 20, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{
          margin: '0 0 6px',
          color: '#334155',
          fontSize: isDesktop ? 16 : 15,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
        >
          <MaterialSymbol name="storefront" size={22} style={{ color: '#16a34a' }} />
          Vendors & performance
        </h3>
        <p style={{ margin: '0 0 18px', fontSize: 13, color: '#64748b' }}>
          Products listed = catalogue in demo data. Orders / sold / GMV = computed from the live order ledger (updates when clients check out).
        </p>

        {isDesktop ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Vendor</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Account</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Products listed</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Orders</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>Completed sales</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>In pipeline</th>
                  <th style={{ padding: '10px 8px', fontWeight: 600 }}>GMV (ledger)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.vendor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600, color: '#1e293b' }}>
                      {r.vendor.name}
                      <div style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>{r.vendor.owner}</div>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 10px',
                        borderRadius: 999,
                        background: r.badge.bg,
                        color: r.badge.color,
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                      >
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: r.badge.dot }} />
                        {r.badge.short}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{r.productsListed}</td>
                    <td style={{ padding: '12px 8px' }}>{r.orderCount}</td>
                    <td style={{ padding: '12px 8px', color: '#15803d', fontWeight: 600 }}>{r.soldDelivered}</td>
                    <td style={{ padding: '12px 8px', color: '#64748b' }}>{r.openPipeline}</td>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>KES {r.gmv.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map((r) => (
              <div
                key={r.vendor.id}
                style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: 14,
                  padding: 14,
                  background: '#fafafa',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b' }}>{r.vendor.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{r.vendor.owner}</div>
                  </div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: 999,
                    background: r.badge.bg,
                    color: r.badge.color,
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                  >
                    {r.badge.short}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12, color: '#475569' }}>
                  <div><strong style={{ color: '#334155' }}>Products</strong><br />{r.productsListed} listed</div>
                  <div><strong style={{ color: '#334155' }}>Orders</strong><br />{r.orderCount} in ledger</div>
                  <div><strong style={{ color: '#15803d' }}>Sold</strong><br />{r.soldDelivered} delivered</div>
                  <div><strong style={{ color: '#334155' }}>Pipeline</strong><br />{r.openPipeline} open</div>
                  <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#334155' }}>GMV</strong> KES {r.gmv.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
