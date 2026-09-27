const express = require('express');
const router = express.Router();
const paymentMethodController = require('../controllers/paymentMethodController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Public listing
router.get('/', paymentMethodController.getPaymentMethods);

// Admin endpoints
router.post('/', authenticateToken, requireAdmin, paymentMethodController.createPaymentMethod);
router.patch('/:id/toggle', authenticateToken, requireAdmin, paymentMethodController.togglePaymentMethod);

module.exports = router;
