# API Fetcher 사용 가이드

## 파일 구조

```
src/shared/lib/api/
  types.ts      — ApiError, NetworkError, ApiResult, ApiResponse, RequestConfig
  _utils.ts     — buildUrl, parseBody, serializeBody, parseApiResponse (내부 헬퍼, 직접 사용 X)
  client.ts     — clientFetch (저수준 fetch 래퍼, 직접 사용 X)
  api.ts        — api (클라이언트 전용, throw 방식)
  safeApi.ts    — safeApi (클라이언트 전용, { data, error } 방식)
  serverApi.ts  — serverApi (서버 전용, { data, error } 방식)
  index.ts      — 공개 export
```

---

## 에러 처리 방식 한눈에 보기

| | throw 여부 | 에러 처리 |
|---|---|---|
| `api` | O (throw) | try/catch 필요 |
| `safeApi` | X | `{ data, error }` 체크 |
| `serverApi` | X | `{ data, error }` 체크 |

---

## 어디서 무엇을 쓰나

| 파일 위치 | 사용 가능한 API |
|---|---|
| Client Component (`'use client'`) | `api`, `safeApi` |
| Server Component (RSC, `'use client'` 없음) | `serverApi` |
| Server Action (`'use server'`) | `serverApi` |
| Route Handler (`route.ts`) | `serverApi` |
| Service 함수 (서버에서 호출) | `serverApi` |

> `serverApi`는 `next/headers`를 내부에서 사용하므로 클라이언트 컴포넌트에서 import 하면 빌드 에러 발생

---

## 언제 무엇을 쓰나 — 상황별 판단 기준

### `safeApi` vs `api` (클라이언트)

**`safeApi` 사용 — 아래 상황 대부분**
- 데이터를 불러와서 화면에 표시하는 경우 (목록 조회, 상세 조회)
- 에러가 나면 toast만 띄우고 조용히 실패해도 되는 경우
- try/catch를 빠뜨릴 위험을 없애고 싶을 때
- 훅(`useEffect`, `useCallback`) 내부에서 호출할 때

```
예: 면접 목록 불러오기, 대시보드 데이터 조회, 공지사항 목록 조회
```

**`api` 사용 — 에러 분기가 세밀하게 필요한 경우**
- 에러 코드(`error.code`)에 따라 다른 동작이 필요할 때
- 특정 에러는 toast 없이 UI로 직접 처리해야 할 때
- 에러 발생 시 다른 API를 추가로 호출해야 할 때

```
예: 로그인 (에러 코드별로 다른 안내 메시지), 결제 (에러 유형별 처리)
```

---

### `serverApi` — 어떤 패턴으로 호출하나

**RSC (서버 컴포넌트) — 페이지 진입 시 초기 데이터가 필요한 경우**
- URL로 직접 접근했을 때 데이터가 바로 보여야 하는 경우
- SEO가 필요한 데이터
- 로그인한 사용자 정보, 페이지 메인 컨텐츠

```
예: 대시보드 진입 시 사용자 정보 + 최근 면접 목록, 결과 페이지 상세 데이터
```

**Server Action + `useActionState` — `<form>` 기반 제출**
- 입력 폼 제출 (텍스트 입력, 선택 등)
- 서버 응답(에러 메시지, 성공 메시지)을 폼 UI에 바로 반영해야 할 때
- 제출 중 로딩 상태(`isPending`)가 필요할 때
- JS 없이도 동작해야 하는 경우 (progressive enhancement)

```
예: 면접 생성 폼, 프로필 수정 폼, 비밀번호 변경 폼
```

**Server Action 직접 호출 — 폼이 아닌 버튼/이벤트 기반 작업**
- 클릭 한 번으로 실행되는 단순 작업
- 입력 폼 없이 ID만 넘기면 되는 경우
- 확인 다이얼로그 후 실행하는 작업

```
예: 면접 삭제 버튼, 즐겨찾기 토글, 알림 읽음 처리
```

**Route Handler — Next.js 서버를 외부 API처럼 노출해야 하는 경우**
- 모바일 앱 등 외부 클라이언트가 Next.js를 통해 백엔드에 접근해야 할 때
- 외부 서비스(결제, 알림)의 웹훅 수신
- 클라이언트에서 직접 호출하기 어려운 API를 프록시할 때

```
예: /api/auth/refresh (토큰 갱신 프록시), 외부 웹훅 수신 엔드포인트
```

**Service 함수 — 동일한 API 호출 로직이 여러 곳에서 반복될 때**
- 여러 Server Action에서 같은 API를 호출하는 경우
- RSC와 Server Action 양쪽에서 공통으로 쓰는 데이터 조회
- 비즈니스 로직과 API 호출을 분리하고 싶을 때

```
예: getUserById() — 여러 페이지에서 공통으로 사용하는 사용자 조회
```

---

## 1. Client Component — `safeApi`

`'use client'` 훅, 이벤트 핸들러에서 사용. 절대 throw하지 않아 페이지가 터질 위험 없음.

```tsx
// src/featured/interview/hooks/useInterviews.ts
'use client'

import { useState, useEffect } from 'react'
import { safeApi } from '@/shared/lib/api'
import type { Interview } from '@/featured/interview/types'

export function useInterviews() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await safeApi.get<Interview[]>('/interviews')

      if (error) {
        // toast는 자동으로 띄워짐. 추가 처리가 필요하면 여기서.
        setIsLoading(false)
        return
      }

      setInterviews(data ?? [])
      setIsLoading(false)
    }
    load()
  }, [])

  return { interviews, isLoading }
}
```

### 쿼리 파라미터

```ts
const { data, error } = await safeApi.get<InterviewList>('/interviews', {
  params: { page: 1, size: 10 },
})
// → GET /interviews?page=1&size=10
```

### 필드 에러 처리 (폼 제출)

```ts
const { data, error } = await safeApi.post('/auth/signup', { email, password })

if (error) {
  // 서버가 내려준 필드별 에러 처리
  error.errors?.forEach((e) => {
    if (e.field === 'email') setEmailError(e.reason)
    if (e.field === 'password') setPasswordError(e.reason)
  })
  return
}
```

---

## 2. Client Component — `api` (try/catch)

에러 코드로 세밀하게 분기해야 할 때 사용.

```ts
// src/featured/auth/hooks/useSigninForm.ts
'use client'

import { api, ApiError } from '@/shared/lib/api'

export function useSigninForm() {
  async function handleSignin(email: string, password: string) {
    try {
      const data = await api.post<{ user: User }>('/auth/login', { email, password })
      router.push('/dashboard')
    } catch (error) {
      if (error instanceof ApiError) {
        // HTTP 상태코드로 분기
        if (error.status === 401) {
          setFormError('이메일 또는 비밀번호가 올바르지 않습니다.')
        }
        // 서버 에러 코드로 분기
        if (error.code === 'USER-E001') {
          setFormError('존재하지 않는 계정입니다.')
        }
      }
    }
  }
}
```

---

## 3. Server Component (RSC)

`'use client'` 없는 서버 컴포넌트에서 직접 데이터 패칭. toast 없음.
에러 시 `data`가 `null`이므로 빈 UI를 직접 렌더링.

```tsx
// src/app/(authenticated)/(sidebar)/dashboard/page.tsx
import { serverApi } from '@/shared/lib/api'
import type { User } from '@/featured/auth/types'
import type { Interview } from '@/featured/interview/types'

export default async function DashboardPage() {
  // 병렬 패칭으로 waterfall 방지
  const [{ data: user }, { data: interviews }] = await Promise.all([
    serverApi.get<User>('/me'),
    serverApi.get<Interview[]>('/interviews/recent'),
  ])

  return (
    <div>
      <h1>{user?.name ?? '사용자'}님 안녕하세요</h1>
      <InterviewList items={interviews ?? []} />
    </div>
  )
}
```

---

## 4. Server Action

`'use server'` 파일에서 정의. 클라이언트가 호출하는 서버 함수.
`serverApi`는 `{ data, error }` 반환이므로 try/catch 불필요.

### Action 정의

```ts
// src/featured/interview/actions.ts
'use server'

import { serverApi } from '@/shared/lib/api'
import type { Interview } from './types'

// useActionState용 — 첫 번째 인자가 prevState, 두 번째가 FormData
export async function createInterviewAction(
  prevState: { success: boolean; message: string } | null,
  formData: FormData,
) {
  const title = formData.get('title') as string

  const { data, error } = await serverApi.post<Interview>('/interviews', { title })

  if (error) {
    if (error.status === 409) {
      return { success: false, message: '이미 존재하는 면접입니다.' }
    }
    return { success: false, message: error.message }
  }

  return { success: true, message: '면접이 생성되었습니다.', data }
}

// 직접 호출용 — 버튼 클릭 등 비폼 이벤트
export async function deleteInterviewAction(id: string) {
  const { error } = await serverApi.delete(`/interviews/${id}`)

  if (error) return { success: false as const, message: error.message }
  return { success: true as const }
}
```

### 패턴 A — `useActionState` (폼 기반, 권장)

React 19의 `useActionState`로 form 제출. `isPending`으로 로딩 상태 자동 관리.

```tsx
// src/featured/interview/components/CreateInterviewForm.tsx
'use client'

import { useActionState } from 'react'
import { createInterviewAction } from '@/featured/interview/actions'

const initialState = null

export function CreateInterviewForm() {
  const [state, formAction, isPending] = useActionState(createInterviewAction, initialState)

  return (
    <form action={formAction}>
      <input name="title" placeholder="면접 제목" required />

      {/* 서버에서 내려온 에러 메시지 표시 */}
      {state && !state.success && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? '생성 중...' : '면접 생성'}
      </button>
    </form>
  )
}
```

### 패턴 B — 직접 호출 (버튼 클릭 등 비폼 이벤트)

```tsx
// src/featured/interview/components/DeleteInterviewButton.tsx
'use client'

import { useState } from 'react'
import { deleteInterviewAction } from '@/featured/interview/actions'

export function DeleteInterviewButton({ id }: { id: string }) {
  const [isPending, setIsPending] = useState(false)

  async function handleClick() {
    setIsPending(true)
    const result = await deleteInterviewAction(id)
    setIsPending(false)

    if (!result.success) {
      // result.message 활용
      return
    }
    // 삭제 성공 처리
  }

  return (
    <button onClick={handleClick} disabled={isPending}>
      {isPending ? '삭제 중...' : '삭제'}
    </button>
  )
}
```

---

## 5. Route Handler

`src/app/api/` 하위 `route.ts`. 외부 API를 Next.js를 경유해서 노출할 때 사용.
`serverApi`는 `{ data, error }` 반환이므로 try/catch 불필요.

```ts
// src/app/api/interviews/route.ts
import { serverApi } from '@/shared/lib/api'
import { NextResponse } from 'next/server'
import type { Interview } from '@/featured/interview/types'

export async function GET() {
  const { data, error } = await serverApi.get<Interview[]>('/interviews')

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status || 500 },
    )
  }

  return NextResponse.json({ success: true, data })
}

export async function POST(request: Request) {
  const body = await request.json()

  const { data, error } = await serverApi.post<Interview>('/interviews', body)

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: error.status || 500 },
    )
  }

  return NextResponse.json({ success: true, data }, { status: 201 })
}
```

---

## 6. Service 함수

여러 Server Action, Route Handler에서 공통으로 재사용하는 서버 로직.
`serverApi`는 `{ data, error }` 반환이므로 try/catch 불필요.

```ts
// src/featured/interview/services/interviewService.ts
import { serverApi } from '@/shared/lib/api'
import type { Interview, CreateInterviewDto } from '../types'

// 단순 조회 — 에러 시 null 반환
export async function getInterviewById(id: string) {
  const { data } = await serverApi.get<Interview>(`/interviews/${id}`)
  return data // null이면 호출 측에서 빈 UI 처리
}

// { data, error } 그대로 반환 — 호출 측에서 에러 처리
export async function createInterview(dto: CreateInterviewDto) {
  return serverApi.post<Interview>('/interviews', dto)
}

// 페이지네이션
export async function getInterviewList(page: number, size: number) {
  return serverApi.get<Interview[]>('/interviews', {
    params: { page, size },
  })
}
```

```ts
// Server Action에서 service 함수 사용
'use server'

import { createInterview } from '../services/interviewService'

export async function createInterviewAction(title: string) {
  const { data, error } = await createInterview({ title })

  if (error) return { success: false as const, message: error.message }
  return { success: true as const, data }
}
```

---

## RequestConfig 옵션

```ts
interface RequestConfig {
  silent?: boolean                              // true이면 에러 toast 비활성화 (기본: false)
  params?: Record<string, string | number | boolean> // URL 쿼리 파라미터
  headers?: Record<string, string>              // 추가 헤더
  cache?: RequestCache                          // fetch 캐시 전략
  next?: NextFetchRequestConfig                 // Next.js ISR revalidate 등
}

// 사용 예시
await safeApi.get('/interviews', {
  silent: true,                   // toast 비활성화
  params: { page: 1, size: 10 }, // ?page=1&size=10
  cache: 'no-store',             // 캐시 비활성화
  next: { revalidate: 60 },      // 60초마다 ISR 갱신 (serverApi에서 유효)
})
```

---

## 에러 타입

```ts
// 서버가 success: false로 응답한 경우
error.status   // HTTP 상태코드 (400, 403, 404, 500 ...)
error.code     // 서버 에러 코드 ('USER-E001', 'CMMN-A001' ...)
error.message  // 서버 에러 메시지 → toast에 자동으로 표시됨
error.errors   // 필드 에러 배열 [{ field: string, reason: string }] | undefined

// 네트워크 에러 (서버 응답 없음)
error.status   // 0
error.code     // 'NETWORK_ERROR'
error.message  // '네트워크 오류가 발생했습니다.'
```

---

## 401 처리 흐름 (`api`, `safeApi` 전용)

```
원래 요청 → 401
    ↓
1차 refresh (POST /api/auth/refresh)
    ├── 성공 → 토큰 갱신 → 원래 요청 재시도
    └── 실패 → 2차 refresh
                ├── 성공 → 토큰 갱신 → 원래 요청 재시도
                └── 실패 → /signin redirect
```

- 동시에 여러 요청이 401을 받아도 refresh는 1번만 실행 (lock 처리)
- `serverApi`는 미들웨어(proxy)가 인증을 선처리하므로 refresh 로직 없음

---

## FormData / 파일 업로드 (클라이언트 전용)

`api`, `safeApi`는 `FormData`, `Blob` 등을 자동 감지해 `Content-Type`을 건드리지 않음.
브라우저가 `multipart/form-data; boundary=...`를 자동으로 설정.

```ts
'use client'

const formData = new FormData()
formData.append('file', file)
formData.append('title', '이력서')

const { data, error } = await safeApi.post('/resume/upload', formData)
```
