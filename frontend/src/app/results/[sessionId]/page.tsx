"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Trophy, Clock, Target, TrendingUp, TrendingDown,
  CheckCircle2, XCircle, ChevronDown, ChevronUp,
  ArrowRight, BookOpen, AlertCircle, Download,
  Star, MessageSquare, ThumbsUp, ThumbsDown,
} from "lucide-react";
import clsx from "clsx";
import { getToken } from "@/lib/auth";

const API_BASE = "http://127.0.0.1:8000";

interface EvaluationResult {
  question: string;
  question_type: string;
  user_answer: string;
  correct_answer: string;
  score: number;
  is_correct: boolean;
  feedback: string;
  strengths: string[];
  weaknesses: string[];
  time_taken: number;
  subtopic_id: string;
  subtopic_name: string;
}

interface SessionReport {
  session_id: string;
  subject_name: string;
  difficulty: string;
  total_score: number;
  accuracy: number;
  total_questions: number;
  correct_count: number;
  total_time_seconds: number;
  evaluations: EvaluationResult[];
  weak_subtopics: any[];
  strong_subtopics: string[];
  completed_at: string;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [report, setReport] = useState<SessionReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Feedback state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [difficultyOk, setDifficultyOk] = useState<boolean | null>(null);
  const [questionsOk, setQuestionsOk] = useState<boolean | null>(null);
  const [comments, setComments] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);
  const [savingFeedback, setSavingFeedback] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/report`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Report not found");
        const data = await res.json();
        setReport(data);

        // Load existing feedback
        const fbRes = await fetch(`${API_BASE}/api/sessions/${sessionId}/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (fbRes.ok) {
          const fb = await fbRes.json();
          if (fb.exists) {
            setRating(fb.overall_rating);
            setDifficultyOk(fb.difficulty_appropriate);
            setQuestionsOk(fb.questions_relevant);
            setComments(fb.comments || "");
            setFeedbackSaved(true);
          }
        }
      } catch (e) {
        setError("Could not load results.");
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [sessionId]);

  async function saveFeedback() {
    if (rating === 0) return;
    setSavingFeedback(true);
    try {
      const token = getToken();
      await fetch(`${API_BASE}/api/sessions/${sessionId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          overall_rating: rating,
          difficulty_appropriate: difficultyOk,
          questions_relevant: questionsOk,
          comments: comments || null,
        }),
      });
      setFeedbackSaved(true);
    } catch (e) {
      console.error("Failed to save feedback:", e);
    } finally {
      setSavingFeedback(false);
    }
  }

  // ─── Export CSV ───────────────────────────────────────────────────
  function exportCSV() {
    if (!report) return;
    const rows = [
      ["Session Report", report.subject_name, report.difficulty],
      ["Score", report.total_score, ""],
      ["Accuracy", `${report.accuracy}%`, ""],
      ["Correct", `${report.correct_count}/${report.total_questions}`, ""],
      ["Time", formatTime(report.total_time_seconds), ""],
      ["", "", ""],
      ["Q#", "Question", "Type", "Your Answer", "Correct Answer", "Score", "Correct?", "Feedback", "Time"],
      ...report.evaluations.map((e, i) => [
        `Q${i + 1}`,
        e.question,
        e.question_type,
        e.user_answer,
        e.correct_answer,
        `${e.score}/10`,
        e.is_correct ? "Yes" : "No",
        e.feedback,
        `${e.time_taken}s`,
      ]),
    ];

    const csvContent = rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `session_${sessionId.slice(0, 8)}_${report.subject_name.replace(/\s+/g, "_")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ─── Export PDF ───────────────────────────────────────────────────
  async function exportPDF() {
    if (!report) return;
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("Session Report Card", 14, 20);

    // Subject + Meta
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Subject: ${report.subject_name}`, 14, 32);
    doc.text(`Difficulty: ${report.difficulty}`, 14, 40);
    doc.text(`Date: ${new Date(report.completed_at).toLocaleDateString()}`, 14, 48);

    // Score summary
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Summary", 14, 62);

    autoTable(doc, {
      startY: 66,
      head: [["Metric", "Value"]],
      body: [
        ["Overall Score", `${report.total_score}/10`],
        ["Accuracy", `${report.accuracy}%`],
        ["Correct Answers", `${report.correct_count}/${report.total_questions}`],
        ["Total Time", formatTime(report.total_time_seconds)],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 30, 30] },
      margin: { left: 14 },
      tableWidth: 80,
    });

    const afterSummary = (doc as any).lastAutoTable.finalY + 10;

    // Question breakdown
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Question Breakdown", 14, afterSummary);

    autoTable(doc, {
      startY: afterSummary + 4,
      head: [["Q#", "Type", "Score", "Correct?", "Time", "Subtopic"]],
      body: report.evaluations.map((e, i) => [
        `Q${i + 1}`,
        e.question_type.toUpperCase(),
        `${e.score}/10`,
        e.is_correct ? "✓" : "✗",
        `${e.time_taken}s`,
        e.subtopic_name,
      ]),
      theme: "striped",
      headStyles: { fillColor: [30, 30, 30] },
      columnStyles: {
        3: { halign: "center" },
      },
    });

    // Weak areas
    if (report.weak_subtopics.length > 0) {
      const afterTable = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Areas to Improve", 14, afterTable);
      report.weak_subtopics.forEach((w, i) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`• ${w.subtopic_name}: ${w.score}/10`, 18, afterTable + 8 + i * 6);
      });
    }

    doc.save(`report_${report.subject_name.replace(/\s+/g, "_")}_${sessionId.slice(0, 8)}.pdf`);
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  function getScoreColor(score: number): string {
    if (score >= 8) return "text-success";
    if (score >= 5) return "text-warning";
    return "text-danger";
  }

  function getScoreBg(score: number): string {
    if (score >= 8) return "bg-green-50 border-green-200";
    if (score >= 5) return "bg-amber-50 border-amber-200";
    return "bg-red-50 border-red-200";
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-ink-muted text-sm">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-danger mx-auto mb-4" />
          <p className="font-body text-ink-muted">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-8 max-w-5xl mx-auto w-full">

      {/* ─── Header ─── */}
      <div className="mb-8 pb-6 hairline">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-headline text-2xl font-bold text-ink mb-1">Session Results</h1>
            <p className="font-body text-ink-muted text-sm">
              {report.subject_name} · {report.difficulty} difficulty
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Export Dropdown */}
            <div className="flex gap-2">
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-3 py-2 border border-border rounded-sm font-headline text-xs font-medium text-ink-muted hover:text-ink hover:border-border-strong snap-transition"
              >
                <Download className="w-3 h-3" />
                CSV
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-3 py-2 border border-border rounded-sm font-headline text-xs font-medium text-ink-muted hover:text-ink hover:border-border-strong snap-transition"
              >
                <Download className="w-3 h-3" />
                PDF
              </button>
            </div>
            <button
              onClick={() => router.push("/question-practice")}
              className="flex items-center gap-2 bg-ink text-surface-raised px-4 py-2 rounded-sm font-headline text-sm font-medium hover:bg-accent-hover snap-transition"
            >
              Practice Again
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Score Cards ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-border mb-8">
        <div className="bg-surface-raised p-5">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-warning" />
            <p className="font-headline text-xs text-ink-muted uppercase tracking-wider">Score</p>
          </div>
          <p className={clsx("font-headline text-3xl font-bold", getScoreColor(report.total_score))}>
            {report.total_score}<span className="text-lg text-ink-muted">/10</span>
          </p>
        </div>
        <div className="bg-surface-raised p-5">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-5 h-5 text-success" />
            <p className="font-headline text-xs text-ink-muted uppercase tracking-wider">Accuracy</p>
          </div>
          <p className="font-headline text-3xl font-bold text-ink">
            {report.accuracy}<span className="text-lg text-ink-muted">%</span>
          </p>
        </div>
        <div className="bg-surface-raised p-5">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-5 h-5 text-accent" />
            <p className="font-headline text-xs text-ink-muted uppercase tracking-wider">Correct</p>
          </div>
          <p className="font-headline text-3xl font-bold text-ink">
            {report.correct_count}<span className="text-lg text-ink-muted">/{report.total_questions}</span>
          </p>
        </div>
        <div className="bg-surface-raised p-5">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-5 h-5 text-ink-muted" />
            <p className="font-headline text-xs text-ink-muted uppercase tracking-wider">Time</p>
          </div>
          <p className="font-headline text-3xl font-bold text-ink">
            {formatTime(report.total_time_seconds)}
          </p>
        </div>
      </div>

      {/* ─── Strengths & Weaknesses ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {report.strong_subtopics.length > 0 && (
          <div className="section-card p-5">
            <h2 className="font-headline text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-success" />
              Strong Areas
            </h2>
            <div className="space-y-2">
              {report.strong_subtopics.map((topic, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="font-body text-sm text-ink">{topic}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {report.weak_subtopics.length > 0 && (
          <div className="section-card p-5">
            <h2 className="font-headline text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-danger" />
              Needs Improvement
            </h2>
            <div className="space-y-3">
              {report.weak_subtopics.map((topic, i) => (
                <div key={i} className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-body text-sm text-ink">{topic.subtopic_name}</p>
                    <p className="font-body text-xs text-ink-faint mt-0.5">
                      Score: {topic.score}/10 · Time: {formatTime(topic.time_taken)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── Question Breakdown ─── */}
      <div className="section-card mb-8">
        <div className="p-5 hairline">
          <h2 className="font-headline text-base font-semibold text-ink flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            Question-by-Question Breakdown
          </h2>
        </div>
        <div className="divide-y divide-border">
          {report.evaluations.map((evaluation, index) => (
            <div key={index} className="p-5">
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <div className="flex items-start gap-3 flex-1">
                  {evaluation.is_correct
                    ? <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    : <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  }
                  <div className="flex-1">
                    <p className="font-body text-sm text-ink leading-relaxed">
                      Q{index + 1}. {evaluation.question}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={clsx(
                        "font-headline text-xs font-semibold px-2 py-0.5 rounded-sm border",
                        getScoreBg(evaluation.score), getScoreColor(evaluation.score)
                      )}>
                        {evaluation.score}/10
                      </span>
                      <span className="font-body text-xs text-ink-faint">{evaluation.subtopic_name}</span>
                      <span className="font-body text-xs text-ink-faint">{formatTime(evaluation.time_taken)}</span>
                    </div>
                  </div>
                </div>
                {expandedIndex === index
                  ? <ChevronUp className="w-4 h-4 text-ink-muted flex-shrink-0 mt-1" />
                  : <ChevronDown className="w-4 h-4 text-ink-muted flex-shrink-0 mt-1" />
                }
              </div>

              {expandedIndex === index && (
                <div className="mt-4 ml-8 space-y-4">
                  <div>
                    <p className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Your Answer</p>
                    <p className="font-body text-sm text-ink bg-surface-alt p-3 rounded-sm border border-border">
                      {evaluation.user_answer || "No answer provided"}
                    </p>
                  </div>

                  {!evaluation.is_correct && (
                    <div>
                      <p className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">Correct Answer</p>
                      <p className="font-body text-sm text-ink bg-green-50 border border-green-200 p-3 rounded-sm">
                        {evaluation.correct_answer}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider mb-2">AI Feedback</p>
                    <p className="font-body text-sm text-ink-muted leading-relaxed">{evaluation.feedback}</p>
                  </div>

                  {evaluation.is_correct && evaluation.correct_answer && (
                    <div>
                      <p className="font-headline text-xs font-semibold text-success uppercase tracking-wider mb-2">Why This Is Correct</p>
                      <p className="font-body text-sm text-ink-muted leading-relaxed bg-green-50 border border-green-200 p-3 rounded-sm">
                        {evaluation.correct_answer}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {evaluation.strengths.length > 0 && (
                      <div>
                        <p className="font-headline text-xs font-semibold text-success uppercase tracking-wider mb-2">Strengths</p>
                        {evaluation.strengths.map((s, i) => (
                          <p key={i} className="font-body text-xs text-ink-muted flex items-start gap-1 mb-1">
                            <span className="text-success">✓</span> {s}
                          </p>
                        ))}
                      </div>
                    )}
                    {evaluation.weaknesses.length > 0 && (
                      <div>
                        <p className="font-headline text-xs font-semibold text-danger uppercase tracking-wider mb-2">To Improve</p>
                        {evaluation.weaknesses.map((w, i) => (
                          <p key={i} className="font-body text-xs text-ink-muted flex items-start gap-1 mb-1">
                            <span className="text-danger">✗</span> {w}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─── Feedback Section ─── */}
      <div className="section-card p-6 mb-8">
        <h2 className="font-headline text-base font-semibold text-ink mb-1 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          Session Feedback
        </h2>
        <p className="font-body text-xs text-ink-faint mb-6">
          Your feedback helps improve question quality for everyone.
        </p>

        {feedbackSaved ? (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-sm">
            <CheckCircle2 className="w-5 h-5 text-success" />
            <div>
              <p className="font-headline text-sm font-semibold text-ink">Feedback saved!</p>
              <div className="flex gap-1 mt-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={clsx("w-4 h-4", s <= rating ? "text-warning fill-warning" : "text-ink-faint")} />
                ))}
              </div>
            </div>
            <button
              onClick={() => setFeedbackSaved(false)}
              className="ml-auto font-headline text-xs text-accent hover:underline"
            >
              Edit
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Star Rating */}
            <div>
              <p className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                Overall Rating
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="snap-transition"
                  >
                    <Star className={clsx(
                      "w-8 h-8 snap-transition",
                      star <= (hoverRating || rating)
                        ? "text-warning fill-warning"
                        : "text-ink-faint"
                    )} />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="font-body text-sm text-ink-muted self-center ml-2">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Questions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                  Was the difficulty appropriate?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setDifficultyOk(true)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-sm border text-xs font-headline font-medium snap-transition",
                      difficultyOk === true
                        ? "bg-green-50 border-green-300 text-success"
                        : "border-border text-ink-muted hover:border-border-strong"
                    )}
                  >
                    <ThumbsUp className="w-3 h-3" /> Yes
                  </button>
                  <button
                    onClick={() => setDifficultyOk(false)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-sm border text-xs font-headline font-medium snap-transition",
                      difficultyOk === false
                        ? "bg-red-50 border-red-300 text-danger"
                        : "border-border text-ink-muted hover:border-border-strong"
                    )}
                  >
                    <ThumbsDown className="w-3 h-3" /> No
                  </button>
                </div>
              </div>

              <div>
                <p className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                  Were questions relevant?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setQuestionsOk(true)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-sm border text-xs font-headline font-medium snap-transition",
                      questionsOk === true
                        ? "bg-green-50 border-green-300 text-success"
                        : "border-border text-ink-muted hover:border-border-strong"
                    )}
                  >
                    <ThumbsUp className="w-3 h-3" /> Yes
                  </button>
                  <button
                    onClick={() => setQuestionsOk(false)}
                    className={clsx(
                      "flex items-center gap-2 px-4 py-2 rounded-sm border text-xs font-headline font-medium snap-transition",
                      questionsOk === false
                        ? "bg-red-50 border-red-300 text-danger"
                        : "border-border text-ink-muted hover:border-border-strong"
                    )}
                  >
                    <ThumbsDown className="w-3 h-3" /> No
                  </button>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div>
              <p className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
                Additional Comments (optional)
              </p>
              <textarea
                value={comments}
                onChange={e => setComments(e.target.value)}
                placeholder="Any suggestions to improve the questions or experience..."
                rows={3}
                className="w-full bg-surface-raised border border-border rounded-sm px-4 py-3 font-body text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-accent snap-transition resize-none"
              />
            </div>

            <button
              onClick={saveFeedback}
              disabled={rating === 0 || savingFeedback}
              className={clsx(
                "flex items-center gap-2 px-6 py-2.5 rounded-sm font-headline text-sm font-semibold snap-transition",
                rating > 0
                  ? "bg-ink text-surface-raised hover:bg-accent-hover"
                  : "bg-surface-alt text-ink-faint border border-border cursor-not-allowed"
              )}
            >
              {savingFeedback ? "Saving..." : "Submit Feedback"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}