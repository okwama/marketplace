import React from 'react';
import { Download } from 'lucide-react';
import { orderNet } from './reportFinanceUtils';

export function DeltaHint({ current, previous, suffix }) {
  let pct = null;
  if (previous !== 0) {
    pct = ((current - previous) / previous) * 100;
  }
  const text = pct == null || Number.isNaN(pct) ? null : `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`;
  if (text == null || previous === 0) {
    return (
      <span style={{ fontSize: 11, color: '#94a3b8' }}>
        {previous === 0 && current > 0 ? 'No prior-period baseline' : '—'}
      </span>
    );
  }
  const up = pct >= 0;
  return (
    <span style={{ fontSize: 11, fontWeight: 600, color: up ? '#16a34a' : '#dc2626' }}>
      {text} vs prior {suffix ?? 'period'}
    </span>
  );
}

export function RollupByVendor({ isDesktop, byVendor }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#334155', fontSize: 14 }}>
        By vendor (filtered)
      </div>
      {byVendor.length === 0 ? (
        <div style={{ padding: 16, color: '#94a3b8', fontSize: 13 }}>No orders match the current filters.</div>
      ) : isDesktop ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Vendor</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Region</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Orders</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>GMV</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Commission</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Net vendor</th>
            </tr>
          </thead>
          <tbody>
            {byVendor.map((row) => (
              <tr key={row.vendorId} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{row.name}</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>{row.region}</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>{row.orders}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#15803d' }}>KES {row.gmv.toLocaleString()}</td>
                <td style={{ padding: '10px 14px', color: '#64748b' }}>KES {row.commission.toLocaleString()}</td>
                <td style={{ padding: '10px 14px', color: '#0f766e' }}>KES {row.netVendor.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {byVendor.map((row) => (
            <li key={row.vendorId} style={{ padding: 14, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>{row.name}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{row.region} · {row.orders} orders</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#64748b' }}>GMV</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>KES {row.gmv.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
                <span style={{ color: '#64748b' }}>Net vendor</span>
                <span style={{ fontWeight: 600, color: '#0f766e' }}>KES {row.netVendor.toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function RollupByRegion({ isDesktop, byRegion }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #f1f5f9', fontWeight: 700, color: '#334155', fontSize: 14 }}>
        By region (filtered)
      </div>
      {byRegion.length === 0 ? (
        <div style={{ padding: 16, color: '#94a3b8', fontSize: 13 }}>No orders match the current filters.</div>
      ) : isDesktop ? (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Region</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Orders</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>GMV</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Commission</th>
              <th style={{ padding: '10px 14px', fontWeight: 600 }}>Net vendor</th>
            </tr>
          </thead>
          <tbody>
            {byRegion.map((row) => (
              <tr key={row.region} style={{ borderTop: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>{row.region}</td>
                <td style={{ padding: '10px 14px', color: '#475569' }}>{row.orders}</td>
                <td style={{ padding: '10px 14px', fontWeight: 600, color: '#15803d' }}>KES {row.gmv.toLocaleString()}</td>
                <td style={{ padding: '10px 14px', color: '#64748b' }}>KES {row.commission.toLocaleString()}</td>
                <td style={{ padding: '10px 14px', color: '#0f766e' }}>KES {row.netVendor.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {byRegion.map((row) => (
            <li key={row.region} style={{ padding: 14, borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontWeight: 700, color: '#1e293b' }}>{row.region}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{row.orders} orders</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#64748b' }}>GMV</span>
                <span style={{ fontWeight: 700, color: '#15803d' }}>KES {row.gmv.toLocaleString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function LedgerSection({ isDesktop, tableRows, vendorById, exportCsv }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>Order ledger (filtered)</span>
        <button
          type="button"
          onClick={exportCsv}
          disabled={tableRows.length === 0}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 14px',
            borderRadius: 10,
            border: '1px solid #bbf7d0',
            background: tableRows.length === 0 ? '#f8fafc' : '#ecfdf5',
            color: tableRows.length === 0 ? '#94a3b8' : '#15803d',
            fontSize: 12,
            fontWeight: 600,
            cursor: tableRows.length === 0 ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>
      {tableRows.length === 0 ? (
        <div style={{ padding: 20, color: '#94a3b8', fontSize: 13 }}>No rows for this selection.</div>
      ) : isDesktop ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 800 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Order</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Vendor</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Region</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Escrow</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Payout</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>GMV</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Commission</th>
                <th style={{ padding: '10px 14px', fontWeight: 600 }}>Net vendor</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((o) => {
                const v = vendorById.get(o.vendorId);
                return (
                  <tr key={o.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 11, color: '#475569' }}>{o.id}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{o.date}</td>
                    <td style={{ padding: '10px 14px', color: '#1e293b', fontWeight: 500 }}>{v?.name ?? `Vendor #${o.vendorId}`}</td>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>{v?.region ?? 'Unknown'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{o.status}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{o.escrowStatus ?? '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{o.payoutDate ?? '—'}</td>
                    <td style={{ padding: '10px 14px', color: '#1e293b', fontWeight: 500 }}>{o.customerName}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{o.product}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#15803d' }}>KES {Number(o.amount).toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', color: '#64748b' }}>KES {(Number(o.commission) || 0).toLocaleString()}</td>
                    <td style={{ padding: '10px 14px', color: '#0f766e', fontWeight: 500 }}>KES {orderNet(o).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {tableRows.map((o) => {
            const v = vendorById.get(o.vendorId);
            return (
              <li key={o.id} style={{ padding: 14, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', marginBottom: 4 }}>{o.id}</div>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{v?.name ?? `Vendor #${o.vendorId}`}</div>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>
                  {v?.region ?? 'Unknown'} · {o.status} · escrow {o.escrowStatus ?? '—'}
                </div>
                <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>{o.product}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: '#64748b' }}>{o.date}</span>
                  <span style={{ fontWeight: 700, color: '#15803d' }}>KES {Number(o.amount).toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#64748b' }}>
                  <span>Comm KES {(Number(o.commission) || 0).toLocaleString()}</span>
                  <span>Net KES {orderNet(o).toLocaleString()}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
