import type { FastifyInstance } from 'fastify'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'
import { rateLimit } from '../rateLimit.js'

type VisitInput = { path?: string; visitor?: string }

// The site's only real routes. Anything else (typically automated bots/
// scanners probing for generic admin/exploit paths) is silently dropped here
// so it never pollutes the "top pages" metrics, no matter how it was posted.
const KNOWN_PATHS = new Set(['/', '/politica-de-privacidade'])

export async function visitRoutes(app: FastifyInstance) {
  /** Public: record a page view (rate limited per IP to prevent flooding). */
  app.post('/visits', { preHandler: rateLimit({ windowMs: 60_000, max: 100 }) }, async (request, reply) => {
    const input = (request.body ?? {}) as VisitInput
    const path = (input.path ?? '/').slice(0, 300)
    if (!KNOWN_PATHS.has(path)) return reply.code(204).send()

    const now = new Date().toISOString()
    db.prepare(
      'INSERT INTO visits (path, visitor, day, created_at) VALUES (?, ?, ?, ?)',
    ).run(path, (input.visitor ?? '').slice(0, 80), now.slice(0, 10), now)
    return reply.code(204).send()
  })

  /** Admin: aggregated visit stats for a period. ?days=7 (0 = all time). */
  app.get('/visits/stats', { preHandler: requireAuth }, async (request) => {
    const q = request.query as { days?: string }
    const days = Math.max(0, Math.min(365, Number(q.days ?? 7)))

    // Lower bound (inclusive) as a YYYY-MM-DD string, or null for all time.
    let fromDay: string | null = null
    if (days > 0) {
      const d = new Date()
      d.setUTCDate(d.getUTCDate() - (days - 1))
      fromDay = d.toISOString().slice(0, 10)
    }
    const where = fromDay ? 'WHERE day >= ?' : ''
    const args = fromDay ? [fromDay] : []

    const totals = db
      .prepare(
        `SELECT COUNT(*) AS visits, COUNT(DISTINCT visitor) AS visitors FROM visits ${where}`,
      )
      .get(...args) as { visits: number; visitors: number }

    const series = db
      .prepare(
        `SELECT day, COUNT(*) AS visits, COUNT(DISTINCT visitor) AS visitors
         FROM visits ${where} GROUP BY day ORDER BY day ASC`,
      )
      .all(...args) as { day: string; visits: number; visitors: number }[]

    const topPaths = db
      .prepare(
        `SELECT path, COUNT(*) AS visits FROM visits ${where}
         GROUP BY path ORDER BY visits DESC LIMIT 8`,
      )
      .all(...args) as { path: string; visits: number }[]

    // Fill missing days with zeros so the chart is continuous.
    let filled = series
    if (fromDay) {
      const map = new Map(series.map((s) => [s.day, s]))
      filled = []
      const cursor = new Date(`${fromDay}T00:00:00Z`)
      const today = new Date()
      while (cursor.toISOString().slice(0, 10) <= today.toISOString().slice(0, 10)) {
        const key = cursor.toISOString().slice(0, 10)
        filled.push(map.get(key) ?? { day: key, visits: 0, visitors: 0 })
        cursor.setUTCDate(cursor.getUTCDate() + 1)
      }
    }

    return {
      days,
      totalVisits: totals.visits,
      uniqueVisitors: totals.visitors,
      series: filled,
      topPaths,
    }
  })
}
