import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Link, Image } from 'lucide-react';
import { useCategories, useCreateProduct, useUpdateProduct } from '../api/queries';

export function ProductModal({ isOpen, onClose, productToEdit }) {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const fileInputRef = useRef(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'file'
  const [imagePayload, setImagePayload] = useState(null); // base64 for upload

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name || '');
      setDescription(productToEdit.description || '');
      setPrice(productToEdit.price || '');
      setStock(productToEdit.stock || '');
      setCategoryId(productToEdit.categoryId || '');
      setImageUrl(productToEdit.imageUrl || '');
      setImagePreview(productToEdit.imageUrl || '');
      setImagePayload(null);
      setImageMode('url');
    } else {
      setName('');
      setDescription('');
      setPrice('');
      setStock('');
      setCategoryId('');
      setImageUrl('');
      setImagePreview('');
      setImagePayload(null);
      setImageMode('url');
    }
  }, [productToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setImagePayload(base64);
      setImagePreview(base64);
      setImageUrl('');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (e) => {
    setImageUrl(e.target.value);
    setImagePreview(e.target.value);
    setImagePayload(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      categoryId,
    };

    // Attach image: prefer base64 upload, fallback to URL
    if (imagePayload) {
      payload.imagePayload = imagePayload;
    } else if (imageUrl) {
      payload.imageUrl = imageUrl;
    } else {
      payload.imageUrl = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop';
    }

    try {
      if (productToEdit) {
        await updateMutation.mutateAsync({ id: productToEdit.id, ...payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product.');
    }
  };

  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700 }}>
            {productToEdit ? 'Edit Product Item' : 'Create New Product'}
          </h2>
          <button className="btn btn-secondary btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Product Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Wireless Noise-Canceling Headphones"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Price (Rp)</label>
              <input
                type="number"
                step="1"
                className="form-input"
                placeholder="299000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Stock Quantity</label>
              <input
                type="number"
                className="form-input"
                placeholder="25"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Category</label>
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select Category...</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* ── Image Section ── */}
          <div className="input-group">
            <label className="input-label">Product Image</label>

            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: imageMode === 'url' ? '1px solid var(--primary-500)' : '1px solid var(--border-glass)',
                  background: imageMode === 'url' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                  color: imageMode === 'url' ? 'var(--primary-400)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}
              >
                <Link size={14} /> Paste URL
              </button>
              <button
                type="button"
                onClick={() => { setImageMode('file'); fileInputRef.current?.click(); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: imageMode === 'file' ? '1px solid var(--accent-emerald)' : '1px solid var(--border-glass)',
                  background: imageMode === 'file' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                  color: imageMode === 'file' ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}
              >
                <Upload size={14} /> Upload File
              </button>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {/* URL Input */}
            {imageMode === 'url' && (
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={handleUrlChange}
              />
            )}

            {/* File upload drop zone */}
            {imageMode === 'file' && (
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed var(--border-glass)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(255,255,255,0.02)',
                  transition: 'var(--transition-fast)',
                }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--accent-emerald)'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-glass)'}
              >
                <Upload size={24} style={{ color: 'var(--text-dim)', marginBottom: '0.5rem' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {imagePayload ? '✅ File selected — click to change' : 'Click to pick an image from your computer'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            )}

            {/* Preview */}
            {imagePreview && (
              <div style={{ marginTop: '0.75rem', position: 'relative', display: 'inline-block' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  onError={() => setImagePreview('')}
                  style={{
                    width: '100%',
                    maxHeight: '160px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-glass)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => { setImagePreview(''); setImageUrl(''); setImagePayload(null); }}
                  style={{
                    position: 'absolute', top: '6px', right: '6px',
                    background: 'rgba(0,0,0,0.7)', border: 'none',
                    borderRadius: '50%', width: '24px', height: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff',
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          <div className="input-group">
            <label className="input-label">Description</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Product specs and description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : productToEdit
                ? 'Update Product'
                : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
