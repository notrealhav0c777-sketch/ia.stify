import { Redis } from '@upstash/redis';
export const r = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});
export const who = async (req) => {
  const t = (req.headers.authorization || '').replace('Bearer ', '');
  return t ? await r.get('s:' + t) : null;
};
