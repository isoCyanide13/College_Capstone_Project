"use client";

import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import { ChevronRight, ChevronLeft, BarChart3 } from "lucide-react"; // ➕ Added BarChart3

// ─── Curriculum Structure (mirrors curriculum.ts) ─────────────────
const DOMAIN_STRUCTURE = [
  {
    id: "core_cs",
    name: "Core Computer Science",
    color: "#8B7355",
    fillColor: "rgba(139, 115, 85, 0.15)",
    subjects: [
      { id: "dsa", name: "DSA" },
      { id: "os", name: "Op. Systems" },
      { id: "dbms", name: "DBMS" },
      { id: "cn", name: "Networks" },
      { id: "oops", name: "OOP" },
      { id: "se", name: "Soft. Engg" },
      { id: "system_design", name: "Sys. Design" },
    ],
  },
  {
    id: "placement_prep",
    name: "Placement Preparation",
    color: "#5B8A6B",
    fillColor: "rgba(91, 138, 107, 0.15)",
    subjects: [
      { id: "aptitude", name: "Aptitude" },
      { id: "guesstimation", name: "Guesstimate" },
      { id: "case_study", name: "Case Study" },
    ],
  },
];

// Subject full names for display
const SUBJECT_FULL_NAMES: Record<string, string> = {
  dsa: "Data Structures & Algorithms",
  os: "Operating Systems",
  dbms: "Database Management",
  cn: "Computer Networks",
  oops: "Object Oriented Programming",
  se: "Software Engineering",
  system_design: "System Design",
  aptitude: "Aptitude & Reasoning",
  guesstimation: "Guesstimation",
  case_study: "Case Studies",
};

interface SkillRadarProps {
  skillScores?: Record<string, number>;
}

// ─── Color based on score ──────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 7) return "#5B8A6B";  // green — strong
  if (score >= 4) return "#C49A3C";  // amber — moderate
  if (score > 0) return "#B05E5E";   // red — weak
  return "#C8C0B4";                   // gray — not attempted
}

// ─── Custom Tooltip ───────────────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const realScore = (value / 10).toFixed(1);
    return (
      <div className="bg-white border border-border rounded-sm px-3 py-2 shadow-sm">
        <p className="font-headline text-xs font-semibold text-ink">
          {payload[0].name}
        </p>
        <p className="font-body text-sm text-ink">
          {value === 0 ? "Not attempted" : `${realScore}/10`}
        </p>
      </div>
    );
  }
  return null;
}

export default function SkillRadar({ skillScores }: SkillRadarProps) {
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [view, setView] = useState<"domain" | "subject">("domain");

  // ─── Level 1: Domain scores (average of subjects) ───────────────
  const domainData = DOMAIN_STRUCTURE.map(domain => {
    const subjectScores = domain.subjects.map(s =>
      skillScores?.[s.id] ?? 0
    );
    const attempted = subjectScores.filter(s => s > 0);
    const avg = attempted.length > 0
      ? attempted.reduce((a, b) => a + b, 0) / attempted.length
      : 0;
    return {
      domain: domain.name,
      score: Math.round(avg * 10), // 0-100
      rawScore: Math.round(avg * 10) / 10,
      attempted: attempted.length,
      total: domain.subjects.length,
      color: domain.color,
      id: domain.id,
    };
  });

  // ─── Level 2: Subject scores within selected domain ─────────────
  const getSubjectData = (domainId: string) => {
    const domain = DOMAIN_STRUCTURE.find(d => d.id === domainId);
    if (!domain) return [];
    return domain.subjects.map(s => ({
      subject: s.name,
      fullName: SUBJECT_FULL_NAMES[s.id] || s.name,
      score: Math.round((skillScores?.[s.id] ?? 0) * 10),
      rawScore: skillScores?.[s.id] ?? 0,
      id: s.id,
      color: getScoreColor(skillScores?.[s.id] ?? 0),
    }));
  };

  const hasAnyData = Object.values(skillScores ?? {}).some(v => v > 0);
  const currentDomain = DOMAIN_STRUCTURE.find(d => d.id === selectedDomain);
  const subjectData = selectedDomain ? getSubjectData(selectedDomain) : [];

  return (
    <div className="w-full h-full flex flex-col">

      {/* ─── Level Tabs ─── */}
      <div className="flex items-center gap-3 mb-4">
        {view === "subject" && (
          <button
            onClick={() => { setView("domain"); setSelectedDomain(null); }}
            className="flex items-center gap-1 text-xs font-headline text-ink-muted hover:text-accent snap-transition"
          >
            <ChevronLeft className="w-3 h-3" />
            All Domains
          </button>
        )}
        <div className="flex gap-2">
          <span className={`text-xs font-headline font-semibold px-2 py-1 rounded-sm border ${
            view === "domain"
              ? "bg-ink text-surface-raised border-ink"
              : "text-ink-muted border-border"
          }`}>
            {/* 🔄 Replaced 📊 emoji with BarChart3 icon */}
            {view === "domain" ? (
              <><BarChart3 className="w-3.5 h-3.5 inline-block mr-1" />Domain Overview</>
            ) : (
              <><BarChart3 className="w-3.5 h-3.5 inline-block mr-1" />{currentDomain?.name}</>
            )}
          </span>
        </div>
        {!hasAnyData && (
          <span className="text-xs font-body text-ink-faint italic">
            Complete sessions to see real data
          </span>
        )}
      </div>

      {/* ─── View 1: Domain Radar ─── */}
      {view === "domain" && (
        <div className="flex-1 flex flex-col gap-4">

          {/* Radar Chart */}
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%" cy="50%"
                outerRadius="70%"
                data={domainData}
              >
                <PolarGrid stroke="#E0DCD6" />
                <PolarAngleAxis
                  dataKey="domain"
                  tick={{
                    fill: "#6B6B6B",
                    fontSize: 11,
                    fontFamily: "var(--font-headline)",
                  }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Radar
                  name="Domain Score"
                  dataKey="score"
                  stroke="#8B7355"
                  strokeWidth={2}
                  fill="#8B7355"
                  fillOpacity={0.15}
                  dot={{ r: 4, fill: "#8B7355", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#6F5B42", strokeWidth: 2, stroke: "#fff" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Domain Cards — clickable */}
          <div className="grid grid-cols-2 gap-2">
            {DOMAIN_STRUCTURE.map(domain => {
              const dData = domainData.find(d => d.id === domain.id);
              const score = dData?.rawScore ?? 0;
              return (
                <button
                  key={domain.id}
                  onClick={() => {
                    setSelectedDomain(domain.id);
                    setView("subject");
                  }}
                  className="flex items-center justify-between p-3 rounded-sm border border-border hover:border-border-strong bg-surface-raised snap-transition group text-left"
                >
                  <div>
                    <p className="font-headline text-xs font-semibold text-ink group-hover:text-accent snap-transition">
                      {domain.name}
                    </p>
                    <p className="font-body text-xs text-ink-faint mt-0.5">
                      {dData?.attempted}/{dData?.total} subjects attempted
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="font-headline text-sm font-bold"
                      style={{ color: score > 0 ? domain.color : "#C8C0B4" }}
                    >
                      {score > 0 ? `${score}/10` : "—"}
                    </span>
                    <ChevronRight className="w-3 h-3 text-ink-faint group-hover:text-accent snap-transition" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── View 2: Subject Bar Chart ─── */}
      {view === "subject" && selectedDomain && (
        <div className="flex-1 flex flex-col gap-4">

          {/* Bar Chart */}
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={subjectData}
                margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E0DCD6" vertical={false} />
                <XAxis
                  dataKey="subject"
                  tick={{ fill: "#6B6B6B", fontSize: 10, fontFamily: "var(--font-headline)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: "#6B6B6B", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [
                    value === 0 ? "Not attempted" : `${(value / 10).toFixed(1)}/10`,
                    "Score"
                  ]}
                  contentStyle={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E0DCD6",
                    borderRadius: "2px",
                    fontSize: "12px",
                    fontFamily: "var(--font-body)",
                  }}
                />
                <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                  {subjectData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-4 text-xs font-body">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#5B8A6B]" />
              <span className="text-ink-muted">Strong (7+)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#C49A3C]" />
              <span className="text-ink-muted">Moderate (4-7)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#B05E5E]" />
              <span className="text-ink-muted">Weak (0-4)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-[#C8C0B4]" />
              <span className="text-ink-muted">Not attempted</span>
            </div>
          </div>

          {/* Subject Score Cards */}
          <div className="grid grid-cols-2 gap-2">
            {subjectData.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between p-3 rounded-sm border border-border bg-surface-raised"
              >
                <div>
                  <p className="font-headline text-xs font-semibold text-ink">
                    {subject.fullName}
                  </p>
                  <p className="font-body text-xs mt-0.5"
                    style={{ color: subject.color }}
                  >
                    {subject.rawScore === 0
                      ? "Not attempted yet"
                      : subject.rawScore >= 7
                      ? "Strong ✓"
                      : subject.rawScore >= 4
                      ? "Moderate"
                      : "Needs work"
                    }
                  </p>
                </div>
                <span
                  className="font-headline text-sm font-bold"
                  style={{ color: subject.color }}
                >
                  {subject.rawScore === 0 ? "—" : `${subject.rawScore.toFixed(1)}/10`}
                </span>
              </div>
            ))}
          </div>

          {/* Subtopic drill-down teaser */}
          <div className="p-3 border border-border border-dashed rounded-sm text-center">
            <p className="font-body text-xs text-ink-faint">
              {/* 🔄 Replaced 📊 emoji with BarChart3 icon */}
              <BarChart3 className="w-3 h-3 inline-block mr-1" />
              Subtopic-level analysis coming soon — complete more sessions to unlock
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
