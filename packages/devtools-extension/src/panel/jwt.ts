export function formatUnixTime(seconds: number): string {
  try {
    return new Date(seconds * 1000).toISOString().replace('T', ' ').replace('Z', ' UTC');
  } catch {
    return String(seconds);
  }
}

export function base64UrlDecode(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '=='.slice((b64.length + 3) & 3);
  return atob(padded);
}

export function parseJwt(jwt: string): {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signaturePreview: string;
} {
  const parts = jwt.split('.');
  if (parts.length !== 3) throw new Error('Not a 3-part JWT');

  const header = JSON.parse(base64UrlDecode(parts[0]!)) as Record<string, unknown>;
  const payload = JSON.parse(base64UrlDecode(parts[1]!)) as Record<string, unknown>;
  const signaturePreview = parts[2]!.slice(0, 16) + '…';

  return { header, payload, signaturePreview };
}
