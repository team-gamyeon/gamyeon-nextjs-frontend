/**
 * Set-Cookie 헤더 배열을 파싱해 쿠키 이름 → expires Date 매핑을 반환합니다.
 * expires 속성이 없으면 max-age를 현재 시각 기준으로 변환합니다.
 */
export function parseSetCookieExpires(setCookieHeaders: string[]): Map<string, Date> {
  const map = new Map<string, Date>()
  for (const header of setCookieHeaders) {
    const parts = header.split(';').map((p) => p.trim())
    const nameValue = parts[0]
    const eqIdx = nameValue.indexOf('=')
    const name = nameValue.slice(0, eqIdx)

    for (const attr of parts.slice(1)) {
      const lower = attr.toLowerCase()
      if (lower.startsWith('expires=')) {
        const d = new Date(attr.slice('expires='.length))
        if (!isNaN(d.getTime())) map.set(name, d)
        break
      } else if (lower.startsWith('max-age=')) {
        const maxAge = parseInt(attr.slice('max-age='.length))
        if (!isNaN(maxAge)) map.set(name, new Date(Date.now() + maxAge * 1000))
        break
      }
    }
  }
  return map
}
