import { getRedis } from "./redis.js";
import fs from "node:fs";

const script = fs.readFileSync(new URL("./rate-limit.lua", import.meta.url), "utf-8");

export async function checkRateLimit(
  tenantId: string,
  capacity: number,
  refillRate: number
): Promise<boolean> {
  const redis = getRedis();
  const key = `ratelimit:tenant:${tenantId}`;
  const now = Date.now();

  const result = await redis.eval(
    script,
    1,           // number of KEYS
    key,         // KEYS[1]
    capacity,    // ARGV[1]
    refillRate,  // ARGV[2]
    now          // ARGV[3]
  );

  return result === 1;
}