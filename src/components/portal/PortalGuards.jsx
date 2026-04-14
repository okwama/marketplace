import { Navigate } from 'react-router-dom';
import * as goVendorApi from '../../lib/goVendorApi';
import * as goAdminApi from '../../lib/goAdminApi';

export function VendorPortalGuard({ children }) {
  const apiBase = goVendorApi.getApiBase();
  if (apiBase && !goVendorApi.getStoredToken()) {
    return <Navigate to="/vendor/login" replace />;
  }
  return children;
}

export function AdminPortalGuard({ children }) {
  const apiBase = goAdminApi.getApiBase();
  if (apiBase && !goAdminApi.getStoredAdminToken()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}
