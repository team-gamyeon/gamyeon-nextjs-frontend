"use client";

import LandingPage from "@/app/page";
import DashboardPage from "@/app/dashboard/page";
import HistoryPage from "@/app/history/page";
import ResultPage from "@/app/result/page";
import UploadPage from "@/app/upload/page";
import SignupPage from "@/app/signup/page";
import LoginPage from "@/app/login/page";
import InterviewPage from "@/app/interview/page";
import { FigmaModalPreview } from "./modal-preview";

export default function FigmaExportPage() {
    return (
        <div className="flex flex-col bg-slate-100">
            {/* 1. Landing Page */}
            <section className="relative w-full border-b-[20px] border-slate-300">
                <div className="absolute top-2 left-2 z-50 rounded-md bg-black px-3 py-1 text-xs font-bold text-white shadow-lg">
                    1. Landing Page
                </div>
                <LandingPage />
            </section>

            {/* 2. Login Page */}
            <section className="relative w-full border-b-[20px] border-slate-300">
                <div className="absolute top-2 left-2 z-50 rounded-md bg-black px-3 py-1 text-xs font-bold text-white shadow-lg">
                    2. Login Page
                </div>
                <LoginPage />
            </section>

            {/* 3. Signup Page */}
            <section className="relative w-full border-b-[20px] border-slate-300">
                <div className="absolute top-2 left-2 z-50 rounded-md bg-black px-3 py-1 text-xs font-bold text-white shadow-lg">
                    3. Signup Page
                </div>
                <SignupPage />
            </section>

            {/* 4. Dashboard Page */}
            <section className="relative w-full border-b-[20px] border-slate-300">
                <div className="absolute top-2 left-2 z-50 rounded-md bg-black px-3 py-1 text-xs font-bold text-white shadow-lg">
                    4. Dashboard Page
                </div>
                <DashboardPage />
            </section>

            {/* 5. History Page */}
            <section className="relative w-full border-b-[20px] border-slate-300">
                <div className="absolute top-2 left-2 z-50 rounded-md bg-black px-3 py-1 text-xs font-bold text-white shadow-lg">
                    5. History Page
                </div>
                <HistoryPage />
            </section>

            {/* 6. Result Page */}
            <section className="relative w-full border-b-[20px] border-slate-300">
                <div className="absolute top-2 left-2 z-50 rounded-md bg-black px-3 py-1 text-xs font-bold text-white shadow-lg">
                    6. Result Page
                </div>
                <ResultPage />
            </section>

            {/* 7. Upload Page */}
            <section className="relative w-full border-b-[20px] border-slate-300">
                <div className="absolute top-2 left-2 z-50 rounded-md bg-black px-3 py-1 text-xs font-bold text-white shadow-lg">
                    7. Upload Page
                </div>
                <UploadPage />
            </section>

            {/* 8. Interview Page */}
            <section className="relative w-full border-b-[20px] border-slate-300">
                <div className="absolute top-2 left-2 z-50 rounded-md bg-black px-3 py-1 text-xs font-bold text-white shadow-lg">
                    8. Interview Page
                </div>
                <InterviewPage />
            </section>

            {/* 9. Modal Setup Variant 1 - 4 */}
            <section className="relative flex flex-col items-center space-y-12 bg-slate-50 py-24 border-b-[20px] border-slate-300">
                <div className="absolute top-2 left-2 z-50 rounded-md bg-black px-3 py-1 text-xs font-bold text-white shadow-lg">
                    9. Interview Setup Modals (Step 1 ~ 4)
                </div>

                <div className="w-full max-w-4xl">
                    <h2 className="mb-4 text-xl font-bold">Step 1: 면접 제목 입력</h2>
                    <FigmaModalPreview targetStep={1} />
                </div>

                <div className="w-full max-w-4xl">
                    <h2 className="mb-4 text-xl font-bold">Step 2: 카메라 권한</h2>
                    <FigmaModalPreview targetStep={2} />
                </div>

                <div className="w-full max-w-4xl">
                    <h2 className="mb-4 text-xl font-bold">Step 3: 마이크 권한</h2>
                    <FigmaModalPreview targetStep={3} />
                </div>

                <div className="w-full max-w-4xl">
                    <h2 className="mb-4 text-xl font-bold">Step 4: 문서 업로드</h2>
                    <FigmaModalPreview targetStep={4} />
                </div>
            </section>
        </div>
    );
}
