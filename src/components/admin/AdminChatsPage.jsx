import React, { useState } from 'react';
import { MessageSquare, MoreHorizontal } from 'lucide-react';
import { MaterialSymbol } from '../MaterialSymbol';

const THREADS = [
  { id: 't1', name: 'David Kamau', msg: 'Is my order out for delivery?', time: '10:05', tag: 'order', unread: 7 },
  { id: 't2', name: 'Priscilla Onyango', msg: 'I would like to buy a new smartphone.', time: '16:07', tag: 'lead', unread: 16 },
  { id: 't3', name: 'Yusuf Ali', msg: 'Do you sell Smart TVs?', time: 'Apr 10', tag: 'inquiry', unread: 50 },
  { id: 't4', name: 'John Mwangi', msg: 'What time is my delivery?', time: 'Apr 18', tag: 'order', unread: 2 },
  { id: 't5', name: 'Wanjiku M.', msg: 'Escrow OTP did not arrive.', time: 'Apr 12', tag: 'order', unread: 1 },
];

const TAGS = [
  { id: 'all', label: 'All' },
  { id: 'lead', label: 'New lead' },
  { id: 'order', label: 'Order' },
  { id: 'inquiry', label: 'Inquiry' },
];

function ChatRow({ name, msg, time, unread, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: 14,
        border: 'none',
        borderBottom: '1px solid #f1f5f9',
        background: active ? '#f0fdf4' : 'white',
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: 'inherit',
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e2e8f0', flexShrink: 0, overflow: 'hidden' }}>
        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`} alt="" style={{ width: '100%', height: '100%' }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <span style={{ fontWeight: 600, color: '#1e293b', fontSize: 14 }}>{name}</span>
          <span style={{ fontSize: 12, color: '#94a3b8', flexShrink: 0 }}>{time}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{msg}</p>
      </div>
      {unread > 0 && (
        <span style={{ background: '#22c55e', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10, flexShrink: 0 }}>
          {unread}
        </span>
      )}
    </button>
  );
}

export function AdminChatsPage({ isDesktop }) {
  const [filter, setFilter] = useState('all');
  const [activeId, setActiveId] = useState(THREADS[0]?.id ?? null);

  const list = filter === 'all' ? THREADS : THREADS.filter((t) => t.tag === filter);
  const active = THREADS.find((t) => t.id === activeId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 16 }}>
      <div style={{ background: 'white', padding: isDesktop ? 22 : 16, borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: isDesktop ? 20 : 17, display: 'flex', alignItems: 'center', gap: 10 }}>
          <MessageSquare size={22} color="#16a34a" />
          WhatsApp inbox
        </h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>
          Operator view of buyer–seller threads. Assignment, SLAs, and templates would connect to the Cloud API in production.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? 'minmax(280px, 360px) 1fr' : '1fr',
        gap: isDesktop ? 20 : 0,
        alignItems: 'stretch',
        minHeight: isDesktop ? 420 : undefined,
      }}
      >
        <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={{ fontWeight: 700, color: '#334155', fontSize: 13 }}>Conversations</span>
            <button type="button" style={{ border: 'none', background: 'none', padding: 6, cursor: 'pointer', color: '#94a3b8', display: 'flex' }}>
              <MoreHorizontal size={20} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, padding: '10px 12px', flexWrap: 'wrap', borderBottom: '1px solid #f1f5f9' }}>
            {TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: 'none',
                  fontSize: 11,
                  fontWeight: filter === t.id ? 700 : 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  background: filter === t.id ? '#dcfce7' : '#f1f5f9',
                  color: filter === t.id ? '#15803d' : '#64748b',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: isDesktop ? 480 : 360 }}>
            {list.map((t) => (
              <ChatRow
                key={t.id}
                name={t.name}
                msg={t.msg}
                time={t.time}
                unread={t.unread}
                active={t.id === activeId}
                onClick={() => setActiveId(t.id)}
              />
            ))}
          </div>
        </div>

        {isDesktop && (
          <div style={{ background: 'white', borderRadius: 16, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', padding: 24, display: 'flex', flexDirection: 'column' }}>
            {active ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden' }}>
                    <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(active.name)}`} alt="" style={{ width: '100%', height: '100%' }} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: 16 }}>{active.name}</div>
                    <div style={{ fontSize: 12, color: '#64748b', textTransform: 'capitalize' }}>Tagged: {active.tag}</div>
                  </div>
                </div>
                <div style={{ flex: 1, background: '#f8fafc', borderRadius: 12, padding: 16, color: '#64748b', fontSize: 14, lineHeight: 1.55 }}>
                  <p style={{ margin: '0 0 12px' }}>
                    <strong style={{ color: '#334155' }}>Transcript placeholder.</strong> Message history, quick replies, and internal notes would render here.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 12 }}>
                    <MaterialSymbol name="lock" size={18} />
                    End-to-end encrypted channel (mock)
                  </div>
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                  <button type="button" className="btn-primary" style={{ flex: 1, padding: '12px 16px', borderRadius: 10, fontWeight: 600, border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Assign to vendor
                  </button>
                  <button type="button" style={{ padding: '12px 16px', borderRadius: 10, fontWeight: 600, border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontFamily: 'inherit', color: '#475569' }}>
                    Close
                  </button>
                </div>
              </>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 14 }}>
                Select a conversation
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
