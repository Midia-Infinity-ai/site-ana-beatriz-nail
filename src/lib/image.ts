/**
 * Client-side image downscale/compression. Keeps uploads and AI payloads small
 * so large phone photos don't hit body-size limits (which previously made
 * uploads fail silently). Returns a JPEG.
 */

function fileToDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

async function drawScaled(file: File, maxDim: number, quality: number): Promise<Blob | null> {
  const dataUrl = await fileToDataUrl(file)
  const img = await loadImage(dataUrl)
  let { width, height } = img
  const longest = Math.max(width, height)
  if (longest > maxDim) {
    const scale = maxDim / longest
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.drawImage(img, 0, 0, width, height)
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

/** Compress to a File (for admin uploads). Falls back to the original on error. */
export async function compressImageToFile(
  file: File,
  maxDim = 1920,
  quality = 0.85,
): Promise<File> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  try {
    const blob = await drawScaled(file, maxDim, quality)
    if (!blob || blob.size >= file.size) return file
    const name = file.name.replace(/\.[^.]+$/, '') || 'img'
    return new File([blob], `${name}.jpg`, { type: 'image/jpeg' })
  } catch {
    return file
  }
}

/** Compress to a data URL (for the AI try-on payloads). */
export async function compressImageToDataUrl(
  file: File,
  maxDim = 1280,
  quality = 0.85,
): Promise<string> {
  try {
    const blob = await drawScaled(file, maxDim, quality)
    if (!blob) return fileToDataUrl(file)
    return fileToDataUrl(blob)
  } catch {
    return fileToDataUrl(file)
  }
}
