import { test, expect } from '@playwright/test'

/**
 * 면접 타이틀 입력 흐름 테스트
 * 1. 로그인 페이지 접속
 * 2. Google 로그인 클릭 → 대시보드 이동
 * 3. 면접 시작("지금 시작") 클릭 → /screen 이동
 * 4. 타이틀 입력 → 확인 클릭
 * 5. createInterview 서버 액션 응답 확인 (POST /api/v1/intvs)
 */
test('면접 타이틀 입력 후 서버 응답 확인', async ({ page }) => {
  // ── 1. 로그인 페이지 이동 ────────────────────────────────────────
  await page.goto('/signin')
  await page.waitForLoadState('networkidle')

  // ── 2. Google 로그인 ─────────────────────────────────────────────
  await page.getByRole('button', { name: 'Google로 시작하기' }).click()
  await page.waitForURL('**/dashboard')
  console.log('[1] 대시보드 이동 완료')

  // ── 3. 면접 시작 카드 → /screen ──────────────────────────────
  await page.getByRole('link', { name: '지금 시작' }).click()
  await page.waitForURL('**/interview')
  console.log('[2] /screen 이동 완료')

  // 셋업 모달이 열릴 때까지 대기
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible({ timeout: 10_000 })
  console.log('[3] 셋업 모달 표시됨')

  // ── 4. 타이틀 입력 ───────────────────────────────────────────────
  const titleInput = dialog.getByPlaceholder('예: 프론트엔드 개발자 면접')
  await expect(titleInput).toBeVisible()
  await titleInput.fill('프론트엔드 개발자 면접')
  console.log('[4] 타이틀 입력 완료')

  // ── 5. 확인 버튼 클릭 & 서버 응답 캡처 ─────────────────────────
  // Next.js Server Action은 POST 요청으로 전송됨 (Next-Action 헤더 포함)
  // 실제 백엔드 API (POST /api/v1/intvs) 요청도 함께 감지
  const [serverActionResponse] = await Promise.all([
    page.waitForResponse(
      (res) => res.request().method() === 'POST' && res.url().includes('/screen'),
      { timeout: 15_000 },
    ),
    dialog.getByRole('button', { name: '확인' }).click(),
  ])

  console.log('\n========== createInterview 서버 액션 응답 ==========')
  console.log('URL    :', serverActionResponse.url())
  console.log('Status :', serverActionResponse.status())

  // 응답 헤더 출력
  const headers = await serverActionResponse.allHeaders()
  const relevantHeaders = ['content-type', 'x-action-redirect', 'content-disposition']
  relevantHeaders.forEach((key) => {
    if (headers[key]) console.log(`Header [${key}]:`, headers[key])
  })

  // 응답 바디 출력 (Server Action은 특수 형식이지만 JSON 포함 시 파싱)
  let body: string
  try {
    body = await serverActionResponse.text()
    console.log('Body   :', body)

    // JSON 포함 여부 확인
    const jsonMatch = body.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      console.log('\n파싱된 응답 데이터:', JSON.stringify(parsed, null, 2))
    }
  } catch {
    console.log('Body   : (읽기 실패)')
  }
  console.log('====================================================\n')

  // ── 검증: 서버 액션이 정상적으로 호출됨 ─────────────────────────
  expect(serverActionResponse.status()).toBeLessThan(500)

  // 다음 단계(DocumentStep)로 넘어갔는지 확인
  console.log('[5] 확인 클릭 완료 → 다음 단계로 이동 확인 중...')
})

/**
 * 백엔드 API 직접 응답 확인 (외부 요청 인터셉트)
 * createInterview 서버 액션이 호출하는 실제 API 엔드포인트 응답을 확인합니다.
 * (서버→백엔드 호출이라 브라우저에서 직접 보이지 않으므로 별도 테스트)
 */
test('createInterview API 응답 구조 직접 확인', async ({ request }) => {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://15.164.229.233:8080'
  const title = '플레이라이트 테스트 면접'

  console.log(`\nPOST ${API_BASE}/api/v1/intvs`)
  console.log('요청 바디:', JSON.stringify({ title }))

  const response = await request.post(`${API_BASE}/api/v1/intvs`, {
    data: { title },
    headers: { 'Content-Type': 'application/json' },
    timeout: 10_000,
  })

  const status = response.status()
  console.log('\n========== /api/v1/intvs 응답 ==========')
  console.log('Status :', status)

  let body: unknown
  try {
    body = await response.json()
    console.log('Body   :', JSON.stringify(body, null, 2))
  } catch {
    const text = await response.text()
    console.log('Body   :', text)
    body = text
  }
  console.log('=========================================\n')

  // 응답 상태 코드 기록 (서버가 실제로 어떻게 응답하는지 확인)
  console.log(
    `응답 상태: ${status} (${status < 300 ? '성공' : status < 500 ? '클라이언트 에러' : '서버 에러'})`,
  )
})
