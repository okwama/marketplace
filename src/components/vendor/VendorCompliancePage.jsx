import React from 'react';
import { ShieldAlert, FileText, Upload } from 'lucide-react';
import { MaterialSymbol } from '../MaterialSymbol';

const CHECKLIST = [
  { id: 'biz', label: 'Business registration / PIN', status: 'complete' },
  { id: 'id', label: 'Owner ID verification', status: 'complete' },
  { id: 'bank', label: 'Payout bank account verified', status: 'pending' },
  { id: 'addr', label: 'Proof of address (utility bill)', status: 'pending' },
];

export function VendorCompliancePage({ isDesktop, vendor }) {
  const tier = vendor.kycLevel ?? 1;
  const statusLabel = vendor.status === 'approved' ? 'Approved' : vendor.status === 'pending' ? 'Pending review' : 'Suspended';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 16 }}>
      <div className="card" style={{ padding: isDesktop ? 22 : 16 }}>
        <h2 style={{ margin: '0 0 6px', color: 'var(--text-main)', fontSize: isDesktop ? 20 : 17, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldAlert size={22} color="var(--warning)" />
          Compliance & KYC
        </h2>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.5 }}>
          Tier limits and payouts are gated by verification. This screen mirrors what ops would review before raising your ceiling.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? 'repeat(3, minmax(0, 1fr))' : '1fr',
        gap: isDesktop ? 16 : 12,
      }}
      >
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>Account status</div>
          <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: 'var(--text-main)' }}>{statusLabel}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>{vendor.name}</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>KYC tier</div>
          <div style={{ fontSize: isDesktop ? 22 : 18, fontWeight: 800, color: 'var(--primary)' }}>Level {tier}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>Higher tiers unlock larger escrow holds</div>
        </div>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 8 }}>Primary contact</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)' }}>{vendor.owner}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{vendor.phone}</div>
        </div>
      </div>

      <div className="card" style={{ padding: isDesktop ? 22 : 16 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: isDesktop ? 16 : 15, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={18} color="var(--primary)" />
          Document checklist
        </h3>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {CHECKLIST.map((item) => (
            <li
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '12px 14px',
                background: '#f8fafc',
                borderRadius: 10,
                border: '1px solid var(--border-color)',
              }}
            >
              <span style={{ fontSize: 14, color: 'var(--text-main)', fontWeight: 500 }}>{item.label}</span>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                padding: '4px 10px',
                borderRadius: 999,
                background: item.status === 'complete' ? '#ecfdf5' : '#fffbeb',
                color: item.status === 'complete' ? 'var(--secondary)' : '#b45309',
              }}
              >
                {item.status === 'complete' ? 'Verified' : 'Needed'}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          style={{
            marginTop: 18,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '12px 18px',
            borderRadius: 10,
            border: '1px dashed var(--border-color)',
            background: 'white',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            width: isDesktop ? 'auto' : '100%',
          }}
        >
          <Upload size={18} />
          Upload document (demo)
        </button>
      </div>

      <div className="card" style={{ padding: isDesktop ? 22 : 16, background: '#fffbeb', border: '1px dashed #f59e0b' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <MaterialSymbol name="info" size={22} style={{ color: '#b45309', flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: '#92400e', marginBottom: 6, fontSize: 14 }}>Why this matters</div>
            <p style={{ margin: 0, fontSize: 13, color: '#b45309', lineHeight: 1.5 }}>
              Marketplace rules require identity and payout verification before releasing high-value escrow batches. In production this links to your risk provider and manual review queue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
