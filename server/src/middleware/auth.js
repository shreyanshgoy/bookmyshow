const { verifyAccessToken } = require('../utils/tokens');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
    }

    // Verify user exists and is not blocked
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account is suspended. Please contact support.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication error', error: error.message });
  }
};

// Optional auth: populates req.user if token exists, but doesn't block if absent
const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id).select('-password');
        if (user && !user.isBlocked) {
          req.user = user;
        }
      }
    }
  } catch (err) {
    // Proceed as unauthenticated
  }
  next();
};

module.exports = { authenticate, optionalAuth };
