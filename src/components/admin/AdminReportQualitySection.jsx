import React from 'react';

export function AdminReportQualitySection({ isDesktop, unknownVendorAgg, missingRegionAgg }) {
  const unknownTotal = unknownVendorAgg.reduce((s, x) => s + x.count, 0);
  const missingRegTotal = missingRegionAgg.reduce((s, x) => s + x.count, 0);

  return (
    <div style={{ background: 'white', padding: isDesktop ? 22 : 16, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
      <h3 style={{ margin: '0 0 8px', color: '#334155', fontSize: 15 }}>Data quality (full ledger)</h3>
      <p style={{ margin: '0 0 18px', fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
        Orders whose vendor id is missing from the vendor directory, or whose vendor record has no region, will skew regional reports. Add those vendors in mock data to fix.
      </p>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 8 }}>
          Unknown vendor id ({unknownTotal} orders)
        </div>
        {unknownVendorAgg.length === 0 ? (
          <div style={{ fontSize: 13, color: '#16a34a' }}>None — all order vendor ids resolve.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: 13 }}>
            {unknownVendorAgg.map((row) => (
              <li key={row.vendorId}>Vendor #{row.vendorId}: {row.count} orders</li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 8 }}>
          Vendor missing region ({missingRegTotal} orders)
        </div>
        {missingRegionAgg.length === 0 ? (
          <div style={{ fontSize: 13, color: '#16a34a' }}>None in directory — regions set for all catalog vendors.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, color: '#475569', fontSize: 13 }}>
            {missingRegionAgg.map((row) => (
              <li key={row.vendorId}>Vendor #{row.vendorId}: {row.count} orders</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
