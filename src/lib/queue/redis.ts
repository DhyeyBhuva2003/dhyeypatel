import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

declare global {
  // eslint-disable-next-line no-var
  var redisConnection: Redis | undefined;
}

export function getRedisConnection(): Redis {
  if (!global.redisConnection) {
    global.redisConnection = new Redis(REDIS_URL, {
      maxRetriesPerRequest: null, // Required by BullMQ
    });
  }
  return global.redisConnection;
}

export default getRedisConnection;
