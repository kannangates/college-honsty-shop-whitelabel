/**
 * Pure TOTP verification without external dependencies
 * Implements RFC 6238 Time-Based One-Time Password Algorithm
 */

// Base32 alphabet
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/**
 * Decode a base32-encoded string to Uint8Array
 */
function base32Decode(input: string): Uint8Array {
  // Remove padding and convert to uppercase
  const cleanedInput = input.replace(/=+$/, '').toUpperCase();

  const output: number[] = [];
  let bits = 0;
  let value = 0;

  for (const char of cleanedInput) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base32 character: ${char}`);
    }

    value = (value << 5) | index;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }

  return new Uint8Array(output);
}

/**
 * Convert a number to an 8-byte big-endian buffer
 */
function intToBytes(num: number): Uint8Array {
  const buffer = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    buffer[i] = num & 0xff;
    num = Math.floor(num / 256);
  }
  return buffer;
}

/**
 * Generate HMAC-SHA1 hash
 */
async function hmacSha1(key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
  return new Uint8Array(signature);
}

/**
 * Generate a TOTP token for the given secret and time
 */
export async function generateTOTP(secret: string, timeStep: number = 30, digits: number = 6, time?: number): Promise<string> {
  const key = base32Decode(secret);
  const currentTime = time ?? Math.floor(Date.now() / 1000);
  const counter = Math.floor(currentTime / timeStep);
  const counterBytes = intToBytes(counter);

  const hmac = await hmacSha1(key, counterBytes);

  // Dynamic truncation
  const offset = hmac[hmac.length - 1] & 0x0f;
  const binary =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  const otp = binary % Math.pow(10, digits);
  return otp.toString().padStart(digits, '0');
}

/**
 * Verify a TOTP token
 * @param token The token to verify
 * @param secret The base32-encoded secret
 * @param window The number of time steps to check before and after current time (default: 1)
 * @param timeStep The time step in seconds (default: 30)
 * @returns true if the token is valid
 */
export async function verifyTOTP(
  token: string,
  secret: string,
  window: number = 1,
  timeStep: number = 30
): Promise<boolean> {
  const currentTime = Math.floor(Date.now() / 1000);

  // Check current time step and window around it
  for (let i = -window; i <= window; i++) {
    const checkTime = currentTime + (i * timeStep);
    const expectedToken = await generateTOTP(secret, timeStep, 6, checkTime);

    if (token === expectedToken) {
      return true;
    }
  }

  return false;
}

/**
 * Generate a new random secret (for testing/setup)
 */
export function generateSecret(length: number = 20): string {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);

  let secret = '';
  for (const byte of randomBytes) {
    secret += BASE32_ALPHABET[byte % 32];
  }

  return secret;
}
