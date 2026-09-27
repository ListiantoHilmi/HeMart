const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET || 'ecommerce_admin_super_secret_jwt_key_2026';

/**
 * Validates Supabase JWT or local JWT bearer token
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authorization header missing or invalid format.' });
    }

    const token = authHeader.split(' ')[1];

    // 1. Try local JWT verify first (for seed/demo admin/customer JWTs)
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      return next();
    } catch (localErr) {
      // 2. Fallback to Supabase Auth token validation via SDK
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token);

      if (error || !supabaseUser) {
        return res.status(401).json({ success: false, message: 'Invalid or expired Supabase authentication token.' });
      }

      // Check or sync user from local database
      let dbUser = await prisma.user.findFirst({
        where: {
          OR: [
            { supabaseUid: supabaseUser.id },
            { email: supabaseUser.email },
          ]
        }
      });

      if (!dbUser) {
        // Create user dynamically if authenticated via Supabase
        const role = supabaseUser.user_metadata?.role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
        dbUser = await prisma.user.create({
          data: {
            supabaseUid: supabaseUser.id,
            email: supabaseUser.email,
            name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
            role: role,
          }
        });
      }

      req.user = {
        id: dbUser.id,
        supabaseUid: dbUser.supabaseUid,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role,
      };

      return next();
    }
  } catch (err) {
    console.error('[Auth Middleware Exception]:', err);
    return res.status(500).json({ success: false, message: 'Internal server error during authentication.' });
  }
}

/**
 * Ensures authenticated user has ADMIN role
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required.' });
  }
  next();
}

/**
 * Optional authentication middleware for guest/customer operations
 */
async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  return authenticateToken(req, res, next);
}

module.exports = {
  authenticateToken,
  requireAdmin,
  optionalAuth,
};
