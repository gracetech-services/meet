import { describe, expect, it } from 'vitest';
import { parseJoinToken } from './join-token';

function encodeSegment(value: unknown): string {
  return Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
}

function createToken(payload: Record<string, unknown>, header: Record<string, unknown> = {}) {
  return `${encodeSegment({ typ: 'JWT', ...header })}.${encodeSegment(payload)}.signature`;
}

describe('parseJoinToken', () => {
  it('reads room and participant name from a LiveKit video grant token', () => {
    const token = createToken({ video: { room: 'team-sync' }, name: 'Alice' });

    expect(parseJoinToken(token)).toEqual({
      ok: true,
      roomName: 'team-sync',
      participantName: 'Alice',
    });
  });

  it('reads top-level room claims', () => {
    const token = createToken({ room: 'direct-room', name: 'Bob' });

    expect(parseJoinToken(token)).toEqual({
      ok: true,
      roomName: 'direct-room',
      participantName: 'Bob',
    });
  });

  it('reads server URL claims', () => {
    const token = createToken({
      room: 'direct-room',
      name: 'Bob',
      serverUrl: 'wss://example.livekit.cloud',
    });

    expect(parseJoinToken(token)).toEqual({
      ok: true,
      roomName: 'direct-room',
      participantName: 'Bob',
      serverUrl: 'wss://example.livekit.cloud',
    });
  });

  it('reads the query string JSON token shape', () => {
    const token = JSON.stringify({
      name: 'John Doe',
      video: {
        room: 'idigest-1234',
        roomJoin: true,
        canPublish: true,
        canPublishData: true,
        canSubscribe: true,
      },
      iss: 'APIkZdvVdMrbbUW',
      sub: 'idigest',
      serverUrl: 'wss://n1.fishmeet.top',
      userId: 1,
      iat: 1516239022,
      exp: Math.floor(Date.now() / 1000) + 3600,
    });

    expect(parseJoinToken(token)).toEqual({
      ok: true,
      roomName: 'idigest-1234',
      participantName: 'John Doe',
      serverUrl: 'wss://n1.fishmeet.top',
    });
  });

  it('rejects expired tokens', () => {
    const token = createToken({ video: { room: 'room' }, name: 'Alice', exp: 1 });

    expect(parseJoinToken(token)).toEqual({ ok: false, error: 'Token has expired' });
  });

  it('rejects malformed tokens', () => {
    expect(parseJoinToken('not-a-token')).toEqual({
      ok: false,
      error: 'Invalid JWT: expected three dot-separated segments',
    });
  });
});
