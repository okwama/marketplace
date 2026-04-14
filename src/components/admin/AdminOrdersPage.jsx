import React, { useState } from 'react';
import { ClipboardList } from 'lucide-react';

const STATUS_LABEL = {
  confirmed: 'Paid · assign rider',
  dispatched: 'In transit',
  delivered: 'Delivered',
};

export function AdminOrdersPage({
  isDesktop,
  liveOrders,
  vendors,
  riders,
  assignRiderToOrder,
  getRiderById,
}) {
  const [pickByOrder, setPickByOrder] = useState({});

  const vendorName = (vid) => vendors.find((v) => v.id === vid)?.name ?? `Vendor #${vid}`;
  const activeRiders = riders.filter((r) => r.active);

  const pipeline = [...liveOrders].sort((a, b) => String(b.id).localeCompare(String(a.id)));

  const setPick = (orderId, riderId) => {
    setPickByOrder((p) => ({ ...p, [orderId]: riderId }));
  };

  const assign = (orderId) => {
    const rid = pickByOrder[orderId];
    if (!rid) return;
    assignRiderToOrder(orderId, rid);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 16 }}>
      <div style={{ background: 'white', padding: isDesktop ? 22 : 16, borderRadius: 16, border: '1px solid #bbf7d0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: isDesktop ? 18 : 16, display: 'flex', alignItems: 'center', gap: 10, color: '#14532d' }}>
          <ClipboardList size={22} /> Orders & rider assignment
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
          Platform assigns riders to paid orders. After the vendor hands off, the rider (or vendor) enters the customer OTP to complete delivery and release escrow.
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: 16, overflow: 'auto', border: '1px solid #e2e8f0' }}>
        {isDesktop ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 720 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Order</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vendor</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Customer</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Rider</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Assign</th>
              </tr>
            </thead>
            <tbody>
              {pipeline.map((o) => {
                const rider = o.riderId ? getRiderById(o.riderId) : null;
                const canAssign = o.status === 'confirmed' && o.escrowStatus === 'held';
                return (
                  <tr key={o.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#1e293b', maxWidth: 200 }}>
                      <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500 }}>{o.id}</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>{o.product}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{vendorName(o.vendorId)}</td>
                    <td style={{ padding: '12px 16px', color: '#475569' }}>{o.customerName}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>KES {o.amount.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: o.status === 'delivered' ? '#15803d' : '#64748b' }}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: rider ? '#1e293b' : '#94a3b8' }}>
                      {rider ? `${rider.name} · ${rider.phone}` : '—'}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {canAssign ? (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                          <select
                            value={pickByOrder[o.id] ?? ''}
                            onChange={(e) => setPick(o.id, e.target.value)}
                            style={{ padding: 8, borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'inherit', maxWidth: 160 }}
                          >
                            <option value="">Select rider</option>
                            {activeRiders.map((r) => (
                              <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                          </select>
                          <button type="button" onClick={() => assign(o.id)} disabled={!pickByOrder[o.id]} style={{ padding: '8px 12px', borderRadius: 8, border: 'none', background: pickByOrder[o.id] ? '#16a34a' : '#cbd5e1', color: 'white', fontSize: 12, fontWeight: 600, cursor: pickByOrder[o.id] ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                            Assign
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94a3b8' }}>{o.status === 'delivered' ? 'Closed' : 'Locked'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {pipeline.map((o) => {
              const rider = o.riderId ? getRiderById(o.riderId) : null;
              const canAssign = o.status === 'confirmed' && o.escrowStatus === 'held';
              return (
                <li key={o.id} style={{ padding: 16, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontSize: 11, color: '#94a3b8' }}>{o.id}</div>
                  <div style={{ fontWeight: 600, marginTop: 4 }}>{o.product}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{vendorName(o.vendorId)} · {o.customerName}</div>
                  <div style={{ fontWeight: 700, marginTop: 8 }}>KES {o.amount.toLocaleString()} · {STATUS_LABEL[o.status] ?? o.status}</div>
                  <div style={{ fontSize: 12, marginTop: 8 }}>Rider: {rider ? `${rider.name}` : '—'}</div>
                  {canAssign && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <select
                        value={pickByOrder[o.id] ?? ''}
                        onChange={(e) => setPick(o.id, e.target.value)}
                        style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0', fontFamily: 'inherit' }}
                      >
                        <option value="">Select rider</option>
                        {activeRiders.map((r) => (
                          <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                      </select>
                      <button type="button" className="btn-primary" style={{ padding: '10px 16px', borderRadius: 8, border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => assign(o.id)} disabled={!pickByOrder[o.id]}>Assign</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
