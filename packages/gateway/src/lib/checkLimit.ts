import { checkSlidingWindow } from "./sliding-window.js";
import { checkRateLimit } from "./rate-limit.js";

const RATE_LIMIT_STRATEGY = process.env.RATE_LIMIT_STRATEGY ?? "token-bucket";

export async function checkLimit(tenantId: string): Promise<boolean> {
  if (RATE_LIMIT_STRATEGY === "sliding-window") {
    return checkSlidingWindow(tenantId, 60000, 20);
  }
  return checkRateLimit(tenantId, 10, 1);
}