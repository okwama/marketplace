import React, { useState } from 'react';
import { MessageCircle, Headphones, Package, Send } from 'lucide-react';
import { motion as Motion } from 'framer-motion';
import { MaterialSymbol } from '../MaterialSymbol';

const THREADS = [
  {
    id: 'support',
    title: 'Marketplace support',
    subtitle: 'We typically reply in minutes',
    last: 'Hi! How can we help with your order?',
    time: 'Now',
  },
  {
    id: 'vendor',
    title: 'TechZone Nairobi',
    subtitle: 'Your last order',
    last: 'Thanks for shopping with us!',
    time: 'Yesterday',
  },
];

export function CustomerChatPage({ isDesktop, pagePad }) {
  const [activeId, setActiveId] = useState(THREADS[0].id);
  const active = THREADS.find((t) => t.id === activeId) ?? THREADS[0];

  return (
    <Motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div style={{ padding: pagePad, paddingBottom: 12 }}>
        <h2 style={{ fontSize: isDesktop ? 18 : 16, fontWeight: 700, margin: '0 0 8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageCircle size={22} color="var(--primary)" />
          Chats
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.45 }}>
          Conversations are powered by WhatsApp in production. This is a layout preview only.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? 'minmax(260px, 320px) 1fr' : '1fr',
        gap: isDesktop ? 16 : 0,
        padding: `0 ${pagePad} ${pagePad}`,
        alignItems: 'stretch',
        minHeight: isDesktop ? 380 : undefined,
      }}
      >
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {THREADS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: 14,
                border: 'none',
                borderBottom: '1px solid var(--border-color)',
                background: t.id === activeId ? 'rgba(255, 121, 0, 0.08)' : 'white',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
              >
                {t.id === 'support' ? <Headphones size={22} color="var(--primary)" /> : <Package size={22} color="var(--secondary)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-main)' }}>{t.title}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{t.time}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{t.subtitle}</div>
                <p style={{ margin: 0, fontSize: 13, color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.last}</p>
              </div>
            </button>
          ))}
        </div>

        {isDesktop && (
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', minHeight: 360 }}>
            <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{active.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{active.subtitle}</div>
              </div>
              <MaterialSymbol name="lock" size={22} style={{ color: 'var(--text-muted)' }} />
            </div>
            <div style={{ flex: 1, padding: 18, background: '#f8fafc', overflowY: 'auto' }}>
              <div style={{ maxWidth: '85%', background: 'white', padding: '12px 14px', borderRadius: '12px 12px 12px 4px', boxShadow: 'var(--shadow-sm)', fontSize: 14, color: 'var(--text-main)', lineHeight: 1.45 }}>
                {active.last}
              </div>
              <p style={{ margin: '16px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>
                Demo — connect WhatsApp Cloud API to show real message bubbles and read receipts.
              </p>
            </div>
            <div style={{ padding: 12, borderTop: '1px solid var(--border-color)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                readOnly
                placeholder="Type a message…"
                style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-color)', fontSize: 14, fontFamily: 'inherit', background: '#f8fafc', color: 'var(--text-muted)' }}
              />
              <button type="button" style={{ padding: 12, borderRadius: 10, border: 'none', background: 'var(--primary)', color: 'white', cursor: 'not-allowed', display: 'flex', opacity: 0.6 }} aria-disabled>
                <Send size={20} />
              </button>
            </div>
          </div>
        )}

        {!isDesktop && (
          <div className="card" style={{ marginTop: 12, padding: 16 }}>
            <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--text-main)' }}>{active.title}</div>
            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 12, fontSize: 14, color: 'var(--text-main)', lineHeight: 1.5 }}>
              {active.last}
            </div>
            <p style={{ margin: '12px 0 0', fontSize: 12, color: 'var(--text-muted)' }}>Open a thread on desktop to see the split layout and composer.</p>
          </div>
        )}
      </div>
    </Motion.div>
  );
}
