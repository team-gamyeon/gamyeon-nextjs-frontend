"use client";

import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Plus } from "lucide-react";

export function HistoryHeader() {
  return (
    <div className="border-b border-border/50 bg-background/80 px-8 py-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">면접 기록</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">지금까지의 면접 연습 기록과 점수 변화를 확인하세요.</p>
        </div>
        <Button size="sm" className="gap-2" asChild>
          <Link href="/upload"><Plus className="h-4 w-4" />새 면접</Link>
        </Button>
      </div>
    </div>
  );
}
