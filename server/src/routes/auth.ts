import type { FastifyInstance } from 'fastify'
import {
  AUTH_COOKIE,
  cookieOptions,
  currentUser,
  signToken,
  verifyCredentials,
} from '../auth.js'

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (request, reply) => {
    const { email, password } = (request.body ?? {}) as {
      email?: string
      password?: string
    }
    if (!email || !password || !verifyCredentials(email, password)) {
      return reply.code(401).send({ error: 'invalid_credentials' })
    }
    reply.setCookie(AUTH_COOKIE, signToken(), cookieOptions)
    return { email: email.toLowerCase() }
  })

  app.post('/auth/logout', async (_request, reply) => {
    reply.clearCookie(AUTH_COOKIE, { path: '/' })
    return { ok: true }
  })

  app.get('/auth/me', async (request, reply) => {
    const user = currentUser(request)
    if (!user) return reply.code(401).send({ error: 'unauthorized' })
    return user
  })
}
