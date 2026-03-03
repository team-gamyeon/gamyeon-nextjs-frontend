'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  File,
} from 'lucide-react'
import { useFileUpload } from '@/featured/upload/hooks/useFileUpload'

export function FileUploadZone() {
  const {
    state,
    progress,
    fileName,
    fileSize,
    parsed,
    handleDrop,
    handleFileInput,
    reset,
    setDragging,
  } = useFileUpload()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-border/50 shadow-primary/5 shadow-lg">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {/* 업로드 존 */}
            {(state === 'idle' || state === 'dragging') && (
              <motion.div
                key="upload-zone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 transition-all ${
                    state === 'dragging'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <div
                    className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl transition-colors ${
                      state === 'dragging' ? 'bg-primary/10' : 'bg-muted'
                    }`}
                  >
                    <Upload
                      className={`h-7 w-7 transition-colors ${
                        state === 'dragging' ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  </div>
                  <p className="mb-1 text-base font-medium">
                    이력서 파일을 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-muted-foreground mb-4 text-sm">
                    PDF, DOCX, HWP 파일 지원 (최대 10MB)
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      파일 선택
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.docx,.hwp"
                        onChange={handleFileInput}
                      />
                    </label>
                  </Button>
                </div>

                <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-sm text-blue-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>
                    업로드된 파일은 면접 질문 생성에만 사용되며, 면접 종료 후 안전하게 삭제됩니다.
                  </p>
                </div>
              </motion.div>
            )}

            {/* 업로드 중 */}
            {state === 'uploading' && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-8"
              >
                <div className="bg-muted/50 mb-6 flex items-center gap-3 rounded-xl px-4 py-3">
                  <FileText className="text-primary h-5 w-5" />
                  <div className="text-left">
                    <p className="text-sm font-medium">{fileName}</p>
                    <p className="text-muted-foreground text-xs">{fileSize}</p>
                  </div>
                  <button
                    onClick={reset}
                    className="text-muted-foreground hover:text-foreground ml-4"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="w-full max-w-sm space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">업로드 중...</span>
                    <span className="font-medium">{Math.min(100, Math.round(progress))}%</span>
                  </div>
                  <Progress value={Math.min(100, progress)} className="h-2" />
                </div>
              </motion.div>
            )}

            {/* 처리 중 */}
            {state === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-12"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                >
                  <Loader2 className="text-primary h-10 w-10" />
                </motion.div>
                <p className="mt-4 text-base font-medium">AI가 이력서를 분석하고 있습니다...</p>
                <p className="text-muted-foreground mt-1 text-sm">잠시만 기다려주세요</p>
              </motion.div>
            )}

            {/* 완료 */}
            {state === 'done' && parsed && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3 rounded-xl bg-green-50 p-4">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      이력서 분석이 완료되었습니다
                    </p>
                    <p className="text-xs text-green-600">
                      {fileName} ({fileSize})
                    </p>
                  </div>
                  <button onClick={reset} className="ml-auto text-green-600 hover:text-green-800">
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <Card className="border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      <File className="text-primary h-4 w-4" />
                      <h3 className="text-sm font-semibold">분석 결과 미리보기</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-medium">이름</p>
                      <p className="text-sm">{parsed.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1 text-xs font-medium">이메일</p>
                      <p className="text-sm">{parsed.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2 text-xs font-medium">보유 기술</p>
                      <div className="flex flex-wrap gap-1.5">
                        {parsed.skills.map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-2 text-xs font-medium">경력 사항</p>
                      <ul className="space-y-1">
                        {parsed.experience.map((exp) => (
                          <li key={exp} className="text-sm">
                            {exp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                <Button className="w-full gap-2" size="lg" asChild>
                  <Link href="/interview">
                    면접 시작하기 <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}
