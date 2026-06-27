/**
 * OpenRouter client for the "Espelho do Futuro" virtual nail try-on.
 *
 * The visitor uploads a photo of their hand; a vision+image model (Gemini 2.5
 * Flash Image, "nano banana") repaints ONLY the nails in the chosen style while
 * keeping the real hand, skin, pose and lighting untouched and photorealistic.
 *
 * The API key lives only on the server and is never exposed to the browser.
 */

const OPENROUTER_URL =
  process.env.OPENROUTER_BASE_URL ?? 'https://openrouter.ai/api/v1/chat/completions'
const API_KEY = process.env.OPENROUTER_API_KEY ?? ''
const IMAGE_MODEL = process.env.OPENROUTER_IMAGE_MODEL ?? 'google/gemini-2.5-flash-image'
const IMAGE_TIMEOUT_MS = Number(process.env.AI_IMAGE_TIMEOUT_MS ?? 90000)

export const aiEnabled = (): boolean => API_KEY.length > 0

/** Style id -> art-direction brief (kept server-side so it cannot be tampered). */
const STYLE_PROMPTS: Record<string, string> = {
  'classico-real':
    'a clean, glossy "clean girl" manicure in a natural rosy-nude tone, subtle shine, impeccably shaped',
  'ouro-majestoso':
    'a couture design with antique-gold foil accents over a deep burgundy base, ornamental and luxurious',
  minimalismo:
    'a modern minimalist look: soft neutral base with one delicate fine-line detail, understated and elegant',
  'nail-art':
    'intricate hand-painted artistic nail art, unique and editorial, refined brushwork',
  francesinha:
    'a modern french manicure with crisp, precise tips and a refined natural base',
  'vermelho-couture':
    'deep crimson-red high-gloss nails, timeless couture, rich and glossy',
}

export const STYLE_IDS = Object.keys(STYLE_PROMPTS)

async function call(body: Record<string, unknown>, timeoutMs: number): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.PUBLIC_URL ?? 'https://www.anabeatriznail.com.br',
        'X-Title': 'Ana Beatriz Nail Try-On',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`openrouter_${res.status}: ${text.slice(0, 300)}`)
    }
    return res.json()
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`openrouter_timeout_${timeoutMs}ms`)
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Generate a try-on preview. `imageDataUrl` is the visitor's photo as a data
 * URL; `style` is one of STYLE_IDS. Returns base64 PNG data (no data-URL prefix).
 */
export async function generateNailTryOn(
  imageDataUrl: string,
  style: string,
): Promise<string> {
  const styleBrief = STYLE_PROMPTS[style]
  if (!styleBrief) throw new Error('invalid_style')

  const instruction =
    `Edit the provided photograph of a person's hand. Repaint ONLY the fingernails with ` +
    `${styleBrief}. ` +
    `Keep EVERYTHING else exactly as in the original photo: the same hand, the same skin tone ` +
    `and texture, the same finger pose and proportions, the same background, the same lighting ` +
    `and shadows. Do not change the number of fingers or the hand shape. ` +
    `The result must look like a 100% real photograph of THIS hand with a fresh manicure, ` +
    `not an illustration, 3D render or AI artwork. Photorealistic, natural shine on the nails, ` +
    `physically correct reflections and shadows. No text, no watermark, no logo. ` +
    `Return a single edited image preserving the original framing and aspect ratio.`

  const data = await call(
    {
      model: IMAGE_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: instruction },
            { type: 'image_url', image_url: { url: imageDataUrl } },
          ],
        },
      ],
      modalities: ['image', 'text'],
    },
    IMAGE_TIMEOUT_MS,
  )

  // Image models return the result in different shapes: a data URL, a raw
  // base64 string, or a hosted http(s) URL. Handle all of them.
  const msg = data?.choices?.[0]?.message
  const url: string | undefined =
    msg?.images?.[0]?.image_url?.url ??
    msg?.images?.[0]?.url ??
    (typeof msg?.content === 'string' && msg.content.startsWith('data:image')
      ? msg.content
      : undefined)
  if (!url) throw new Error('ai_no_image')

  if (url.startsWith('data:')) {
    return url.split(',')[1] ?? ''
  }
  if (url.startsWith('http')) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), IMAGE_TIMEOUT_MS)
    try {
      const imgRes = await fetch(url, { signal: controller.signal })
      if (!imgRes.ok) throw new Error(`image_fetch_${imgRes.status}`)
      return Buffer.from(await imgRes.arrayBuffer()).toString('base64')
    } finally {
      clearTimeout(timer)
    }
  }
  return url
}
