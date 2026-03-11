# API 사용 가이드

## 핵심 규칙 — 딱 하나만 기억하세요

> **API를 직접 호출하는 코드가 어디서 실행되느냐에 따라 고르면 끝입니다.**

| API를 직접 호출하는 위치 | 뭘 써야 하나? |
|---|---|
| 클라이언트에서 직접 (이벤트 핸들러, 훅) | `clientApi` |
| 서버에서 실행되는 코드 (`'use server'` 파일, 서버 컴포넌트) | `serverApi` |

`'use client'` 컴포넌트에서 `useActionState`로 Server Action을 호출하는 경우,
**실제 API 호출은 서버(Server Action)에서 일어나므로 `serverApi`를 씁니다.**
클라이언트 파일 자체에서는 `serverApi`를 import하지 않습니다.

두 가지 모두 **에러가 나면 throw** 합니다. try/catch로 잡으세요.

---

## 파일 구조

```
src/shared/lib/api/
  types.ts      — 타입 정의 (ApiError, NetworkError 등)
  _utils.ts     — 내부 헬퍼 (직접 사용 X)
  client.ts     — 내부 fetch 래퍼 (직접 사용 X)
  api.ts        — clientApi 구현
  serverApi.ts  — serverApi 구현
  index.ts      — 공개 export
```

---

## clientApi — 클라이언트 컴포넌트에서 사용

`'use client'` 파일에서 버튼 클릭, 폼 제출 등 **사용자 이벤트 처리 시** 사용합니다.

```ts
'use client'

import { clientApi } from '@/shared/lib/api'

async function handleSubmit() {
  try {
    const data = await clientApi.post('/interviews', { title: '면접 제목' })
    // 성공 처리
  } catch (error) {
    // 에러 처리 (toast는 자동으로 뜸)
  }
}
```

### 에러 발생 시 toast가 자동으로 뜹니다

별도 처리 없이도 사용자에게 에러 메시지가 표시됩니다.
toast를 끄고 싶으면 `silent: true` 옵션을 사용하세요.

```ts
const data = await clientApi.get('/interviews', { silent: true })
```

### 쿼리 파라미터

```ts
// GET /interviews?page=1&size=10
const data = await clientApi.get('/interviews', {
  params: { page: 1, size: 10 },
})
```

### 에러 코드로 분기

```ts
import { clientApi } from '@/shared/lib/api'
import type { ApiError } from '@/shared/lib/api'

try {
  const data = await clientApi.post('/auth/login', { email, password })
} catch (err) {
  const error = err as ApiError
  if (error.code === 'USER-E001') setMessage('존재하지 않는 계정입니다.')
  if (error.status === 429) setMessage('잠시 후 다시 시도해주세요.')
}
```

---

## serverApi — 서버에서 사용

`'use server'` 파일이나 서버 컴포넌트(RSC)에서 사용합니다.
`next/headers`를 내부에서 사용하므로 클라이언트 파일에서 import 하면 빌드 에러가 납니다.

### 서버 컴포넌트 (RSC)

페이지 진입 시 데이터를 바로 가져와야 할 때 사용합니다.
에러가 나면 가장 가까운 `error.tsx`로 이동합니다.

```tsx
// app/dashboard/page.tsx (서버 컴포넌트 — 'use client' 없음)
import { serverApi } from '@/shared/lib/api'
import type { User } from '@/featured/auth/types'

export default async function DashboardPage() {
  const user = await serverApi.get<User>('/me')

  return <h1>{user.nickname}님 안녕하세요</h1>
}
```

### Server Action + useActionState — 폼 제출 권장 패턴

클라이언트 컴포넌트에서 폼을 제출할 때 가장 깔끔한 패턴입니다.
서버에서 API를 호출하고, 결과(성공/실패 메시지)를 클라이언트에 반환합니다.

```ts
// features/interview/actions.ts
'use server'

import { serverApi } from '@/shared/lib/api'
import type { Interview } from './types'

export async function createInterviewAction(
  prevState: { success: boolean; message: string } | null,
  formData: FormData,
) {
  const title = formData.get('title') as string

  try {
    const data = await serverApi.post<Interview>('/interviews', { title })
    return { success: true, message: '면접이 생성되었습니다.', data }
  } catch (error) {
    return { success: false, message: (error as Error).message }
  }
}
```

```tsx
// features/interview/components/CreateForm.tsx
'use client'

import { useActionState } from 'react'
import { createInterviewAction } from '../actions'  // serverApi는 여기서 import 안 함

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

### Server Action — ⚠️ 반드시 try/catch + return 사용

Server Action에서 에러를 throw하면 Next.js가 에러 내용을 클라이언트에 노출합니다.
**반드시 try/catch로 잡아서 return으로 내려줘야 합니다.**

```ts
// actions.ts
'use server'

import { serverApi } from '@/shared/lib/api'

export async function createInterviewAction(title: string) {
  try {
    const data = await serverApi.post('/interviews', { title })
    return { success: true as const, data }
  } catch (error) {
    // throw가 아닌 return — 클라이언트에 안전하게 전달
    return { success: false as const, message: (error as Error).message }
  }
}
```

클라이언트에서 호출:

```tsx
'use client'

async function handleClick() {
  const result = await createInterviewAction('내 면접')

  if (!result.success) {
    alert(result.message)
    return
  }
  // result.data 사용
}
```

---

## 401 처리 흐름 (clientApi 전용)

로그인이 만료되면 자동으로 처리합니다. 직접 신경 쓰지 않아도 됩니다.

```
요청 → 401 응답
  └── refresh 시도
        ├── 성공 → 토큰 갱신 → 원래 요청 재시도
        └── 실패 → /signin 으로 이동
```

- 동시에 여러 요청이 401을 받아도 refresh는 딱 1번만 실행됩니다.
- `serverApi`는 미들웨어가 인증을 처리하므로 refresh 로직이 없습니다.

---

## RequestConfig 옵션 정리

```ts
{
  silent?: boolean    // true이면 에러 toast를 띄우지 않음 (기본: false)
  params?: object     // URL 쿼리 파라미터 (?key=value 형태로 자동 변환)
  headers?: object    // 추가 헤더
  cache?: RequestCache           // fetch 캐시 전략
  next?: NextFetchRequestConfig  // Next.js ISR revalidate 등 (serverApi에서 유효)
}
```

---

## 에러 타입

```ts
error.status   // HTTP 상태코드 (400, 401, 403, 500 ...)
error.code     // 서버 에러 코드 ('USER-E001', 'CMMN-A001' ...)
error.message  // 에러 메시지 (toast에 자동 표시)
error.errors   // 필드별 에러 배열 [{ field, reason }] — 폼 검증 시 사용

// 네트워크 자체가 끊긴 경우
error.status   // 0
error.code     // 'NETWORK_ERROR'
```

---

## 자주 쓰는 패턴 모음

### 기본 GET / POST

```ts
// 데이터 가져오기
const interviews = await clientApi.get<Interview[]>('/interviews')

// 데이터 생성
const created = await clientApi.post<Interview>('/interviews', { title: '면접 제목' })

// 데이터 수정
const updated = await clientApi.patch<Interview>('/interviews/123', { title: '수정된 제목' })

// 데이터 삭제 (응답 데이터 없으면 제네릭 생략 가능)
await clientApi.delete('/interviews/123')
```

---

### 쿼리 파라미터 (params)

```ts
// GET /interviews?page=1&size=10&keyword=면접
const list = await clientApi.get<InterviewList>('/interviews', {
  params: { page: 1, size: 10, keyword: '면접' },
})

// 서버 컴포넌트에서도 동일
const list = await serverApi.get<InterviewList>('/interviews', {
  params: { page: 1, size: 10 },
})
```

---

### toast 끄기 (silent)

에러가 나도 toast를 띄우지 않고 직접 UI로 처리하고 싶을 때 사용합니다.

```ts
try {
  const data = await clientApi.get('/interviews', { silent: true })
} catch (error) {
  // toast 없이 직접 에러 메시지 표시
  setErrorMessage((error as ApiError).message)
}
```

---

### 에러 코드 / 상태코드로 분기

서버가 내려주는 코드에 따라 다른 메시지를 보여줄 때 사용합니다.

```ts
import type { ApiError } from '@/shared/lib/api'

try {
  await clientApi.post('/auth/login', { email, password })
} catch (err) {
  const error = err as ApiError

  // 서버 에러 코드로 분기
  if (error.code === 'USER-E001') {
    setMessage('존재하지 않는 계정입니다.')
    return
  }

  // HTTP 상태코드로 분기
  if (error.status === 429) {
    setMessage('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.')
    return
  }
}
```

---

### 폼 필드 에러 처리

서버가 필드별 유효성 에러를 내려줄 때 사용합니다.

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

### 여러 요청 동시에 (병렬 패칭)

순서가 상관없는 요청은 `Promise.all`로 묶어 속도를 높입니다.

```ts
// 서버 컴포넌트에서 두 API를 동시에 호출
const [user, interviews] = await Promise.all([
  serverApi.get<User>('/me'),
  serverApi.get<Interview[]>('/interviews/recent'),
])
```

---

### 파일 업로드 (FormData)

`FormData`를 그대로 넘기면 `Content-Type`이 자동으로 설정됩니다.

```ts
const formData = new FormData()
formData.append('file', file)
formData.append('title', '이력서')

const result = await clientApi.post('/resume/upload', formData)
```

---

### Next.js 캐싱 / ISR (serverApi 전용)

서버 컴포넌트에서 캐시 전략을 지정할 수 있습니다.

```ts
// 캐시 완전 비활성화 (항상 최신 데이터)
const data = await serverApi.get('/interviews', { cache: 'no-store' })

// 60초마다 자동 갱신 (ISR)
const data = await serverApi.get('/interviews', {
  next: { revalidate: 60 },
})

// 특정 태그로 캐시를 수동으로 무효화 가능하게 설정
const data = await serverApi.get('/interviews', {
  next: { tags: ['interviews'] },
})
```

---

### 요약 한눈에 보기

```ts
// ✅ 클라이언트 — 기본
try { const data = await clientApi.get<T>('/path') } catch {}

// ✅ 클라이언트 — 쿼리 파라미터
await clientApi.get('/path', { params: { page: 1 } })

// ✅ 클라이언트 — toast 끄기
await clientApi.get('/path', { silent: true })

// ✅ 서버 컴포넌트 — 그냥 await
const data = await serverApi.get<T>('/path')

// ✅ 서버 컴포넌트 — 병렬
const [a, b] = await Promise.all([serverApi.get('/a'), serverApi.get('/b')])

// ✅ Server Action — try/catch + return (throw 절대 금지)
try {
  const data = await serverApi.post('/path', body)
  return { success: true, data }
} catch (error) {
  return { success: false, message: (error as Error).message }
}
```
