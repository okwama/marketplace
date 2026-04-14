export const PERIODS = [
  { id: 'all', label: 'All dates' },
  { id: '30d', label: 'Last 30 days' },
  { id: 'month', label: 'This month' },
  { id: 'year', label: 'This year' },
];

export const SOURCE_OPTS = [
  { id: 'all', label: 'All orders' },
  { id: 'demo', label: 'Demo checkouts only' },
  { id: 'seed', label: 'Seed ledger only' },
];

export function orderNet(o) {
  if (o.netVendor != null) return Number(o.netVendor);
  return Number(o.amount) - (Number(o.commission) || 0);
}

export function parseYmd(d) {
  if (!d) return null;
  const t = Date.parse(`${d}T12:00:00`);
  return Number.isNaN(t) ? null : t;
}

function startOfDay(y, m, day) {
  return new Date(y, m, day, 0, 0, 0, 0).getTime();
}

/** Current window for period (for comparison labeling). */
export function currentPeriodBounds(period) {
  if (period === 'all') return null;
  const nowMs = Date.now();
  const d = new Date(nowMs);
  if (period === '30d') {
    return { start: nowMs - 30 * 86400000, end: nowMs };
  }
  if (period === 'month') {
    const start = startOfDay(d.getFullYear(), d.getMonth(), 1);
    const next = startOfDay(d.getFullYear(), d.getMonth() + 1, 1);
    return { start, end: next };
  }
  if (period === 'year') {
    const start = startOfDay(d.getFullYear(), 0, 1);
    const next = startOfDay(d.getFullYear() + 1, 0, 1);
    return { start, end: next };
  }
  return null;
}

/** Immediately preceding window of equal length (30d / calendar month / calendar year). */
export function previousPeriodBounds(period) {
  if (period === 'all') return null;
  const d = new Date();
  if (period === '30d') {
    const end = Date.now() - 30 * 86400000;
    const start = end - 30 * 86400000;
    return { start, end };
  }
  if (period === 'month') {
    const thisStart = startOfDay(d.getFullYear(), d.getMonth(), 1);
    const prevMonthEnd = thisStart - 86400000;
    const pr = new Date(prevMonthEnd);
    const prevStart = startOfDay(pr.getFullYear(), pr.getMonth(), 1);
    return { start: prevStart, end: thisStart };
  }
  if (period === 'year') {
    const thisStart = startOfDay(d.getFullYear(), 0, 1);
    const prevStart = startOfDay(d.getFullYear() - 1, 0, 1);
    return { start: prevStart, end: thisStart };
  }
  return null;
}

export function inPeriod(ts, period) {
  if (period === 'all') return true;
  if (ts == null) return false;
  const b = currentPeriodBounds(period);
  if (!b) return true;
  return ts >= b.start && ts < b.end;
}

export function inPreviousPeriod(ts, period) {
  if (period === 'all') return false;
  if (ts == null) return false;
  const b = previousPeriodBounds(period);
  if (!b) return false;
  return ts >= b.start && ts < b.end;
}

export function sourceMatch(o, source) {
  const demo = String(o.id).includes('DEMO');
  if (source === 'demo') return demo;
  if (source === 'seed') return !demo;
  return true;
}

export function escrowMatch(o, escrow) {
  if (escrow === 'all') return true;
  return (o.escrowStatus ?? '') === escrow;
}

export function payoutMatch(o, payout) {
  if (payout === 'all') return true;
  const paid = o.payoutDate != null && String(o.payoutDate).trim() !== '';
  if (payout === 'paid') return paid;
  if (payout === 'unpaid') return !paid;
  return true;
}

export function applyReportFilters(orders, {
  period,
  vendorId,
  region,
  status,
  source,
  escrow,
  payout,
  vendorById,
  periodMode = 'current',
}) {
  const usePrev = periodMode === 'previous';
  return orders.filter((o) => {
    if (!sourceMatch(o, source)) return false;
    if (status !== 'all' && o.status !== status) return false;
    if (vendorId !== 'all' && o.vendorId !== Number(vendorId)) return false;
    const v = vendorById.get(o.vendorId);
    const reg = v?.region ?? 'Unknown';
    if (region !== 'all' && reg !== region) return false;
    if (!escrowMatch(o, escrow)) return false;
    if (!payoutMatch(o, payout)) return false;
    const ts = parseYmd(o.date);
    if (usePrev) {
      if (!inPreviousPeriod(ts, period)) return false;
    } else if (!inPeriod(ts, period)) {
      return false;
    }
    return true;
  });
}

export function sumTotals(rows) {
  let gmv = 0;
  let commission = 0;
  let netVendor = 0;
  rows.forEach((o) => {
    gmv += Number(o.amount) || 0;
    commission += Number(o.commission) || 0;
    netVendor += orderNet(o);
  });
  const count = rows.length;
  const avgOrder = count > 0 ? Math.round(gmv / count) : 0;
  const commPct = gmv > 0 ? (commission / gmv) * 100 : 0;
  return {
    gmv, commission, netVendor, count, avgOrder, commPct,
  };
}

export function aggregateByVendor(filtered, vendorById) {
  const map = new Map();
  filtered.forEach((o) => {
    const vid = o.vendorId;
    const v = vendorById.get(vid);
    const name = v?.name ?? `Vendor #${vid}`;
    const reg = v?.region ?? 'Unknown';
    if (!map.has(vid)) {
      map.set(vid, {
        vendorId: vid, name, region: reg, orders: 0, gmv: 0, commission: 0, netVendor: 0,
      });
    }
    const row = map.get(vid);
    row.orders += 1;
    row.gmv += Number(o.amount) || 0;
    row.commission += Number(o.commission) || 0;
    row.netVendor += orderNet(o);
  });
  return Array.from(map.values()).sort((a, b) => b.gmv - a.gmv);
}

export function aggregateByRegion(filtered, vendorById) {
  const map = new Map();
  filtered.forEach((o) => {
    const v = vendorById.get(o.vendorId);
    const reg = v?.region ?? 'Unknown';
    if (!map.has(reg)) {
      map.set(reg, {
        region: reg, orders: 0, gmv: 0, commission: 0, netVendor: 0,
      });
    }
    const row = map.get(reg);
    row.orders += 1;
    row.gmv += Number(o.amount) || 0;
    row.commission += Number(o.commission) || 0;
    row.netVendor += orderNet(o);
  });
  return Array.from(map.values()).sort((a, b) => b.gmv - a.gmv);
}

/** Chronological daily buckets for chart; cap length for readability. */
export function dailyGmvSeries(filtered, maxPoints = 45) {
  const m = new Map();
  filtered.forEach((o) => {
    const day = o.date || '—';
    if (!m.has(day)) m.set(day, { date: day, label: day, gmv: 0, commission: 0 });
    const row = m.get(day);
    row.gmv += Number(o.amount) || 0;
    row.commission += Number(o.commission) || 0;
  });
  const arr = Array.from(m.values()).sort((a, b) => a.date.localeCompare(b.date));
  if (arr.length <= maxPoints) return arr;
  return arr.slice(-maxPoints);
}
