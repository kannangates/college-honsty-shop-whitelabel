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
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'developer')) {
      return res.status(403).json({ error: 'Admin or Developer access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Authentication failed' });
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
