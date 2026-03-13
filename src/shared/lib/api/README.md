# API 사용 가이드

## 먼저 읽어야 할 핵심 개념

Next.js에서 API를 호출할 수 있는 위치는 두 곳입니다.

- **서버** — RSC, Server Action, Route Handler
- **클라이언트** — `'use client'` 컴포넌트의 이벤트 핸들러, useEffect 등

**이 프로젝트의 원칙: 기본은 서버에서 `serverApi`로 호출한다.**
클라이언트에서 직접 백엔드를 호출하는 것은 폴링처럼 불가피한 경우에만 허용한다.

---

## 어떤 방법을 써야 할지 모르겠다면

```
백엔드 API를 호출해야 한다
│
├─ 서버에서 실행되는 코드인가?
│   ├─ RSC (페이지, 레이아웃)          → serverApi 직접 사용
│   ├─ Server Action (폼 제출, 뮤테이션) → serverApi 사용
│   └─ Route Handler                  → serverApi 사용
│
└─ 클라이언트에서 실행되는 코드인가?
    ├─ 폼 제출 / 데이터 변경            → Server Action 만들어서 serverApi 사용
    ├─ 데이터 조회 (이벤트 기반)         → Route Handler(proxy) 만들어서 serverApi 사용
    ├─ 폴링 (setInterval 등 반복 요청)  → clientApi 직접 사용
    └─ S3 등 외부 서비스               → raw fetch 사용 (clientApi/serverApi 불가)
```

---

## 파일 구조

```
src/shared/lib/api/
  types.ts      — 타입 정의 (ApiError, NetworkError 등)
  _utils.ts     — 내부 헬퍼 (직접 사용 X)
  client.ts     — 내부 fetch 래퍼 (직접 사용 X)
  clientApi.ts        — clientApi 구현
  serverApi.ts  — serverApi 구현
  index.ts      — 공개 export
```

직접 import해서 쓰는 것은 `serverApi`, `clientApi`, `ApiError`뿐입니다.

---

## 1. serverApi — 기본 선택지

`next/headers`로 쿠키를 읽어 백엔드에 요청합니다.
클라이언트 파일에서 import하면 빌드 에러가 나므로 반드시 서버 파일에서만 사용합니다.

### RSC에서 데이터 패칭

페이지 진입 시 데이터를 서버에서 미리 가져올 때 사용합니다.
에러가 나면 가장 가까운 `error.tsx`로 이동합니다.

```tsx
// app/interviews/page.tsx
import { serverApi } from '@/shared/lib/api'

export default async function InterviewsPage() {
  const interviews = await serverApi.get<Interview[]>('/interviews')

  return (
    <ul>
      {interviews.map((interview) => (
        <li key={interview.id}>{interview.title}</li>
      ))}
    </ul>
  )
}
```

여러 API를 동시에 호출할 때는 `Promise.all`로 묶어 속도를 높입니다.

```tsx
const [user, interviews] = await Promise.all([
  serverApi.get<User>('/me'),
  serverApi.get<Interview[]>('/interviews'),
])
```

### Server Action — 폼 제출 / 데이터 변경

클라이언트에서 폼을 제출하거나 데이터를 변경할 때 사용합니다.
Server Action은 서버에서 실행되므로 `serverApi`를 사용합니다.

**⚠️ Server Action에서 에러를 throw하면 안 되는 이유**

throw하면 에러가 error boundary로 가버려서 `useActionState`로 핸들링할 수 없습니다.
`redirect()` 같이 내부적으로 throw하는 함수는 예외적으로 반드시 re-throw해야 합니다.

```ts
// features/screen/actions.ts
'use server'

import { serverApi } from '@/shared/lib/api'
import { isRedirectError } from 'next/dist/client/components/redirect-error'

export async function createInterviewAction(
  prevState: { success: boolean; message: string } | null,
  formData: FormData,
) {
  const title = formData.get('title') as string

  try {
    const data = await serverApi.post<Interview>('/interviews', { title })
    return { success: true as const, message: '면접이 생성되었습니다.', data }
  } catch (error) {
    if (isRedirectError(error)) throw error  // redirect는 반드시 re-throw
    return { success: false as const, message: (error as Error).message }
  }
}
```

클라이언트에서 `useActionState`로 호출합니다.
`serverApi`를 직접 import하지 않고, action 함수만 가져옵니다.

```tsx
// features/screen/components/CreateForm.tsx
'use client'

import { useActionState } from 'react'
import { createInterviewAction } from '../actions'

export function CreateForm() {
  const [state, action, isPending] = useActionState(createInterviewAction, null)

  return (
    <form action={action}>
      <input name="title" required />
      {state && !state.success && (
        <p className="text-destructive text-sm">{state.message}</p>
      )}
      <button type="submit" disabled={isPending}>
        {isPending ? '생성 중...' : '생성'}
      </button>
    </form>
  )
}
```

### Route Handler — 클라이언트에서 serverApi가 필요할 때 (proxy)

클라이언트 컴포넌트에서 `serverApi`를 직접 import할 수 없습니다.
이 경우 Route Handler를 proxy로 만들어 클라이언트가 그 Route Handler를 호출하게 합니다.

Route Handler 내부에서 `serverApi`를 쓰고, 백엔드에서 받은 에러 status를 그대로 클라이언트에 전달합니다.

```ts
// app/api/interviews/route.ts
import { serverApi } from '@/shared/lib/api'
import { isRedirectError } from 'next/dist/client/components/redirect-error'
import type { ApiError } from '@/shared/lib/api'

export async function GET() {
  try {
    const data = await serverApi.get<Interview[]>('/interviews')
    return Response.json({ success: true, data })
  } catch (error) {
    if (isRedirectError(error)) {
      // Route Handler에서 redirect는 의미 없으므로 401로 변환
      return Response.json({ success: false, message: '인증이 필요합니다.' }, { status: 401 })
    }
    return Response.json(
      { success: false, message: (error as Error).message },
      { status: (error as ApiError).status ?? 500 },
    )
  }
}
```

클라이언트에서 호출합니다.

```ts
// 클라이언트 컴포넌트에서
const res = await fetch('/api/interviews')
const { success, data, message } = await res.json()

if (!success) {
  console.error(message)
  return
}
// data 사용
```

---

## 2. clientApi — 폴링(반복 요청)에 사용

`setInterval` 등으로 주기적으로 요청을 보내는 경우, Server Action이나 Route Handler를 쓰면 불필요한 오버헤드가 생깁니다.
이 경우에만 클라이언트에서 `clientApi`로 백엔드에 직접 요청합니다.

```tsx
'use client'

import { useEffect, useState } from 'react'
import { clientApi } from '@/shared/lib/api'

export function InterviewStatus({ id }: { id: string }) {
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    const poll = async () => {
      try {
        const data = await clientApi.get<{ status: string }>(`/interviews/${id}/status`)
        setStatus(data?.status ?? null)
      } catch {
        // 에러 toast는 자동으로 표시됨
      }
    }

    poll()
    const timer = setInterval(poll, 3000)  // 3초마다 반복
    return () => clearInterval(timer)
  }, [id])

  return <span>{status}</span>
}
```

### clientApi 특징

| 기능 | 설명 |
|---|---|
| 에러 toast | 에러 발생 시 toast 자동 표시. 끄려면 `{ silent: true }` |
| 401 자동 처리 | refresh 시도 → 실패하면 `/signin`으로 이동 |
| base URL | `NEXT_PUBLIC_API_URL` 고정 (변경 불가) |

---

## 3. raw fetch — 외부 서비스(S3 등)

`clientApi`/`serverApi` 모두 `NEXT_PUBLIC_API_URL`을 base로 고정하므로 다른 서버에 요청할 수 없습니다.
S3 등 외부 서비스에 직접 요청할 때는 `fetch`를 그대로 사용합니다.

```ts
// presigned URL로 S3에 직접 업로드
await fetch(presignedUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type },
})
```

---

## 에러 처리

### 에러 타입

```ts
error.status   // HTTP 상태코드 (400, 401, 403, 500 ...)
error.code     // 서버 에러 코드 ('USER-E001', 'CMMN-A001' ...)
error.message  // 에러 메시지 (clientApi에서는 toast에 자동 표시)
error.errors   // 필드별 에러 배열 [{ field, reason }] — 폼 검증 시 사용

// 네트워크 자체가 끊긴 경우
error.status   // 0
error.code     // 'NETWORK_ERROR'
```

### 에러 코드로 분기

```ts
import type { ApiError } from '@/shared/lib/api'

try {
  await clientApi.post('/auth/login', { email, password })
} catch (err) {
  const error = err as ApiError

  if (error.code === 'USER-E001') {
    setMessage('존재하지 않는 계정입니다.')
    return
  }
  if (error.status === 429) {
    setMessage('잠시 후 다시 시도해주세요.')
    return
  }
}
```

### 폼 필드 에러 처리

```ts
try {
  await clientApi.post('/auth/signup', { email, password })
} catch (err) {
  const error = err as ApiError

  // error.errors = [{ field: 'email', reason: '이미 사용 중인 이메일입니다.' }, ...]
  error.errors?.forEach((e) => {
    if (e.field === 'email') setEmailError(e.reason)
    if (e.field === 'password') setPasswordError(e.reason)
  })
}
```

---

## RequestConfig 옵션

```ts
{
  silent?: boolean    // true이면 에러 toast를 띄우지 않음 (기본: false, clientApi에서만 유효)
  params?: object     // URL 쿼리 파라미터 → /path?key=value 형태로 자동 변환
  headers?: object    // 추가 헤더
  cache?: RequestCache           // fetch 캐시 전략
  next?: NextFetchRequestConfig  // Next.js ISR revalidate 등 (serverApi에서만 유효)
}
```

### 쿼리 파라미터

```ts
// GET /interviews?page=1&size=10
const list = await serverApi.get<InterviewList>('/interviews', {
  params: { page: 1, size: 10 },
})
```

### Next.js 캐싱 / ISR (serverApi 전용)

```ts
// 항상 최신 데이터 (캐시 비활성화)
const data = await serverApi.get('/interviews', { cache: 'no-store' })

// 60초마다 자동 갱신
const data = await serverApi.get('/interviews', { next: { revalidate: 60 } })

// 태그로 수동 캐시 무효화
const data = await serverApi.get('/interviews', { next: { tags: ['interviews'] } })
```

---

## 한눈에 보기

```ts
// ✅ RSC — 서버에서 직접 데이터 패칭
const data = await serverApi.get<T>('/path')

// ✅ Server Action — try/catch + return, throw 금지 (redirect는 예외)
try {
  const data = await serverApi.post('/path', body)
  return { success: true, data }
} catch (error) {
  if (isRedirectError(error)) throw error
  return { success: false, message: (error as Error).message }
}

// ✅ Route Handler proxy — 백엔드 status 그대로 전달
try {
  const data = await serverApi.get('/path')
  return Response.json({ success: true, data })
} catch (error) {
  if (isRedirectError(error)) return Response.json({ success: false }, { status: 401 })
  return Response.json({ success: false }, { status: (error as ApiError).status ?? 500 })
}

// ✅ 폴링 — clientApi 직접 사용
const data = await clientApi.get<T>('/path')

// ✅ 외부 서비스 — raw fetch
await fetch(externalUrl, { method: 'PUT', body: file })
```
