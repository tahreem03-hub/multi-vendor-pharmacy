import { useState, useEffect } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const getHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ─────────────────────────────────────────────────────────────
// usePrescriberDashboard
// Backend returns exactly:
// {
//   threePot:             { pot1StockValue, pot2Deposit, pot3Commission, pot3VatReserve, pot3TotalRevenue, equilibriumStatus }
//   orders:               { totalRevenue, totalCommission, totalVat, totalOrders, pendingOrders, monthlyBreakdown }
//   stock:                { totalProducts, totalUnits, totalPot1Value, lowStockCount, expiredCount, expiring30Count, expiring60Count }
//   alerts:               { count, items }
//   recentPrescriptions:  [ { user, method, status, ... } ]
// }
// ─────────────────────────────────────────────────────────────
export const usePrescriberDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API}/api/prescriber/dashboard`, {
          headers: getHeaders(),
        });

        // Backend wraps response in { success, data: {...} }
        const d = res.data.data || res.data;

        setData({
          threePot: {
            equilibriumStatus: d.threePot?.equilibriumStatus  || 'green',
            pot1StockValue:    d.threePot?.pot1StockValue      || 0,
            pot2Deposit:       d.threePot?.pot2Deposit         || 0,
            pot3Commission:    d.threePot?.pot3Commission      || 0,
            pot3VatReserve:    d.threePot?.pot3VatReserve      || 0,
            pot3TotalRevenue:  d.threePot?.pot3TotalRevenue    || 0,
          },
          orders: {
            totalRevenue:      d.orders?.totalRevenue          || 0,
            totalCommission:   d.orders?.totalCommission       || 0,
            totalVat:          d.orders?.totalVat              || 0,
            totalOrders:       d.orders?.totalOrders           || 0,
            pendingOrders:     d.orders?.pendingOrders         || 0,
            monthlyBreakdown:  d.orders?.monthlyBreakdown      || [],
          },
          stock: {
            totalProducts:     d.stock?.totalProducts          || 0,
            totalUnits:        d.stock?.totalUnits             || 0,
            totalPot1Value:    d.stock?.totalPot1Value         || 0,
            lowStockCount:     d.stock?.lowStockCount          || 0,
            expiredCount:      d.stock?.expiredCount           || 0,
            expiring30Count:   d.stock?.expiring30Count        || 0,
            expiring60Count:   d.stock?.expiring60Count        || 0,
          },
          alerts: {
            count: d.alerts?.count   || 0,
            items: d.alerts?.items   || [],
          },
          recentPrescriptions: d.recentPrescriptions || [],
        });
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard');
        // Safe fallback so component never crashes
        setData({
          threePot:            { equilibriumStatus: 'green', pot1StockValue: 0, pot2Deposit: 0, pot3Commission: 0 },
          orders:              { totalRevenue: 0, totalCommission: 0, totalOrders: 0, pendingOrders: 0 },
          stock:               { totalProducts: 0, totalUnits: 0, lowStockCount: 0, expiring30Count: 0, expiring60Count: 0, expiredCount: 0 },
          alerts:              { count: 0, items: [] },
          recentPrescriptions: [],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return { data, loading, error };
};

// ─────────────────────────────────────────────────────────────
// useMyOrders
// ─────────────────────────────────────────────────────────────
export const useMyOrders = (status = '', page = 1) => {
  const [data, setData]       = useState({ orders: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 20 });
    if (status) params.append('status', status);

    axios.get(`${API}/api/orders/my?${params}`, { headers: getHeaders() })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status, page]);

  return { ...data, loading };
};

// ─────────────────────────────────────────────────────────────
// useMyStock
// ─────────────────────────────────────────────────────────────
export const useMyStock = (expiryAlert = '', isLowStock = '') => {
  const [data, setData]       = useState({ stock: [], count: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (expiryAlert) params.append('expiryAlert', expiryAlert);
    if (isLowStock)  params.append('isLowStock', isLowStock);

    axios.get(`${API}/api/stock/my?${params}`, { headers: getHeaders() })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [expiryAlert, isLowStock]);

  return { ...data, loading };
};

// ─────────────────────────────────────────────────────────────
// useMyThreePot
// ─────────────────────────────────────────────────────────────
export const useMyThreePot = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = () => {
    setLoading(true);
    axios.get(`${API}/api/three-pot/my`, { headers: getHeaders() })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { refetch(); }, []);
  return { data, loading, refetch };
};

// ─────────────────────────────────────────────────────────────
// useMyPatients
// ─────────────────────────────────────────────────────────────
export const useMyPatients = (page = 1) => {
  const [data, setData]       = useState({ patients: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API}/api/prescriber/patients?page=${page}`, { headers: getHeaders() })
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  return { ...data, loading };
};

// ─────────────────────────────────────────────────────────────
// markAlertRead
// ─────────────────────────────────────────────────────────────
export const markAlertRead = async (alertId) => {
  return await axios.patch(
    `${API}/api/three-pot/my/read-alert/${alertId}`,
    {},
    { headers: getHeaders() }
  );
};