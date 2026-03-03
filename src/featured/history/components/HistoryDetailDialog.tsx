"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Separator } from "@/shared/ui/separator";
import { FileText, TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import type { InterviewRecord } from "@/featured/history/types";

interface HistoryDetailDialogProps {
  record: InterviewRecord | null;
  onClose: () => void;
}

export function HistoryDetailDialog({ record, onClose }: HistoryDetailDialogProps) {
  return (
    <Dialog open={!!record} onOpenChange={() => onClose()}>
      {record && (
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              면접 결과 미리보기
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{record.position}</p>
                <p className="text-sm text-muted-foreground">{record.date} · {record.duration}</p>
              </div>
              <div className={`flex h-14 w-14 flex-col items-center justify-center rounded-xl ${record.score >= 80 ? "bg-green-50 text-green-700" : record.score >= 70 ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>
                <span className="text-xl font-bold">{record.score}</span>
                <span className="text-[10px]">점</span>
              </div>
            </div>
            <Separator />
            <div>
              <p className="mb-2 text-sm font-medium text-green-700">잘한 점</p>
              <ul className="space-y-1">
                {record.strengths.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="h-3 w-3 text-green-500" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-amber-700">개선할 점</p>
              <ul className="space-y-1">
                {record.improvements.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingDown className="h-3 w-3 text-amber-500" />{s}
                  </li>
                ))}
              </ul>
            </div>
            <Button className="w-full gap-2" asChild>
              <Link href="/result">상세 리포트 보기 <ChevronRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
