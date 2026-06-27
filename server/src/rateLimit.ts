import type { FastifyReply, FastifyRequest } from 'fastify'

type Bucket = { count: number; reset: number }
const buckets = new Map<string, Bucket>()

// Bound memory: drop expired buckets every minute.
setInterval(() => {
  const now = Date.now()
  for (const [key, b] of buckets) if (now > b.reset) buckets.delete(key)
}, 60_000).unref()

/**
 * Lightweight in-memory rate limiter (per client IP + route). Good enough for a
 * single-container deploy to blunt spam and floods on public endpoints.
 * Relies on Fastify `trustProxy` so request.ip is the real client behind the
 * reverse proxy.
 */
export function rateLimit({ windowMs, max }: { windowMs: number; max: number }) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = request.ip || 'unknown'
    const key = `${request.url.split('?')[0]}:${ip}`
    const now = Date.now()
    const b = buckets.get(key)
    if (!b || now > b.reset) {
      buckets.set(key, { count: 1, reset: now + windowMs })
      return
    }
    b.count += 1
    if (b.count > max) {
      reply.header('Retry-After', Math.ceil((b.reset - now) / 1000))
      return reply.code(429).send({ error: 'rate_limited' })
    }
  }
}
