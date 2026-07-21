-- KEYS[1] = the Redis key for this tenant's bucket, e.g. "ratelimit:tenant:<id>"
-- ARGV[1] = capacity (max tokens)
-- ARGV[2] = refillRate (tokens per second)
-- ARGV[3] = current timestamp (ms, passed in from Node since Lua can't reliably get wall-clock time itself)

local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local bucket = redis.call("HMGET", key, "tokens", "lastRefill")
local tokens = tonumber(bucket[1])
local lastRefill = tonumber(bucket[2])

if tokens == nil then
  tokens = capacity
  lastRefill = now
end

local elapsedSeconds = (now - lastRefill) / 1000
local refillAmount = elapsedSeconds * refillRate
tokens = math.min(capacity, tokens + refillAmount)

local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end

redis.call("HSET", key, "tokens", tokens, "lastRefill", now)
redis.call("EXPIRE", key, 3600)

return allowed