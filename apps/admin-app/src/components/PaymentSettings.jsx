import React, { useState } from 'react';
import { Plus, CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';
import { usePaymentMethods, useCreatePaymentMethod, useTogglePaymentMethod } from '../api/queries';

export function PaymentSettings() {
  const { data: methods = [], isLoading } = usePaymentMethods();
  const createMutation = useCreatePaymentMethod();
  const toggleMutation = useTogglePaymentMethod();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('ONLINE');
  const [instructions, setInstructions] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync({ name, code, type, instructions });
      setName('');
      setCode('');
      setInstructions('');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create payment method.');
    }
  };

  const handleToggle = async (id) => {
    try {
      await toggleMutation.mutateAsync(id);
    } catch (err) {
      alert('Failed to toggle active status.');
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.25rem' }}>
      <div className="glass-card">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CreditCard size={20} style={{ color: 'var(--accent-cyan)' }} /> Active Payment Channels
        </h2>

        {isLoading ? (
          <p>Loading channels...</p>
        ) : methods.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No payment methods configured.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {methods.map((method) => (
              <div
                key={method.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#ffffff' }}>{method.name} ({method.code})</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Type: <strong style={{ color: 'var(--primary-400)' }}>{method.type}</strong>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                    {method.instructions}
                  </div>
                </div>

                <label className="switch" title="Toggle active status">
                  <input
                    type="checkbox"
                    checked={method.isActive}
                    onChange={() => handleToggle(method.id)}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card">
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} style={{ color: 'var(--accent-emerald)' }} /> Add Payment Channel
        </h2>

        <form onSubmit={handleCreate}>
          <div className="input-group">
            <label className="input-label">Channel Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Bank BCA Transfer / QRIS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Channel Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="BCA_VA"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Type</label>
              <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
                <option value="ONLINE">ONLINE (QRIS / Bank)</option>
                <option value="IN_STORE">IN_STORE (Cashier / POS)</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Payment Instructions for Customer</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Transfer to Account #123456789 A/N AURA E-Commerce"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Saving Channel...' : 'Save Payment Gateway'}
          </button>
        </form>
      </div>
    </div>
  );
}
