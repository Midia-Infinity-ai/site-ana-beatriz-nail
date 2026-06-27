import type { FastifyInstance } from 'fastify'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'

type ContentRow = { key: string; value: string }

export async function siteContentRoutes(app: FastifyInstance) {
  app.get('/site-content', async () => {
    const rows = db.prepare('SELECT key, value FROM site_content').all() as ContentRow[]
    const out: Record<string, unknown> = {}
    for (const row of rows) {
      try {
        out[row.key] = JSON.parse(row.value)
      } catch {
        out[row.key] = row.value
      }
    }
    return out
  })

  app.put('/site-content/:key', { preHandler: requireAuth }, async (request) => {
    const { key } = request.params as { key: string }
    const value = JSON.stringify((request.body as { value: unknown })?.value ?? request.body)
    db.prepare(
      `INSERT INTO site_content (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    ).run(key, value)
    return { key, value: JSON.parse(value) }
  })
}
