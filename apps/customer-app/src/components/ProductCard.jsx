import React from 'react';
import { Plus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatRupiah } from '../utils/formatters';

export function ProductCard({ product }) {
  const { addToCart } = useCart();
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="glass-card product-card">
      <div className="product-image-wrap">
        <img
          src={product.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop'}
          alt={product.name}
          loading="lazy"
        />
        <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
          {isOutOfStock ? (
            <span className="badge badge-danger">
              <AlertTriangle size={12} /> Out of Stock
            </span>
          ) : (
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> {product.stock} left
            </span>
          )}
        </div>
      </div>

      <div className="product-card-body">
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--primary-400)', fontWeight: 700, letterSpacing: '0.5px' }}>
          {product.category?.name || 'General'}
        </div>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Price</span>
            <span className="product-price">{formatRupiah(product.price)}</span>
          </div>

          <button
            className={`btn ${isOutOfStock ? 'btn-secondary' : 'btn-primary'}`}
            disabled={isOutOfStock}
            onClick={() => addToCart(product, 1)}
          >
            <Plus size={16} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
