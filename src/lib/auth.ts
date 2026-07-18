// Web Crypto only — must run in both the Edge middleware and Node routes.
export const ADMIN_COOKIE = 'admin_session';
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7; // 7 days

const encoder = new TextEncoder();

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function fromHex(hex: string): Uint8Array<ArrayBuffer> | null {
  if (hex.length === 0 || hex.length % 2 !== 0 || /[^0-9a-f]/.test(hex)) {
    return null;
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

/** Token = "<expiresAtMs>.<hexHmac>"; the HMAC covers the expiry. */
export async function createSessionToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set.');
  const expires = Date.now() + SESSION_MAX_AGE_S * 1000;
  const key = await hmacKey(secret);
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`admin:${expires}`)
  );
  return `${expires}.${toHex(sig)}`;
}

export async function verifySessionToken(
  token: string | undefined | null
): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret || !token) return false;
  const dot = token.indexOf('.');
  if (dot < 1) return false;
  const expires = Number(token.slice(0, dot));
  if (!Number.isFinite(expires) || Date.now() > expires) return false;
  const sig = fromHex(token.slice(dot + 1));
  if (!sig) return false;
  const key = await hmacKey(secret);
  return crypto.subtle.verify(
    'HMAC',
    key,
    sig,
    encoder.encode(`admin:${expires}`)
  );
}
