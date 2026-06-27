import type { FastifyInstance } from 'fastify'
import { existsSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { basename, extname, join, resolve } from 'node:path'
import { requireAuth } from '../auth.js'
import { UPLOADS_DIR } from '../db.js'

const ALLOWED = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif', '.gif'])
const MAX_BYTES = 8 * 1024 * 1024

function safeName(original: string): string {
  const ext = extname(original).toLowerCase()
  const base = original
    .slice(0, original.length - ext.length)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48)
  return `${Date.now()}-${base || 'img'}${ext}`
}

type UploadBody = { filename?: string; data?: string }

export async function uploadRoutes(app: FastifyInstance) {
  // POST /api/uploads — body: { filename: string, data: base64 string }
  app.post('/uploads', { preHandler: requireAuth }, async (request, reply) => {
    const body = request.body as UploadBody
    if (!body?.filename || !body?.data) {
      return reply.code(400).send({ error: 'no_file' })
    }

    const ext = extname(body.filename).toLowerCase()
    if (!ALLOWED.has(ext)) {
      return reply.code(415).send({ error: 'unsupported_type' })
    }

    const buffer = Buffer.from(body.data, 'base64')
    if (buffer.length > MAX_BYTES) {
      return reply.code(413).send({ error: 'file_too_large' })
    }

    const name = safeName(body.filename)
    writeFileSync(join(UPLOADS_DIR, name), buffer)

    return reply.code(201).send({ url: `/uploads/${name}`, name })
  })

  app.get('/uploads', { preHandler: requireAuth }, async () => {
    if (!existsSync(UPLOADS_DIR)) return []
    return readdirSync(UPLOADS_DIR)
      .filter((f) => ALLOWED.has(extname(f).toLowerCase()))
      .map((f) => ({
        name: f,
        url: `/uploads/${f}`,
        mtime: statSync(join(UPLOADS_DIR, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime)
  })

  app.delete('/uploads/:name', { preHandler: requireAuth }, async (request, reply) => {
    const { name } = request.params as { name: string }
    // Strip any path component and sanitize, then verify the resolved path is
    // contained in UPLOADS_DIR (defense in depth against path traversal).
    const safe = basename(name).replace(/[^a-z0-9._-]/gi, '')
    if (!safe || !ALLOWED.has(extname(safe).toLowerCase())) {
      return reply.code(400).send({ error: 'invalid_name' })
    }
    const filePath = resolve(UPLOADS_DIR, safe)
    if (!filePath.startsWith(resolve(UPLOADS_DIR) + '/')) {
      return reply.code(400).send({ error: 'invalid_path' })
    }
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      return reply.code(404).send({ error: 'not_found' })
    }
    rmSync(filePath)
    return { ok: true }
  })
}
