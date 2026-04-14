import React, { useMemo, useState } from 'react';
import { ClipboardList, User, Phone, Bike } from 'lucide-react';
import { motion as Motion } from 'framer-motion';

const STATUS_TAB = {
  open: 'open',
  done: 'done',
};

export function VendorOrdersPage({
  isDesktop,
  vendorOrders,
  getRiderById,
  vendorHandoffToRider,
  verifyVendorOtp,
}) {
  const [listTab, setListTab] = useState(STATUS_TAB.open);
  const [otpByOrder, setOtpByOrder] = useState({});
  const [otpErrorByOrder, setOtpErrorByOrder] = useState({});

  const openOrders = useMemo(
    () => vendorOrders.filter((o) => o.status !== 'delivered').slice().sort((a, b) => String(b.id).localeCompare(String(a.id))),
    [vendorOrders],
  );
  const completedOrders = useMemo(
    () => vendorOrders.filter((o) => o.status === 'delivered').slice().sort((a, b) => String(b.id).localeCompare(String(a.id))),
    [vendorOrders],
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isDesktop ? 20 : 16 }}>
      <div className="card" style={{ padding: isDesktop ? 22 : 16 }}>
        <h2 style={{ margin: '0 0 6px', fontSize: isDesktop ? 20 : 17, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ClipboardList size={22} color="var(--primary)" />
          Orders
        </h2>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Manage hand-off to riders and verify customer OTP to release escrow. Open: {openOrders.length} · Completed: {completedOrders.length}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { id: STATUS_TAB.open, label: `Open (${openOrders.length})` },
          { id: STATUS_TAB.done, label: `Completed (${completedOrders.length})` },
        ].map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setListTab(id)}
            style={{
              padding: '10px 18px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 13,
              fontWeight: listTab === id ? 600 : 500,
              background: listTab === id ? 'rgba(255, 121, 0, 0.12)' : '#f1f5f9',
              color: listTab === id ? 'var(--primary)' : 'var(--text-muted)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {listTab === STATUS_TAB.open && (
        openOrders.length === 0 ? (
          <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No open orders right now.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isDesktop && openOrders.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
            gap: 15,
          }}
          >
            {openOrders.map((order) => {
              const rider = order.riderId ? getRiderById(order.riderId) : null;
              return (
                <Motion.div key={order.id} whileHover={{ scale: isDesktop ? 1.01 : 1.02 }} className="card" style={{ padding: isDesktop ? 18 : 15, borderLeft: order.status === 'confirmed' ? '4px solid var(--warning)' : '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{order.id} • {order.customerName}</div>
                      <div style={{ fontSize: isDesktop ? 16 : 15, fontWeight: 600, marginTop: 2 }}>{order.product}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--secondary)', whiteSpace: 'nowrap' }}>KES {order.netVendor.toLocaleString()}</div>
                  </div>

                  {rider && (
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: 12, marginBottom: 12, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <Bike size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-main)' }}>Assigned rider</div>
                        <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <User size={14} /> {rider.name}
                        </div>
                        <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: 'var(--text-muted)' }}>
                          <Phone size={14} /> {rider.phone}
                        </div>
                      </div>
                    </div>
                  )}

                  {order.status === 'confirmed' && !rider && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, padding: 10, background: '#f8fafc', borderRadius: 8 }}>
                      Waiting for the platform to assign a rider. You will see their contact here.
                    </div>
                  )}

                  {order.status === 'confirmed' && rider && (
                    <div style={{ marginTop: 15, display: 'flex', gap: 10 }}>
                      <button
                        type="button"
                        className="btn-primary"
                        style={{ flex: 1, padding: '10px 0', fontSize: 13 }}
                        onClick={() => vendorHandoffToRider(order.id)}
                      >
                        Hand off to rider
                      </button>
                    </div>
                  )}

                  {order.status === 'dispatched' && (
                    <div style={{ marginTop: 15, background: '#f8fafc', padding: 12, borderRadius: 8 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Package in transit. You or the assigned rider can enter the customer OTP to release escrow — same code.</div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: isDesktop ? 'nowrap' : 'wrap' }}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={otpByOrder[order.id] ?? ''}
                          onChange={(e) => {
                            setOtpByOrder((p) => ({ ...p, [order.id]: e.target.value }));
                            setOtpErrorByOrder((p) => ({ ...p, [order.id]: '' }));
                          }}
                          placeholder={order.otpGenerated ? `e.g. ${order.otpGenerated}` : 'e.g. 7281'}
                          style={{ flex: '1 1 160px', minWidth: 0, padding: 10, borderRadius: 6, border: '1px solid var(--border-color)', outline: 'none', letterSpacing: 2, fontWeight: 700 }}
                        />
                        <button
                          type="button"
                          className="btn-wa"
                          style={{ fontSize: 13, padding: '10px 16px' }}
                          onClick={() => {
                            const ok = verifyVendorOtp(order.id, otpByOrder[order.id] ?? '');
                            if (!ok) {
                              setOtpErrorByOrder((p) => ({ ...p, [order.id]: 'OTP does not match.' }));
                            }
                          }}
                        >
                          Verify & Release
                        </button>
                      </div>
                      {otpErrorByOrder[order.id] && (
                        <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>{otpErrorByOrder[order.id]}</div>
                      )}
                    </div>
                  )}
                </Motion.div>
              );
            })}
          </div>
        )
      )}

      {listTab === STATUS_TAB.done && (
        completedOrders.length === 0 ? (
          <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
            No completed orders in the demo ledger yet.
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {completedOrders.map((o) => (
                <li key={o.id} style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{o.id}</div>
                    <div style={{ fontWeight: 600, marginTop: 4 }}>{o.product}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{o.customerName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--secondary)' }}>KES {o.netVendor.toLocaleString()}</div>
                    <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, marginTop: 4 }}>Delivered</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
}
