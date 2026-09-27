import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Bell, Search, RefreshCw, Eye } from 'lucide-react';
import { useAdminOrders, useUpdateOrderStatus } from '../api/queries';
import { formatRupiah } from '../utils/formatters';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

export function RealtimeOrderMonitor({ onSelectOrder }) {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [fulfillmentFilter, setFulfillmentFilter] = useState('ALL');
  const [liveAlert, setLiveAlert] = useState(null);

  const { data: orders = [], isLoading, refetch } = useAdminOrders({
    search,
    paymentStatus: paymentFilter,
    fulfillmentStatus: fulfillmentFilter,
  });

  const updateStatusMutation = useUpdateOrderStatus();

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);

    socket.emit('join_admin');

    socket.on('new_order', (data) => {
      console.log('⚡ [Realtime Alert] New order received:', data);
      setLiveAlert(`🔔 NEW ORDER RECEIVED: #${data.order.orderCode} - Total: ${formatRupiah(data.order.totalAmount)}`);
      refetch();
    });

    socket.on('order_status_updated', () => {
      refetch();
    });

    return () => {
      socket.disconnect();
    };
  }, [refetch]);

  const handleStatusChange = async (orderId, field, value) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      const payload = {
        id: orderId,
        paymentStatus: field === 'payment' ? value : order.paymentStatus,
        fulfillmentStatus: field === 'fulfillment' ? value : order.fulfillmentStatus,
      };
      await updateStatusMutation.mutateAsync(payload);
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ position: 'relative', display: 'flex', height: '10px', width: '10px' }}>
              <span style={{ position: 'absolute', display: 'inline-flex', height: '100%', width: '100%', borderRadius: '999px', background: 'var(--accent-emerald)', opacity: 0.75, animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
              <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '999px', height: '10px', width: '10px', background: 'var(--accent-emerald)' }}></span>
            </span>
            Real-Time Live Order Monitoring
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Instant order broadcasting, payment verification, and cashier fulfillment queue.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={() => refetch()}>
          <RefreshCw size={16} /> Refresh Feed
        </button>
      </div>

      {liveAlert && (
        <div className="realtime-alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
            <Bell size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span>{liveAlert}</span>
          </div>
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setLiveAlert(null)}
            style={{ padding: '4px' }}
          >
            ✕
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search Order Code or Customer Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <select
          className="form-select"
          style={{ flex: '1 1 150px', minWidth: '150px' }}
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="ALL">All Payment Statuses</option>
          <option value="PENDING">Payment PENDING</option>
          <option value="PAID">Payment PAID</option>
          <option value="FAILED">Payment FAILED</option>
        </select>

        <select
          className="form-select"
          style={{ flex: '1 1 160px', minWidth: '160px' }}
          value={fulfillmentFilter}
          onChange={(e) => setFulfillmentFilter(e.target.value)}
        >
          <option value="ALL">All Fulfillment Statuses</option>
          <option value="PENDING">Fulfillment PENDING</option>
          <option value="PROCESSING">Fulfillment PROCESSING</option>
          <option value="COMPLETED">Fulfillment COMPLETED</option>
          <option value="CANCELLED">Fulfillment CANCELLED</option>
        </select>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order Code & Date</th>
              <th>Customer Info</th>
              <th>Total & Method</th>
              <th>Payment Status</th>
              <th>Fulfillment Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                  Listening for incoming order streams...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No orders found.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--accent-cyan)' }}>#{order.orderCode}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                      {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#ffffff' }}>{order.customerName || 'Guest'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerPhone || 'No phone'}</div>
                  </td>
                  <td>
                    <strong style={{ color: '#ffffff' }}>{formatRupiah(order.totalAmount)}</strong>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {order.paymentMethod?.name || 'Cash'}
                    </div>
                  </td>

                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={order.paymentStatus}
                      onChange={(e) => handleStatusChange(order.id, 'payment', e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                    </select>
                  </td>

                  <td>
                    <select
                      className="form-select"
                      style={{ padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                      value={order.fulfillmentStatus}
                      onChange={(e) => handleStatusChange(order.id, 'fulfillment', e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-secondary btn-icon"
                      onClick={() => onSelectOrder(order)}
                      title="View Digital Receipt Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
