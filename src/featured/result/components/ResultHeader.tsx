import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { BrainCircuit, Download, Share2 } from "lucide-react";

export function ResultHeader() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BrainCircuit className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">InterviewAI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />PDF 저장
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="h-3.5 w-3.5" />공유
          </Button>
        </div>
      </div>
    </header>
  );
}
