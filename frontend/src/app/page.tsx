"use client";

import Link from "next/link";
import {
  ArrowRight, Code2, Bot, ShieldCheck,
  BarChart3, Zap, BookOpen, Clock, ChevronRight
} from "lucide-react";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useEffect, useState, useRef } from "react";

const features = [
  {
    icon: Bot,
    title: "AI Interviewer Panel",
    description: "Face a multi-member AI panel that asks contextual follow-ups, remembers prior answers, and challenges contradictions in real time.",
    accent: "accent",
    tag: "Phase 2",
    tagColor: "teal",
  },
  {
    icon: Code2,
    title: "Live Code Execution",
    description: "Write, test, and run code in an integrated editor with real-time test case validation and AI code review.",
    accent: "accent",
    tag: "Phase 2",
    tagColor: "teal",
  },
  {
    icon: BarChart3,
    title: "Adaptive Skill Vectors",
    description: "Per-topic skill diagnosis with EMA tracking. Your score reflects recent performance, not just history.",
    accent: "accent",
    tag: "Live",
    tagColor: "success",
  },
  {
    icon: ShieldCheck,
    title: "Proctoring Simulation",
    description: "Gaze tracking, tab monitoring, and behavioural analysis — the same measures used by top-tier companies.",
    accent: "accent",
    tag: "Phase 2",
    tagColor: "teal",
  },
];

const stats = [
  { value: "27", label: "Subjects" },
  { value: "200+", label: "Subtopics" },
  { value: "7", label: "Domains" },
  { value: "∞", label: "Questions" },
];

// Counter hook for arcade stat animation
function useCounter(target: number, duration: number = 1200, start: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    const steps = 40;
    const increment = target / steps;
    const interval = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, interval);
    return () => clearInterval(timer);
  }, [target, duration, start]);
  return count;
}

export default function Home() {
  const { displayText, cursorVisible } = useTypewriter({
    text: "Interview Simulator Using Artificial Intelligence",
    speed: 48,
    startDelay: 400,
  });

  const [statsVisible, setStatsVisible] = useState(false);
  const [featuresVisible, setFeaturesVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.target === statsRef.current && e.isIntersecting) setStatsVisible(true);
          if (e.target === featuresRef.current && e.isIntersecting) setFeaturesVisible(true);
        });
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex flex-col flex-1 items-center justify-start relative z-10">

      {/* ─── Hero ─── */}
      <section className="w-full max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 pt-16 md:pt-28 pb-24">

        {/* Phase badge */}
        <div className="animate-slide-up opacity-0" style={{animationDelay: '100ms', animationFillMode: 'forwards'}}>
          <div className="phase-badge mx-auto w-fit mb-10">
            <span className="live-dot" />
            Platform Phase 1 — Live Now
          </div>
        </div>

        {/* MockAI wordmark */}
        <div className="animate-slide-up opacity-0 mb-6" style={{animationDelay: '200ms', animationFillMode: 'forwards'}}>
          <div className="inline-flex items-baseline gap-1 mb-4">
            <span className="font-headline font-extrabold text-6xl md:text-8xl tracking-tight text-ink">
              Mock
            </span>
            <span className="font-headline font-extrabold text-6xl md:text-8xl tracking-tight text-teal">
              AI
            </span>
          </div>
        </div>

        {/* Typewriter subtitle */}
        <div
          className="animate-slide-up opacity-0 min-h-[3.5rem] md:min-h-[5rem] flex items-center justify-center mb-8"
          style={{animationDelay: '300ms', animationFillMode: 'forwards'}}
        >
          <h1 className="font-typewriter text-xl md:text-3xl text-ink-muted leading-snug max-w-2xl">
            {displayText}
            {cursorVisible && <span className="typewriter-cursor" />}
          </h1>
        </div>

        {/* Description */}
        <div className="animate-slide-up opacity-0 mb-12" style={{animationDelay: '400ms', animationFillMode: 'forwards'}}>
          <p className="font-body text-base md:text-lg text-ink-muted leading-relaxed max-w-xl mx-auto">
            Adaptive AI generates fresh questions every session, evaluates
            your answers with expert-level feedback, and tracks your skill
            progression over time.
          </p>
        </div>

        {/* CTAs */}
        <div
          className="animate-slide-up opacity-0 flex flex-col sm:flex-row items-center justify-center gap-3"
          style={{animationDelay: '500ms', animationFillMode: 'forwards'}}
        >
          <Link href="/register" className="aero-btn px-8 py-3.5 text-base">
            Start Practicing Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/login" className="ghost-btn px-8 py-3.5 text-base">
            Sign In
          </Link>
        </div>

        {/* Quick feature tags */}
        <div
          className="animate-fade-in opacity-0 flex flex-wrap items-center justify-center gap-2 mt-10"
          style={{animationDelay: '700ms', animationFillMode: 'forwards'}}
        >
          {["MCQ + Theory", "AI Evaluation", "Skill Tracking", "PDF Export", "27 Subjects"].map(tag => (
            <span key={tag} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm border border-border bg-surface-raised font-headline text-xs text-ink-muted">
              <Zap className="w-2.5 h-2.5 text-teal" />
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <div className="w-full hairline" />
      <div ref={statsRef} className="w-full max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-4 divide-x divide-border">
          {stats.map((stat, i) => (
            <div key={stat.label} className="py-10 text-center">
              <div className="arcade-score font-mono text-3xl md:text-4xl font-bold text-ink mb-1">
                {stat.value}
              </div>
              <div className="arcade-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full hairline" />

      {/* ─── How it works ─── */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-teal tracking-widest uppercase mb-3">
            01 / HOW IT WORKS
          </p>
          <h2 className="font-headline font-bold text-2xl md:text-3xl text-ink mb-4">
            From zero to interview-ready
          </h2>
          <p className="font-body text-ink-muted max-w-lg mx-auto">
            A structured practice loop designed around how real interviews work.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: BookOpen,
              title: "Configure Your Session",
              desc: "Select domain, subject, subtopics, difficulty, and question type. AI tailors everything to your exact focus.",
            },
            {
              step: "02",
              icon: Clock,
              title: "Practice Under Pressure",
              desc: "Dual timers, mark-for-review, free navigation. The quiz interface mirrors real examination conditions.",
            },
            {
              step: "03",
              icon: BarChart3,
              title: "Receive Expert Feedback",
              desc: "AI evaluates every answer, identifies weak subtopics, and updates your skill vector using EMA scoring.",
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="section-card p-7 card-lift scan-hover relative"
              >
                {/* Step number — arcade style */}
                <div className="font-mono text-xs font-bold text-ink-faint tracking-widest mb-5">
                  {item.step}
                </div>
                <div className="w-10 h-10 rounded-sm bg-accent-light flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="font-headline font-semibold text-base text-ink mb-2">
                  {item.title}
                </h3>
                <p className="font-body text-sm text-ink-muted leading-relaxed">
                  {item.desc}
                </p>
                {/* Corner accent */}
                {i === 2 && (
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-teal opacity-40 rounded-sm" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="w-full hairline" />

      {/* ─── Features Grid ─── */}
      <section
        ref={featuresRef}
        className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24"
      >
        <div className="text-center mb-16">
          <p className="font-mono text-xs text-teal tracking-widest uppercase mb-3">
            02 / PLATFORM CAPABILITIES
          </p>
          <h2 className="font-headline font-bold text-2xl md:text-3xl text-ink mb-4">
            Built for the real thing
          </h2>
          <p className="font-body text-ink-muted max-w-lg mx-auto">
            Every component designed to replicate the pressure and depth
            of actual technical interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            const isLive = feature.tagColor === "success";
            return (
              <div
                key={idx}
                className={`section-card p-7 card-lift scan-hover relative overflow-hidden ${featuresVisible ? 'animate-slide-up' : 'opacity-0'}`}
                style={{animationDelay: `${idx * 80}ms`, animationFillMode: 'forwards'}}
              >
                {/* Tag */}
                <div className="absolute top-5 right-5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-headline font-semibold border ${
                    isLive
                      ? "bg-success/8 border-success/30 text-success"
                      : "bg-teal-light border-teal/20 text-teal"
                  }`}>
                    {isLive && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
                    {feature.tag}
                  </span>
                </div>

                <div className={`w-10 h-10 rounded-sm flex items-center justify-center mb-5 ${
                  isLive ? "bg-accent-light" : "bg-teal-light"
                }`}>
                  <Icon className={`w-5 h-5 ${isLive ? "text-accent" : "text-teal"}`} />
                </div>

                <h3 className="font-headline font-semibold text-base text-ink mb-2 pr-16">
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

      <div className="w-full hairline" />

      {/* ─── CTA Section ─── */}
      <section className="w-full max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="section-card p-12 pixel-grid relative overflow-hidden">
          {/* Ambient teal corner */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-30"
            style={{background: 'radial-gradient(circle at top right, rgba(13,148,136,0.2), transparent 70%)'}} />

          <p className="font-mono text-xs text-teal tracking-widest uppercase mb-4">
            03 / GET STARTED
          </p>
          <h2 className="font-headline font-bold text-2xl md:text-3xl text-ink mb-4">
            Your next interview is closer than you think
          </h2>
          <p className="font-body text-ink-muted max-w-md mx-auto mb-8">
            Start with a free session. No credit card. No setup. Just you,
            the AI, and a question set built for your exact focus area.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="aero-btn px-10 py-3.5 text-base">
              Begin Practicing
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/question-practice" className="ghost-btn px-10 py-3.5 text-base">
              Explore Questions
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="w-full max-w-5xl mx-auto px-4 pb-12">
        <div className="hairline mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-sm bg-ink flex items-center justify-center">
              <span className="font-mono text-[9px] font-bold text-surface">AI</span>
            </div>
            <span className="font-headline font-bold text-sm text-ink">
              Mock<span className="text-teal">AI</span>
            </span>
          </div>
          <p className="font-typewriter text-xs text-ink-faint">
            Capstone Project — UIET, Panjab University Chandigarh
          </p>
          <div className="flex items-center gap-1 font-mono text-xs text-ink-faint">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Phase 1 Live
          </div>
        </div>
      </footer>
    </div>
  );
}