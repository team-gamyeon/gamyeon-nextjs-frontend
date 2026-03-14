import { notFound } from 'next/navigation'
import { NoticeHeader } from '@/featured/notice/components/NoticeHeader'
import { NoticeDetail } from '@/featured/notice/components/NoticeDetail'
import { getNoticeDetailAction, getNoticesAction } from '@/featured/notice/actions/notice.action'

interface NoticeDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  const { id } = await params
  const noticeId = Number(id)

  const detailResult = await getNoticeDetailAction(noticeId)

  if (!detailResult.success || !detailResult.data) {
    return notFound() 
  }

  const notice = detailResult.data

  const listResult = await getNoticesAction()
  let prevNotice = null
  let nextNotice = null

  if (listResult.success && listResult.data) {
    const idx = listResult.data.findIndex((n) => n.id === noticeId)

    if (idx !== -1) {
      prevNotice = idx > 0 ? listResult.data[idx - 1] : null
      nextNotice = idx < listResult.data.length - 1 ? listResult.data[idx + 1] : null
    }
  }

  return (
    <>
      <NoticeHeader />
      <NoticeDetail notice={notice} prevNotice={prevNotice} nextNotice={nextNotice} />
    </>
  )
}
