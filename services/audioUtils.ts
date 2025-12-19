/**
 * Downsamples a Float32Array using Linear Interpolation.
 * This ensures smooth audio without "metallic" artifacts.
 */
export function downsampleBuffer(
  buffer: Float32Array,
  sampleRate: number,
  outSampleRate: number
): Float32Array {
  if (outSampleRate === sampleRate) return buffer;
  if (outSampleRate > sampleRate) return buffer;

  const sampleRateRatio = sampleRate / outSampleRate;
  const newLength = Math.round(buffer.length / sampleRateRatio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const nextOffset = i * sampleRateRatio;
    const leftIndex = Math.floor(nextOffset);
    const rightIndex = Math.ceil(nextOffset);
    const ratio = nextOffset - leftIndex;

    const leftVal = buffer[leftIndex] || 0;
    const rightVal = buffer[rightIndex] || 0;

    // Interpolate
    result[i] = leftVal + ratio * (rightVal - leftVal);
  }

  return result;
}

/**
 * Converts Float32Array to Int16 Base64 string.
 * Optimized to prevent Main Thread blocking (no string += loop).
 */
export function convertFloat32ToInt16Base64(buffer: Float32Array): string {
  const l = buffer.length;
  const buf = new Int16Array(l);

  for (let i = 0; i < l; i++) {
    // Clamp and scale
    const s = Math.max(-1, Math.min(1, buffer[i]));
    buf[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }

  // Fast conversion using stack logic (safe for chunks < 32kb)
  const bytes = new Uint8Array(buf.buffer);
  const binary = String.fromCharCode.apply(null, bytes as unknown as number[]);
  return window.btoa(binary);
}
