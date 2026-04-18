"use client";

import { useState } from "react";
import {
  Monitor,
  Mic,
  Settings,
  Play,
  Code2,
  BrainCircuit,
  ListChecks,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function InterviewLobbyPage() {
  const [selectedType, setSelectedType] = useState<string>("technical");
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<string>("medium");

  const interviewTypes = [
    {
      id: "technical",
      icon: Code2,
      title: "Technical / Coding",
      desc: "Data structures, algorithms, and logic.",
    },
    {
      id: "system",
      icon: Monitor,
      title: "System Design",
      desc: "Architecture, scaling, and tradeoffs.",
    },
    {
      id: "behavioral",
      icon: BrainCircuit,
      title: "Behavioral",
      desc: "Past experiences and cultural fit.",
    },
    {
      id: "mixed",
      icon: Settings,
      title: "Mixed Full-Loop",
      desc: "A combination of all topics.",
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 pb-6 hairline">
        <h1 className="font-headline text-2xl font-bold text-ink mb-1">
          Configure Session
        </h1>
        <p className="font-body text-ink-muted text-sm">
          Set up your AI interview parameters before starting.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          {/* Interview Type */}
          <section className="section-card p-6">
            <h2 className="font-headline text-base font-semibold text-ink mb-4 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-accent" />
              Interview Focus
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interviewTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    id={`type-${type.id}`}
                    onClick={() => setSelectedType(type.id)}
                    className={clsx(
                      "p-4 rounded-sm text-left border snap-transition",
                      isSelected
                        ? "bg-accent-light border-accent"
                        : "bg-surface border-border hover:border-border-strong"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-5 h-5 mb-3",
                        isSelected ? "text-accent" : "text-ink-faint"
                      )}
                    />
                    <h3 className="font-headline text-sm font-medium text-ink mb-1">
                      {type.title}
                    </h3>
                    <p className="font-body text-xs text-ink-muted">
                      {type.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Difficulty */}
          <section className="section-card p-6">
            <h2 className="font-headline text-base font-semibold text-ink mb-4">
              Difficulty Level
            </h2>
            <div className="flex gap-3">
              {["Easy", "Medium", "Hard"].map((level) => {
                const id = level.toLowerCase();
                const isSelected = selectedDifficulty === id;
                return (
                  <button
                    key={id}
                    id={`difficulty-${id}`}
                    onClick={() => setSelectedDifficulty(id)}
                    className={clsx(
                      "flex-1 py-3 rounded-sm font-headline font-medium text-sm snap-transition border",
                      isSelected
                        ? "bg-ink text-surface-raised border-ink"
                        : "bg-transparent text-ink-muted border-border hover:border-border-strong hover:text-ink"
                    )}
                  >
                    {level}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <section className="section-card p-6">
            <h2 className="font-headline text-base font-semibold text-ink mb-4">
              System Check
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-success" />
                  <span className="font-body text-sm text-ink">
                    Microphone
                  </span>
                </div>
                <span className="font-headline text-xs font-medium text-success bg-green-50 px-2 py-0.5 rounded-sm border border-green-200">
                  Ready
                </span>
              </div>
              <div className="hairline" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-success" />
                  <span className="font-body text-sm text-ink">
                    Screen Share
                  </span>
                </div>
                <span className="font-headline text-xs font-medium text-success bg-green-50 px-2 py-0.5 rounded-sm border border-green-200">
                  Ready
                </span>
              </div>
              <div className="hairline" />
              <div className="flex items-start gap-2 mt-2 p-3 bg-surface-alt rounded-sm border border-border">
                <AlertCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <p className="font-body text-xs text-ink-muted leading-relaxed">
                  Anti-cheat measures will be active during this session.
                  Please close unnecessary applications.
                </p>
              </div>
            </div>
          </section>

          <Link
            id="start-interview-btn"
            href="/interview/session"
            className="w-full flex items-center justify-center gap-2 bg-ink text-surface-raised py-4 rounded-sm font-headline font-bold text-base snap-transition hover:bg-accent-hover"
          >
            <Play className="w-4 h-4" fill="currentColor" />
            Start Interview
          </Link>
        </div>
      </div>
    </div>
  );
}
