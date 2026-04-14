import { describe, it, expect } from 'vitest';
import {
  orderNet,
  sumTotals,
  applyReportFilters,
  inPeriod,
  parseYmd,
  dailyGmvSeries,
} from './reportFinanceUtils.js';

function vendorMapFromRows(rows) {
  const m = new Map();
  rows.forEach((v) => m.set(v.id, v));
  return m;
}

describe('orderNet', () => {
  it('uses netVendor when present', () => {
    expect(orderNet({ amount: 1000, commission: 50, netVendor: 950 })).toBe(950);
  });

  it('derives from amount minus commission', () => {
    expect(orderNet({ amount: 1000, commission: 50 })).toBe(950);
  });

  it('treats missing commission as zero', () => {
    expect(orderNet({ amount: 200 })).toBe(200);
  });
});

describe('sumTotals', () => {
  it('aggregates empty list', () => {
    const t = sumTotals([]);
    expect(t.gmv).toBe(0);
    expect(t.count).toBe(0);
    expect(t.commPct).toBe(0);
  });

  it('sums gmv, commission, net', () => {
    const t = sumTotals([
      { amount: 1000, commission: 100, netVendor: 900 },
      { amount: 500, commission: 25 },
    ]);
    expect(t.gmv).toBe(1500);
    expect(t.commission).toBe(125);
    expect(t.netVendor).toBe(900 + 475);
    expect(t.count).toBe(2);
    expect(t.avgOrder).toBe(750);
  });
});

describe('applyReportFilters', () => {
  const vendorById = vendorMapFromRows([
    { id: 1, name: 'A', region: 'Nairobi Metro' },
    { id: 2, name: 'B', region: 'Western' },
  ]);

  const orders = [
    { id: 'o1', vendorId: 1, amount: 100, commission: 5, status: 'delivered', date: '2026-04-10', escrowStatus: 'released', payoutDate: '2026-04-10' },
    { id: 'o2', vendorId: 2, amount: 200, commission: 10, status: 'confirmed', date: '2026-04-11', escrowStatus: 'held', payoutDate: null },
    { id: 'MSK-DEMO-x', vendorId: 1, amount: 50, commission: 2, status: 'delivered', date: '2026-04-12', escrowStatus: 'released', payoutDate: '2026-04-12' },
  ];

  it('filters by vendor', () => {
    const out = applyReportFilters(orders, {
      period: 'all',
      vendorId: '1',
      region: 'all',
      status: 'all',
      source: 'all',
      escrow: 'all',
      payout: 'all',
      vendorById,
      periodMode: 'current',
    });
    expect(out.map((o) => o.id)).toEqual(['o1', 'MSK-DEMO-x']);
  });

  it('filters demo source only', () => {
    const out = applyReportFilters(orders, {
      period: 'all',
      vendorId: 'all',
      region: 'all',
      status: 'all',
      source: 'demo',
      escrow: 'all',
      payout: 'all',
      vendorById,
      periodMode: 'current',
    });
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('MSK-DEMO-x');
  });

  it('filters escrow held', () => {
    const out = applyReportFilters(orders, {
      period: 'all',
      vendorId: 'all',
      region: 'all',
      status: 'all',
      source: 'all',
      escrow: 'held',
      payout: 'all',
      vendorById,
      periodMode: 'current',
    });
    expect(out.map((o) => o.id)).toEqual(['o2']);
  });

  it('filters unpaid payout', () => {
    const out = applyReportFilters(orders, {
      period: 'all',
      vendorId: 'all',
      region: 'all',
      status: 'all',
      source: 'all',
      escrow: 'all',
      payout: 'unpaid',
      vendorById,
      periodMode: 'current',
    });
    expect(out.map((o) => o.id)).toEqual(['o2']);
  });
});

describe('inPeriod', () => {
  it('all dates accepts any parsed ts', () => {
    expect(inPeriod(parseYmd('2026-01-01'), 'all')).toBe(true);
    expect(inPeriod(null, 'all')).toBe(true);
  });
});

describe('dailyGmvSeries', () => {
  it('buckets by date', () => {
    const rows = [
      { date: '2026-04-01', amount: 100, commission: 5 },
      { date: '2026-04-01', amount: 50, commission: 2 },
      { date: '2026-04-02', amount: 200, commission: 10 },
    ];
    const s = dailyGmvSeries(rows);
    expect(s).toHaveLength(2);
    expect(s[0].gmv).toBe(150);
    expect(s[0].commission).toBe(7);
    expect(s[1].gmv).toBe(200);
  });
});
