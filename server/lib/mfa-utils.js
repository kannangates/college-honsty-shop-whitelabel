import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { supabaseAdmin } from './supabase.js';

export async function generateMFASecret(userId, email) {
  if (!userId || !email) {
    throw new Error('User ID and email are required');
  }

  try {
    const secret = speakeasy.generateSecret({
      name: `Shasun College:${email}`,
      issuer: 'Shasun College',
      length: 20,
    });

    // Store the secret in the database (not yet enabled)
    const { error } = await supabaseAdmin
      .from('user_mfa')
      .upsert({
        user_id: userId,
        secret: secret.base32,
        enabled: false,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to store MFA secret in database');
    }

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url || `otpauth://totp/Shasun%20College:${encodeURIComponent(email)}?secret=${secret.base32}&issuer=Shasun%20College`,
    };
  } catch (error) {
    console.error('Error generating MFA secret:', error);
    throw new Error('Failed to generate MFA secret');
  }
}

export async function verifyMFAToken(userId, token) {
  if (!userId || !token) {
    throw new Error('User ID and token are required');
  }

  try {
    // Get the user's MFA secret
    const { data, error } = await supabaseAdmin
      .from('user_mfa')
      .select('secret, enabled')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('MFA not set up for user:', userId);
      throw new Error('MFA not set up for this user');
    }

    if (!data.enabled) {
      console.error('MFA not enabled for user:', userId);
      throw new Error('MFA is not enabled for this user');
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: data.secret,
      encoding: 'base32',
      token: token.replace(/\s+/g, ''), // Remove any whitespace
      window: 1, // Allow 1 step (30 seconds) in either direction
    });

    console.log(`MFA verification ${verified ? 'succeeded' : 'failed'} for user:`, userId);
    return verified;
  } catch (error) {
    console.error('Error in verifyMFAToken:', error);
    return false;
  }
}

export async function isMFAEnabled(userId) {
  if (!userId) return false;

  try {
    const { data, error } = await supabaseAdmin
      .from('user_mfa')
      .select('enabled')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      console.error('Error checking MFA status:', error);
      return false;
    }

    return !!data.enabled;
  } catch (error) {
    console.error('Exception in isMFAEnabled:', error);
    return false;
  }
}

export async function enableMFA(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { error } = await supabaseAdmin
      .from('user_mfa')
      .update({
        enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error enabling MFA:', error);
      throw new Error('Failed to enable MFA in database');
    }

    return true;
  } catch (error) {
    console.error('Exception in enableMFA:', error);
    throw new Error('Failed to enable MFA');
  }
}

export async function disableMFA(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const { error } = await supabaseAdmin
      .from('user_mfa')
      .update({
        enabled: false,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Error disabling MFA:', error);
      throw new Error('Failed to disable MFA in database');
    }

    return true;
  } catch (error) {
    console.error('Exception in disableMFA:', error);
    throw new Error('Failed to disable MFA');
  }
}

export async function generateQRCode(otpauthUrl) {
  if (!otpauthUrl) {
    throw new Error('OTP Auth URL is required');
  }

  try {
    const qrCode = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 6,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrCode;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}
