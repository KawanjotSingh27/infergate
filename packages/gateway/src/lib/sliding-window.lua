-- KEYS[1] = the Redis key for this tenant's request log, e.g. "slidingwindow:tenant:<id>"
-- ARGV[1] = window size in milliseconds
-- ARGV[2] = max requests allowed per window
-- ARGV[3] = current timestamp (ms)

local key = KEYS[1]
local windowMs = tonumber(ARGV[1])
local maxRequests = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local windowStart = now - windowMs

-- Drop any timestamps older than the current window
redis.call("ZREMRANGEBYSCORE", key, 0, windowStart)

-- Count how many requests are still within the window
local count = redis.call("ZCARD", key)

local allowed = 0
if count < maxRequests then
  redis.call("ZADD", key, now, now)
  allowed = 1
end

redis.call("PEXPIRE", key, windowMs)

return allowed