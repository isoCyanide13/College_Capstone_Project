"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";
import clsx from "clsx";
import { curriculumMap, allDomains, allSubjects } from "@/lib/curriculum";

interface TopicSelectorProps {
  onStart?: (config: {
    domains: string[];
    subjects: string[];
    difficulty: string;
    questionCount: number;
  }) => void;
}

export default function TopicSelector({ onStart }: TopicSelectorProps) {
  const [selectedDomains, setSelectedDomains] = useState<Set<string>>(
    new Set()
  );
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(15);

  /* Derive active subjects from selected domains (union) */
  const activeSubjects = useMemo(() => {
    const subjects = new Set<string>();
    selectedDomains.forEach((domain) => {
      curriculumMap[domain]?.forEach((s) => subjects.add(s));
    });
    return subjects;
  }, [selectedDomains]);

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) {
        next.delete(domain);
      } else {
        next.add(domain);
      }
      return next;
    });
  };

  const handleStart = () => {
    onStart?.({
      domains: Array.from(selectedDomains),
      subjects: Array.from(activeSubjects),
      difficulty,
      questionCount,
    });
  };

  return (
    <div className="space-y-8">
      {/* ─── Domain Grid ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-headline text-sm font-semibold text-ink uppercase tracking-wider">
            Select Domain
          </h3>
          {selectedDomains.size > 0 && (
            <button
              onClick={() => setSelectedDomains(new Set())}
              className="font-headline text-xs text-ink-faint hover:text-accent snap-transition"
            >
              Clear All
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {allDomains.map((domain) => {
            const isActive = selectedDomains.has(domain);
            const subjectCount = curriculumMap[domain].length;
            return (
              <button
                key={domain}
                id={`domain-${domain.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => toggleDomain(domain)}
                className={clsx("domain-card", isActive && "domain-card-active")}
              >
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={clsx(
                      "font-headline text-sm font-semibold leading-snug",
                      isActive ? "text-ink" : "text-ink-muted"
                    )}
                  >
                    {domain}
                  </span>
                  {isActive ? (
                    <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                  )}
                </div>
                <span className="font-body text-xs text-ink-faint">
                  {subjectCount} subject{subjectCount !== 1 && "s"} mapped
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Subject Pills ─── */}
      <div>
        <h3 className="font-headline text-sm font-semibold text-ink uppercase tracking-wider mb-4">
          Mapped Subjects
          {activeSubjects.size > 0 && (
            <span className="ml-2 font-typewriter text-xs text-accent font-normal normal-case">
              — {activeSubjects.size} active
            </span>
          )}
        </h3>
        {selectedDomains.size === 0 ? (
          <p className="font-body text-sm text-ink-faint italic">
            Select a domain above to view its mapped subjects.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {allSubjects.map((subject) => {
              const isActive = activeSubjects.has(subject);
              return (
                <span
                  key={subject}
                  className={clsx(
                    "subject-pill",
                    isActive && "subject-pill-active"
                  )}
                >
                  {isActive && (
                    <CheckCircle2 className="w-3 h-3 text-accent" />
                  )}
                  {subject}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Hairline ─── */}
      <div className="hairline" />

      {/* ─── Configuration Row ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* Difficulty */}
        <div>
          <label className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-3">
            Difficulty
          </label>
          <div className="flex gap-2">
            {["Easy", "Medium", "Hard"].map((level) => {
              const id = level.toLowerCase();
              const isSelected = difficulty === id;
              return (
                <button
                  key={id}
                  id={`topic-difficulty-${id}`}
                  onClick={() => setDifficulty(id)}
                  className={clsx(
                    "flex-1 py-2.5 rounded-sm font-headline font-medium text-sm snap-transition border",
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
        </div>

        {/* Question Count */}
        <div>
          <label className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-3">
            Questions
          </label>
          <div className="flex items-center border border-border rounded-sm">
            <button
              onClick={() => setQuestionCount((c) => Math.max(5, c - 5))}
              className="px-3 py-2.5 text-ink-muted hover:text-ink snap-transition"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="flex-1 text-center font-headline font-bold text-ink text-base">
              {questionCount}
            </span>
            <button
              onClick={() => setQuestionCount((c) => Math.min(50, c + 5))}
              className="px-3 py-2.5 text-ink-muted hover:text-ink snap-transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Start Button */}
        <div>
          <button
            id="start-topic-practice"
            onClick={handleStart}
            disabled={selectedDomains.size === 0}
            className={clsx(
              "w-full flex items-center justify-center gap-2 py-3 rounded-sm font-headline font-bold text-sm snap-transition",
              selectedDomains.size > 0
                ? "bg-ink text-surface-raised hover:bg-accent-hover"
                : "bg-surface-alt text-ink-faint border border-border cursor-not-allowed"
            )}
          >
            Begin Practice
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
