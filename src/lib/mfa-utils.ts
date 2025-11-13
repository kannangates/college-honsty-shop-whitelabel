// Type definitions for MFA functionality
// The actual MFA logic is now handled by the Express server in server/lib/mfa-utils.js

export interface MFASecret {
  secret: string;
  otpauthUrl: string;
  qrCode?: string;
}

export interface MFAStatus {
  isEnabled: boolean;
  isVerified: boolean;
}
