import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase client for auth verification
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://vkuagjkrpbagrchsqmsf.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Middleware to verify admin/developer access
const requireAdminOrDeveloper = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      console.error('❌ No authorization header');
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Use the anon key client to verify the user's JWT token
    const anonClient = createClient(
      process.env.VITE_SUPABASE_URL || 'https://vkuagjkrpbagrchsqmsf.supabase.co',
      process.env.VITE_SUPABASE_PUBLISHABLE_KEY || ''
    );

    const { data: { user }, error } = await anonClient.auth.getUser(token);

    if (error || !user) {
      console.error('❌ Auth error:', error?.message || 'No user found');
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    console.log('✅ User authenticated:', user.email);

    // Always query the users table for the current role (source of truth)
    console.log('🔍 Querying users table for role...');
    const { data: userData, error: roleError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (roleError) {
      console.error('❌ Error fetching user role:', roleError);
      return res.status(500).json({ error: 'Failed to verify user role: ' + roleError.message });
    }

    const userRole = userData?.role;
    console.log('👤 User role from database:', userRole);

    // Allow admin or developer roles
    const allowedRoles = ['admin', 'developer'];
    if (!userRole || !allowedRoles.includes(userRole)) {
      console.error('❌ Insufficient permissions. Role:', userRole);
      return res.status(403).json({ error: 'Admin or Developer access required. Your role: ' + (userRole || 'none') });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth error:', error);
    res.status(401).json({ error: 'Authentication failed: ' + error.message });
  }
};

// Update whitelabel.json
router.post('/update', requireAdminOrDeveloper, async (req, res) => {
  try {
    const { config } = req.body;

    if (!config || typeof config !== 'object') {
      return res.status(400).json({ error: 'Invalid config format' });
    }

    // Path to whitelabel.json (go up from server/routes to project root)
    const whitelabelPath = path.join(__dirname, '../../whitelabel.json');

    // Write the updated config
    await fs.writeFile(whitelabelPath, JSON.stringify(config, null, 2), 'utf8');

    console.log('✅ Whitelabel config updated successfully');

    res.json({
      success: true,
      message: 'Whitelabel configuration updated successfully. Please restart the server to apply changes.'
    });
  } catch (error) {
    console.error('❌ Error updating whitelabel config:', error);
    res.status(500).json({
      error: 'Failed to update configuration',
      details: error.message
    });
  }
});

export default router;
