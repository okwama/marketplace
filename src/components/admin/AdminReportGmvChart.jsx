import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export function AdminReportGmvChart({ data, isDesktop, height }) {
  const h = height ?? (isDesktop ? 260 : 220);
  if (!data.length) {
    return (
      <div style={{
        height: h,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#94a3b8',
        fontSize: 13,
        background: '#fafafa',
        borderRadius: 12,
      }}
      >
        No dated orders in this selection for a trend chart.
      </div>
    );
  }

  return (
    <div style={{ height: h, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: isDesktop ? 0 : -18, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={isDesktop ? 48 : 40}
            tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : String(v))}
          />
          <Tooltip
            formatter={(value, name) => [`KES ${Number(value).toLocaleString()}`, name === 'gmv' ? 'GMV' : 'Commission']}
            contentStyle={{ borderRadius: 10, border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="gmv" name="GMV" fill="#4ade80" radius={[4, 4, 0, 0]} maxBarSize={28} />
          <Bar dataKey="commission" name="Commission" fill="#334155" radius={[4, 4, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
