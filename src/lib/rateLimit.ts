type RateLimitConfig = {
  limit: number;
  windowMs: number;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

function getCurrentEntry(key: string, windowMs: number) {
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || entry.resetAt <= now) {
    const nextEntry = { count: 0, resetAt: now + windowMs };
    buckets.set(key, nextEntry);
    return nextEntry;
  }

  return entry;
}

function getRateLimitResult(entry: RateLimitEntry, limit: number): RateLimitResult {
  const now = Date.now();

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(limit - entry.count, 0),
    retryAfter: 0,
    resetAt: entry.resetAt,
  };
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const entry = getCurrentEntry(key, config.windowMs);
  return getRateLimitResult(entry, config.limit);
}

export function incrementRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const entry = getCurrentEntry(key, config.windowMs);
  entry.count += 1;

  return getRateLimitResult(entry, config.limit);
}

export function consumeRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const result = checkRateLimit(key, config);
  if (!result.allowed) return result;

  return incrementRateLimit(key, config);
}

export function clearRateLimit(key: string) {
  buckets.delete(key);
}

export function getClientIp(request: Request) {
  return getClientIpFromHeaders(request.headers);
}

export function getClientIpFromHeaders(headers?: Headers | Record<string, string | string[] | undefined>) {
  const forwardedFor = getHeaderValue(headers, "x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return getHeaderValue(headers, "x-real-ip") || "unknown";
}

function getHeaderValue(headers: Headers | Record<string, string | string[] | undefined> | undefined, name: string) {
  if (!headers) return null;

  if ("get" in headers && typeof headers.get === "function") {
    return headers.get(name);
  }

  const headerMap = headers as Record<string, string | string[] | undefined>;
  const value = headerMap[name] ?? headerMap[name.toLowerCase()];

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export function formatRetryAfter(seconds: number) {
  const safeSeconds = Math.max(seconds, 1);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  if (minutes <= 0) {
    return `${remainingSeconds} сек.`;
  }

  if (remainingSeconds === 0) {
    return `${minutes} мин.`;
  }

  return `${minutes} мин. ${remainingSeconds} сек.`;
}
