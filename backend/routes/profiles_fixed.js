import express from 'express';
import { supabase } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get current user's profile (MUST come before /:userId)
router.get('/me', authenticateToken, async (req, res) => {
  // ... existing /me route code
});

// Search profiles (MUST come before /:userId)  
router.get('/search', async (req, res) => {
  // ... existing /search route code
});

// Get user profile by ID (MUST come after specific routes)
router.get('/:userId', async (req, res) => {
  // ... existing /:userId route code
});

// ... rest of routes

export default router;
