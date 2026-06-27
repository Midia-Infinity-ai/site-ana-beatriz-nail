import Fastify from 'fastify'
import cookie from '@fastify/cookie'
import fastifyStatic from '@fastify/static'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { UPLOADS_DIR } from './db.js'
import { seedDatabase } from './seed.js'
import { authRoutes } from './routes/auth.js'
import { siteContentRoutes } from './routes/siteContent.js'
import { uploadRoutes } from './routes/uploads.js'
import { nailRoutes } from './routes/nail.js'
import { leadRoutes } from './routes/leads.js'
import { visitRoutes } from './routes/visits.js'

const PORT = Number(process.env.PORT ?? 3000)
const HOST = process.env.HOST ?? '0.0.0.0'
// Built frontend (production). In dev this folder does not exist; Vite serves the app.
const PUBLIC_DIR = resolve(process.env.PUBLIC_DIR ?? './public')

async function main() {
  seedDatabase()

  // bodyLimit: 12 MB to accommodate base64-encoded 8 MB images (~33 % overhead).
  // trustProxy: behind EasyPanel/Traefik so request.ip is the real client.
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL ?? 'info' },
    bodyLimit: 12 * 1024 * 1024,
    trustProxy: true,
  })

  // Baseline security headers on every response.
  app.addHook('onSend', async (_request, reply) => {
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-Frame-Options', 'SAMEORIGIN')
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
    reply.header('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    if (process.env.COOKIE_SECURE === 'true') {
      reply.header('Strict-Transport-Security', 'max-age=15552000; includeSubDomains')
    }
  })

  await app.register(cookie)

  // API
  await app.register(
    async (api) => {
      api.get('/health', async () => ({ ok: true, uptime: process.uptime() }))
      await api.register(authRoutes)
      await api.register(siteContentRoutes)
      await api.register(uploadRoutes)
      await api.register(nailRoutes)
      await api.register(leadRoutes)
      await api.register(visitRoutes)
    },
    { prefix: '/api' },
  )

  // Uploaded media (always available, including dev for admin previews).
  await app.register(fastifyStatic, {
    root: UPLOADS_DIR,
    prefix: '/uploads/',
    decorateReply: false,
  })

  // Production: serve the built SPA with history fallback.
  if (existsSync(PUBLIC_DIR)) {
    await app.register(fastifyStatic, {
      root: PUBLIC_DIR,
      prefix: '/',
    })
    app.setNotFoundHandler((request, reply) => {
      if (request.method === 'GET' && !request.url.startsWith('/api')) {
        return reply.sendFile('index.html')
      }
      return reply.code(404).send({ error: 'not_found' })
    })
  }

  await app.listen({ port: PORT, host: HOST })
  app.log.info(`Ana Beatriz server on :${PORT} (public dir: ${existsSync(PUBLIC_DIR) ? PUBLIC_DIR : 'none/dev'})`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
