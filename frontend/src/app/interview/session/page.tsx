"use client";

import { useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import InterviewPanel from "@/components/InterviewPanel";
import AntiCheatOverlay from "@/components/AntiCheatOverlay";

export default function InterviewSessionPage() {
  const [cheatStatus, setCheatStatus] = useState<
    "active" | "warning" | "violation"
  >("active");

  return (
    <div
      id="interview-session"
      className="flex-1 flex w-full relative h-[calc(100vh-4rem)] bg-surface overflow-hidden"
    >
      <AntiCheatOverlay status={cheatStatus} />

      {/* 40% — AI Interview Panel */}
      <div className="w-[40%] h-full">
        <InterviewPanel />
      </div>

      {/* 60% — Code Editor */}
      <div className="w-[60%] h-full">
        <CodeEditor />
      </div>
    </div>
  );
}
