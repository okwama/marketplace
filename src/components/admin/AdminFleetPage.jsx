import React, { useState } from 'react';
import { Bike, Plus, Trash2 } from 'lucide-react';

export function AdminFleetPage({ isDesktop, riders, addRider, toggleRiderActive, removeRider }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    addRider({ name, phone });
    setName('');
    setPhone('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 16 }}>
      <div style={{ background: 'white', padding: isDesktop ? 22 : 16, borderRadius: 16, border: '1px solid #bbf7d0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: isDesktop ? 18 : 16, display: 'flex', alignItems: 'center', gap: 10, color: '#14532d' }}>
          <Bike size={22} /> Rider fleet
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
          Add riders here. Admins assign them to paid orders; vendors hand off packages; riders complete delivery (or vendors verify OTP).
        </p>
      </div>

      <form onSubmit={submit} style={{ background: 'white', padding: isDesktop ? 20 : 16, borderRadius: 16, border: '1px solid #e2e8f0', display: 'flex', flexDirection: isDesktop ? 'row' : 'column', gap: 12, flexWrap: 'wrap', alignItems: isDesktop ? 'flex-end' : 'stretch' }}>
        <label style={{ flex: isDesktop ? '1 1 180px' : 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600, color: '#64748b' }}>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Kamau" required style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit' }} />
        </label>
        <label style={{ flex: isDesktop ? '1 1 180px' : 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, fontWeight: 600, color: '#64748b' }}>
          Phone
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+2547..." required style={{ padding: 10, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 14, fontFamily: 'inherit' }} />
        </label>
        <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: 'none', background: '#16a34a', color: 'white', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          <Plus size={18} /> Add rider
        </button>
      </form>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', background: '#f8fafc', fontWeight: 600, color: '#334155', fontSize: 14 }}>Active roster ({riders.length})</div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {riders.map((r) => (
            <li key={r.id} style={{ padding: '14px 16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1e293b' }}>{r.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{r.phone}</div>
                <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 4 }}>{r.id}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={r.active} onChange={() => toggleRiderActive(r.id)} />
                  Active
                </label>
                <button type="button" onClick={() => { if (window.confirm(`Remove ${r.name} from fleet? Unassigns them from orders.`)) removeRider(r.id); }} style={{ padding: 8, border: 'none', background: '#fee2e2', color: '#b91c1c', borderRadius: 8, cursor: 'pointer', display: 'flex' }} aria-label="Remove rider">
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        {riders.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: '#64748b', fontSize: 14 }}>No riders yet.</div>
        )}
      </div>
    </div>
  );
}
