import { redirect } from 'next/navigation'

export default function ReportPage() {
  // 유저가 /report 경로로 잘못 접근하면,
  // 정상적인 면접 목록 페이지인 /history로 강제 이동시킵니다.
  redirect('/history')
}
