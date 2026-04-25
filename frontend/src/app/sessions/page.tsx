"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Clock,
  Trophy,
  Target,
  ChevronRight,
  BookOpen,
  ArrowLeft,
  Filter,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { getToken } from "@/lib/auth";
import clsx from "clsx";
import { Download } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000";

interface Session {
  session_id: string;
  subject_name: string;
  difficulty: string;
  total_score: number;
  accuracy: number;
  total_questions: number;
  ended_at: string;
  weak_subtopics: any[];
  strong_subtopics: string[];
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getScoreStyle(score: number) {
  if (score >= 7) return "text-success bg-green-50 border-green-200";
  if (score >= 4) return "text-warning bg-amber-50 border-amber-200";
  return "text-danger bg-red-50 border-red-200";
}

export default function SessionLogPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "strong" | "weak">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const token = getToken();
        if (!token) { router.push("/login"); return; }
        const res = await fetch(`${API_BASE}/api/sessions/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSessions(data.recent_sessions || []);
        }
      } catch (e) {
        console.error("Failed to load sessions:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const filteredSessions = sessions.filter(s => {
    if (filter === "strong") return s.total_score >= 7;
    if (filter === "weak") return s.total_score < 5;
    return true;
  });
  function exportSelectedCSV() {
    const toExport = filteredSessions.filter(s => selectedIds.has(s.session_id));
    const rows = [
      ["Session ID", "Subject", "Difficulty", "Score", "Accuracy", "Questions", "Date"],
      ...toExport.map(s => [
        s.session_id.slice(0, 8),
        s.subject_name,
        s.difficulty,
        `${s.total_score}/10`,
        `${s.accuracy}%`,
        s.total_questions,
        s.ended_at ? new Date(s.ended_at).toLocaleDateString() : "—",
      ]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `session_log_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-4xl mx-auto w-full">

      {/* Header */}
      <div className="mb-8 pb-6 hairline">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-headline text-ink-muted hover:text-accent snap-transition"
          >
            <ArrowLeft className="w-3 h-3" />
            Dashboard
          </Link>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-2xl font-bold text-ink mb-1">
              Session Log
            </h1>
            <p className="font-body text-ink-muted text-sm">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} completed
            </p>
          </div>
          <Link
            href="/question-practice"
            className="flex items-center gap-2 bg-ink text-surface-raised px-4 py-2 rounded-sm font-headline text-sm font-medium hover:bg-accent-hover snap-transition"
          >
            New Session
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-ink-muted" />
        {(["all", "strong", "weak"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "px-3 py-1.5 rounded-sm text-xs font-headline font-medium border snap-transition capitalize",
              filter === f
                ? "bg-ink text-surface-raised border-ink"
                : "text-ink-muted border-border hover:border-border-strong"
            )}
          >
            {f === "all" ? "All Sessions" : f === "strong" ? "Strong (7+)" : "Needs Work (<5)"}
          </button>
        ))}
      </div>

      {/* Session List */}
        {/* Bulk Actions */}
          {filteredSessions.length > 0 && (
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedIds(
                    selectedIds.size === filteredSessions.length
                      ? new Set()
                      : new Set(filteredSessions.map(s => s.session_id))
                  )}
                  className="font-headline text-xs text-ink-muted hover:text-accent snap-transition"
                >
                  {selectedIds.size === filteredSessions.length ? "Deselect All" : "Select All"}
                </button>
                {selectedIds.size > 0 && (
                  <span className="font-body text-xs text-ink-faint">
                    {selectedIds.size} selected
                  </span>
                )}
              </div>
              {selectedIds.size > 0 && (
                <button
                  onClick={exportSelectedCSV}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-sm font-headline text-xs font-medium text-ink-muted hover:text-ink hover:border-border-strong snap-transition"
                >
                  <Download className="w-3 h-3" />
                  Export Selected CSV
                </button>
              )}
            </div>
          )}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-surface-alt rounded-sm animate-pulse" />
          ))}
        </div>
      ) : filteredSessions.length === 0 ? (
        <div className="section-card p-12 text-center">
          <BookOpen className="w-10 h-10 text-ink-faint mx-auto mb-4" />
          <p className="font-headline text-base font-semibold text-ink mb-2">
            {filter === "all" ? "No sessions yet" : `No ${filter} sessions`}
          </p>
          <p className="font-body text-sm text-ink-muted mb-6">
            {filter === "all"
              ? "Complete your first practice session to see it here."
              : "Adjust the filter to see other sessions."}
          </p>
          {filter === "all" && (
            <Link
              href="/question-practice"
              className="inline-flex items-center gap-2 bg-ink text-surface-raised px-5 py-2.5 rounded-sm font-headline text-sm font-medium hover:bg-accent-hover snap-transition"
            >
              Start Practicing
            </Link>
          )}
        </div>
      ) : (
        <div className="section-card divide-y divide-border">
          {filteredSessions.map((session, idx) => (
            <Link
              key={session.session_id}
              href={`/results/${session.session_id}`}
              className="flex items-center justify-between p-5 hover:bg-surface-alt snap-transition group"
            >
              <div className="flex items-center gap-4">
                {/* Session Number */}
                <div
                    onClick={e => {
                      e.preventDefault();
                      setSelectedIds(prev => {
                        const next = new Set(prev);
                        next.has(session.session_id) ? next.delete(session.session_id) : next.add(session.session_id);
                        return next;
                      });
                    }}
                    className={clsx(
                      "w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center snap-transition",
                      selectedIds.has(session.session_id)
                        ? "bg-accent border-accent"
                        : "border-border-strong"
                    )}
                  >
                    {selectedIds.has(session.session_id) && (
                      <CheckCircle2 className="w-3 h-3 text-surface-raised" />
                    )}
                  </div>
                <div className="w-8 h-8 rounded-sm bg-surface-alt border border-border flex items-center justify-center flex-shrink-0">
                  <span className="font-headline text-xs font-bold text-ink-muted">
                    {sessions.length - idx}
                  </span>
                </div>

                <div>
                  <p className="font-headline text-sm font-semibold text-ink group-hover:text-accent snap-transition">
                    {session.subject_name}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="font-body text-xs text-ink-faint capitalize">
                      {session.difficulty}
                    </span>
                    <span className="font-body text-xs text-ink-faint">
                      {session.total_questions} questions
                    </span>
                    <span className="font-body text-xs text-ink-faint flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {session.ended_at ? timeAgo(session.ended_at) : "—"}
                    </span>
                  </div>

                  {/* Weak subtopics preview */}
                  {session.weak_subtopics?.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="font-body text-xs text-danger">
                        Weak: {session.weak_subtopics.slice(0, 2).map((w: any) => w.subtopic_name).join(", ")}
                        {session.weak_subtopics.length > 2 && ` +${session.weak_subtopics.length - 2}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Score + Arrow */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <span className={clsx(
                    "font-headline text-sm font-bold px-2 py-1 rounded-sm border",
                    getScoreStyle(session.total_score)
                  )}>
                    {session.total_score}/10
                  </span>
                  <p className="font-body text-xs text-ink-faint mt-1">
                    {session.accuracy}% accuracy
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-faint group-hover:text-accent snap-transition" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}