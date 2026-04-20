/** 암호학적으로 안전한 무작위 code_verifier 생성 (43~128자) */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(
    Array.from(array)
      .map((b) => String.fromCharCode(b))
      .join(''),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

/** code_verifier를 SHA-256으로 해싱하여 code_challenge 생성 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(
    Array.from(new Uint8Array(digest))
      .map((b) => String.fromCharCode(b))
      .join(''),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}
