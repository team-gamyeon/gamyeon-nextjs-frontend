import Link from 'next/link'
import { BrainCircuit } from 'lucide-react'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="border-border/50 bg-muted/30 border-t">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/Gamyeon_Logo.png"
                alt="Gamyeon logo"
                width={1024}
                height={768}
                style={{ height: '32px', width: 'auto' }}
              />
            </Link>
            <p className="text-muted-foreground text-sm">
              AI 기반 면접 시뮬레이터로
              <br />
              합격의 가능성을 높이세요.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">서비스</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-foreground">
                  AI 면접 연습
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  이력서 분석
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  피드백 리포트
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">고객지원</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-foreground">
                  자주 묻는 질문
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  이용가이드
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  문의하기
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">법적 고지</h4>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="#" className="hover:text-foreground">
                  이용약관
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-foreground">
                  개인정보 처리방침
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border/50 mt-10 border-t pt-6">
          <p className="text-muted-foreground text-center text-xs">
            &copy; 2026 Gamyeon. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
