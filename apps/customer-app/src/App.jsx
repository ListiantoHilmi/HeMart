import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { Search, Sparkles, ShoppingBag, Receipt, Bell, LogIn, LogOut, User, Home, LayoutGrid } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { useProducts, useCategories, useMyOrders } from './api/queries';
import { ProductCard } from './components/ProductCard';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { ReceiptModal } from './components/ReceiptModal';
import { LoginModal } from './components/LoginModal';
import { formatRupiah } from './utils/formatters';

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30,
    },
  },
});

function CustomerNavbar({ onOpenOrders, onOpenLogin }) {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, logout } = useAuth();

  return (
    <header className="navbar-glass">
      <div className="navbar-inner">
        <div className="brand-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Sparkles style={{ color: 'var(--accent-cyan)' }} size={24} />
          <span>HeMart</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>


          <button className="btn btn-secondary hide-on-mobile" onClick={onOpenOrders} title="View My Orders & Receipts">
            <Receipt size={18} />
            <span>Pesanan Saya</span>
          </button>

          <button className="btn btn-primary" onClick={() => setIsCartOpen(true)} style={{ position: 'relative' }}>
            <ShoppingBag size={18} />
            <span className="hide-on-mobile">Keranjang</span>
            {totalItems > 0 && (
              <span
                style={{
                  background: 'var(--accent-cyan)',
                  color: '#000000',
                  borderRadius: '999px',
                  padding: '2px 7px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  marginLeft: '4px',
                }}
              >
                {totalItems}
              </span>
            )}
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.25rem' }}>
              <div
                style={{
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.65rem',
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '8px',
                  border: '1px solid var(--border-glass)',
                }}
              >
                <User size={15} style={{ color: 'var(--accent-cyan)' }} />
                <span>{user.name.split(' ')[0]}</span>
              </div>
              <button
                className="btn btn-secondary"
                onClick={logout}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.65rem',
                  color: 'var(--accent-rose)',
                  borderColor: 'rgba(244, 63, 94, 0.3)',
                }}
                title="Keluar akun customer"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-secondary"
              onClick={onOpenLogin}
              style={{
                fontSize: '0.825rem',
                padding: '0.4rem 0.85rem',
                color: 'var(--accent-cyan)',
                borderColor: 'rgba(6, 182, 212, 0.3)',
                background: 'rgba(6, 182, 212, 0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <LogIn size={16} />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function MainCustomerView() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeReceiptOrder, setActiveReceiptOrder] = useState(null);
  const [showMyOrdersModal, setShowMyOrdersModal] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [liveToastAlert, setLiveToastAlert] = useState(null);

  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const { data: products = [], isLoading: productsLoading } = useProducts({
    search,
    category: selectedCategory,
    inStockOnly: 'false',
  });

  const { data: categories = [] } = useCategories();
  const { data: myOrders = [], refetch: refetchMyOrders } = useMyOrders();

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL);
    socket.emit('join_customer');

    socket.on('order_status_updated', (data) => {
      console.log('⚡ [Customer App Socket] Order status updated:', data);
      setLiveToastAlert(`⚡ Live Status Update: Order #${data.orderCode} is now Payment [${data.paymentStatus}] & Fulfillment [${data.fulfillmentStatus}]`);
      refetchMyOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, [refetchMyOrders]);

  const handleOrderPlaced = (createdOrder) => {
    setActiveReceiptOrder(createdOrder);
    refetchMyOrders();
  };

  return (
    <div className="app-container">
      <CustomerNavbar
        onOpenOrders={() => setShowMyOrdersModal(true)}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      <main className="main-content">
        {liveToastAlert && (
          <div className="realtime-alert-banner" style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(6, 182, 212, 0.2))', border: '1px solid var(--accent-emerald)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700 }}>
              <Bell size={20} style={{ color: 'var(--accent-emerald)' }} />
              <span>{liveToastAlert}</span>
            </div>
            <button className="btn btn-secondary btn-icon" onClick={() => setLiveToastAlert(null)} style={{ padding: '4px' }}>
              ✕
            </button>
          </div>
        )}

        <section style={{ padding: '2rem 0 1.5rem 0', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '999px', padding: '6px 16px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary-400)', marginBottom: '0.85rem' }}>
            <Sparkles size={16} /> HeMart Customer Shopping Portal
          </div>

          <h1 className="hero-title">
            Discover Premium Products & Order Online
          </h1>
          <p className="hero-subtitle">
            Place orders instantly with cash at cashier or online payment methods. Real-time updates directly from Admin Backoffice.
          </p>

          <div style={{ maxWidth: '580px', margin: '0 auto', position: 'relative' }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search products by title, description or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '3rem', height: '48px', fontSize: '0.95rem', borderRadius: 'var(--radius-lg)' }}
            />
          </div>
        </section>

        <section style={{ margin: '1.5rem 0' }}>
          <div className="category-pills">
            <button
              className={`cat-pill ${selectedCategory === 'ALL' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('ALL')}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`cat-pill ${selectedCategory === cat.slug ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                {cat.name} ({cat._count?.products || 0})
              </button>
            ))}
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1rem 0' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 700 }}>
              Catalog Items ({products.length})
            </h2>
          </div>

          {productsLoading ? (
            <div className="products-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="glass-card" style={{ height: '320px', opacity: 0.4 }}>
                  Loading catalog...
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <h3>No products match your filter</h3>
              <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>Try clearing search or picking another category.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />

        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          onOrderPlaced={handleOrderPlaced}
        />

        <ReceiptModal
          isOpen={Boolean(activeReceiptOrder)}
          order={activeReceiptOrder}
          onClose={() => setActiveReceiptOrder(null)}
        />

        {showMyOrdersModal && (
          <div className="overlay-backdrop" onClick={() => setShowMyOrdersModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Receipt size={20} style={{ color: 'var(--accent-cyan)' }} /> My Recent Orders & Real-time Status
                </h2>
                <button className="btn btn-secondary btn-icon" onClick={() => setShowMyOrdersModal(false)}>
                  ✕
                </button>
              </div>

              {myOrders.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                  No recent orders found.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {myOrders.map((ord) => (
                    <div
                      key={ord.id}
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
                        <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>#{ord.orderCode}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(ord.createdAt).toLocaleDateString()} • {ord.orderItems?.length || 0} items
                        </div>
                        <div style={{ marginTop: '4px', display: 'flex', gap: '6px' }}>
                          <span className={`badge ${ord.paymentStatus === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                            PAY: {ord.paymentStatus}
                          </span>
                          <span className={`badge ${ord.fulfillmentStatus === 'COMPLETED' ? 'badge-success' : 'badge-info'}`}>
                            STATUS: {ord.fulfillmentStatus}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <strong style={{ fontSize: '1rem' }}>{formatRupiah(ord.totalAmount)}</strong>
                        <button
                          className="btn btn-secondary"
                          onClick={() => {
                            setShowMyOrdersModal(false);
                            setActiveReceiptOrder(ord);
                          }}
                        >
                          Receipt
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => refetchMyOrders()}
        />
      </main>

      {/* Mobile Bottom Navigation Bar for Smartphones */}
      <nav className="mobile-bottom-nav">
        <button
          className="mobile-nav-item"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Ke Katalog Produk"
        >
          <Home size={19} />
          <span>Katalog</span>
        </button>

        <button
          className="mobile-nav-item"
          onClick={() => setShowMyOrdersModal(true)}
          title="Riwayat & Status Pesanan"
        >
          <Receipt size={19} />
          <span>Pesanan</span>
        </button>

        <button
          className="mobile-nav-item"
          onClick={() => setIsCartOpen(true)}
          title="Keranjang Belanja"
        >
          <ShoppingBag size={19} />
          <span>Keranjang</span>
          {totalItems > 0 && <span className="mobile-badge">{totalItems}</span>}
        </button>


        <button
          className="mobile-nav-item"
          onClick={() => (user ? setShowMyOrdersModal(true) : setIsLoginModalOpen(true))}
          title="Profil Customer"
        >
          <User size={19} />
          <span>{user ? user.name.split(' ')[0] : 'Masuk'}</span>
        </button>
      </nav>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <MainCustomerView />
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
