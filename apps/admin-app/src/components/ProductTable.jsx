import React, { useState } from 'react';
import { Plus, Search, Edit2, Trash2, CheckCircle2, AlertTriangle, Package } from 'lucide-react';
import { useProducts, useSoftDeleteProduct } from '../api/queries';
import { formatRupiah } from '../utils/formatters';

export function ProductTable({ onCreateProduct, onEditProduct }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const { data: products = [], isLoading } = useProducts({
    search,
    category: selectedCategory,
    inStockOnly: 'false',
  });

  const deleteProductMutation = useSoftDeleteProduct();

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete product '${name}'?`)) {
      try {
        await deleteProductMutation.mutateAsync(id);
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  return (
    <div className="glass-card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} style={{ color: 'var(--primary-400)' }} /> Product Inventory Catalog
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage store products, price tags, and inventory stock counts.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onCreateProduct} style={{ whiteSpace: 'nowrap' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Filter product by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>
                  Loading inventory...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: '#ffffff' }}>{product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{product.category?.name || 'General'}</span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--accent-cyan)' }}>{formatRupiah(product.price)}</strong>
                  </td>
                  <td>
                    {product.stock <= 0 ? (
                      <span className="badge badge-danger">
                        <AlertTriangle size={12} /> Out of Stock (0)
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="badge badge-warning">
                        <AlertTriangle size={12} /> Low Stock ({product.stock})
                      </span>
                    ) : (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} /> In Stock ({product.stock})
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary btn-icon"
                        onClick={() => onEditProduct(product)}
                        title="Edit product"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="btn btn-danger btn-icon"
                        onClick={() => handleDelete(product.id, product.name)}
                        title="Delete product"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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
