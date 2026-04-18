"use client";

import { useState } from "react";
import {
  BookOpen,
  Code2,
  ClipboardList,
  Wrench,
  Clock,
  FileText,
  ArrowRight,
} from "lucide-react";
import clsx from "clsx";
import TopicSelector from "@/components/TopicSelector";

/* ─── Practice Mode Tabs ─── */
const practiceTabs = [
  {
    id: "topic",
    label: "Topic-Specific",
    icon: BookOpen,
    desc: "Theory & Coding filtered by domain",
  },
  {
    id: "coding",
    label: "Coding Only",
    icon: Code2,
    desc: "Pure coding problems",
  },
  {
    id: "classic",
    label: "Classic Tests",
    icon: ClipboardList,
    desc: "Predefined timed exams",
  },
  {
    id: "custom",
    label: "Custom Builder",
    icon: Wrench,
    desc: "Build your own test",
  },
];

/* ─── Predefined Classic Tests ─── */
const classicTests = [
  {
    id: "dsa-45",
    title: "Standard 45-min DSA",
    duration: "45 min",
    questions: 20,
    desc: "Covers arrays, trees, graphs, and DP. Timed under exam conditions.",
  },
  {
    id: "sys-design-60",
    title: "System Design Sprint",
    duration: "60 min",
    questions: 8,
    desc: "Architecture, scaling, and tradeoff discussions with diagramming.",
  },
  {
    id: "full-stack-90",
    title: "Full-Stack Assessment",
    duration: "90 min",
    questions: 30,
    desc: "Frontend, backend, DB, and API design. Comprehensive evaluation.",
  },
  {
    id: "quick-fire-15",
    title: "Quick-Fire Theory",
    duration: "15 min",
    questions: 25,
    desc: "Rapid MCQ round covering CS fundamentals and recent concepts.",
  },
];

export default function QuestionPracticePage() {
  const [activeTab, setActiveTab] = useState("topic");

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="mb-8 pb-6 hairline">
        <h1 className="font-headline text-2xl font-bold text-ink mb-1">
          Question Practice
        </h1>
        <p className="font-body text-ink-muted text-sm">
          Select a practice mode and configure your session parameters.
        </p>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-0 hairline mb-8 overflow-x-auto">
        {practiceTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "practice-tab",
                isActive && "practice-tab-active"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {/* ─── Topic-Specific ─── */}
        {activeTab === "topic" && (
          <div className="section-card p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="font-headline text-base font-semibold text-ink mb-1">
                Topic-Specific Practice
              </h2>
              <p className="font-body text-sm text-ink-muted">
                Choose your target domains — relevant subjects are
                automatically mapped for a focused practice session.
              </p>
            </div>
            <TopicSelector />
          </div>
        )}

        {/* ─── Coding Only ─── */}
        {activeTab === "coding" && (
          <div className="section-card p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="font-headline text-base font-semibold text-ink mb-1 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-accent" />
                Coding Questions Only
              </h2>
              <p className="font-body text-sm text-ink-muted">
                Pure algorithmic and implementation challenges — no theory, no MCQs.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {["Easy", "Medium", "Hard"].map((level) => (
                <div
                  key={level}
                  className="p-5 border border-border rounded-sm hover:border-border-strong snap-transition cursor-pointer group"
                >
                  <h3 className="font-headline text-sm font-semibold text-ink mb-1 group-hover:text-accent snap-transition">
                    {level} Problems
                  </h3>
                  <p className="font-body text-xs text-ink-faint">
                    {level === "Easy"
                      ? "Warm-up problems for pattern recognition."
                      : level === "Medium"
                      ? "Standard interview-level challenges."
                      : "Advanced problems requiring deep optimization."}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button className="flex items-center gap-2 bg-ink text-surface-raised px-6 py-2.5 rounded-sm font-headline font-semibold text-sm snap-transition hover:bg-accent-hover">
                Start Coding Session
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Classic Tests ─── */}
        {activeTab === "classic" && (
          <div className="section-card p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="font-headline text-base font-semibold text-ink mb-1 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-accent" />
                Predefined Classic Tests
              </h2>
              <p className="font-body text-sm text-ink-muted">
                Battle-tested exam formats used by top companies. Pick one and begin immediately.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border">
              {classicTests.map((test) => (
                <div
                  key={test.id}
                  id={`classic-${test.id}`}
                  className="bg-surface-raised p-5 group cursor-pointer hover:bg-surface-alt snap-transition"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-headline text-sm font-semibold text-ink group-hover:text-accent snap-transition">
                      {test.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 text-ink-faint group-hover:text-accent snap-transition shrink-0 mt-0.5" />
                  </div>
                  <p className="font-body text-xs text-ink-muted leading-relaxed mb-3">
                    {test.desc}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-headline text-ink-faint">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {test.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {test.questions} questions
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Custom Builder ─── */}
        {activeTab === "custom" && (
          <div className="section-card p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="font-headline text-base font-semibold text-ink mb-1 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-accent" />
                Custom Test Builder
              </h2>
              <p className="font-body text-sm text-ink-muted">
                Assemble a test from scratch — choose topics, question types,
                difficulty distribution, and time limits.
              </p>
            </div>
            <div className="border border-border rounded-sm p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
              <Wrench className="w-8 h-8 text-ink-faint mb-4" />
              <p className="font-headline text-sm font-medium text-ink-muted mb-1">
                Coming Soon
              </p>
              <p className="font-body text-xs text-ink-faint max-w-sm">
                The custom test builder will allow you to mix question types,
                set per-section time limits, and create shareable test
                configurations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
