"use client";

import {
  Trophy,
  Target,
  Flame,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Circle,
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

const SkillRadar = dynamic(() => import("@/components/SkillRadar"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full flex items-center justify-center text-ink-faint font-body text-sm">
      Loading chart…
    </div>
  ),
});

const stats = [
  { label: "Overall Score", value: "88/100", icon: Trophy, accent: "text-warning" },
  { label: "Sessions Done", value: "12", icon: Target, accent: "text-success" },
  { label: "Current Streak", value: "4 Days", icon: Flame, accent: "text-accent" },
  { label: "Practice Time", value: "18h", icon: Clock, accent: "text-ink-muted" },
];

const recentActivity = [
  {
    id: 1,
    title: "Senior Frontend Engineer Interview",
    date: "2 days ago",
    score: 92,
    improvement: "+4",
  },
  {
    id: 2,
    title: "Systems Design (Distributed)",
    date: "5 days ago",
    score: 78,
    improvement: "-2",
  },
  {
    id: 3,
    title: "Data Structures & Algorithms",
    date: "1 week ago",
    score: 85,
    improvement: "+10",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 hairline">
        <div>
          <h1 className="font-headline text-2xl font-bold text-ink mb-1">
            Welcome back, Alex
          </h1>
          <p className="font-body text-ink-muted text-sm">
            Here is your progress overview.
          </p>
        </div>
        <Link
          href="/interview"
          id="start-session-btn"
          className="hidden sm:flex items-center gap-2 bg-ink text-surface-raised px-5 py-2.5 rounded-sm font-headline font-medium text-sm snap-transition hover:bg-accent-hover"
        >
          Start New Session
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              id={`stat-${idx}`}
              className="bg-surface-raised p-5 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-sm bg-surface-alt flex items-center justify-center flex-shrink-0">
                <Icon className={`w-5 h-5 ${stat.accent}`} />
              </div>
              <div>
                <p className="text-xs font-headline text-ink-muted uppercase tracking-wider mb-0.5">
                  {stat.label}
                </p>
                <p className="text-xl font-headline font-bold text-ink tracking-tight">
                  {stat.value}
                </p>
              </div>
            </div>
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
            <div className="h-[350px]">
              <SkillRadar />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="section-card p-6">
            <h2 className="font-headline text-base font-semibold text-ink mb-5">
              Recent Sessions
            </h2>
            <div className="space-y-0">
              {recentActivity.map((activity, idx) => (
                <div key={activity.id}>
                  <div className="py-4 group">
                    <div className="flex justify-between items-start mb-1.5">
                      <h3 className="font-headline text-sm font-medium text-ink group-hover:text-accent snap-transition">
                        {activity.title}
                      </h3>
                      <span className="font-headline text-xs font-semibold text-accent bg-accent-light px-2 py-0.5 rounded-sm ml-2 flex-shrink-0">
                        {activity.score}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-body text-ink-faint">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {activity.date}
                      </span>
                      <span
                        className={`font-headline font-medium ${
                          activity.improvement.startsWith("+")
                            ? "text-success"
                            : "text-danger"
                        }`}
                      >
                        {activity.improvement}
                      </span>
                    </div>
                  </div>
                  {idx < recentActivity.length - 1 && (
                    <div className="hairline" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Focus */}
          <div className="section-card p-6">
            <h2 className="font-headline text-base font-semibold text-ink mb-5">
              Recommended Focus
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Circle className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-headline text-sm font-medium text-ink">
                    System Design Patterns
                  </h4>
                  <p className="font-body text-xs text-ink-muted mt-0.5 leading-relaxed">
                    Your score is currently 70. Practice load balancing
                    concepts.
                  </p>
                </div>
              </div>
              <div className="hairline" />
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-headline text-sm font-medium text-ink">
                    Tree Traversal Algorithms
                  </h4>
                  <p className="font-body text-xs text-ink-muted mt-0.5 leading-relaxed">
                    Completed 3 practice sets yesterday.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
