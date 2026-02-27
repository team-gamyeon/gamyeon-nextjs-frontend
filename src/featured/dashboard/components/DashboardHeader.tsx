"use client";

import { motion } from "framer-motion";
import { useAuthStore } from "@/featured/auth/store";

export function DashboardHeader() {
  const { user } = useAuthStore();

  return (
    <div className="border-b border-border/50 bg-background/80 px-8 py-5 backdrop-blur">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-xl font-bold">
          안녕하세요, {user?.name ?? "사용자"}님 👋
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          오늘도 면접 실력을 키워볼까요?
        </p>
      </motion.div>
    </div>
  );
}
