import type { FastifyInstance } from 'fastify'
import { db } from '../db.js'
import { requireAuth } from '../auth.js'
import { rateLimit } from '../rateLimit.js'

type LeadInput = {
  name?: string
  email?: string
  phone?: string
  service?: string
  details?: string
}

type LeadRow = {
  id: number
  name: string
  email: string
  phone: string
  service: string
  details: string
  created_at: string
}

export async function leadRoutes(app: FastifyInstance) {
  /** Public: receive a form submission (rate limited against spam) */
  app.post('/leads', { preHandler: rateLimit({ windowMs: 60_000, max: 6 }) }, async (request, reply) => {
    const input = (request.body ?? {}) as LeadInput
    const now = new Date().toISOString()
    const result = db
      .prepare(
        `INSERT INTO leads (name, email, phone, service, details, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        (input.name ?? '').slice(0, 200),
        (input.email ?? '').slice(0, 200),
        (input.phone ?? '').slice(0, 60),
        (input.service ?? '').slice(0, 100),
        (input.details ?? '').slice(0, 2000),
        now,
      )
    return reply.code(201).send({ id: result.lastInsertRowid })
  })

  /** Admin: list all leads */
  app.get('/leads', { preHandler: requireAuth }, async () => {
    const rows = db
      .prepare('SELECT * FROM leads ORDER BY created_at DESC')
      .all() as LeadRow[]
    return rows
  })

  /** Admin: delete a lead */
  app.delete('/leads/:id', { preHandler: requireAuth }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const result = db.prepare('DELETE FROM leads WHERE id = ?').run(id)
    if (result.changes === 0) return reply.code(404).send({ error: 'not_found' })
    return { ok: true }
  })

  /** Admin: export leads as CSV */
  app.get('/leads/export', { preHandler: requireAuth }, async (_req, reply) => {
    const rows = db
      .prepare('SELECT * FROM leads ORDER BY created_at DESC')
      .all() as LeadRow[]

    const header = 'ID,Nome,E-mail,Telefone,Serviço,Detalhes,Data\n'
    const csv = rows
      .map((r) =>
        [
          r.id,
          `"${r.name.replace(/"/g, '""')}"`,
          `"${r.email.replace(/"/g, '""')}"`,
          `"${r.phone.replace(/"/g, '""')}"`,
          `"${r.service.replace(/"/g, '""')}"`,
          `"${r.details.replace(/"/g, '""')}"`,
          `"${r.created_at}"`,
        ].join(','),
      )
      .join('\n')

    reply
      .header('Content-Type', 'text/csv; charset=utf-8')
      .header('Content-Disposition', `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`)
      .send('﻿' + header + csv)
  })
}
