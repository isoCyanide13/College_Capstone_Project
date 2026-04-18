"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface SkillData {
  subject: string;
  A: number;
  fullMark: number;
}

const data: SkillData[] = [
  { subject: "Algorithms", A: 85, fullMark: 100 },
  { subject: "Data Structures", A: 90, fullMark: 100 },
  { subject: "System Design", A: 70, fullMark: 100 },
  { subject: "Communication", A: 80, fullMark: 100 },
  { subject: "Problem Solving", A: 95, fullMark: 100 },
  { subject: "Code Quality", A: 75, fullMark: 100 },
];

export default function SkillRadar() {
  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#E0DCD6" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#6B6B6B", fontSize: 12, fontFamily: "var(--font-headline)" }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E0DCD6",
              borderRadius: "2px",
              color: "#1A1A1A",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
            }}
          />
          <Radar
            name="Skill Level"
            dataKey="A"
            stroke="#8B7355"
            strokeWidth={2}
            fill="#8B7355"
            fillOpacity={0.15}
            dot={{ r: 3, fill: "#8B7355", strokeWidth: 0 }}
            activeDot={{ r: 5, fill: "#6F5B42", strokeWidth: 2, stroke: "#FFFFFF" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
