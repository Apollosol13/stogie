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

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(morgan('combined'));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CORS_ORIGINS?.split(',') || []
    : ['http://localhost:8081', 'http://localhost:19006', 'exp://192.168.1.100:8081'],
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
