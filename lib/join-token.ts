export type ParsedJoinToken =
  | { ok: true; roomName: string; participantName: string; serverUrl?: string }
  | { ok: false; error: string };

function base64UrlDecode(input: string): string {
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function parseJsonSegment(segment: string): unknown {
  return JSON.parse(base64UrlDecode(segment));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function parseJoinToken(token: string): ParsedJoinToken {
  const trimmed = token.trim();
  if (!trimmed) return { ok: false, error: 'Token is required' };

  let payload: unknown;
  if (trimmed.startsWith('{')) {
    try {
      payload = JSON.parse(trimmed);
    } catch {
      return { ok: false, error: 'Invalid token: JSON payload could not be parsed' };
    }
  } else {
    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      return { ok: false, error: 'Invalid JWT: expected three dot-separated segments' };
    }

    let header: unknown;
    try {
      header = parseJsonSegment(parts[0]);
      payload = parseJsonSegment(parts[1]);
    } catch {
      return { ok: false, error: 'Invalid JWT: header or payload is not valid base64url JSON' };
    }

    if (!isRecord(header)) {
      return { ok: false, error: 'Invalid JWT: header is not a JSON object' };
    }

    if (typeof header.typ === 'string' && header.typ.toUpperCase() !== 'JWT') {
      return { ok: false, error: `Invalid JWT: unexpected "typ" header "${header.typ}"` };
    }
  }

  if (!isRecord(payload)) {
    return { ok: false, error: 'Invalid token: payload is not a JSON object' };
  }
  if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
    return { ok: false, error: 'Token has expired' };
  }

  const videoGrant = isRecord(payload.video) ? payload.video : undefined;
  const roomName = payload.room ?? videoGrant?.room;
  const participantName = payload.name;
  const serverUrl = payload.serverUrl ?? payload.liveKitUrl ?? payload.livekitUrl;
  if (typeof roomName !== 'string' || !roomName) {
    return { ok: false, error: 'Token is missing the "room" claim' };
  }
  if (typeof participantName !== 'string' || !participantName) {
    return { ok: false, error: 'Token is missing the "name" claim' };
  }
  if (serverUrl !== undefined && (typeof serverUrl !== 'string' || !serverUrl)) {
    return { ok: false, error: 'Token has an invalid "serverUrl" claim' };
  }

  return {
    ok: true,
    roomName,
    participantName,
    ...(serverUrl ? { serverUrl } : {}),
  };
}
