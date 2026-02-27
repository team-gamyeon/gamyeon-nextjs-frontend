"use client";

import { motion, type Variants } from "framer-motion";
import type { Step } from "@/featured/landing/types";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const steps: Step[] = [
  { step: "01", title: "이력서 업로드", description: "이력서 또는 포트폴리오를 업로드하면 AI가 내용을 분석합니다." },
  { step: "02", title: "면접 시뮬레이션", description: "실전과 동일한 환경에서 AI 면접관과 모의 면접을 진행합니다." },
  { step: "03", title: "결과 리포트 확인", description: "AI 분석 리포트를 통해 개선점을 파악하고 실력을 향상시킵니다." },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl font-bold tracking-tight sm:text-4xl">
            간단한 <span className="text-primary">3단계</span>로 시작
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="mt-4 text-muted-foreground">
            복잡한 설정 없이 바로 면접 연습을 시작할 수 있습니다.
          </motion.p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={fadeUp}
              custom={i}
              className="relative text-center"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <span className="text-xl font-bold text-primary">{step.step}</span>
              </div>
              <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="absolute top-8 left-[calc(50%+40px)] hidden h-px w-[calc(100%-80px)] bg-border md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
