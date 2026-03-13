// app/notices/[id]/page.tsx
import { notFound } from 'next/navigation'
import { NoticeHeader } from '@/featured/notice/components/NoticeHeader'
import { NoticeDetail } from '@/featured/notice/components/NoticeDetail'

// 1. 가짜 데이터 대신 진짜 데이터를 가져올 Action 함수들을 불러옵니다.
import { getNoticeDetailAction, getNoticesAction } from '@/featured/notice/actions/notice.action'

interface NoticeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  // 2. 주소창(URL)에 있는 id 값을 꺼내서 숫자로 바꿉니다. (예: /notices/1 -> 1)
  const { id } = await params
  const noticeId = Number(id)

  // 3. 진짜 상세 데이터를 서버에 요청합니다.
  const detailResult = await getNoticeDetailAction(noticeId)

  // 4. 만약 통신이 실패했거나, 해당 id의 공지사항이 없으면 404 페이지로 보냅니다.
  if (!detailResult.success || !detailResult.data) {
    notFound()
  }

  const notice = detailResult.data

  // 5. '이전 글 / 다음 글'을 찾기 위해 전체 목록 데이터를 살짝 가져옵니다.
  const listResult = await getNoticesAction()
  let prevNotice = null
  let nextNotice = null

  if (listResult.success && listResult.data) {
    // 여기서 n 에러가 해결됩니다! listResult.data가 Notice[] 라는 것을 컴퓨터가 이미 알고 있습니다.
    const idx = listResult.data.findIndex((n) => n.id === noticeId)

    if (idx !== -1) {
      // 내 위치(idx)를 기준으로 앞(idx - 1)과 뒤(idx + 1)의 글을 찾습니다.
      prevNotice = idx > 0 ? listResult.data[idx - 1] : null
      nextNotice = idx < listResult.data.length - 1 ? listResult.data[idx + 1] : null
    }
  }

  return (
    <>
      <NoticeHeader />
      {/* 6. 찾아낸 진짜 데이터들을 컴포넌트에 쏙 넣어줍니다. */}
      <NoticeDetail notice={notice} prevNotice={prevNotice} nextNotice={nextNotice} />
    </>
  )
}
