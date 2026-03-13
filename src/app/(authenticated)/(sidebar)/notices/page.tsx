import { NoticeHeader } from '@/featured/notice/components/NoticeHeader'
import { NoticeClient } from '@/featured/notice/components/NoticeClient'
import type { Notice } from '@/featured/notice/types' // 타입도 가져옵니다.

// [수정 1] 캡처 화면의 폴더 구조에 맞게 파일 이름(notice.action)까지 정확하게 적어줍니다.
import { getNoticesAction } from '@/featured/notice/actions/notice.action'

export default async function NoticePage() {
  // [수정 2] 만약 에러가 나더라도 화면이 터지지 않게, 기본값을 '빈 배열'로 미리 준비해 둡니다.
  let fetchedNotices: Notice[] = []

  // [수정 3] Action에서 던지는 에러(throw)를 막기 위해 try...catch 방패를 씌웁니다.
  try {
    const result = await getNoticesAction()

    // 통신이 성공하고 데이터가 있으면, 미리 준비한 변수에 진짜 데이터를 덮어씌웁니다.
    if (result.success && result.data) {
      fetchedNotices = result.data
    }
  } catch (error) {
    // 서버 통신에 실패해도, try...catch가 막아주었기 때문에 빈 배열([])이 그대로 유지됩니다.
    console.error('공지사항 전체 페이지 불러오기 실패:', error)
  }

  return (
    <>
      <NoticeHeader />
      {/* 정상일 때는 진짜 데이터가, 에러 났을 때는 빈 배열이 안전하게 들어갑니다. */}
      <NoticeClient initialNotices={fetchedNotices} />
    </>
  )
}
