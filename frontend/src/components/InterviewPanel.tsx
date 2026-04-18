"use client";

import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const mockTranscript = [
  {
    speaker: "Interviewer 1",
    role: "Algorithm Specialist",
    message:
      "Could you explain the difference between a mutex and a semaphore? When would you choose one over the other?",
    time: "00:01:23",
  },
  {
    speaker: "You",
    role: "Candidate",
    message:
      "A mutex is essentially a locking mechanism that allows only one thread to access a resource at a time. A semaphore, on the other hand, is a signaling mechanism that can allow multiple threads...",
    time: "00:01:45",
  },
  {
    speaker: "Interviewer 1",
    role: "Algorithm Specialist",
    message:
      "Good start. Can you give a concrete scenario where a semaphore with count greater than 1 would be more appropriate than a mutex?",
    time: "00:02:30",
  },
];

export default function InterviewPanel() {
  const [micMuted, setMicMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);

  return (
    <div className="flex flex-col h-full bg-surface-raised border-r border-border">
      {/* Panel Header */}
      <div className="px-5 py-4 hairline flex items-center justify-between">
        <div>
          <h2 className="font-headline text-sm font-semibold text-ink">
            Interview Panel
          </h2>
          <p className="font-body text-xs text-ink-faint mt-0.5">
            AI Interviewer — Algorithm Specialist
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="font-headline text-xs text-success font-medium">
            Live
          </span>
        </div>
      </div>

      {/* AI Status Area */}
      <div className="px-5 py-6 hairline bg-surface-alt">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm bg-ink flex items-center justify-center flex-shrink-0">
            <BrainIcon className="w-6 h-6 text-surface" />
          </div>
          <div>
            <p className="font-headline text-sm font-medium text-ink">
              Dr. Alan — Panel Lead
            </p>
            <p className="font-typewriter text-xs text-ink-muted mt-0.5">
              Currently asking follow-up questions...
            </p>
          </div>
        </div>
      </div>

      {/* Conversation Transcript */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <p className="font-headline text-xs text-ink-faint uppercase tracking-wider mb-4">
          Transcript
        </p>
        <div className="space-y-0">
          {mockTranscript.map((msg, idx) => (
            <div key={idx}>
              <div className="py-4">
                <div className="flex items-baseline justify-between mb-1.5">
                  <span
                    className={clsx(
                      "font-headline text-xs font-semibold",
                      msg.speaker === "You" ? "text-accent" : "text-ink"
                    )}
                  >
                    {msg.speaker}
                    <span className="font-normal text-ink-faint ml-1.5">
                      — {msg.role}
                    </span>
                  </span>
                  <span className="font-typewriter text-[10px] text-ink-faint">
                    {msg.time}
                  </span>
                </div>
                <p className="font-body text-sm text-ink leading-[1.7]">
                  {msg.message}
                </p>
              </div>
              {idx < mockTranscript.length - 1 && <div className="hairline" />}
            </div>
          ))}
        </div>
      </div>

      {/* User PIP + Controls */}
      <div className="hairline-top px-5 py-4 bg-surface flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mini self-view */}
          <div className="w-10 h-8 rounded-sm bg-surface-alt border border-border overflow-hidden flex items-center justify-center">
            {!videoOff ? (
              <UserPlaceholderIcon className="w-4 h-4 text-ink-faint" />
            ) : (
              <VideoOff className="w-3 h-3 text-ink-faint" />
            )}
          </div>

          <button
            id="mic-toggle"
            onClick={() => setMicMuted(!micMuted)}
            className={clsx(
              "p-2 rounded-sm snap-transition border",
              micMuted
                ? "bg-red-50 text-danger border-red-200"
                : "bg-surface-alt text-ink border-border hover:border-border-strong"
            )}
          >
            {micMuted ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </button>
          <button
            id="video-toggle"
            onClick={() => setVideoOff(!videoOff)}
            className={clsx(
              "p-2 rounded-sm snap-transition border",
              videoOff
                ? "bg-red-50 text-danger border-red-200"
                : "bg-surface-alt text-ink border-border hover:border-border-strong"
            )}
          >
            {videoOff ? (
              <VideoOff className="w-4 h-4" />
            ) : (
              <Video className="w-4 h-4" />
            )}
          </button>
        </div>

        <button
          id="end-session-btn"
          className="bg-danger text-white px-5 py-2 rounded-sm font-headline font-medium text-sm snap-transition hover:opacity-90"
        >
          End Session
        </button>
      </div>
    </div>
  );
}

function BrainIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  );
}

function UserPlaceholderIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
