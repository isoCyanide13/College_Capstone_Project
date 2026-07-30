"use client";

import {
  Trophy,
  Target,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Circle,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, animate } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { getToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const API_BASE = "http://127.0.0.1:8000";

const spring = { type: "spring" as const, stiffness: 380, damping: 26 };

const SkillRadar = dynamic(() => import("@/components/SkillRadar"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full flex items-center justify-center text-ink-faint font-body text-sm">
      Loading chart…
    </div>
  ),
});

interface RecentSession {
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

interface DashboardStats {
  user_name: string;
  total_sessions: number;
  avg_score: number;
  total_hours: number;
  recent_sessions: RecentSession[];
  skill_scores: Record<string, number>;
  weak_subjects: { subject: string; score: number }[];
  strong_subjects: { subject: string; score: number }[];
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function formatSubject(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());
}

/* Count-up number for the stat cards. Only mounts once loading is
   false, so it plays once real data arrives instead of animating
   from a placeholder. */
function AnimatedStat({
  value,
  decimals = 0,
  suffix = "",
}: {
  value: number;
  decimals?: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 0.8,
      ease: [0.34, 1.56, 0.64, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span className="font-precise">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = getToken();
        if (!token) {
          router.push("/login");
          return;
        }
        const res = await fetch(`${API_BASE}/api/sessions/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to load dashboard:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Overall Score",
      raw: stats?.avg_score ?? 0,
      decimals: 1,
      suffix: "/10",
      icon: Trophy,
      accent: "text-warning",
    },
    {
      label: "Sessions Done",
      raw: stats?.total_sessions ?? 0,
      decimals: 0,
      suffix: "",
      icon: Target,
      accent: "text-success",
    },
    {
      label: "Subjects Practiced",
      raw: stats
        ? Object.values(stats.skill_scores).filter(v => v > 0).length
        : 0,
      decimals: 0,
      suffix: "",
      icon: BookOpen,
      accent: "text-accent",
    },
    {
      label: "Practice Time",
      raw: stats?.total_hours ?? 0,
      decimals: 0,
      suffix: "h",
      icon: Clock,
      accent: "text-ink-muted",
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 hairline">
        <div>
          <h1 className="font-headline text-2xl font-bold text-ink mb-1">
            Welcome back, {user?.name || "there"}
          </h1>
          <p className="font-body text-ink-muted text-sm">
            {loading
              ? "Loading your progress..."
              : stats?.total_sessions === 0
              ? "No sessions yet. Start practicing to see your stats!"
              : `${stats?.total_sessions} session${stats?.total_sessions !== 1 ? "s" : ""} completed`
            }
          </p>
        </div>
        <motion.div
          whileHover={{ y: -3 }}
          whileTap={{ y: 0, scale: 0.96 }}
          transition={spring}
        >
          <Link
            href="/question-practice"
            className="hidden sm:flex items-center gap-2 bg-ink text-surface-raised px-5 py-2.5 notch font-headline font-medium text-sm snap-transition hover:bg-accent-hover"
          >
            Start Practice
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-8">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              transition={spring}
              className="relative bg-surface-raised p-5 flex items-center gap-4 grid-texture overflow-hidden"
            >
              <div className="w-10 h-10 notch-sm bg-surface-alt flex items-center justify-center flex-shrink-0 relative z-[1]">
                <Icon className={`w-5 h-5 ${stat.accent}`} />
              </div>
              <div className="relative z-[1]">
                <p className="text-xs font-headline text-ink-muted uppercase tracking-wider mb-0.5">
                  {stat.label}
                </p>
                <p className="text-xl font-headline font-bold text-ink tracking-tight">
                  {loading ? (
                    <span className="inline-block w-12 h-5 bg-surface-alt rounded animate-pulse" />
                  ) : (
                    <AnimatedStat value={stat.raw} decimals={stat.decimals} suffix={stat.suffix} />
                  )}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Chart Area */}
        <div className="lg:col-span-2 space-y-8">
          <div className="section-card p-6">
            <h2 className="font-headline text-base font-semibold text-ink mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-accent" />
              Skill Breakdown
            </h2>
            <div className="min-h-[400px] h-auto">
              <SkillRadar skillScores={stats?.skill_scores} />
            </div>
          </div>

          {/* Weak vs Strong */}
          {stats && (stats.weak_subjects.length > 0 || stats.strong_subjects.length > 0) && (
            <div className="grid grid-cols-2 gap-4">
              {/* Strong */}
              {stats.strong_subjects.length > 0 && (
                <div className="section-card p-5">
                  <h3 className="font-headline text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    Strong Areas
                  </h3>
                  <div className="space-y-3">
                    {stats.strong_subjects.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="font-body text-sm text-ink">
                          {formatSubject(s.subject)}
                        </span>
                        <span className="font-headline text-xs font-bold text-success bg-green-50 border border-green-200 px-2 py-0.5 rounded-sm">
                          {s.score}/10
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Weak */}
              {stats.weak_subjects.length > 0 && (
                <div className="section-card p-5">
                  <h3 className="font-headline text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-danger" />
                    Needs Work
                  </h3>
                  <div className="space-y-3">
                    {stats.weak_subjects.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="font-body text-sm text-ink">
                          {formatSubject(s.subject)}
                        </span>
                        <span className="font-headline text-xs font-bold text-danger bg-red-50 border border-red-200 px-2 py-0.5 rounded-sm">
                          {s.score}/10
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">

          {/* Recent Sessions */}
          <div className="section-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-headline text-base font-semibold text-ink">
                Recent Sessions
              </h2>
              <Link
                href="/sessions"
                className="font-headline text-xs text-accent hover:underline"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 bg-surface-alt rounded animate-pulse" />
                ))}
              </div>
            ) : stats?.recent_sessions.length === 0 ? (
              <div className="text-center py-6">
                <BookOpen className="w-8 h-8 text-ink-faint mx-auto mb-2" />
                <p className="font-body text-sm text-ink-muted">No sessions yet</p>
                <Link
                  href="/question-practice"
                  className="font-headline text-xs text-accent hover:underline mt-1 inline-block"
                >
                  Start your first session →
                </Link>
              </div>
            ) : (
              <div className="space-y-0">
                {stats?.recent_sessions.map((session, idx) => (
                  <motion.div
                    key={session.session_id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...spring, delay: idx * 0.06 }}
                  >
                    <Link
                      href={`/results/${session.session_id}`}
                      className="py-4 group block"
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-headline text-sm font-medium text-ink group-hover:text-accent snap-transition">
                          {session.subject_name}
                        </h3>
                        <span className={clsx(
                          "font-headline text-xs font-semibold px-2 py-0.5 rounded-sm ml-2 flex-shrink-0",
                          session.total_score >= 7
                            ? "text-success bg-green-50 border border-green-200"
                            : session.total_score >= 5
                            ? "text-warning bg-amber-50 border border-amber-200"
                            : "text-danger bg-red-50 border border-red-200"
                        )}>
                          {session.total_score}/10
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-body text-ink-faint">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {session.ended_at ? timeAgo(session.ended_at) : "—"}
                        </span>
                        <span className="capitalize">{session.difficulty}</span>
                      </div>
                    </Link>
                    {idx < (stats?.recent_sessions.length ?? 0) - 1 && (
                      <div className="hairline" />
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Recommended Focus */}
          <div className="section-card p-6">
            <h2 className="font-headline text-base font-semibold text-ink mb-5">
              Recommended Focus
            </h2>
            {stats?.weak_subjects.length === 0 && stats?.total_sessions === 0 ? (
              <p className="font-body text-sm text-ink-muted">
                Complete a session to get personalized recommendations.
              </p>
            ) : stats?.weak_subjects.length === 0 ? (
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <p className="font-body text-sm text-ink-muted">
                  Great work! Keep practicing to maintain your scores.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.weak_subjects.map((s, i) => (
                  <div key={i}>
                    {i > 0 && <div className="hairline mb-4" />}
                    <div className="flex items-start gap-3">
                      <Circle className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-headline text-sm font-medium text-ink">
                          {formatSubject(s.subject)}
                        </h4>
                        <p className="font-body text-xs text-ink-muted mt-0.5 leading-relaxed">
                          Current score {s.score}/10. Practice more to improve.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}