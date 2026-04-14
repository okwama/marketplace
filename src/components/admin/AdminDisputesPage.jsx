import React, { useState, useCallback } from 'react';
import { Scale } from 'lucide-react';
import * as goAdminApi from '../../lib/goAdminApi';

export function AdminDisputesPage({
  isDesktop,
  disputes,
  apiMode = false,
  apiBase = '',
  apiToken = '',
  listLoading = false,
  listError = '',
  onRefresh = () => {},
}) {
  const [notesById, setNotesById] = useState({});
  const [patchBusyId, setPatchBusyId] = useState(null);
  const [patchErr, setPatchErr] = useState('');

  const openCount = disputes.filter((d) => d.status === 'open').length;
  const sourceLabel = apiMode ? 'Go API / Postgres' : 'seed data';

  const setNote = useCallback((id, v) => {
    setNotesById((prev) => ({ ...prev, [id]: v }));
  }, []);

  const handlePatch = async (row, status) => {
    if (!apiMode || !apiBase || !apiToken || row._apiId == null) return;
    setPatchErr('');
    setPatchBusyId(row.id);
    try {
      const notes = (notesById[row.id] || '').trim();
      await goAdminApi.patchDispute(apiBase, apiToken, row._apiId, {
        status,
        resolution_notes: notes,
      });
      await onRefresh();
    } catch (e) {
      setPatchErr(e?.message || 'Update failed');
    } finally {
      setPatchBusyId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 16 }}>
      <div style={{ background: 'white', padding: isDesktop ? 22 : 16, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: isDesktop ? 20 : 17, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Scale size={22} color="#16a34a" />
          Disputes
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>
          {apiMode
            ? 'Open disputes from the Go backend. Resolve or dismiss to write status and audit log.'
            : 'Demo-only case queue. Sign in via Go API above to load live disputes from Postgres.'}
        </p>
        <div style={{
          marginTop: 14,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 12,
          fontSize: 13,
          fontWeight: 600,
          color: openCount ? '#c2410c' : '#15803d',
        }}
        >
          <span>
            {openCount}
            {' '}
            open ·
            {' '}
            {disputes.length}
            {' '}
            total (
            {sourceLabel}
            )
          </span>
          {apiMode && (
            <button
              type="button"
              onClick={() => onRefresh()}
              disabled={listLoading}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #bbf7d0',
                background: '#f0fdf4',
                fontFamily: 'inherit',
                fontSize: 12,
                fontWeight: 600,
                color: '#14532d',
                cursor: listLoading ? 'wait' : 'pointer',
              }}
            >
              {listLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          )}
        </div>
        {listError ? (
          <div style={{ marginTop: 10, fontSize: 12, color: '#b91c1c' }}>{listError}</div>
        ) : null}
        {patchErr ? (
          <div style={{ marginTop: 10, fontSize: 12, color: '#b91c1c' }}>{patchErr}</div>
        ) : null}
      </div>

      <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {listLoading && disputes.length === 0 ? (
          <div style={{ padding: 24, color: '#64748b', fontSize: 14 }}>Loading disputes…</div>
        ) : disputes.length === 0 ? (
          <div style={{ padding: 24, color: '#94a3b8', fontSize: 14 }}>
            {apiMode ? 'No disputes returned from API.' : 'No disputes in mock data.'}
          </div>
        ) : isDesktop ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', color: '#64748b', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Order</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Raised by</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Vendor</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Date</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Reason</th>
                {apiMode ? <th style={{ padding: '12px 16px', fontWeight: 600 }}>Actions</th> : null}
              </tr>
            </thead>
            <tbody>
              {disputes.map((d) => (
                <tr key={d.id} style={{ borderTop: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                  <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: 12, color: '#475569' }}>{d.id}</td>
                  <td style={{ padding: '14px 16px', color: '#1e293b', fontWeight: 600 }}>{d.orderId}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{d.raisedBy}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{d.vendor}</td>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#15803d' }}>KES {Number(d.amount).toLocaleString()}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      background: d.status === 'open' ? '#ffedd5' : '#e2e8f0',
                      color: d.status === 'open' ? '#c2410c' : '#475569',
                    }}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#64748b' }}>{d.date}</td>
                  <td style={{ padding: '14px 16px', color: '#475569', maxWidth: 220, lineHeight: 1.4 }}>{d.reason ?? '—'}</td>
                  {apiMode ? (
                    <td style={{ padding: '14px 16px', minWidth: 200 }}>
                      {d.status === 'open' && d._apiId != null ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          <input
                            placeholder="Resolution notes (optional)"
                            value={notesById[d.id] || ''}
                            onChange={(e) => setNote(d.id, e.target.value)}
                            style={{
                              padding: '6px 8px',
                              borderRadius: 8,
                              border: '1px solid #e2e8f0',
                              fontFamily: 'inherit',
                              fontSize: 12,
                            }}
                          />
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            <button
                              type="button"
                              disabled={patchBusyId === d.id}
                              onClick={() => handlePatch(d, 'resolved')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 8,
                                border: 'none',
                                background: '#15803d',
                                color: 'white',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: patchBusyId === d.id ? 'wait' : 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              Resolve
                            </button>
                            <button
                              type="button"
                              disabled={patchBusyId === d.id}
                              onClick={() => handlePatch(d, 'dismissed')}
                              style={{
                                padding: '6px 10px',
                                borderRadius: 8,
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                color: '#475569',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: patchBusyId === d.id ? 'wait' : 'pointer',
                                fontFamily: 'inherit',
                              }}
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{d.resolutionNotes || '—'}</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {disputes.map((d) => (
              <li key={d.id} style={{ padding: 16, borderBottom: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' }}>{d.id}</div>
                <div style={{ fontWeight: 700, color: '#1e293b', marginTop: 4 }}>{d.orderId} · {d.vendor}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{d.reason}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 12 }}>
                  <span style={{ fontWeight: 700, color: '#15803d' }}>KES {Number(d.amount).toLocaleString()}</span>
                  <span style={{ color: '#64748b' }}>{d.date}</span>
                </div>
                {apiMode && d.status === 'open' && d._apiId != null ? (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input
                      placeholder="Resolution notes (optional)"
                      value={notesById[d.id] || ''}
                      onChange={(e) => setNote(d.id, e.target.value)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        fontFamily: 'inherit',
                        fontSize: 12,
                      }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        type="button"
                        disabled={patchBusyId === d.id}
                        onClick={() => handlePatch(d, 'resolved')}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: 'none',
                          background: '#15803d',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: patchBusyId === d.id ? 'wait' : 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Resolve
                      </button>
                      <button
                        type="button"
                        disabled={patchBusyId === d.id}
                        onClick={() => handlePatch(d, 'dismissed')}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: 8,
                          border: '1px solid #cbd5e1',
                          background: 'white',
                          color: '#475569',
                          fontWeight: 600,
                          fontSize: 12,
                          cursor: patchBusyId === d.id ? 'wait' : 'pointer',
                          fontFamily: 'inherit',
                        }}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
