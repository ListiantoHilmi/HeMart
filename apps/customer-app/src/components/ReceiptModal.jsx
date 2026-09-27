import React from 'react';
import { X, Printer, CheckCircle, Clock, Sparkles, AlertCircle } from 'lucide-react';
import { formatRupiah } from '../utils/formatters';

export function ReceiptModal({ order, isOpen, onClose }) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return <span className="badge badge-success"><CheckCircle size={12} /> {status}</span>;
      case 'PROCESSING':
        return <span className="badge badge-info"><Clock size={12} /> {status}</span>;
      case 'PENDING':
        return <span className="badge badge-warning"><Clock size={12} /> {status}</span>;
      default:
        return <span className="badge badge-danger"><AlertCircle size={12} /> {status}</span>;
    }
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button className="btn btn-secondary" onClick={handlePrint}>
            <Printer size={16} /> Print Receipt
          </button>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div
          id="printable-receipt"
          style={{
            background: 'rgba(15, 19, 29, 0.95)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
          }}
        >
          <div style={{ textAlign: 'center', borderBottom: '1px dashed var(--border-glass)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800 }}>
              <Sparkles style={{ color: 'var(--accent-cyan)' }} size={22} />
              <span>HeMart</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Official E-Commerce Digital Tax Receipt
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--accent-cyan)' }}>
              ORDER #{order.orderCode}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
              {new Date(order.createdAt).toLocaleString()}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Customer Name</span>
              <strong style={{ color: '#ffffff' }}>{order.customerName || 'Guest'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Payment Method</span>
              <strong style={{ color: '#ffffff' }}>{order.paymentMethod?.name || 'Store Payment'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Payment Status</span>
              <div>{getStatusBadge(order.paymentStatus)}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)', display: 'block' }}>Fulfillment</span>
              <div>{getStatusBadge(order.fulfillmentStatus)}</div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-glass)', borderBottom: '1px solid var(--border-glass)', padding: '0.85rem 0', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '0.5rem' }}>
              <span>Item Description</span>
              <span>Qty x Price = Subtotal</span>
            </div>
            {order.orderItems?.map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', margin: '6px 0' }}>
                <div>
                  <span style={{ color: '#ffffff', fontWeight: 600 }}>{item.product?.name || 'Product Item'}</span>
                </div>
                <div style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                  {item.quantity} x {formatRupiah(item.price)} = <strong style={{ color: 'var(--accent-cyan)' }}>{formatRupiah(item.subtotal)}</strong>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=VERIFY-${order.orderCode}`}
                alt="Receipt Verification QR"
                style={{ width: '56px', height: '56px', borderRadius: '4px' }}
              />
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '140px' }}>
                Scan to verify receipt validity on store POS.
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Paid Amount</span>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                {formatRupiah(order.totalAmount)}
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px dashed var(--border-glass)', paddingTop: '0.75rem' }}>
            Thank you for shopping at HeMart!
          </p>
        </div>
      </div>
    </div>
  );
}
