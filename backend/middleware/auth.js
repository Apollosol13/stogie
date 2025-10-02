import jwt from 'jsonwebtoken';
import supabase, { supabaseAuth } from '../config/database.js';

// Middleware to authenticate JWT tokens
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'Authorization header required'
      });
    }

    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Verify token with Supabase using anon client
    console.log('🔐 AUTH MIDDLEWARE: Verifying token...');
    console.log('🔐 AUTH MIDDLEWARE: Token preview:', token.substring(0, 30) + '...');
    
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    console.log('🔐 AUTH MIDDLEWARE: Supabase response:', { user: !!user, error: error?.message });
    
    if (error) {
      console.log('🔐 AUTH MIDDLEWARE: Supabase error details:', error);
    }

    if (error || !user) {
      console.log('🔐 AUTH MIDDLEWARE: Token verification failed');
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    
    console.log('🔐 AUTH MIDDLEWARE: Token verified successfully for user:', user.id);

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Middleware to check if user is admin (for future use)
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user has admin role in their metadata
    const isAdmin = req.user.user_metadata?.role === 'admin' || 
                   req.user.app_metadata?.role === 'admin';

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();

  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization check failed'
    });
  }
};

// Middleware to validate request body
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    
    next();
  };
};

// Middleware to handle rate limiting (basic implementation)
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

export const rateLimit = (req, res, next) => {
  const clientId = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  
  if (!requestCounts.has(clientId)) {
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  const clientData = requestCounts.get(clientId);
  
  if (now > clientData.resetTime) {
    // Reset the counter
    requestCounts.set(clientId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }
  
  if (clientData.count >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
    });
  }
  
  clientData.count++;
  next();
};

export default {
  authenticateToken,
  requireAdmin,
  validateRequest,
  rateLimit
};
