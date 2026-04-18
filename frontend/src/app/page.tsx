"use client";

import Link from "next/link";
import { ArrowRight, Code2, Bot, ShieldCheck, BarChart3 } from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";

const features = [
  {
    icon: Bot,
    title: "AI Interviewer Panel",
    description:
      "Face a multi-member panel that asks contextual follow-ups, remembers prior answers, and challenges contradictions.",
  },
  {
    icon: Code2,
    title: "Live Code Execution",
    description:
      "Write, test, and run your code in an integrated editor with real-time test case validation and AI code review.",
  },
  {
    icon: ShieldCheck,
    title: "Proctoring Simulation",
    description:
      "Experience gaze tracking, tab monitoring, and behavioral analysis — the same measures used by top-tier companies.",
  },
  {
    icon: BarChart3,
    title: "Adaptive Skill Vectors",
    description:
      "Receive per-topic skill diagnosis, difficulty scaling, and targeted training plans based on your performance.",
  },
];

export default function Home() {
  const { displayText, cursorVisible } = useTypewriter({
    text: "Mock Interview Simulator Using Artificial Intelligence",
    speed: 55,
    startDelay: 300,
  });

  return (
    <div className="flex flex-col flex-1 items-center justify-start">
      {/* ─── Hero Section ─── */}
      <section
        id="hero"
        className="w-full max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 pt-16 md:pt-28 pb-20"
      >
        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-border rounded-sm text-ink-muted mb-10 font-headline text-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          Platform Phase 1 — Now Live
        </div>

        {/* Typewriter Headline */}
        <div className="min-h-[4.5rem] md:min-h-[7rem] flex items-center justify-center mb-8">
          <h1
            id="main-headline"
            className="font-typewriter text-4xl md:text-6xl leading-tight text-ink"
          >
            {displayText}
            {cursorVisible && <span className="typewriter-cursor" />}
          </h1>
        </div>

        <p className="font-body text-lg md:text-xl text-ink-muted leading-relaxed max-w-2xl mx-auto mb-12">
          A structured technical interview environment powered by adaptive AI.
          Voice-first interaction, real-time code evaluation, and deep
          performance analytics — practice like the real thing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            id="cta-register"
            href="/register"
            className="flex items-center gap-2 bg-ink text-surface-raised px-8 py-3.5 rounded-sm font-headline font-semibold text-base snap-transition hover:bg-accent-hover"
          >
            Start Practicing Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            id="cta-guest"
            href="/interview"
            className="flex items-center gap-2 border border-border-strong text-ink px-8 py-3.5 rounded-sm font-headline font-medium text-base snap-transition hover:border-ink hover:bg-surface-alt"
          >
            Try Guest Interview
          </Link>
        </div>
      </section>

      {/* ─── Hairline Divider ─── */}
      <div className="w-full max-w-6xl mx-auto hairline" />

      {/* ─── Features Grid ─── */}
      <section
        id="features"
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <h2 className="font-headline font-bold text-2xl text-ink text-center mb-3">
          Platform Capabilities
        </h2>
        <p className="font-body text-ink-muted text-center max-w-xl mx-auto mb-14">
          Every component designed to replicate the pressure and structure of
          real technical interviews.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                id={`feature-${idx}`}
                className="bg-surface p-8 flex flex-col items-start text-left group"
              >
                <div className="w-10 h-10 rounded-sm bg-accent-light flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-headline font-semibold text-base text-ink mb-2">
                  {feature.title}
                </h3>
                <p className="font-body text-sm text-ink-muted leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── Bottom Divider ─── */}
      <div className="w-full max-w-6xl mx-auto hairline" />

      {/* ─── Footer Note ─── */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="font-typewriter text-sm text-ink-faint">
          Capstone Project — AI-Powered Interview Simulation System
        </p>
      </footer>
    </div>
  );
}
