import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { BarChart3, Filter, LayoutGrid, Table2, Database } from 'lucide-react';
import { MaterialSymbol } from '../MaterialSymbol';
import { AdminReportGmvChart } from './AdminReportGmvChart';
import { AdminReportQualitySection } from './AdminReportQualitySection';
import {
  DeltaHint, RollupByVendor, RollupByRegion, LedgerSection,
} from './AdminReportTables';
import {
  PERIODS,
  SOURCE_OPTS,
  orderNet,
  applyReportFilters,
  sumTotals,
  aggregateByVendor,
  aggregateByRegion,
  dailyGmvSeries,
} from './reportFinanceUtils';

const STORAGE_KEY = 'mp-admin-report-filters';

const REPORT_TABS = [
  { id: 'overview', label: 'Overview', Icon: LayoutGrid },
  { id: 'ledger', label: 'Ledger', Icon: Table2 },
  { id: 'quality', label: 'Data quality', Icon: Database },
];

function loadSavedFilters() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && typeof v === 'object' ? v : null;
  } catch {
    return null;
  }
}

function readInitialFilters() {
  const s = loadSavedFilters();
  return {
    reportTab: REPORT_TABS.some((t) => t.id === s?.reportTab) ? s.reportTab : 'overview',
    period: s?.period && PERIODS.some((p) => p.id === s.period) ? s.period : 'all',
    vendorId: s?.vendorId ?? 'all',
    region: s?.region ?? 'all',
    status: s?.status ?? 'all',
    source: s?.source && SOURCE_OPTS.some((x) => x.id === s.source) ? s.source : 'all',
    escrow: s?.escrow ?? 'all',
    payout: s?.payout ?? 'all',
  };
}

export function AdminReportsPage({
  isDesktop, liveOrders, liveGmv, liveOrderCount, vendors,
}) {
  const vendorById = useMemo(() => {
    const m = new Map();
    vendors.forEach((v) => m.set(v.id, v));
    return m;
  }, [vendors]);

  const initialFilters = useMemo(() => readInitialFilters(), []);
  const [reportTab, setReportTab] = useState(() => initialFilters.reportTab);
  const [period, setPeriod] = useState(() => initialFilters.period);
  const [vendorId, setVendorId] = useState(() => initialFilters.vendorId);
  const [region, setRegion] = useState(() => initialFilters.region);
  const [status, setStatus] = useState(() => initialFilters.status);
  const [source, setSource] = useState(() => initialFilters.source);
  const [escrow, setEscrow] = useState(() => initialFilters.escrow);
  const [payout, setPayout] = useState(() => initialFilters.payout);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        reportTab, period, vendorId, region, status, source, escrow, payout,
      }));
    } catch {
      /* ignore */
    }
  }, [reportTab, period, vendorId, region, status, source, escrow, payout]);

  const filterArgs = useMemo(() => ({
    period, vendorId, region, status, source, escrow, payout, vendorById,
  }), [period, vendorId, region, status, source, escrow, payout, vendorById]);

  const regions = useMemo(() => {
    const s = new Set();
    vendors.forEach((v) => {
      if (v.region) s.add(v.region);
    });
    return Array.from(s).sort();
  }, [vendors]);

  const statuses = useMemo(() => {
    const s = new Set(liveOrders.map((o) => o.status).filter(Boolean));
    return Array.from(s).sort();
  }, [liveOrders]);

  const escrowStatuses = useMemo(() => {
    const s = new Set(liveOrders.map((o) => o.escrowStatus).filter(Boolean));
    return Array.from(s).sort();
  }, [liveOrders]);

  const filtered = useMemo(
    () => applyReportFilters(liveOrders, { ...filterArgs, periodMode: 'current' }),
    [liveOrders, filterArgs],
  );

  const filteredPrev = useMemo(
    () => (period === 'all' ? [] : applyReportFilters(liveOrders, { ...filterArgs, periodMode: 'previous' })),
    [liveOrders, filterArgs, period],
  );

  const totals = useMemo(() => sumTotals(filtered), [filtered]);
  const prevTotals = useMemo(() => sumTotals(filteredPrev), [filteredPrev]);

  const byVendor = useMemo(() => aggregateByVendor(filtered, vendorById), [filtered, vendorById]);
  const byRegion = useMemo(() => aggregateByRegion(filtered, vendorById), [filtered, vendorById]);

  const chartData = useMemo(() => dailyGmvSeries(filtered), [filtered]);

  const tableRows = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    return copy;
  }, [filtered]);

  const commissionLedgerTotal = useMemo(
    () => liveOrders.reduce((s, o) => s + (Number(o.commission) || 0), 0),
    [liveOrders],
  );

  const filtersNarrowed = useMemo(() => (
    period !== 'all'
    || vendorId !== 'all'
    || region !== 'all'
    || status !== 'all'
    || source !== 'all'
    || escrow !== 'all'
    || payout !== 'all'
  ), [period, vendorId, region, status, source, escrow, payout]);

  const unknownVendorAgg = useMemo(() => {
    const m = new Map();
    liveOrders.forEach((o) => {
      if (vendorById.has(o.vendorId)) return;
      m.set(o.vendorId, (m.get(o.vendorId) ?? 0) + 1);
    });
    return Array.from(m.entries()).map(([id, count]) => ({ vendorId: id, count })).sort((a, b) => b.count - a.count);
  }, [liveOrders, vendorById]);

  const missingRegionAgg = useMemo(() => {
    const m = new Map();
    liveOrders.forEach((o) => {
      const v = vendorById.get(o.vendorId);
      if (!v || v.region) return;
      m.set(o.vendorId, (m.get(o.vendorId) ?? 0) + 1);
    });
    return Array.from(m.entries()).map(([id, count]) => ({ vendorId: id, count })).sort((a, b) => b.count - a.count);
  }, [liveOrders, vendorById]);

  const applyPreset = useCallback((patch) => {
    if (patch === 'reset') {
      setPeriod('all');
      setVendorId('all');
      setRegion('all');
      setStatus('all');
      setSource('all');
      setEscrow('all');
      setPayout('all');
      return;
    }
    if (patch.period != null) setPeriod(patch.period);
    if (patch.vendorId != null) setVendorId(patch.vendorId);
    if (patch.region != null) setRegion(patch.region);
    if (patch.status != null) setStatus(patch.status);
    if (patch.source != null) setSource(patch.source);
    if (patch.escrow != null) setEscrow(patch.escrow);
    if (patch.payout != null) setPayout(patch.payout);
  }, []);

  const exportCsv = useCallback(() => {
    const headers = ['id', 'date', 'vendor', 'region', 'customer', 'product', 'amount', 'commission', 'net_vendor', 'status', 'escrow', 'payout_date'];
    const lines = [headers.join(',')];
    const meta = `# filters: period=${period} vendor=${vendorId} region=${region} status=${status} source=${source} escrow=${escrow} payout=${payout} rows=${tableRows.length}`;
    lines.push(meta);
    tableRows.forEach((o) => {
      const v = vendorById.get(o.vendorId);
      const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
      lines.push([
        o.id,
        o.date,
        esc(v?.name ?? ''),
        v?.region ?? 'Unknown',
        esc(o.customerName ?? ''),
        esc(o.product ?? ''),
        Number(o.amount) || 0,
        Number(o.commission) || 0,
        orderNet(o),
        o.status ?? '',
        o.escrowStatus ?? '',
        o.payoutDate ?? '',
      ].join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [tableRows, vendorById, period, vendorId, region, status, source, escrow, payout]);

  const selectStyle = {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    fontSize: 12,
    fontFamily: 'inherit',
    background: 'white',
    color: '#334155',
    width: '100%',
    boxSizing: 'border-box',
  };

  const filterLabel = { fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4, display: 'block' };

  const tabBtn = (id, label, Icon) => {
    const on = reportTab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => setReportTab(id)}
        style={{
          flex: 1,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '10px 12px',
          borderRadius: 12,
          border: on ? '1px solid #86efac' : '1px solid #e2e8f0',
          background: on ? '#ecfdf5' : '#f8fafc',
          color: on ? '#15803d' : '#64748b',
          fontWeight: on ? 700 : 600,
          fontSize: 13,
          cursor: 'pointer',
          fontFamily: 'inherit',
          maxWidth: isDesktop ? 200 : 'none',
        }}
      >
        <Icon size={18} strokeWidth={on ? 2.25 : 2} />
        {label}
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 16 }}>
      <div style={{ background: 'white', padding: isDesktop ? 22 : 16, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: isDesktop ? 20 : 17, display: 'flex', alignItems: 'center', gap: 10 }}>
          <BarChart3 size={22} color="#16a34a" />
          Reports
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>
          Financial slices of the demo order ledger. GMV is checkout total; commission is the platform fee; net to vendors is GMV minus commission (or the stored net field when present).
        </p>
      </div>

      <div style={{ background: 'white', padding: isDesktop ? 18 : 14, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, color: '#334155', fontWeight: 700, fontSize: 14 }}>
          <Filter size={18} color="#16a34a" />
          Filters
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(4, minmax(0, 1fr))' : '1fr',
          gap: isDesktop ? 12 : 10,
          marginBottom: 12,
        }}
        >
          <label>
            <span style={filterLabel}>Period</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={selectStyle}>
              {PERIODS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span style={filterLabel}>Vendor</span>
            <select value={vendorId} onChange={(e) => setVendorId(e.target.value)} style={selectStyle}>
              <option value="all">All vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={String(v.id)}>{v.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span style={filterLabel}>Region</span>
            <select value={region} onChange={(e) => setRegion(e.target.value)} style={selectStyle}>
              <option value="all">All regions</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            <span style={filterLabel}>Order status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
              <option value="all">All statuses</option>
              {statuses.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </label>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? 'repeat(4, minmax(0, 1fr))' : '1fr',
          gap: isDesktop ? 12 : 10,
        }}
        >
          <label>
            <span style={filterLabel}>Source</span>
            <select value={source} onChange={(e) => setSource(e.target.value)} style={selectStyle}>
              {SOURCE_OPTS.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </label>
          <label>
            <span style={filterLabel}>Escrow</span>
            <select value={escrow} onChange={(e) => setEscrow(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              {escrowStatuses.map((es) => (
                <option key={es} value={es}>{es}</option>
              ))}
            </select>
          </label>
          <label>
            <span style={filterLabel}>Payout</span>
            <select value={payout} onChange={(e) => setPayout(e.target.value)} style={selectStyle}>
              <option value="all">All</option>
              <option value="paid">Paid (has date)</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <span style={filterLabel}>Quick presets</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" onClick={() => applyPreset({ source: 'demo', period: '30d' })} style={{ ...selectStyle, width: 'auto', cursor: 'pointer', padding: '6px 10px' }}>Demo · 30d</button>
              <button type="button" onClick={() => applyPreset({ region: 'Nairobi Metro' })} style={{ ...selectStyle, width: 'auto', cursor: 'pointer', padding: '6px 10px' }}>Nairobi Metro</button>
              <button type="button" onClick={() => applyPreset('reset')} style={{ ...selectStyle, width: 'auto', cursor: 'pointer', padding: '6px 10px' }}>Reset</button>
            </div>
          </div>
        </div>
        <p style={{ margin: '12px 0 0', fontSize: 12, color: '#94a3b8' }}>
          Full ledger: KES {liveGmv.toLocaleString()} GMV · {liveOrderCount} orders · KES {commissionLedgerTotal.toLocaleString()} commission (unfiltered).
          {filtersNarrowed && liveGmv > 0 && (
            <span>
              {' '}
              Selection is {(totals.gmv / liveGmv * 100).toFixed(1)}% of platform GMV.
            </span>
          )}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {REPORT_TABS.map(({ id, label, Icon }) => tabBtn(id, label, Icon))}
      </div>

      {reportTab === 'overview' && (
        <>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(3, minmax(0, 1fr))' : '1fr',
            gap: isDesktop ? 16 : 12,
          }}
          >
            <div style={{ background: 'white', padding: 18, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                <MaterialSymbol name="payments" size={22} />
                GMV (filtered)
              </div>
              <div style={{ fontSize: isDesktop ? 26 : 22, fontWeight: 800, color: '#15803d' }}>KES {totals.gmv.toLocaleString()}</div>
              <div style={{ marginTop: 6 }}>
                {period !== 'all' ? (
                  <DeltaHint current={totals.gmv} previous={prevTotals.gmv} suffix="period GMV" />
                ) : filtersNarrowed && liveGmv > 0 ? (
                  <span style={{ fontSize: 11, color: '#64748b' }}>
                    {(totals.gmv / liveGmv * 100).toFixed(1)}% of full ledger GMV
                  </span>
                ) : (
                  <span style={{ fontSize: 11, color: '#94a3b8' }}>Matches full date range</span>
                )}
              </div>
            </div>
            <div style={{ background: 'white', padding: 18, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                <MaterialSymbol name="percent" size={22} />
                Commission (filtered)
              </div>
              <div style={{ fontSize: isDesktop ? 26 : 22, fontWeight: 800, color: '#1e293b' }}>KES {totals.commission.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{totals.commPct.toFixed(1)}% of filtered GMV</div>
              {period !== 'all' && (
                <div style={{ marginTop: 4 }}>
                  <DeltaHint current={totals.commission} previous={prevTotals.commission} suffix="period commission" />
                </div>
              )}
            </div>
            <div style={{ background: 'white', padding: 18, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                <MaterialSymbol name="storefront" size={22} />
                Net to vendors (filtered)
              </div>
              <div style={{ fontSize: isDesktop ? 26 : 22, fontWeight: 800, color: '#0f766e' }}>KES {totals.netVendor.toLocaleString()}</div>
              {period !== 'all' && (
                <div style={{ marginTop: 6 }}>
                  <DeltaHint current={totals.netVendor} previous={prevTotals.netVendor} suffix="period net" />
                </div>
              )}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? 'repeat(3, minmax(0, 1fr))' : '1fr',
            gap: isDesktop ? 16 : 12,
          }}
          >
            <div style={{ background: 'white', padding: 18, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Orders (filtered)</div>
              <div style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 800, color: '#1e293b' }}>{totals.count}</div>
              {period !== 'all' && (
                <div style={{ marginTop: 6 }}>
                  <DeltaHint current={totals.count} previous={prevTotals.count} suffix="order count" />
                </div>
              )}
            </div>
            <div style={{ background: 'white', padding: 18, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Avg order value</div>
              <div style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 800, color: '#15803d' }}>KES {totals.avgOrder.toLocaleString()}</div>
            </div>
            <div style={{ background: 'white', padding: 18, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 8 }}>Vendors with sales</div>
              <div style={{ fontSize: isDesktop ? 24 : 20, fontWeight: 800, color: '#1e293b' }}>{byVendor.length}</div>
            </div>
          </div>

          <div style={{ background: 'white', padding: isDesktop ? 22 : 16, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 16px', color: '#334155', fontSize: isDesktop ? 15 : 14 }}>GMV and commission by day (filtered)</h3>
            <AdminReportGmvChart data={chartData} isDesktop={isDesktop} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
            gap: isDesktop ? 16 : 12,
          }}
          >
            <RollupByVendor isDesktop={isDesktop} byVendor={byVendor} />
            <RollupByRegion isDesktop={isDesktop} byRegion={byRegion} />
          </div>
        </>
      )}

      {reportTab === 'ledger' && (
        <LedgerSection
          isDesktop={isDesktop}
          tableRows={tableRows}
          vendorById={vendorById}
          exportCsv={exportCsv}
        />
      )}

      {reportTab === 'quality' && (
        <AdminReportQualitySection
          isDesktop={isDesktop}
          unknownVendorAgg={unknownVendorAgg}
          missingRegionAgg={missingRegionAgg}
        />
      )}
    </div>
  );
}
