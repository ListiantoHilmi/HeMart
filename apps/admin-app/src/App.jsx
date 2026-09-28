import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ShieldCheck, DollarSign, ShoppingBag, Clock, AlertTriangle, Package, CreditCard, Activity, LogOut, User } from 'lucide-react';
import { formatRupiah } from './utils/formatters';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useAdminStats } from './api/queries';
import { ProductTable } from './components/ProductTable';
import { ProductModal } from './components/ProductModal';
import { PaymentSettings } from './components/PaymentSettings';
import { RealtimeOrderMonitor } from './components/RealtimeOrderMonitor';
import { ReceiptModal } from './components/ReceiptModal';
import { AdminLogin } from './components/AdminLogin';



const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

function AdminNavbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar-glass">
      <div className="navbar-inner">
        <div className="brand-logo" style={{ background: 'linear-gradient(135deg, #ffffff 0%, var(--accent-amber) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          <ShieldCheck style={{ color: 'var(--accent-amber)' }} size={24} />
          <span>HeMart Backoffice</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>


          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ textAlign: 'right' }} className="hide-on-mobile">
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                  <User size={14} style={{ color: 'var(--accent-amber)' }} />
                  {user.name}
                </div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                  {user.email} (<span style={{ color: 'var(--accent-amber)' }}>ADMIN</span>)
                </div>
              </div>

              <button
                className="btn btn-secondary"
                onClick={logout}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-rose)',
                  borderColor: 'rgba(244, 63, 94, 0.3)',
                }}
                title="Keluar dari akun admin"
              >
                <LogOut size={14} />
                <span className="hide-on-mobile">Keluar</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function MainAdminView() {
  const [activeTab, setActiveTab] = useState('orders');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  const { data: stats } = useAdminStats();

  const handleCreateProduct = () => {
    setProductToEdit(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setProductToEdit(product);
    setIsProductModalOpen(true);
  };

  return (
    <div className="app-container">
      <AdminNavbar />

      <main className="main-content">
        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', fontWeight: 800 }}>
            Executive Admin Control Center
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            Real-time order dispatch, inventory controls, and payment channel configuration.
          </p>
        </div>

        <div className="stats-grid">
          <div className="glass-card stat-card">
            <div className="stat-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent-emerald)' }}>
              <DollarSign size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PAID SALES REVENUE</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                {formatRupiah(stats ? stats.totalRevenue : 0)}
              </div>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)' }}>
              <ShoppingBag size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ORDERS</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                {stats ? stats.totalOrders : 0}
              </div>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
              <Clock size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PENDING QUEUE</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                {stats ? stats.pendingOrders : 0}
              </div>
            </div>
          </div>

          <div className="glass-card stat-card">
            <div className="stat-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--accent-rose)' }}>
              <AlertTriangle size={26} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>LOW STOCK ALERTS</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }}>
                {stats ? stats.lowStockItems : 0}
              </div>
            </div>
          </div>
        </div>

        <div className="admin-tabs-bar">
          <button
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('orders')}
          >
            <Activity size={18} /> Live Order Queue
          </button>

          <button
            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('products')}
          >
            <Package size={18} /> Product Inventory
          </button>

          <button
            className={`btn ${activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('payments')}
          >
            <CreditCard size={18} /> Payment Gateways
          </button>
        </div>

        {activeTab === 'orders' && (
          <RealtimeOrderMonitor onSelectOrder={(order) => setSelectedReceiptOrder(order)} />
        )}

        {activeTab === 'products' && (
          <ProductTable
            onCreateProduct={handleCreateProduct}
            onEditProduct={handleEditProduct}
          />
        )}

        {activeTab === 'payments' && <PaymentSettings />}

        <ProductModal
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          productToEdit={productToEdit}
        />

        <ReceiptModal
          isOpen={Boolean(selectedReceiptOrder)}
          order={selectedReceiptOrder}
          onClose={() => setSelectedReceiptOrder(null)}
        />
      </main>
    </div>
  );
}

function AdminAuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Memuat HeMart Backoffice...</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Memverifikasi otentikasi administrator</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return <MainAdminView />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminAuthGate />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

