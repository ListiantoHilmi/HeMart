import React, { useState } from 'react';
import { X, Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginModal({ isOpen, onClose, onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setErrorMsg('');
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', padding: '2rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-cyan)',
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800, color: '#ffffff' }}>
                Masuk ke HeMart
              </h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Akun Customer Pembeli
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '6px', borderRadius: '8px', lineHeight: 1 }}
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              marginBottom: '1.25rem',
              padding: '0.75rem 0.9rem',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.825rem',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Email Terdaftar
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                style={{
                  width: '100%',
                  padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
              Password Customer
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password customer"
                style={{
                  width: '100%',
                  padding: '0.65rem 2.5rem 0.65rem 2.4rem',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              padding: '0.75rem',
              fontSize: '0.9rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.25rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            {isSubmitting ? 'Memproses Masuk...' : 'Masuk Sekarang'}
            {!isSubmitting && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Demo Fast Pick Section */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem', fontWeight: 600 }}>
            <UserCheck size={14} style={{ color: 'var(--accent-cyan)' }} />
            <span>PILIH EMAIL CUSTOMER TERDAFTAR:</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleSelectDemoUser('budi@gmail.com')}
              style={{
                padding: '0.5rem 0.65rem',
                borderRadius: '8px',
                background: email === 'budi@gmail.com' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: email === 'budi@gmail.com' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Budi Santoso</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>budi@gmail.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('siti@gmail.com')}
              style={{
                padding: '0.5rem 0.65rem',
                borderRadius: '8px',
                background: email === 'siti@gmail.com' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: email === 'siti@gmail.com' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Siti Rahma</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>siti@gmail.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('dewi@gmail.com')}
              style={{
                padding: '0.5rem 0.65rem',
                borderRadius: '8px',
                background: email === 'dewi@gmail.com' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: email === 'dewi@gmail.com' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Dewi Lestari</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>dewi@gmail.com</div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('customer@store.com')}
              style={{
                padding: '0.5rem 0.65rem',
                borderRadius: '8px',
                background: email === 'customer@store.com' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: email === 'customer@store.com' ? '1px solid var(--accent-cyan)' : '1px solid var(--border-glass)',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>Jane Customer</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>customer@store.com</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
