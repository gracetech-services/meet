#!/usr/bin/env node

import { createHmac, randomBytes } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DEFAULT_TTL_SECONDS = 60 * 60;

loadDotEnv('.env.local');
loadDotEnv('.env');

const args = parseArgs(process.argv.slice(2));

if (args.help || args.positionals.length < 2) {
  printUsage(args.help ? 0 : 1);
}

const [roomName, participantName] = args.positionals;
const apiKey = process.env.LIVEKIT_API_KEY;
const apiSecret = process.env.LIVEKIT_API_SECRET;
const serverUrl = args.serverUrl ?? process.env.LIVEKIT_URL;
const ttlSeconds = Number(args.ttl ?? DEFAULT_TTL_SECONDS);

if (!apiKey) fail('LIVEKIT_API_KEY is required');
if (!apiSecret) fail('LIVEKIT_API_SECRET is required');
if (!serverUrl) fail('LIVEKIT_URL is required');
if (!Number.isFinite(ttlSeconds) || ttlSeconds <= 0) {
  fail('--ttl must be a positive number of seconds');
}

const identity = args.identity ?? `${participantName}__${randomString(4)}`;
const now = Math.floor(Date.now() / 1000);

const token = signJwt(
  {
    name: participantName,
    video: {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canPublishData: true,
      canSubscribe: true,
    },
    iss: apiKey,
    sub: identity,
    serverUrl,
    nbf: now,
    exp: now + ttlSeconds,
  },
  apiSecret,
);

process.stdout.write(`${token}\n`);

function signJwt(payload, secret) {
  const header = { alg: 'HS256' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac('sha256', secret).update(data).digest('base64url');
  return `${data}.${signature}`;
}

function parseArgs(values) {
  const parsed = {
    positionals: [],
    serverUrl: undefined,
    ttl: undefined,
    identity: undefined,
    help: false,
  };

  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--help' || value === '-h') {
      parsed.help = true;
    } else if (value === '--') {
      continue;
    } else if (value === '--server-url') {
      parsed.serverUrl = values[++index];
    } else if (value === '--ttl') {
      parsed.ttl = values[++index];
    } else if (value === '--identity') {
      parsed.identity = values[++index];
    } else if (value.startsWith('--')) {
      fail(`Unknown option: ${value}`);
    } else {
      parsed.positionals.push(value);
    }
  }

  return parsed;
}

function loadDotEnv(fileName) {
  const path = resolve(process.cwd(), fileName);
  if (!existsSync(path)) return;

  const content = readFileSync(path, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] ??= value;
  }
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url');
}

function randomString(length) {
  return randomBytes(length).toString('base64url').slice(0, length);
}

function printUsage(exitCode) {
  const output = exitCode === 0 ? process.stdout : process.stderr;
  output.write(`Usage: pnpm participant-token -- <room> <user> [options]

Options:
  --server-url <url>    Video server WebSocket URL. Defaults to LIVEKIT_URL.
  --identity <identity> Participant identity. Defaults to <user>__<random>.
  --ttl <seconds>       Token lifetime in seconds. Defaults to ${DEFAULT_TTL_SECONDS}.
`);
  process.exit(exitCode);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
