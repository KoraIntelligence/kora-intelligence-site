import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type SessionMem = {
  sessionId: string;
  userName?: string;
  company?: string;
  role?: string;
  currentTask?: string;
  preferences?: string[];
  lastUpdated: number;
};

const ttlSeconds = 60 * 60 * 8; // 8 hours

export async function getSessionMem(sessionId: string): Promise<SessionMem | null> {
const raw = await redis.get(`sess:${sessionId}`);
return raw ? (JSON.parse(raw as string) as SessionMem) : null;
}

export async function updateSessionMem(sessionId: string, patch: Partial<SessionMem>) {
  const current = (await getSessionMem(sessionId)) || { sessionId, lastUpdated: Date.now() };
  const updated: SessionMem = {
    ...current,
    ...patch,
    lastUpdated: Date.now(),
  };
  await redis.set(`sess:${sessionId}`, JSON.stringify(updated), { ex: ttlSeconds });
  return updated;
}

export async function clearSessionMem(sessionId: string) {
  await redis.del(`sess:${sessionId}`);
}