export const JWT_PATTERN = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function extractJwt(value: string): string | null {
  const bearer = value.match(/^Bearer\s+([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i);
  if (bearer) return bearer[1];
  if (JWT_PATTERN.test(value)) return value;
  return null;
}

export function findExpiredJwtsInHeaders(headers: Record<string, string>): string[] {
  const expired: string[] = [];
  for (const value of Object.values(headers)) {
    const token = extractJwt(value);
    if (!token) continue;
    const payload = decodeJwtPayload(token);
    if (payload && typeof payload['exp'] === 'number' && payload['exp'] * 1000 < Date.now()) {
      expired.push(token);
    }
  }
  return expired;
}
