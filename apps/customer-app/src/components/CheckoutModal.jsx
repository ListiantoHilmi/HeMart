import React, { useState, useEffect } from 'react';
import { X, Store, QrCode, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { usePaymentMethods, useCheckoutOrder } from '../api/queries';
import { formatRupiah } from '../utils/formatters';

export function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { data: paymentMethods = [] } = usePaymentMethods({ activeOnly: 'true' });
  const checkoutMutation = useCheckoutOrder();

  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (user?.name && !customerName) {
      setCustomerName(user.name);
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  const handleSubmitCheckout = async (e) => {
    e.preventDefault();

    if (!selectedMethodId) {
      alert('Please select a payment method.');
      return;
    }

    const payload = {
      items: cartItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      paymentMethodId: selectedMethodId,
      customerName,
      customerPhone,
      notes,
    };

    try {
      const res = await checkoutMutation.mutateAsync(payload);
      if (res.success) {
        clearCart();
        onClose();
        onOrderPlaced(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed. Please try again.');
    }
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700 }}>
              Complete Order Checkout
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Select your payment method and review your order total.
            </p>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmitCheckout}>
          <div className="input-group">
            <label className="input-label">Customer Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Alex Johnson"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Phone Number (Optional for order receipt SMS)</label>
            <input
              type="tel"
              className="form-input"
              placeholder="e.g. +1 555 019 2831"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div style={{ margin: '1.25rem 0' }}>
            <label className="input-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
              Select Payment Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
              {paymentMethods.map((method) => {
                const isSelected = selectedMethodId === method.id;
                const isStore = method.type === 'IN_STORE';
                return (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethodId(method.id)}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      border: isSelected ? '1px solid var(--primary-500)' : '1px solid var(--border-glass)',
                      cursor: 'pointer',
                      transition: 'var(--transition-fast)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {isStore ? (
                        <Store size={20} style={{ color: 'var(--accent-amber)' }} />
                      ) : (
                        <QrCode size={20} style={{ color: 'var(--accent-cyan)' }} />
                      )}
                      {isSelected && <CheckCircle2 size={16} style={{ color: 'var(--primary-400)' }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{method.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {isStore ? 'Pay in Store / Cashier' : 'Instant QRIS / Online'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedMethod && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--accent-cyan)' }}>
                <ShieldCheck size={16} /> Payment Instructions
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedMethod.instructions}</p>

              {selectedMethod.type === 'ONLINE' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=HEMART-QRIS-PAYMENT-DEMO"
                    alt="QRIS Demo"
                    style={{ width: '70px', height: '70px', borderRadius: '4px' }}
                  />
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Scan QR code using any supported e-wallet or mobile banking app after submitting order.
                  </div>
                </div>
              )}
            </div>
          )}

          <div
            style={{
              padding: '1rem',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              <span>Items Total ({cartItems.length} unique)</span>
              <span>{formatRupiah(totalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800 }}>
              <span>Total Payable</span>
              <span style={{ color: 'var(--accent-cyan)' }}>{formatRupiah(totalPrice)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={checkoutMutation.isPending}
            >
              {checkoutMutation.isPending ? 'Processing...' : 'Place Order & View Receipt'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
