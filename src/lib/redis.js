import { URL } from "url";

export function getRedisConnection() {
  if (!process.env.UPSTASH_REDIS_URL) {
    throw new Error("UPSTASH_REDIS_URL is not defined");
  }

  const redisUrl = new URL(process.env.UPSTASH_REDIS_URL);

  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port),
    password: redisUrl.password,
    tls: {},
  };
}