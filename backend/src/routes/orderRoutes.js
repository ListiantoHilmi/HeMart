const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/authMiddleware');

// Customer checkout (guest or authenticated)
router.post('/checkout', optionalAuth, orderController.createCheckoutOrder);
router.get('/my-orders', optionalAuth, orderController.getMyOrders);

// Admin dashboard & management routes
router.get('/admin/all', authenticateToken, requireAdmin, orderController.getAllOrders);
router.get('/admin/stats', authenticateToken, requireAdmin, orderController.getDashboardStats);
router.patch('/admin/:id/status', authenticateToken, requireAdmin, orderController.updateOrderStatus);

module.exports = router;
