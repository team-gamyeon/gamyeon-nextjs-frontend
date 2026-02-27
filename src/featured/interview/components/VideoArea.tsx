"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import type { Phase } from "@/featured/interview/types";

interface VideoAreaProps {
  cameraOn: boolean;
  micOn: boolean;
  phase: Phase;
}

export function VideoArea({ cameraOn, micOn, phase }: VideoAreaProps) {
  return (
    <motion.div
      layout
      className="relative flex aspect-video w-full max-w-[700px] items-center justify-center overflow-hidden rounded-2xl bg-slate-800 shadow-2xl"
    >
      {cameraOn ? (
        <div className="text-center text-white/25">
          <Video className="mx-auto mb-2 h-14 w-14" />
          <p className="text-sm">카메라 미리보기</p>
        </div>
      ) : (
        <div className="text-center text-white/25">
          <VideoOff className="mx-auto mb-2 h-14 w-14" />
          <p className="text-sm">카메라 꺼짐</p>
        </div>
      )}

      <div className="absolute bottom-3 left-3">
        <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs backdrop-blur ${micOn ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
          {micOn ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          {micOn ? "마이크 켜짐" : "마이크 꺼짐"}
        </div>
      </div>

      <AnimatePresence>
        {phase === "answering" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute top-3 left-3">
            <div className="flex items-center gap-1.5 rounded-full bg-red-500/80 px-3 py-1 text-xs font-medium backdrop-blur">
              <div className="h-2 w-2 animate-pulse rounded-full bg-white" />
              답변 중
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
