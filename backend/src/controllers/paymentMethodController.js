const prisma = require('../config/prisma');

/**
 * Get payment methods (public checkout lists active ones, admin gets all)
 */
async function getPaymentMethods(req, res) {
  try {
    const { activeOnly } = req.query;

    const whereClause = {};
    if (activeOnly === 'true') {
      whereClause.isActive = true;
    }

    const paymentMethods = await prisma.paymentMethod.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ success: true, data: paymentMethods });
  } catch (err) {
    console.error('[Get Payment Methods Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch payment methods.' });
  }
}

/**
 * Admin: Add new payment method
 */
async function createPaymentMethod(req, res) {
  try {
    const { name, code, type, instructions, isActive = true } = req.body;

    if (!name || !code || !type) {
      return res.status(400).json({ success: false, message: 'Name, code, and type (IN_STORE or ONLINE) are required.' });
    }

    const uppercaseCode = code.toUpperCase().replace(/[^A-Z0-9_]/g, '_');

    const existing = await prisma.paymentMethod.findUnique({ where: { code: uppercaseCode } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Payment method code already exists.' });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        name,
        code: uppercaseCode,
        type: type === 'IN_STORE' ? 'IN_STORE' : 'ONLINE',
        instructions: instructions || null,
        isActive: Boolean(isActive),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Payment method created successfully.',
      data: paymentMethod,
    });
  } catch (err) {
    console.error('[Create Payment Method Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to create payment method.' });
  }
}

/**
 * Admin: Toggle payment method active/inactive state
 */
async function togglePaymentMethod(req, res) {
  try {
    const { id } = req.params;

    const existing = await prisma.paymentMethod.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Payment method not found.' });
    }

    const updated = await prisma.paymentMethod.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return res.json({
      success: true,
      message: `Payment method ${updated.isActive ? 'enabled' : 'disabled'} successfully.`,
      data: updated,
    });
  } catch (err) {
    console.error('[Toggle Payment Method Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to toggle payment method state.' });
  }
}

module.exports = {
  getPaymentMethods,
  createPaymentMethod,
  togglePaymentMethod,
};
