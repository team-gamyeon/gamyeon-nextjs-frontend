"use client";

import { useState, useCallback } from "react";
import type { UploadState, ParsedData } from "@/featured/upload/types";
import { MOCK_PARSED } from "@/featured/upload/types";

export function useFileUpload() {
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [parsed, setParsed] = useState<ParsedData | null>(null);

  const simulateUpload = useCallback((file: File) => {
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)}KB`);
    setState("uploading");
    setProgress(0);

    const uploadInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(uploadInterval);
          setState("processing");
          setTimeout(() => {
            setParsed(MOCK_PARSED);
            setState("done");
          }, 2000);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setState("idle");
      const file = e.dataTransfer.files[0];
      if (file) simulateUpload(file);
    },
    [simulateUpload],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) simulateUpload(file);
    },
    [simulateUpload],
  );

  const reset = useCallback(() => {
    setState("idle");
    setProgress(0);
    setFileName("");
    setFileSize("");
    setParsed(null);
  }, []);

  const setDragging = useCallback((dragging: boolean) => {
    setState(dragging ? "dragging" : "idle");
  }, []);

  return {
    state,
    progress,
    fileName,
    fileSize,
    parsed,
    handleDrop,
    handleFileInput,
    reset,
    setDragging,
  };
}
