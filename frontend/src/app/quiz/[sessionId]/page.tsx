"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Flag,
  Send,
  AlertCircle,
  CheckCircle2,
  Circle,
  BookOpen,
  Code2,
  Shield,
} from "lucide-react";
import clsx from "clsx";
import { getToken } from "@/lib/auth";

const API_BASE = "http://127.0.0.1:8000";

interface Question {
  id: string;
  question_number: number;
  question: string;
  type: string;
  options: string[] | null;
  subtopic_id: string;
  subtopic_name: string;
}

interface SessionData {
  session_id: string;
  questions: Question[];
  total_questions: number;
  subject_name: string;
  difficulty: string;
  question_type: string;
}

type QuestionStatus =
  | "not_visited"
  | "not_answered"
  | "answered"
  | "marked_review"            // unanswered + flagged
  | "answered_marked_review";  // answered + flagged

export default function QuizPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // ─── Session State ────────────────────────────────────────────────
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Answer State ─────────────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [questionStatus, setQuestionStatus] = useState<Record<string, QuestionStatus>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // ─── Timer State ──────────────────────────────────────────────────
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(30 * 60); // default 30 min
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [questionSeconds, setQuestionSeconds] = useState(0);
  const [timeExpired, setTimeExpired] = useState(false);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const totalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const questionTimeMap = useRef<Record<string, number>>({});

  // ─── UI State ─────────────────────────────────────────────────────
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // ─── Load Session ─────────────────────────────────────────────────
  useEffect(() => {
    async function loadSession() {
      // First try sessionStorage (from TopicSelector)
      const stored = sessionStorage.getItem("currentSession");
      if (stored) {
        const data = JSON.parse(stored);
        setSession(data);
        // Set time limit from config
        if (data.timeLimit) {
          setTimeLimitSeconds(data.timeLimit * 60);
        }
        initializeStatus(data.questions);
        setLoading(false);
        return;
      }

      // Fallback: fetch from API
      try {
        const token = getToken();
        const res = await fetch(`${API_BASE}/api/sessions/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Session not found");
        const data = await res.json();
        setSession(data);
        initializeStatus(data.questions);
      } catch (e) {
        setError("Could not load session. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId]);

  function initializeStatus(questions: Question[]) {
    const status: Record<string, QuestionStatus> = {};
    questions.forEach(q => {
      status[q.id] = "not_visited";
    });
    setQuestionStatus(status);
  }

  // ─── Total Timer ──────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    totalTimerRef.current = setInterval(() => {
      setTotalSeconds(s => {
        const next = s + 1;
        if (next >= timeLimitSeconds) {
          // Time's up — auto submit
          setTimeExpired(true);
          if (totalTimerRef.current) clearInterval(totalTimerRef.current);
        }
        return next;
      });
    }, 1000);
    return () => {
      if (totalTimerRef.current) clearInterval(totalTimerRef.current);
    };
  }, [session, timeLimitSeconds]);

  useEffect(() => {
    if (timeExpired && !submitting) {
      handleSubmit();
    }
  }, [timeExpired]);

  // ─── Per Question Timer ───────────────────────────────────────────
  useEffect(() => {
    if (!session) return;
    // Save time for previous question before switching
    const prevQId = session.questions[currentIndex]?.id;

    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    // Restore accumulated time for this question
    const accumulated = questionTimeMap.current[session.questions[currentIndex]?.id] || 0;
    setQuestionSeconds(accumulated);

    questionTimerRef.current = setInterval(() => {
      setQuestionSeconds(s => {
        // Keep updating the map in real time
        const qId = session.questions[currentIndex]?.id;
        if (qId) questionTimeMap.current[qId] = s + 1;
        return s + 1;
      });
    }, 1000);

    // Mark as visited
    if (session.questions[currentIndex]) {
      const qId = session.questions[currentIndex].id;
      setQuestionStatus(prev => ({
        ...prev,
        [qId]: prev[qId] === "not_visited" ? "not_answered" : prev[qId],
      }));
    }

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [currentIndex, session]);

  // ─── Save time when leaving a question ───────────────────────────
  const saveQuestionTime = useCallback(() => {
    if (!session) return;
    const qId = session.questions[currentIndex]?.id;
    if (qId) {
      questionTimeMap.current[qId] = (questionTimeMap.current[qId] || 0) + questionSeconds;
    }
  }, [currentIndex, questionSeconds, session]);

  // ─── Format Time ─────────────────────────────────────────────────
  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // ─── Handle Answer ────────────────────────────────────────────────
  function handleAnswer(questionId: string, answer: string) {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    setQuestionStatus(prev => {
      const current = prev[questionId];
      // Preserve marked flag if already marked
      if (current === "marked_review" || current === "answered_marked_review") {
        return { ...prev, [questionId]: "answered_marked_review" };
      }
      return { ...prev, [questionId]: "answered" };
    });
  }

  // ─── Navigate ─────────────────────────────────────────────────────
  function goToQuestion(index: number) {
    saveQuestionTime();
    setCurrentIndex(index);
  }

  function goNext() {
    if (!session) return;
    saveQuestionTime();
    if (currentIndex < session.questions.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  }

  function goPrev() {
    saveQuestionTime();
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  }

  function skipQuestion() {
    saveQuestionTime();
    if (!session) return;
    goNext();
  }

  // ─── Mark for Review ──────────────────────────────────────────────
  function toggleMarkReview(questionId: string) {
    const hasAnswer = !!answers[questionId];
    setQuestionStatus(prev => {
      const current = prev[questionId];
      if (current === "answered_marked_review") return { ...prev, [questionId]: "answered" };
      if (current === "marked_review") return { ...prev, [questionId]: "not_answered" };
      if (current === "answered") return { ...prev, [questionId]: "answered_marked_review" };
      return { ...prev, [questionId]: hasAnswer ? "answered_marked_review" : "marked_review" };
    });
  }

  // ─── Submit Session ───────────────────────────────────────────────
  async function handleSubmit() {
    if (!session) return;
    saveQuestionTime();
    setSubmitting(true);

    const token = getToken();

    // Submit all answers
    for (const question of session.questions) {
      const answer = answers[question.id];
      if (!answer) continue;
      try {
        await fetch(`${API_BASE}/api/sessions/answers/submit`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: session.session_id,
            question_id: question.id,
            answer_text: answer,
            time_taken_seconds: questionTimeMap.current[question.id] || 0,
          }),
        });
      } catch (e) {
        console.error("Failed to submit answer:", e);
      }
    }

    // End session and get report
    try {
      const res = await fetch(`${API_BASE}/api/sessions/${session.session_id}/end`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        sessionStorage.removeItem("currentSession");
        router.push(`/results/${session.session_id}`);
      }
    } catch (e) {
      setError("Failed to submit session. Please try again.");
    } finally {
      setSubmitting(false);
      setShowSubmitConfirm(false);
    }
  }

  // ─── Derived Data ─────────────────────────────────────────────────
  const currentQuestion = session?.questions[currentIndex];
  const mcqQuestions = session?.questions.filter(q => q.type === "mcq") ?? [];
  const theoryQuestions = session?.questions.filter(q => q.type === "theory") ?? [];
  const answeredCount = Object.values(questionStatus).filter(s => s === "answered" || s === "answered_marked_review").length;
  const markedCount = Object.values(questionStatus).filter(s => s === "marked_review" || s === "answered_marked_review").length;
  const notAnsweredCount = Object.values(questionStatus).filter(s => s === "not_answered").length;
  const notVisitedCount = Object.values(questionStatus).filter(s => s === "not_visited").length;
  const isCurrentMarked = currentQuestion && (questionStatus[currentQuestion.id] === "marked_review" || questionStatus[currentQuestion.id] === "answered_marked_review");

  // ─── Loading State ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-body text-ink-muted text-sm">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-danger mx-auto mb-4" />
          <p className="font-body text-ink-muted">{error || "Session not found"}</p>
        </div>
      </div>
    );
  }

  return (
  <div className="flex-1 flex flex-col min-h-screen bg-surface">

    {/* ─── Evaluating Overlay ─── */}
    {submitting && (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
        <div className="bg-surface-raised border border-border rounded-sm p-8 max-w-sm w-full text-center">
          <div className="w-12 h-12 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h3 className="font-headline text-base font-semibold text-ink mb-2">
            Evaluating Your Answers
          </h3>
          <p className="font-body text-sm text-ink-muted">
            AI is scoring each answer and generating feedback. This takes 15-30 seconds...
          </p>
        </div>
      </div>
    )}

    {/* ─── Top Bar ─── */}
      <div className="sticky top-16 z-40 bg-surface-raised border-b border-border px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Session Info */}
          <div className="flex items-center gap-4">
            <div>
              <p className="font-headline text-xs font-semibold text-ink">
                {session.subject_name}
              </p>
              <p className="font-body text-xs text-ink-faint capitalize">
                {session.difficulty} · {session.question_type}
              </p>
            </div>
          </div>

          {/* Timers */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Clock className={clsx(
                "w-4 h-4",
                (timeLimitSeconds - totalSeconds) < 300 ? "text-danger" : "text-ink-muted"
              )} />
              <div className="text-right">
                <p className="font-body text-xs text-ink-faint">Time Left</p>
                <p className={clsx(
                  "font-headline text-sm font-bold",
                  (timeLimitSeconds - totalSeconds) < 300 ? "text-danger" : "text-ink"
                )}>
                  {formatTime(Math.max(0, timeLimitSeconds - totalSeconds))}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <div className="text-right">
                <p className="font-body text-xs text-ink-faint">This Question</p>
                <p className="font-headline text-sm font-bold text-accent">
                  {formatTime(questionSeconds)}
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitConfirm(true)}
            disabled={submitting}
            className="flex items-center gap-2 bg-ink text-surface-raised px-4 py-2 rounded-sm font-headline font-semibold text-sm hover:bg-accent-hover snap-transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            Submit
          </button>
        </div>
      </div>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">

        {/* ─── Main Question Area ─── */}
        <div className="flex-1 p-6">

          {/* Question Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="font-headline text-xs font-semibold text-ink-faint uppercase tracking-wider">
                Question {currentIndex + 1} of {session.total_questions}
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className={clsx(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-xs font-headline font-medium border",
                  currentQuestion?.type === "mcq"
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-amber-50 border-amber-200 text-amber-700"
                )}>
                  {currentQuestion?.type === "mcq"
                    ? <><Code2 className="w-3 h-3" /> MCQ</>
                    : <><BookOpen className="w-3 h-3" /> Theory</>
                  }
                </span>
                <span className="font-body text-xs text-ink-faint">
                  {currentQuestion?.subtopic_name}
                </span>
              </div>
            </div>
            <button
              onClick={() => currentQuestion && toggleMarkReview(currentQuestion.id)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-headline font-medium border snap-transition",
                isCurrentMarked
                  ? "bg-amber-50 border-amber-300 text-amber-700"
                  : "border-border text-ink-muted hover:border-border-strong"
              )}
            >
              <Flag className="w-3 h-3" />
              {isCurrentMarked ? "Marked for Review" : "Mark for Review"}
            </button>
          </div>

          {/* Question Text */}
          <div className="section-card p-6 mb-6">
            <p className="font-body text-base text-ink leading-relaxed">
              {currentQuestion?.question}
            </p>
          </div>

          {/* Answer Area */}
          {currentQuestion?.type === "mcq" ? (
            /* MCQ Options */
            <div className="space-y-3">
              {currentQuestion.options?.map((option, idx) => {
                const isSelected = answers[currentQuestion.id] === option;
                const labels = ["A", "B", "C", "D"];
                return (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(currentQuestion.id, option)}
                    className={clsx(
                      "w-full flex items-center gap-4 p-4 rounded-sm border text-left snap-transition",
                      isSelected
                        ? "bg-accent-light border-accent"
                        : "bg-surface-raised border-border hover:border-border-strong"
                    )}
                  >
                    <div className={clsx(
                      "w-8 h-8 rounded-sm flex items-center justify-center font-headline text-sm font-bold flex-shrink-0",
                      isSelected
                        ? "bg-accent text-surface-raised"
                        : "bg-surface-alt text-ink-muted"
                    )}>
                      {labels[idx]}
                    </div>
                    <span className={clsx(
                      "font-body text-sm",
                      isSelected ? "text-ink font-medium" : "text-ink-muted"
                    )}>
                      {option}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-accent ml-auto flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Theory Text Area */
            <div>
              <label className="font-headline text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-3">
                Your Answer
              </label>
              <textarea
                value={answers[currentQuestion?.id ?? ""] ?? ""}
                onChange={(e) => currentQuestion && handleAnswer(currentQuestion.id, e.target.value)}
                placeholder="Write your answer here. Be specific and explain your reasoning..."
                rows={8}
                className="w-full bg-surface-raised border border-border rounded-sm px-4 py-3 font-body text-sm text-ink placeholder-ink-faint focus:outline-none focus:border-accent snap-transition resize-none"
              />
              <div className="flex justify-between mt-2">
                <p className="font-body text-xs text-ink-faint">
                  Tip: Use examples and explain your reasoning clearly
                </p>
                <p className="font-body text-xs text-ink-faint">
                  {(answers[currentQuestion?.id ?? ""] ?? "").length} characters
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-sm font-headline text-sm font-medium text-ink-muted hover:text-ink hover:border-border-strong snap-transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              {/* Clear Answer */}
              {currentQuestion && answers[currentQuestion.id] && (
                <button
                  onClick={() => {
                    if (!currentQuestion) return;
                    setAnswers(prev => {
                      const next = { ...prev };
                      delete next[currentQuestion.id];
                      return next;
                    });
                    setQuestionStatus(prev => {
                      const current = prev[currentQuestion.id];
                      // If marked for review, keep marked but remove answered
                      if (current === "answered_marked_review") {
                        return { ...prev, [currentQuestion.id]: "marked_review" };
                      }
                      return { ...prev, [currentQuestion.id]: "not_answered" };
                    });
                  }}
                  className="px-4 py-2 border border-border rounded-sm font-headline text-sm font-medium text-ink-muted hover:text-danger hover:border-danger snap-transition"
                >
                  Clear
                </button>
              )}
              <button
                onClick={skipQuestion}
                disabled={currentIndex === session.total_questions - 1}
                className="px-4 py-2 border border-border rounded-sm font-headline text-sm font-medium text-ink-muted hover:text-ink hover:border-border-strong snap-transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Skip
              </button>
              <button
                onClick={goNext}
                disabled={currentIndex === session.total_questions - 1}
                className="flex items-center gap-2 px-4 py-2 bg-ink text-surface-raised rounded-sm font-headline text-sm font-medium hover:bg-accent-hover snap-transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Save & Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── Right Sidebar ─── */}
        <div className="w-72 border-l border-border p-4 flex flex-col gap-4 overflow-y-auto">

          {/* Legend */}
          <div className="section-card p-4">
            <h3 className="font-headline text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Status Legend
            </h3>
            <div className="space-y-2 text-xs font-body">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-surface-alt border border-border flex items-center justify-center">
                  <Circle className="w-3 h-3 text-ink-faint" />
                </div>
                <span className="text-ink-muted">Not Visited ({notVisitedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-surface-alt border border-border-strong flex items-center justify-center">
                  <span className="text-[10px] text-ink-muted font-headline font-bold">—</span>
                </div>
                <span className="text-ink-muted">Not Answered ({notAnsweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-accent border border-accent flex items-center justify-center">
                  <CheckCircle2 className="w-3 h-3 text-surface-raised" />
                </div>
                <span className="text-ink-muted">Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-amber-100 border border-amber-300 flex items-center justify-center">
                  <Flag className="w-3 h-3 text-amber-600" />
                </div>
                <span className="text-ink-muted">Marked, Unanswered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-sm bg-accent border border-accent flex items-center justify-center relative">
                  <CheckCircle2 className="w-3 h-3 text-surface-raised" />
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full flex items-center justify-center">
                    <Flag className="w-2 h-2 text-white" />
                  </span>
                </div>
                <span className="text-ink-muted">Answered + Marked</span>
              </div>
            </div>
          </div>

          {/* MCQ Section */}
          {mcqQuestions.length > 0 && (
            <div className="section-card p-4">
              <h3 className="font-headline text-xs font-semibold text-ink uppercase tracking-wider mb-3 flex items-center gap-2">
                <Code2 className="w-3 h-3 text-blue-500" />
                MCQ ({mcqQuestions.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {mcqQuestions.map((q) => {
                  const status = questionStatus[q.id];
                  const isActive = currentIndex === session.questions.indexOf(q);
                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(session.questions.indexOf(q))}
                      className={clsx(
                        "w-8 h-8 rounded-sm text-xs font-headline font-bold snap-transition border",
                        isActive && "ring-2 ring-accent ring-offset-1",
                        status === "answered"
                          ? "bg-accent border-accent text-surface-raised"
                          : status === "answered_marked_review"
                          ? "bg-accent border-accent text-surface-raised after:content-['▶'] after:absolute after:top-0 after:right-0 after:text-amber-400 after:text-[6px]"
                          : status === "marked_review"
                          ? "bg-amber-100 border-amber-300 text-amber-700"
                          : status === "not_answered"
                          ? "bg-surface-alt border-border-strong text-ink-muted"
                          : "bg-surface-raised border-border text-ink-faint"
                      )}
                    >
                      {q.question_number}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Theory Section */}
          {theoryQuestions.length > 0 && (
            <div className="section-card p-4">
              <h3 className="font-headline text-xs font-semibold text-ink uppercase tracking-wider mb-3 flex items-center gap-2">
                <BookOpen className="w-3 h-3 text-amber-500" />
                Theory ({theoryQuestions.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {theoryQuestions.map((q) => {
                  const status = questionStatus[q.id];
                  const isActive = currentIndex === session.questions.indexOf(q);
                  return (
                    <button
                      key={q.id}
                      onClick={() => goToQuestion(session.questions.indexOf(q))}
                      className={clsx(
                        "w-8 h-8 rounded-sm text-xs font-headline font-bold snap-transition border",
                        isActive && "ring-2 ring-accent ring-offset-1",
                        status === "answered"
                          ? "bg-accent border-accent text-surface-raised"
                          : status === "answered_marked_review"
                          ? "bg-accent border-accent text-surface-raised after:content-['▶'] after:absolute after:top-0 after:right-0 after:text-amber-400 after:text-[6px]"
                          : status === "marked_review"
                          ? "bg-amber-100 border-amber-300 text-amber-700"
                          : status === "not_answered"
                          ? "bg-surface-alt border-border-strong text-ink-muted"
                          : "bg-surface-raised border-border text-ink-faint"
                      )}
                    >
                      {q.question_number}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Anti-Cheat — Coming Soon */}
          <div className="section-card p-4 opacity-60">
            <h3 className="font-headline text-xs font-semibold text-ink uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-3 h-3 text-ink-muted" />
              Anti-Cheat
              <span className="ml-auto text-[10px] font-headline bg-surface-alt border border-border px-1.5 py-0.5 rounded-sm text-ink-faint">
                Coming Soon
              </span>
            </h3>
            <div className="space-y-2 text-xs font-body text-ink-faint">
              <p>· Eye tracking</p>
              <p>· Tab switch detection</p>
              <p>· Face detection</p>
              <p>· Audio monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Submit Confirmation Modal ─── */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface-raised border border-border rounded-sm p-6 max-w-md w-full">
            <h2 className="font-headline text-lg font-bold text-ink mb-2">
              Submit Session?
            </h2>
            <p className="font-body text-sm text-ink-muted mb-4">
              You have answered {answeredCount} of {session.total_questions} questions.
              {markedCount > 0 && ` ${markedCount} marked for review.`}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="bg-surface-alt rounded-sm p-3 text-center">
                <p className="font-headline font-bold text-ink text-lg">{answeredCount}</p>
                <p className="font-body text-xs text-ink-muted">Answered</p>
              </div>
              <div className="bg-surface-alt rounded-sm p-3 text-center">
                <p className="font-headline font-bold text-ink text-lg">
                  {session.total_questions - answeredCount}
                </p>
                <p className="font-body text-xs text-ink-muted">Unanswered</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 py-2.5 border border-border rounded-sm font-headline text-sm font-medium text-ink-muted hover:border-border-strong snap-transition"
              >
                Continue Reviewing
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 py-2.5 bg-ink text-surface-raised rounded-sm font-headline text-sm font-bold hover:bg-accent-hover snap-transition disabled:opacity-50"
              >
                {submitting ? "Evaluating..." : "Submit & Evaluate"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}