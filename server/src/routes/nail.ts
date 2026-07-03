import type { FastifyInstance } from 'fastify'
import {
  currentMonth,
  getAiUsage,
  incrementAiUsage,
  getNailUsage,
  incrementNailUsage,
} from '../db.js'
import { aiEnabled, generateNailTryOn, STYLE_IDS } from '../ai.js'
import { rateLimit } from '../rateLimit.js'

// Global monthly cap protects against runaway image-generation costs.
const LIMIT = Number(process.env.AI_MONTHLY_LIMIT ?? 200)
// Silent per-person cap so a single visitor cannot drain the credits.
const PERSON_LIMIT = Number(process.env.NAIL_PERSON_LIMIT ?? 3)
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

type GenerateBody = { image?: string; style?: string; reference?: string; visitor?: string }

/** Rough byte size of a base64 payload (without the data-URL prefix). */
function base64Bytes(dataUrl: string): number {
  const comma = dataUrl.indexOf(',')
  const b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
  return Math.floor((b64.length * 3) / 4)
}

export async function nailRoutes(app: FastifyInstance) {
  /** Public: is the try-on available, and how much quota is left this month. */
  app.get('/nail/status', async () => {
    const month = currentMonth()
    const used = getAiUsage(month)
    return { enabled: aiEnabled(), remaining: Math.max(0, LIMIT - used) }
  })

  /** Public: generate a nail-style preview from an uploaded hand photo. */
  app.post(
    '/nail/generate',
    { preHandler: rateLimit({ windowMs: 60_000, max: 8 }) },
    async (request, reply) => {
      if (!aiEnabled()) return reply.code(503).send({ error: 'ai_disabled' })

      const month = currentMonth()
      if (getAiUsage(month) >= LIMIT) {
        return reply.code(429).send({ error: 'ai_limit_reached' })
      }

      const body = (request.body ?? {}) as GenerateBody
      const { image, style, reference, visitor } = body

      // Silent per-person cap (keyed by the anonymous visitor id).
      const visitorId = (visitor ?? '').slice(0, 80) || request.ip
      if (getNailUsage(visitorId) >= PERSON_LIMIT) {
        return reply.code(429).send({ error: 'personal_limit' })
      }

      if (!image || !image.startsWith('data:image/')) {
        return reply.code(400).send({ error: 'invalid_image' })
      }
      if (base64Bytes(image) > MAX_IMAGE_BYTES) {
        return reply.code(413).send({ error: 'image_too_large' })
      }
      const hasReference = typeof reference === 'string' && reference.startsWith('data:image/')
      if (hasReference && base64Bytes(reference!) > MAX_IMAGE_BYTES) {
        return reply.code(413).send({ error: 'reference_too_large' })
      }
      // A style is only required when there's no reference: with one, the
      // reference alone defines the look and the style pill is hidden client-side.
      if (!hasReference && (!style || !STYLE_IDS.includes(style))) {
        return reply.code(400).send({ error: 'invalid_style' })
      }

      try {
        const base64 = await generateNailTryOn(
          image,
          style,
          hasReference ? reference : undefined,
        )
        if (!base64) throw new Error('ai_no_image')
        // Count only successful generations against both quotas.
        incrementAiUsage(month)
        incrementNailUsage(visitorId)
        return reply.send({ image: `data:image/png;base64,${base64}` })
      } catch (err) {
        request.log.error({ err }, 'nail try-on generation failed')
        const message = err instanceof Error ? err.message : 'ai_failed'
        return reply.code(502).send({ error: 'ai_failed', detail: message })
      }
    },
  )
}
