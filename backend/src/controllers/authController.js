const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce_admin_super_secret_jwt_key_2026';

/**
 * Sync or register user account into local database
 */
async function syncUser(req, res) {
  try {
    const { email, name, role = 'CUSTOMER', supabaseUid } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          supabaseUid ? { supabaseUid } : undefined,
          { email },
        ].filter(Boolean)
      }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          role: role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'CUSTOMER',
          supabaseUid: supabaseUid || null,
        }
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        supabaseUid: user.supabaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'User synchronized successfully.',
      data: {
        user,
        token,
      }
    });
  } catch (err) {
    console.error('[Auth Sync Error]:', err);
    return res.status(500).json({ success: false, message: 'Failed to synchronize user.' });
  }
}

/**
 * Demo Quick Login / Switch Role for rapid testing
 */
async function quickLogin(req, res) {
  try {
    const { role = 'CUSTOMER' } = req.body;
    const targetRole = role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
    const email = targetRole === 'ADMIN' ? 'admin@store.com' : 'customer@store.com';

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: targetRole === 'ADMIN' ? 'Store Administrator' : 'Valued Customer',
          role: targetRole,
        }
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        supabaseUid: user.supabaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      data: {
        user,
        token,
      }
    });
  } catch (err) {
    console.error('[Quick Login Error]:', err);
    return res.status(500).json({ success: false, message: 'Quick login failed.' });
  }
}

/**
 * Login with email and password
 * - Admin password: "Admin1234"
 * - Customer password: "Customer1234"
 */
async function login(req, res) {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password wajib diisi.'
      });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user in database by email (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: trimmedEmail,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: `Email "${email}" tidak terdaftar dalam sistem.`
      });
    }

    // Determine expected password based on role
    const expectedPassword = user.role === 'ADMIN' ? 'Admin1234' : 'Customer1234';

    if (password !== expectedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Password salah. Periksa kembali password Anda.'
      });
    }

    // Portal validation (e.g. customer cannot log into admin panel)
    if (portal === 'ADMIN' && user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak: Akun ini adalah Customer, bukan Administrator.'
      });
    }

    // Sign JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        supabaseUid: user.supabaseUid,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login berhasil.',
      data: {
        user,
        token,
      }
    });
  } catch (err) {
    console.error('[Login Error]:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan saat memproses login.' });
  }
}

/**
 * Get available users list for quick testing / demo selection
 */
async function getDemoUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
      orderBy: { name: 'asc' }
    });

    return res.json({ success: true, data: users });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to fetch users.' });
  }
}

/**
 * Get current authenticated user details
 */
async function getMe(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthenticated.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    return res.json({ success: true, data: user || req.user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error retrieving profile.' });
  }
}

module.exports = {
  login,
  getDemoUsers,
  syncUser,
  quickLogin,
  getMe,
};
