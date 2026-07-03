/**
 * OpenRouter client for the "Espelho do Futuro" virtual nail try-on.
 *
 * The visitor uploads a photo of their hand and either picks a style or
 * attaches a reference nail-design photo. A vision+image model (Gemini 2.5
 * Flash Image, "nano banana") simulates the finished manicure on that hand:
 * with a style, it repaints the existing nails; with a reference, it also
 * matches the reference's nail shape and length (extending short nails when
 * the reference shows extensions). The hand itself (skin, pose, background,
 * lighting) stays untouched and photorealistic.
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
  'molde-f1':
    'long, elegant gel extensions built on an "F1" mold: an elongated almond/stiletto silhouette with ' +
    'a slim, slightly curved tip, structured and resistant, with a flawless glossy natural finish',
  'cutilagem-russa':
    'a clean Russian manicure: an impeccably clean cuticle area with healthy, well-shaped natural nails ' +
    'and a long-lasting, natural-looking glossy polish',
  francesinha:
    'a modern french manicure (francesinha): crisp, precise white tips over a refined, natural sheer base',
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

type ContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string } }

/**
 * Generate a try-on preview. `imageDataUrl` is the visitor's hand photo (data
 * URL); `style` is one of STYLE_IDS; `referenceDataUrl` is an optional photo of
 * a desired nail design to replicate. Returns base64 PNG (no data-URL prefix).
 */
export async function generateNailTryOn(
  imageDataUrl: string,
  style: string | undefined,
  referenceDataUrl?: string,
): Promise<string> {
  // The style brief is only needed when there's no reference image: with a
  // reference, it alone defines the desired look (see the instruction below).
  let styleBrief = ''
  if (!referenceDataUrl) {
    const brief = STYLE_PROMPTS[style ?? '']
    if (!brief) throw new Error('invalid_style')
    styleBrief = brief
  }

  const baseRules =
    `Keep the hand itself exactly as in the FIRST photo: the same skin tone and texture, the ` +
    `same finger pose and count, the same background, the same lighting and shadows. ` +
    `The result must look like a 100% real photograph of THIS hand with a fresh manicure, ` +
    `not an illustration, 3D render or AI artwork. Photorealistic, natural shine on the nails, ` +
    `physically correct reflections and shadows. No text, no watermark, no logo. ` +
    `Return a single edited image preserving the original framing and aspect ratio.`

  const instruction = referenceDataUrl
    ? `You are given TWO images. The FIRST image is a photograph of a person's hand with her CURRENT ` +
      `nails (whatever their present length and shape). The SECOND image is a reference nail design ` +
      `that is the SINGLE SOURCE OF TRUTH for the desired result: treat it as a precise specification ` +
      `to replicate, not inspiration to loosely riff on. ` +
      `Simulate the finished manicure/nail service AS IF it had actually been performed on this ` +
      `person's hand, matching the SECOND image AS CLOSELY AS PHYSICALLY POSSIBLE in every visual ` +
      `aspect, including: ` +
      `(1) NAIL SHAPE - e.g. round, square, almond, coffin/ballerina, stiletto - copy the reference's ` +
      `shape exactly, even if it differs from the hand photo's current shape; ` +
      `(2) NAIL LENGTH - if the reference shows extended/long nails (acrylic or gel extensions) and the ` +
      `FIRST photo shows short/natural nails, you MUST extend the nails in the output to match the ` +
      `reference's length, as if an extension service was just done; do not keep them short. Likewise, ` +
      `if the reference shows short/natural nails, keep them short. The output nail length and shape ` +
      `must visually match the reference, NOT the original photo; ` +
      `(3) COLOR - exact colors and any gradients or color transitions; ` +
      `(4) PATTERN/MOTIF - the same design and exactly where it sits on the nail; ` +
      `(5) FINISH - the same glossy, matte, chrome or glitter finish; ` +
      `(6) EMBELLISHMENTS - the same rhinestones, foil, 3D charms, French line, ombre, etc. in the same ` +
      `positions; ` +
      `(7) PROPORTIONS - the same proportions of the nail art relative to the nail (how much of the tip ` +
      `is covered, line thickness, spacing between elements). ` +
      `Do not simplify, reinterpret, average it with a generic style, or invent your own variation: the ` +
      `goal is a faithful, near-identical copy of the reference design and shape/length, applied ` +
      `naturally to this specific hand (same finger count, same finger proportions and curvature, just ` +
      `with the new nail shape/length/art from the reference). Render the extended or reshaped nails ` +
      `with physically correct anatomy: natural-looking cuticles and nail beds, correct attachment to ` +
      `the finger, no floating or detached nails. ${baseRules}`
    : `Edit the provided photograph of a person's hand. Repaint ONLY the fingernails with ` +
      `${styleBrief}. Keep the nail shape and length as they are in the photo. ${baseRules}`

  const parts: ContentPart[] = [
    { type: 'text', text: instruction },
    { type: 'image_url', image_url: { url: imageDataUrl } },
  ]
  if (referenceDataUrl) {
    parts.push({ type: 'image_url', image_url: { url: referenceDataUrl } })
  }

  const data = await call(
    {
      model: IMAGE_MODEL,
      messages: [{ role: 'user', content: parts }],
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
