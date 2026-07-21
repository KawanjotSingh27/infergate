import { getRedis } from "./redis.js";
import fs from "node:fs";

const script = fs.readFileSync(new URL("./sliding-window.lua", import.meta.url), "utf-8");

export async function checkSlidingWindow(
  tenantId: string,
  windowMs: number,
  maxRequests: number
): Promise<boolean> {
  const redis = getRedis();
    const key = `slidingwindow:tenant:${tenantId}`;
    const now = Date.now();
  
    const result = await redis.eval(
      script,
      1,           // number of KEYS
      key,         // KEYS[1]
      windowMs,    // ARGV[1]
      maxRequests,  // ARGV[2]
      now          // ARGV[3]
    );
  
    return result === 1;
}