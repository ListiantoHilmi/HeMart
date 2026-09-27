import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CUSTOMER_APP_URL = import.meta.env.VITE_CUSTOMER_APP_URL || 'http://localhost:5173';

export function AdminLogin() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@store.com');
  const [password, setPassword] = useState('Admin1234');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Login gagal. Periksa kembali email dan password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectDemoUser = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Admin1234');
    setErrorMsg('');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(ellipse at top center, rgba(245, 158, 11, 0.15) 0%, rgba(10, 10, 15, 0.95) 70%, #06070a 100%)',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '460px',
          padding: '2.5rem 2rem',
          borderRadius: '20px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 1rem',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.1) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.25)',
            }}
          >
            <ShieldCheck size={36} />
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.75rem',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, var(--accent-amber) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.35rem',
            }}
          >
            HeMart Backoffice
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Portal Masuk Administrator & Pengelola Toko
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              marginBottom: '1.5rem',
              padding: '0.85rem 1rem',
              borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              fontSize: '0.85rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                marginBottom: '0.4rem',
              }}
            >
              Email Administrator
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@store.com"
                style={{
                  width: '100%',
                  padding: '0.75rem 0.85rem 0.75rem 2.6rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                }}
              >
                Password Admin
              </label>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600 }}>
                Default: Admin1234
              </span>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password admin"
                style={{
                  width: '100%',
                  padding: '0.75rem 2.75rem 0.75rem 2.6rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-glass)',
                  color: '#ffffff',
                  fontSize: '0.95rem',
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
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, var(--accent-amber) 0%, #d97706 100%)',
              color: '#000000',
              border: 'none',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              marginTop: '0.5rem',
            }}
          >
            {isSubmitting ? 'Memverifikasi...' : 'Masuk ke Dashboard'}
            {!isSubmitting && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Demo Fast Pick */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-glass)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: 600 }}>
            PILIH AKUN ADMIN TERDAFTAR (KLIK UNTUK AUTO-FILL):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleSelectDemoUser('admin@store.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: email === 'admin@store.com' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: email === 'admin@store.com' ? '1px solid var(--accent-amber)' : '1px solid var(--border-glass)',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>admin@store.com</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Executive Admin</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600 }}>Pilih</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectDemoUser('manager@store.com')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                background: email === 'manager@store.com' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                border: email === 'manager@store.com' ? '1px solid var(--accent-amber)' : '1px solid var(--border-glass)',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>manager@store.com</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manager Toko</div>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-amber)', fontWeight: 600 }}>Pilih</span>
            </button>
          </div>
        </div>

        {/* Back to Customer App */}
        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <a
            href={CUSTOMER_APP_URL}
            style={{
              fontSize: '0.85rem',
              color: 'var(--accent-cyan)',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>Buka Customer Storefront HeMart</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
