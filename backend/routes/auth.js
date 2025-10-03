import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/database.js';

const router = express.Router();

// Sign up endpoint
router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName, username } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        full_name: fullName,
        username: username 
      },
      email_confirm: true, // Mark email as confirmed
      email_confirmed_at: new Date().toISOString() // Set confirmation timestamp
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    // Immediately sign in using anon client to return a session/JWT
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseAnonKey) {
      return res.status(500).json({ success: false, error: 'Authentication service not configured' });
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error) {
      return res.status(500).json({ success: false, error: 'Auto sign-in failed' });
    }

    // Load profile (optional)
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    // Return session + user just like /signin
    res.status(201).json({
      success: true,
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: profile?.full_name,
        username: profile?.username,
        avatarUrl: profile?.avatar_url
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create user'
    });
  }
});

// Sign in endpoint
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    // Create a temporary Supabase client for authentication
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseAnonKey) {
      console.error('SUPABASE_ANON_KEY not found in environment variables');
      return res.status(500).json({
        success: false,
        error: 'Authentication service not configured'
      });
    }

    console.log('Using Supabase URL:', supabaseUrl);
    console.log('Anon key available:', !!supabaseAnonKey);

    const authClient = createClient(supabaseUrl, supabaseAnonKey);

    // Sign in with Supabase using client-side method
    const { data, error } = await authClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    // Get user profile using service role client
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
    }

    res.json({
      success: true,
      session: data.session,
      user: {
        id: data.user.id,
        email: data.user.email,
        fullName: profile?.full_name,
        username: profile?.username,
        avatarUrl: profile?.avatar_url
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sign in'
    });
  }
});

// Sign out endpoint
router.post('/signout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        error: 'No authorization header'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Sign out from Supabase
    const { error } = await supabase.auth.admin.signOut(token);

    if (error) {
      console.error('Signout error:', error);
    }

    res.json({
      success: true,
      message: 'Signed out successfully'
    });

  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sign out'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    res.json({
      success: true,
      session: data.session
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh token'
    });
  }
});

export default router;
