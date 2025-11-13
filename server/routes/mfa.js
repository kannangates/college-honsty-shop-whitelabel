import express from 'express';
import { getUserFromRequest } from '../lib/supabase.js';
import {
  generateMFASecret,
  verifyMFAToken,
  isMFAEnabled,
  enableMFA,
  disableMFA,
  generateQRCode,
} from '../lib/mfa-utils.js';

const router = express.Router();

// Middleware to check authentication
async function requireAuth(req, res, next) {
  const user = await getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  req.user = user;
  next();
}

// Setup MFA - Generate secret and QR code
router.post('/setup', requireAuth, async (req, res) => {
  try {
    const { id: userId, email } = req.user;

    const { secret, otpauthUrl } = await generateMFASecret(userId, email);
    const qrCode = await generateQRCode(otpauthUrl);

    res.json({
      secret,
      qrCode,
      otpauthUrl,
    });
  } catch (error) {
    console.error('MFA setup error:', error);
    res.status(500).json({ error: error.message || 'Failed to setup MFA' });
  }
});

// Verify MFA token and enable MFA
router.post('/verify', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const { id: userId } = req.user;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const isValid = await verifyMFAToken(userId, token);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    // Enable MFA after successful verification
    await enableMFA(userId);

    res.json({ success: true, message: 'MFA enabled successfully' });
  } catch (error) {
    console.error('MFA verification error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify MFA' });
  }
});

// Verify MFA session (during login)
router.post('/verify-session', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    const { id: userId } = req.user;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const isValid = await verifyMFAToken(userId, token);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid token' });
    }

    res.json({ success: true, message: 'MFA verified successfully' });
  } catch (error) {
    console.error('MFA session verification error:', error);
    res.status(500).json({ error: error.message || 'Failed to verify MFA session' });
  }
});

// Disable MFA
router.post('/disable', requireAuth, async (req, res) => {
  try {
    const { id: userId } = req.user;

    await disableMFA(userId);

    res.json({ success: true, message: 'MFA disabled successfully' });
  } catch (error) {
    console.error('MFA disable error:', error);
    res.status(500).json({ error: error.message || 'Failed to disable MFA' });
  }
});

// Check MFA status
router.get('/status', requireAuth, async (req, res) => {
  try {
    const { id: userId } = req.user;

    const enabled = await isMFAEnabled(userId);

    res.json({ enabled });
  } catch (error) {
    console.error('MFA status check error:', error);
    res.status(500).json({ error: error.message || 'Failed to check MFA status' });
  }
});

export default router;
