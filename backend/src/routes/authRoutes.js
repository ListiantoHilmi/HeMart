const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/demo-users', authController.getDemoUsers);
router.post('/sync', authController.syncUser);
router.post('/quick-login', authController.quickLogin);
router.get('/me', authenticateToken, authController.getMe);

module.exports = router;
