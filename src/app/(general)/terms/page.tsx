import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="bg-muted/20 min-h-screen px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Link
            href="/signin"
            className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            돌아가기
          </Link>
        </div>

        <article className="space-y-8">
          <header className="space-y-2">
            <h1 className="text-3xl font-bold text-balance">이용약관</h1>
            <p className="text-muted-foreground text-sm">최종 수정일: 2026년 3월 10일</p>
          </header>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">제1조 목적</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              본 약관은 가면(이하 "회사")가 제공하는 서비스의 이용에 관한 조건 및 절차, 그리고
              회원의 권리와 의무를 규정함을 목적으로 합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">제2조 정의</h2>
            <ul className="text-muted-foreground space-y-1.5 text-sm leading-relaxed">
              <li>
                <span className="text-foreground font-medium">서비스:</span> 회사가 제공하는 모든
                서비스
              </li>
              <li>
                <span className="text-foreground font-medium">회원:</span> 본 약관을 동의하고
                서비스를 이용하는 개인
              </li>
              <li>
                <span className="text-foreground font-medium">콘텐츠:</span> 회원이 서비스에 업로드,
                게시하는 모든 정보
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">제3조 서비스 이용</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              회원은 본 약관을 동의함으로써 서비스를 이용할 권리를 갖습니다. 회사는 서비스의 질
              향상을 위해 서비스 내용을 변경할 수 있습니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">제4조 회원의 의무</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              회원은 다음 행위를 하지 않아야 합니다:
            </p>
            <ul className="text-muted-foreground list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              <li>타인의 정보 도용 또는 부정 사용</li>
              <li>회사의 시스템에 부정 접근</li>
              <li>욕설, 명예훼손, 개인정보 침해 등의 위법 행위</li>
              <li>스팸, 광고성 정보 게시</li>
              <li>저작권 등 지적재산권 침해</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">제5조 서비스 중단</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              회사는 다음의 사유로 서비스를 중단할 수 있습니다:
            </p>
            <ul className="text-muted-foreground list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              <li>서비스 점검 및 유지보수</li>
              <li>시스템 장애</li>
              <li>회원의 약관 위반</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">제6조 책임의 한계</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              회사는 다음에 대해 책임을 지지 않습니다:
            </p>
            <ul className="text-muted-foreground list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
              <li>외부 링크 사이트의 콘텐츠</li>
              <li>회원 간의 분쟁</li>
              <li>천재지변 또는 회사의 제어 범위 밖의 사유</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">제7조 약관 변경</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              회사는 필요시 약관을 변경할 수 있으며, 변경된 약관은 공지일로부터 효력을 발생합니다.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">제8조 준거법</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">
              본 약관은 대한민국 법률에 따라 해석되며, 분쟁은 대한민국 법원의 관할을 받습니다.
            </p>
          </section>

          <p className="text-muted-foreground border-t pt-6 text-sm">
            본 약관에 대한 문의사항이 있으신 경우, 고객지원팀에 연락주시기 바랍니다.
          </p>
        </article>
      </div>
    </div>
  )
}
