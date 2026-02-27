"use client";

import { motion } from "framer-motion";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
    CheckCircle2,
    Video,
    Mic,
    ChevronRight,
    Upload,
    AlertCircle,
    FileText,
    FolderOpen,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";

type StepStatus = "pending" | "active" | "done";

const STEPS = [
    { id: 1, label: "면접 제목", icon: FileText },
    { id: 2, label: "카메라 권한", icon: Video },
    { id: 3, label: "마이크 권한", icon: Mic },
    { id: 4, label: "문서 업로드", icon: FolderOpen },
] as const;

function SidebarStep({
    step,
    status,
}: {
    step: (typeof STEPS)[number];
    status: StepStatus;
}) {
    const Icon = step.icon;
    return (
        <div
            className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200",
                status === "active" && "bg-primary/10",
                status === "pending" && "opacity-40",
            )}
        >
            <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                {status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                    <div
                        className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold",
                            status === "active"
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/30 text-muted-foreground/50",
                        )}
                    >
                        {step.id}
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Icon
                    className={cn(
                        "h-4 w-4 shrink-0",
                        status === "active"
                            ? "text-primary"
                            : status === "done"
                                ? "text-green-500"
                                : "text-muted-foreground/50",
                    )}
                />
                <span
                    className={cn(
                        "text-sm font-medium",
                        status === "active" && "text-primary",
                        status === "done" && "text-foreground",
                        status === "pending" && "text-muted-foreground",
                    )}
                >
                    {step.label}
                </span>
            </div>
        </div>
    );
}

export function FigmaModalPreview({ targetStep = 1 }: { targetStep: number }) {
    const statuses: StepStatus[] = [
        targetStep > 1 ? "done" : targetStep === 1 ? "active" : "pending",
        targetStep > 2 ? "done" : targetStep === 2 ? "active" : "pending",
        targetStep > 3 ? "done" : targetStep === 3 ? "active" : "pending",
        targetStep > 4 ? "done" : targetStep === 4 ? "active" : "pending",
    ];

    const doneCount = targetStep - 1;

    const renderContent = () => {
        switch (targetStep) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold">면접 제목 입력</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                이번 면접의 제목이나 포지션명을 입력해주세요.
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="예: 프론트엔드 개발자 면접"
                                className="flex-1"
                                readOnly
                            />
                            <Button disabled className="shrink-0 gap-1">
                                확인
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-5">
                        <div>
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                <Video className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold">카메라 권한 요청 및 테스트</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                면접 영상 녹화를 위해 카메라 접근 권한이 필요합니다.
                            </p>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Video className="h-4 w-4" />
                            카메라 권한 요청하기
                        </Button>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-5">
                        <div>
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                <Mic className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold">마이크 권한 요청 및 테스트</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                답변 인식을 위해 마이크 접근 권한이 필요합니다.
                            </p>
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Mic className="h-4 w-4" />
                            마이크 권한 요청하기
                        </Button>
                    </div>
                );

            case 4:
                return (
                    <div className="space-y-5">
                        <div>
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                <FolderOpen className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-bold">문서 업로드</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                이력서, 포트폴리오, 자기소개서를 업로드하면 AI가 맞춤 질문을
                                준비합니다.
                            </p>
                        </div>

                        <div className="space-y-2">
                            {[
                                { label: "(필수) 이력서" },
                                { label: "(선택) 포트폴리오" },
                                { label: "(선택) 자기소개서" },
                            ].map(({ label }) => (
                                <div key={label}>
                                    <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-dashed border-border px-4 py-2.5 transition-colors hover:bg-muted/30">
                                        <Upload className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">
                                            {label} 업로드
                                        </span>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 pt-1">
                            <Button size="sm" disabled className="gap-2">
                                완료
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm">
                                건너뛰기
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-[500px] w-full max-w-4xl overflow-hidden rounded-xl border border-border bg-background shadow-lg">
            <aside className="flex w-64 shrink-0 flex-col border-r border-border/60 bg-muted/30">
                <div className="border-b border-border/50 px-5 py-5">
                    <p className="text-sm font-bold leading-tight">면접 환경 설정</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {doneCount} / 4 단계 완료
                    </p>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-border">
                        <div
                            className="h-full rounded-full bg-primary"
                            style={{ width: `${(doneCount / 4) * 100}%` }}
                        />
                    </div>
                </div>
                <nav className="flex-1 space-y-0.5 p-3">
                    {STEPS.map((step) => (
                        <SidebarStep
                            key={step.id}
                            step={step}
                            status={statuses[step.id - 1]}
                        />
                    ))}
                </nav>
            </aside>

            <div className="flex flex-1 flex-col bg-background">
                <div className="flex-1 overflow-y-auto px-8 py-8">
                    <div>{renderContent()}</div>
                </div>
                <div className="flex items-center justify-between border-t border-border/50 px-8 py-4">
                    <Button variant="ghost" size="sm">
                        취소
                    </Button>
                    <Button disabled className="gap-2">
                        면접 시작하기
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
