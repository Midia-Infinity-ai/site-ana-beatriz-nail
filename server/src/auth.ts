import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { randomBytes } from 'node:crypto'
import type { FastifyReply, FastifyRequest } from 'fastify'

export const AUTH_COOKIE = 'aba_admin'
const TOKEN_TTL = '12h'

const OWNER_EMAIL = (process.env.OWNER_EMAIL ?? 'admin@anabeatriznail.com.br').toLowerCase()

// Password: prefer a pre-computed hash; otherwise hash a plaintext env value;
// otherwise fall back to a dev default (with a loud warning).
const OWNER_PASSWORD_HASH = (() => {
  if (process.env.OWNER_PASSWORD_HASH) return process.env.OWNER_PASSWORD_HASH
  if (process.env.OWNER_PASSWORD) return bcrypt.hashSync(process.env.OWNER_PASSWORD, 10)
  console.warn('[auth] OWNER_PASSWORD not set, using dev default "anabeatriz123"')
  return bcrypt.hashSync('anabeatriz123', 10)
})()

const JWT_SECRET =
  process.env.JWT_SECRET ??
  (() => {
    console.warn('[auth] JWT_SECRET not set, using an ephemeral secret (dev only)')
    return randomBytes(32).toString('hex')
  })()

export function verifyCredentials(email: string, password: string): boolean {
  if (email.trim().toLowerCase() !== OWNER_EMAIL) return false
  return bcrypt.compareSync(password, OWNER_PASSWORD_HASH)
}

export function signToken(): string {
  return jwt.sign({ sub: OWNER_EMAIL, role: 'owner' }, JWT_SECRET, { expiresIn: TOKEN_TTL })
}

export function currentUser(request: FastifyRequest): { email: string } | null {
  const token = request.cookies[AUTH_COOKIE]
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string }
    return { email: payload.sub }
  } catch {
    return null
  }
}

/** Fastify preHandler that rejects unauthenticated requests with 401. */
export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  if (!currentUser(request)) {
    return reply.code(401).send({ error: 'unauthorized' })
  }
}

// COOKIE_SECURE=true only when behind HTTPS (e.g. after adding a domain in EasyPanel).
// Default false so HTTP test deployments work out of the box.
export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.COOKIE_SECURE === 'true',
  path: '/',
  maxAge: 60 * 60 * 12,
}
