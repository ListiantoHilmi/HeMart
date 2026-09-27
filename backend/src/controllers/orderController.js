const prisma = require('../config/prisma');
const { uploadToSupabaseStorage } = require('../config/supabase');

/**
 * Customer / Guest Checkout endpoint (Handles IN_STORE & ONLINE)
 */
async function createCheckoutOrder(req, res) {
  try {
    const {
      items,
      paymentMethodId,
      customerName,
      customerPhone,
      notes,
      paymentProofPayload,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    if (!paymentMethodId) {
      return res.status(400).json({ success: false, message: 'Payment method selection is required.' });
    }

    // 1. Verify Payment Method
    const paymentMethod = await prisma.paymentMethod.findUnique({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod || !paymentMethod.isActive) {
      return res.status(400).json({ success: false, message: 'Selected payment method is currently unavailable.' });
    }

    // 2. Fetch products and check stock availability
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, isDeleted: false },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let calculatedTotal = 0;
    const orderItemData = [];

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(400).json({ success: false, message: `Product item not found.` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for '${product.name}'. Remaining stock: ${product.stock}`,
        });
      }

      const itemPrice = parseFloat(product.price);
      const subtotal = itemPrice * item.quantity;
      calculatedTotal += subtotal;

      orderItemData.push({
        productId: product.id,
        quantity: item.quantity,
        price: itemPrice,
        subtotal: subtotal,
      });
    }

    // Handle payment proof upload if provided for ONLINE flow
    let paymentProofUrl = null;
    if (paymentMethod.type === 'ONLINE' && paymentProofPayload) {
      paymentProofUrl = await uploadToSupabaseStorage('payment-proofs', `proof_${Date.now()}.png`, paymentProofPayload);
    }

    // Determine initial payment status based on payment type
    // IN_STORE defaults to PENDING (Pay at Cashier). ONLINE with proof can be set to PENDING for admin verification.
    const initialPaymentStatus = 'PENDING';
    const initialFulfillmentStatus = 'PENDING';

    const orderCode = `ORD-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Execute Transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // Create Order
      const createdOrder = await tx.order.create({
        data: {
          orderCode,
          userId: req.user ? req.user.id : null,
          customerName: customerName || (req.user ? req.user.name : 'Guest Customer'),
          customerPhone: customerPhone || null,
          totalAmount: calculatedTotal,
          paymentStatus: initialPaymentStatus,
          fulfillmentStatus: initialFulfillmentStatus,
          paymentMethodId,
          notes: notes || null,
          paymentProofUrl,
          orderItems: {
            create: orderItemData,
          },
        },
        include: {
          orderItems: {
            include: { product: true },
          },
          paymentMethod: true,
        },
      });

      // Deduct stock for ordered items
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return createdOrder;
    });

    // 4. Broadcast Real-time socket alert to Admin backoffice
    const io = req.app.get('io');
    if (io) {
      io.emit('new_order', {
        message: `New Order ${newOrder.orderCode} placed! Total: Rp ${Number(newOrder.totalAmount).toLocaleString('id-ID')}`,
        order: newOrder,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      data: newOrder,
    });
  } catch (err) {
    console.error('[Checkout Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to process checkout.' });
  }
}

/**
 * Customer order history
 */
async function getMyOrders(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const { phone } = req.query;

    const whereClause = {};

    if (userId) {
      whereClause.userId = userId;
    } else if (phone) {
      whereClause.customerPhone = phone;
    } else {
      return res.json({ success: true, data: [] });
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: { product: true },
        },
        paymentMethod: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error('[My Orders Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch order history.' });
  }
}

/**
 * Admin: List all orders with filters
 */
async function getAllOrders(req, res) {
  try {
    const { search, paymentStatus, fulfillmentStatus } = req.query;

    const whereClause = {};

    if (paymentStatus && paymentStatus !== 'ALL') {
      whereClause.paymentStatus = paymentStatus;
    }

    if (fulfillmentStatus && fulfillmentStatus !== 'ALL') {
      whereClause.fulfillmentStatus = fulfillmentStatus;
    }

    if (search) {
      whereClause.OR = [
        { orderCode: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        orderItems: {
          include: { product: true },
        },
        paymentMethod: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error('[Get All Orders Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch admin orders.' });
  }
}

/**
 * Admin: Update Order Status (PENDING, PAID, PROCESSING, COMPLETED, CANCELLED)
 */
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { paymentStatus, fulfillmentStatus } = req.body;

    const existing = await prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Handle stock restoration if order is CANCELLED
    if (fulfillmentStatus === 'CANCELLED' && existing.fulfillmentStatus !== 'CANCELLED') {
      for (const item of existing.orderItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        ...(paymentStatus && { paymentStatus }),
        ...(fulfillmentStatus && { fulfillmentStatus }),
      },
      include: {
        orderItems: { include: { product: true } },
        paymentMethod: true,
      },
    });

    // Broadcast Real-time event
    const io = req.app.get('io');
    if (io) {
      io.emit('order_status_updated', {
        orderId: updated.id,
        orderCode: updated.orderCode,
        paymentStatus: updated.paymentStatus,
        fulfillmentStatus: updated.fulfillmentStatus,
        order: updated,
      });
    }

    return res.json({
      success: true,
      message: 'Order status updated successfully.',
      data: updated,
    });
  } catch (err) {
    console.error('[Update Order Status Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to update order status.' });
  }
}

/**
 * Admin: Dashboard Analytics Summary
 */
async function getDashboardStats(req, res) {
  try {
    const [totalRevenueAgg, totalOrdersCount, pendingOrdersCount, lowStockCount] = await Promise.all([
      prisma.order.aggregate({
        _sum: { totalAmount: true },
        where: { paymentStatus: 'PAID' },
      }),
      prisma.order.count(),
      prisma.order.count({
        where: { fulfillmentStatus: 'PENDING' },
      }),
      prisma.product.count({
        where: { stock: { lte: 5 }, isDeleted: false },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        totalRevenue: totalRevenueAgg._sum.totalAmount || 0,
        totalOrders: totalOrdersCount,
        pendingOrders: pendingOrdersCount,
        lowStockItems: lowStockCount,
      },
    });
  } catch (err) {
    console.error('[Dashboard Stats Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to compute dashboard stats.' });
  }
}

module.exports = {
  createCheckoutOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getDashboardStats,
};
