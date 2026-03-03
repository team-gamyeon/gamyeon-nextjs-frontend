export type UploadState = 'idle' | 'dragging' | 'uploading' | 'processing' | 'done'

export interface ParsedData {
  name: string
  email: string
  skills: string[]
  experience: string[]
}

export const MOCK_PARSED: ParsedData = {
  name: '홍길동',
  email: 'hong@example.com',
  skills: ['React', 'TypeScript', 'Node.js', 'Python', 'SQL'],
  experience: [
    'ABC 테크 - 프론트엔드 개발자 (2023.03 ~ 현재)',
    'XYZ 스타트업 - 풀스택 인턴 (2022.06 ~ 2022.12)',
  ],
}
