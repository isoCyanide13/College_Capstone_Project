"use client";

import { useState, useRef, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  Lock,
  ArrowRight,
  Minus,
  Plus,
  ChevronDown,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { curriculum, type Domain, type Subject } from "@/lib/curriculum";

interface SessionConfig {
  domainId: string;
  subjectId: string;
  subjectName: string;
  skillField: string;
  subtopics: { id: string; name: string }[];
  difficulty: string;
  questionType: string;
  questionCount: number;
  timeLimit: number;
}

interface TopicSelectorProps {
  onStart?: (config: SessionConfig) => void;
}

export default function TopicSelector({ onStart }: TopicSelectorProps) {
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedSubtopics, setSelectedSubtopics] = useState<Set<string>>(new Set());
  const [subtopicDropdownOpen, setSubtopicDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [difficulty, setDifficulty] = useState("medium");
  const [questionType, setQuestionType] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(10);
  const [timeLimit, setTimeLimit] = useState(30); // minutes

  const handleDomainSelect = (domain: Domain) => {
    if (domain.comingSoon) return;
    setSelectedDomain(domain);
    setSelectedSubject(null);
    setSelectedSubtopics(new Set());
  };

  const handleSubjectSelect = (subject: Subject) => {
    if (subject.comingSoon) return;
    setSelectedSubject(subject);
    setSelectedSubtopics(new Set());
    setSubtopicDropdownOpen(false);
  };
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSubtopicDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  },[]);

  const toggleSubtopic = (subtopicId: string) => {
    setSelectedSubtopics(prev => {
      const next = new Set(prev);
      if (next.has(subtopicId)) {
        next.delete(subtopicId);
      } else {
        next.add(subtopicId);
      }
      return next;
    });
  };

  const toggleAllSubtopics = () => {
    if (!selectedSubject) return;
    if (selectedSubtopics.size === selectedSubject.subtopics.length) {
      setSelectedSubtopics(new Set()); // deselect all
    } else {
    setSelectedSubtopics(new Set(selectedSubject.subtopics.map(s => s.id))); // select all
    }
  };

  const subtopicLabel = () => {
    if (!selectedSubject) return "Select subtopics";
    if (selectedSubtopics.size === 0) return "All Subtopics (default)";
    if (selectedSubtopics.size === selectedSubject.subtopics.length) return "All Subtopics selected";
    return `${selectedSubtopics.size} subtopic${selectedSubtopics.size > 1 ? "s" : ""} selected`;
  };

  const handleStart = () => {
  if (!selectedDomain || !selectedSubject) return;

  const selectedSubtopicsList = selectedSubtopics.size === 0
    ? selectedSubject.subtopics // all subtopics
    : selectedSubject.subtopics.filter(s => selectedSubtopics.has(s.id));

  onStart?.({
    domainId: selectedDomain.id,
    subjectId: selectedSubject.id,
    subjectName: selectedSubject.name,
    skillField: selectedSubject.skillField,
    subtopics: selectedSubtopicsList,
    difficulty,
    questionType,
    questionCount,
    timeLimit,
  });
};

  const canStart = selectedDomain !== null && selectedSubject !== null;

  return (
    <div className="space-y-8">

      {/* ─── Step 1: Domain Selection ─── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-headline text-sm font-semibold text-ink uppercase tracking-wider">
              Step 1 — Select Domain
            </h3>
            <p className="font-body text-xs text-ink-faint mt-0.5">
              Phase B & C subjects are coming soon
            </p>
          </div>
          {selectedDomain && (
            <button
              onClick={() => {
                setSelectedDomain(null);
                setSelectedSubject(null);
                setSelectedSubtopics(new Set());
              }}
              className="font-headline text-xs text-ink-faint hover:text-accent snap-transition"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {curriculum.map((domain) => {
            const isSelected = selectedDomain?.id === domain.id;
            const isLocked = domain.comingSoon;

            return (
              <button
                key={domain.id}
                onClick={() => handleDomainSelect(domain)}
                disabled={isLocked}
                className={clsx(
                  "relative p-4 rounded-sm border text-left snap-transition",
                  isLocked
                    ? "bg-surface-alt border-border opacity-50 cursor-not-allowed"
                    : isSelected
                    ? "bg-accent-light border-accent"
                    : "bg-surface-raised border-border hover:border-border-strong cursor-pointer"
                )}
              >
                {/* Coming Soon Badge */}
                {isLocked && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-surface-alt border border-border rounded-sm px-1.5 py-0.5">
                    <Lock className="w-2.5 h-2.5 text-ink-faint" />
                    <span className="font-headline text-[10px] text-ink-faint">
                      Phase {domain.phase}
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-2">
                  <span className={clsx(
                    "font-headline text-sm font-semibold leading-snug pr-8",
                    isSelected ? "text-ink" : "text-ink-muted"
                  )}>
                    {domain.name}
                  </span>
                  {!isLocked && (
                    isSelected
                      ? <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      : <Circle className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                  )}
                </div>

                <span className="font-body text-xs text-ink-faint">
                  {domain.subjects.length} subject{domain.subjects.length !== 1 ? "s" : ""}
                  {isLocked ? " · Coming Soon" : ` · Phase ${domain.phase}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Step 2: Subject Selection ─── */}
      {selectedDomain && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline text-sm font-semibold text-ink uppercase tracking-wider">
              Step 2 — Select Subject
              <span className="ml-2 font-typewriter text-xs text-accent font-normal normal-case">
                — {selectedDomain.name}
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDomain.subjects.map((subject) => {
              const isSelected = selectedSubject?.id === subject.id;
              const isLocked = subject.comingSoon;

              return (
                <button
                  key={subject.id}
                  onClick={() => handleSubjectSelect(subject)}
                  disabled={isLocked}
                  className={clsx(
                    "relative p-4 rounded-sm border text-left snap-transition",
                    isLocked
                      ? "bg-surface-alt border-border opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "bg-accent-light border-accent"
                      : "bg-surface-raised border-border hover:border-border-strong cursor-pointer"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={clsx(
                      "font-headline text-sm font-semibold leading-snug",
                      isSelected ? "text-ink" : "text-ink-muted"
                    )}>
                      {subject.name}
                    </span>
                    {!isLocked && (
                      isSelected
                        ? <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        : <Circle className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                    )}
                  </div>
                  <span className="font-body text-xs text-ink-faint">
                    {subject.subtopics.length} subtopics
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Step 3: Subtopic Selection (Optional) ─── */}
      {selectedSubject && (
  <div>
    <h3 className="font-headline text-sm font-semibold text-ink uppercase tracking-wider mb-4">
      Step 3 — Focus Area
      <span className="ml-2 font-typewriter text-xs text-ink-muted font-normal normal-case">
        — optional, leave empty for all subtopics
      </span>
    </h3>

    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Trigger */}
      <button
        onClick={() => setSubtopicDropdownOpen(prev => !prev)}
        className="w-full flex items-center justify-between bg-surface-raised border border-border rounded-sm px-4 py-2.5 font-body text-sm text-ink hover:border-border-strong snap-transition"
      >
        <span className={selectedSubtopics.size > 0 ? "text-ink" : "text-ink-muted"}>
          {subtopicLabel()}
        </span>
        <ChevronDown className={clsx(
          "w-4 h-4 text-ink-muted snap-transition",
          subtopicDropdownOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Panel */}
      {subtopicDropdownOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-raised border border-border rounded-sm shadow-sm z-50 max-h-64 overflow-y-auto">
          
          {/* Select All */}
          <button
            onClick={toggleAllSubtopics}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-alt snap-transition border-b border-border"
          >
            <div className={clsx(
              "w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0",
              selectedSubtopics.size === selectedSubject.subtopics.length
                ? "bg-ink border-ink"
                : "border-border-strong"
            )}>
              {selectedSubtopics.size === selectedSubject.subtopics.length && (
                <Check className="w-3 h-3 text-surface-raised" />
              )}
            </div>
            <span className="font-headline text-sm font-semibold text-ink">
              All Subtopics
            </span>
          </button>

          {/* Individual Subtopics */}
          {selectedSubject.subtopics.map((subtopic) => {
            const isChecked = selectedSubtopics.has(subtopic.id);
            return (
              <button
                key={subtopic.id}
                onClick={() => toggleSubtopic(subtopic.id)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-alt snap-transition"
              >
                <div className={clsx(
                  "w-4 h-4 rounded-sm border flex items-center justify-center flex-shrink-0",
                  isChecked ? "bg-ink border-ink" : "border-border-strong"
                )}>
                  {isChecked && (
                    <Check className="w-3 h-3 text-surface-raised" />
                  )}
                </div>
                <span className="font-body text-sm text-ink-muted text-left">
                  {subtopic.name}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>

    {/* Selected subtopic pills */}
    {selectedSubtopics.size > 0 && (
      <div className="flex flex-wrap gap-2 mt-3">
        {selectedSubject.subtopics
          .filter(s => selectedSubtopics.has(s.id))
          .map(s => (
            <span
              key={s.id}
              onClick={() => toggleSubtopic(s.id)}
              className="flex items-center gap-1 bg-accent-light border border-accent text-ink text-xs font-headline px-2.5 py-1 rounded-sm cursor-pointer hover:bg-surface-alt snap-transition"
            >
              {s.name}
              <span className="text-ink-faint ml-1">×</span>
            </span>
          ))}
        <button
          onClick={() => setSelectedSubtopics(new Set())}
          className="text-xs font-headline text-ink-faint hover:text-accent snap-transition px-2"
        >
          Clear all
        </button>
      </div>
    )}
  </div>
)}

      {/* ─── Step 4: Configuration ─── */}
      {selectedSubject && (
        <>
          <div className="hairline" />
          {/* Time Limit */}
          <div>
            <label className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-3">
              Time Limit
            </label>
            <div className="flex items-center border border-border rounded-sm">
              <button
                onClick={() => setTimeLimit((t) => Math.max(5, t - 5))}
                className="px-3 py-2.5 text-ink-muted hover:text-ink snap-transition"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="flex-1 text-center font-headline font-bold text-ink text-base">
                {timeLimit}m
              </span>
              <button
                onClick={() => setTimeLimit((t) => Math.min(120, t + 5))}
                className="px-3 py-2.5 text-ink-muted hover:text-ink snap-transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Question Type */}
            <div>
              <label className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-3">
                Question Type
              </label>
              <div className="flex gap-2">
                {[
                  { id: "mcq", label: "MCQ" },
                  { id: "theory", label: "Theory" },
                  { id: "mixed", label: "Mixed" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setQuestionType(type.id)}
                    className={clsx(
                      "flex-1 py-2.5 rounded-sm font-headline font-medium text-sm snap-transition border",
                      questionType === type.id
                        ? "bg-ink text-surface-raised border-ink"
                        : "bg-transparent text-ink-muted border-border hover:border-border-strong hover:text-ink"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-3">
                Difficulty
              </label>
              <div className="flex gap-2">
                {["Easy", "Medium", "Hard"].map((level) => {
                  const id = level.toLowerCase();
                  return (
                    <button
                      key={id}
                      onClick={() => setDifficulty(id)}
                      className={clsx(
                        "flex-1 py-2.5 rounded-sm font-headline font-medium text-sm snap-transition border",
                        difficulty === id
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
                  onClick={() => setQuestionCount((c) => Math.min(30, c + 5))}
                  className="px-3 py-2.5 text-ink-muted hover:text-ink snap-transition"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* ─── Session Summary + Start Button ─── */}
          <div className="flex items-center justify-between p-4 bg-surface-alt border border-border rounded-sm">
            <div className="font-body text-sm text-ink-muted space-y-0.5">
              <p>
              <span className="font-headline font-semibold text-ink">
                {selectedSubject.name}
              </span>
              {selectedSubtopics.size > 0 && (
                <span className="text-accent ml-2">
                  → {selectedSubtopics.size} subtopic{selectedSubtopics.size > 1 ? "s" : ""}
                </span>
              )}
            </p>
            <p className="text-xs">
              {questionCount} questions · {difficulty} · {questionType} · {timeLimit} min
            </p>
            </div>

            <button
              onClick={handleStart}
              disabled={!canStart}
              className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-sm font-headline font-bold text-sm snap-transition",
                canStart
                  ? "bg-ink text-surface-raised hover:bg-accent-hover"
                  : "bg-surface-alt text-ink-faint border border-border cursor-not-allowed"
              )}
            >
              Begin Practice
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
