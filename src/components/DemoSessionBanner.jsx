import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

const DISMISSED_KEY = 'mp-demo-banner-dismissed';

export function DemoSessionBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (dismissed) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div className="demo-session-banner" role="status">
      <Info size={18} className="demo-session-banner-icon" aria-hidden />
      <p className="demo-session-banner-text">
        Shared demo state: check out on <strong>Storefront</strong>, then open <strong>Vendor</strong> or <strong>Admin</strong> to see the same orders. Data persists for this browser tab until you close it.
      </p>
      <button type="button" className="demo-session-banner-dismiss" onClick={dismiss} aria-label="Dismiss hint">
        <X size={18} />
      </button>
    </div>
  );
}
