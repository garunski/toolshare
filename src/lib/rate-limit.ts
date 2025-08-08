const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(
  identifier: string,
  options: { max?: number; window?: number } = {},
) {
  const { max = 100, window = 60000 } = options; // 1 minute default
  const now = Date.now();

  // Clean up expired entries
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  // Check current rate
  const current = rateLimitStore.get(identifier);
  if (!current || now > current.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + window });
    return { success: true, current: 1, max };
  }

  if (current.count >= max) {
    return { success: false, current: current.count, max };
  }

  current.count++;
  return { success: true, current: current.count, max };
}
