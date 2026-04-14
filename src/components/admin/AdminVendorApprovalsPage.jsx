import React from 'react';
import { UserCheck } from 'lucide-react';

function badgeFor(status) {
  if (status === 'approved') return { bg: '#dcfce7', color: '#15803d', label: 'Approved' };
  if (status === 'pending') return { bg: '#ffedd5', color: '#c2410c', label: 'Pending' };
  return { bg: '#fee2e2', color: '#b91c1c', label: 'Suspended' };
}

export function AdminVendorApprovalsPage({ isDesktop, vendors, getVendorEffectiveStatus, setVendorStatus, clearVendorOverride }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 16 }}>
      <div style={{ background: 'white', padding: isDesktop ? 22 : 16, borderRadius: 16, border: '1px solid #bbf7d0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: isDesktop ? 18 : 16, display: 'flex', alignItems: 'center', gap: 10, color: '#14532d' }}>
          <UserCheck size={22} /> Vendor approvals
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
          Approve, hold, or suspend sellers. Overrides apply for this browser session and sync with the vendor login list.
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
        {isDesktop ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left', color: '#64748b' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vendor</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Contact</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Catalog status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((v) => {
                const eff = getVendorEffectiveStatus(v);
                const b = badgeFor(eff);
                const overridden = eff !== v.status;
                return (
                  <tr key={v.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{v.name}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{v.owner} · {v.category}</div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: 12 }}>{v.phone}<br />{v.email}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: 999, background: b.bg, color: b.color, fontWeight: 600, fontSize: 11 }}>
                        {b.label}
                      </span>
                      {overridden && (
                        <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>Mock: {v.status} → session</div>
                      )}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <button type="button" onClick={() => setVendorStatus(v.id, 'approved')} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#16a34a', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Approve</button>
                        <button type="button" onClick={() => setVendorStatus(v.id, 'pending')} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Pending</button>
                        <button type="button" onClick={() => setVendorStatus(v.id, 'suspended')} style={{ padding: '6px 12px', borderRadius: 8, border: 'none', background: '#fee2e2', color: '#b91c1c', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Suspend</button>
                        {overridden && (
                          <button type="button" onClick={() => clearVendorOverride(v.id)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px dashed #94a3b8', background: 'white', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Reset</button>
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
            {vendors.map((v) => {
              const eff = getVendorEffectiveStatus(v);
              const b = badgeFor(eff);
              return (
                <li key={v.id} style={{ padding: 16, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ fontWeight: 700, color: '#1e293b' }}>{v.name}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>{v.owner}</div>
                  <span style={{ padding: '4px 10px', borderRadius: 999, background: b.bg, color: b.color, fontWeight: 600, fontSize: 11 }}>{b.label}</span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    <button type="button" className="btn-primary" style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setVendorStatus(v.id, 'approved')}>Approve</button>
                    <button type="button" style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setVendorStatus(v.id, 'pending')}>Pending</button>
                    <button type="button" style={{ padding: '8px 14px', fontSize: 12, borderRadius: 8, border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => setVendorStatus(v.id, 'suspended')}>Suspend</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
