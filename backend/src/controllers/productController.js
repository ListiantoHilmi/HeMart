const prisma = require('../config/prisma');
const { uploadToSupabaseStorage } = require('../config/supabase');

/**
 * Get catalog listing for customers or full product list for admins
 */
async function getProducts(req, res) {
  try {
    const { search, category, includeDeleted, inStockOnly } = req.query;

    const whereClause = {};

    // Filter soft-deleted items unless requested by admin
    if (includeDeleted !== 'true') {
      whereClause.isDeleted = false;
    }

    if (inStockOnly === 'true') {
      whereClause.stock = { gt: 0 };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category && category !== 'ALL') {
      whereClause.OR = [
        { categoryId: category },
        { category: { slug: category } },
      ];
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: products });
  } catch (err) {
    console.error('[Get Products Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch products.' });
  }
}

/**
 * Get single product detail
 */
async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    return res.json({ success: true, data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving product.' });
  }
}

/**
 * Get categories list
 */
async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' },
    });
    return res.json({ success: true, data: categories });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
  }
}

/**
 * Admin: Create new product with Supabase Storage image upload
 */
async function createProduct(req, res) {
  try {
    const { name, description, price, stock, categoryId, imagePayload, imageUrl: directImageUrl } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ success: false, message: 'Name, price, and category are required.' });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

    let imageUrl = directImageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop';
    if (imagePayload) {
      imageUrl = await uploadToSupabaseStorage('product-images', `${slug}.png`, imagePayload);
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        imageUrl,
        categoryId,
      },
      include: { category: true },
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully.',
      data: product,
    });
  } catch (err) {
    console.error('[Create Product Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to create product.' });
  }
}

/**
 * Admin: Update product details & stock toggle
 */
async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { name, description, price, stock, categoryId, imagePayload, imageUrl: imageUrlField, isDeleted } = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    let imageUrl = existing.imageUrl;

    // If a direct URL was provided (not a base64 payload), use it directly
    if (imageUrlField && imageUrlField !== existing.imageUrl && !imageUrlField.startsWith('data:')) {
      imageUrl = imageUrlField;
    }

    // If a base64/file payload is provided, upload to Supabase Storage
    if (imagePayload && imagePayload !== existing.imageUrl) {
      imageUrl = await uploadToSupabaseStorage('product-images', `update_${id}.png`, imagePayload);
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(stock !== undefined && { stock: parseInt(stock, 10) }),
        ...(categoryId && { categoryId }),
        imageUrl,
        ...(isDeleted !== undefined && { isDeleted: Boolean(isDeleted) }),
      },
      include: { category: true },
    });

    return res.json({
      success: true,
      message: 'Product updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('[Update Product Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update product.' });
  }
}

/**
 * Admin: Soft-delete product (sets isDeleted = true)
 */
async function softDeleteProduct(req, res) {
  try {
    const { id } = req.params;

    const product = await prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });

    return res.json({
      success: true,
      message: 'Product marked as deleted (soft delete).',
      data: product,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to soft delete product.' });
  }
}

module.exports = {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  softDeleteProduct,
};
