import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import { createClient } from '@supabase/supabase-js';

// Import route modules
import authRoutes from './routes/auth.js';
import cigarRoutes from './routes/cigars.js';
import humidorRoutes from './routes/humidor.js';
import reviewRoutes from './routes/reviews.js';
import profileRoutes from './routes/profiles.js';
import analyticsRoutes from './routes/analytics.js';
import shopRoutes from './routes/shops.js';
import sessionRoutes from './routes/sessions.js';
import integrationRoutes from './routes/integrations.js';
import uploadRoutes from './routes/upload.js';
import postRoutes from './routes/posts.js';
import followRoutes from './routes/follow.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
if (!PORT) {
  console.error("PORT environment variable not set");
  process.exit(1);
}

// Initialize Supabase with service role key (server-side only)
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Trust proxy for Railway (enables req.ip and secure cookies)
app.set('trust proxy', 1);

// Middleware - Helmet security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://fjfvmhhmqtbrbpgxcrec.supabase.co"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    }
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  }
}));

app.use(morgan('combined'));

// CORS configuration with dynamic origin validation
const getAllowedOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: strict whitelist from env var
    const origins = process.env.CORS_ORIGINS?.split(',').map(o => o.trim()) || [];
    console.log('🔒 CORS: Production whitelist:', origins);
    return origins;
  }
  // Development: allow localhost, Expo dev, and local network
  return [
    'http://localhost:8081',
    'http://localhost:19006',
    'http://localhost:3000',
    /^exp:\/\/.*/, // Expo Go on any local IP
    /^http:\/\/192\.168\.\d+\.\d+:\d+$/, // Local network IPs
  ];
};

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Check if origin matches whitelist (string or regex)
    const isAllowed = allowedOrigins.some(allowed => 
      typeof allowed === 'string' 
        ? allowed === origin 
        : allowed.test(origin)
    );
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cigars', cigarRoutes);
app.use('/api/humidor', humidorRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/smoking-sessions', sessionRoutes);
app.use('/integrations', integrationRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/follow', followRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Stogie API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      cigars: '/api/cigars',
      humidor: '/api/humidor',
      reviews: '/api/reviews',
      profiles: '/api/profiles'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';
  
  res.status(err.status || 500).json({
    success: false,
    error: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: `Route ${req.originalUrl} not found` 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚂 Stogie API server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
