import type { FastifyInstance } from 'fastify'
import { currentMonth, getAiUsage, incrementAiUsage } from '../db.js'
import { aiEnabled, generateNailTryOn, STYLE_IDS } from '../ai.js'
import { rateLimit } from '../rateLimit.js'

// Monthly cap protects against runaway image-generation costs.
const LIMIT = Number(process.env.AI_MONTHLY_LIMIT ?? 200)
const MAX_IMAGE_BYTES = 8 * 1024 * 1024

type GenerateBody = { image?: string; style?: string }

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
      const { image, style } = body

      if (!image || !image.startsWith('data:image/')) {
        return reply.code(400).send({ error: 'invalid_image' })
      }
      if (base64Bytes(image) > MAX_IMAGE_BYTES) {
        return reply.code(413).send({ error: 'image_too_large' })
      }
      if (!style || !STYLE_IDS.includes(style)) {
        return reply.code(400).send({ error: 'invalid_style' })
      }

      try {
        const base64 = await generateNailTryOn(image, style)
        if (!base64) throw new Error('ai_no_image')
        // Count only successful generations against the monthly quota.
        incrementAiUsage(month)
        return reply.send({ image: `data:image/png;base64,${base64}` })
      } catch (err) {
        request.log.error({ err }, 'nail try-on generation failed')
        const message = err instanceof Error ? err.message : 'ai_failed'
        return reply.code(502).send({ error: 'ai_failed', detail: message })
      }
    },
  )
}
