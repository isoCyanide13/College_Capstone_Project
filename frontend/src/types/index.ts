/**
 * TypeScript Type Definitions
 * ============================
 * Shared types used across the frontend application.
 */

// ─── User Types ─────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "admin" | "placement_officer";
  college_id?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  college_id?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user_id: string;
  role: string;
}

// ─── Question Types ─────────────────────────────────────────────────
export type QuestionType =
  | "mcq"
  | "coding"
  | "theory"
  | "system_design"
  | "behavioral";

export type Difficulty = "easy" | "medium" | "hard";

export interface Question {
  id: string;
  content: string;
  type: QuestionType;
  difficulty: Difficulty;
  topic?: string;
  company_tag?: string;
  expected_answer?: string;
  test_cases?: TestCase[];
  ai_generated: boolean;
  created_at: string;
}

export interface TestCase {
  input: string;
  expected_output: string;
}

// ─── Session Types ──────────────────────────────────────────────────
export type SessionType =
  | "full_test"
  | "custom"
  | "ai_interview"
  | "mock_panel";

export type SessionStatus =
  | "scheduled"
  | "active"
  | "completed"
  | "aborted";

export interface Session {
  id: string;
  user_id: string;
  session_type: SessionType;
  status: SessionStatus;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export interface SessionConfig {
  session_type: SessionType;
  topic?: string;
  difficulty?: Difficulty;
  count?: number;
}

// ─── Answer Types ───────────────────────────────────────────────────
export interface Answer {
  id: string;
  session_id: string;
  question_id: string;
  response_text?: string;
  response_code?: string;
  voice_transcript?: string;
  time_taken_seconds?: number;
  submitted_at: string;
}

export interface AnswerSubmit {
  session_id: string;
  question_id: string;
  response_text?: string;
  response_code?: string;
  language?: string;
  time_taken_seconds?: number;
}

// ─── Evaluation Types ───────────────────────────────────────────────
export interface Evaluation {
  id: string;
  answer_id: string;
  score: number;
  strengths?: string;
  weaknesses?: string;
  model_answer?: string;
  code_result?: CodeResult;
  evaluated_by: "gemini" | "judge0" | "hybrid";
}

export interface CodeResult {
  passed: boolean;
  runtime?: string;
  memory?: string;
  stderr?: string;
  test_results: TestResult[];
}

export interface TestResult {
  passed: boolean;
  runtime?: string;
  memory?: string;
  stderr?: string;
}

// ─── Skill Vector Types ─────────────────────────────────────────────
export interface SkillVector {
  user_id: string;
  arrays: number;
  linked_lists: number;
  trees: number;
  graphs: number;
  dynamic_programming: number;
  system_design: number;
  communication: number;
  coding_speed: number;
  edge_case_thinking: number;
  last_updated: string;
}

// ─── Anti-Cheat Types ───────────────────────────────────────────────
export type CheatEventType =
  | "tab_switch"
  | "fullscreen_exit"
  | "gaze_away"
  | "face_missing"
  | "multiple_faces";

export type Severity = "low" | "medium" | "high";

export interface CheatEvent {
  type: CheatEventType;
  severity: Severity;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ─── Interview Types ────────────────────────────────────────────────
export interface InterviewMessage {
  speaker: string;
  message: string;
  timestamp: string;
}

export interface AIResponse {
  text: string;
  audio?: ArrayBuffer;
  interviewer: string;
  evaluation: "correct" | "partial" | "incorrect";
}

// ─── Emotion Types ──────────────────────────────────────────────────
export type Emotion =
  | "angry"
  | "disgusted"
  | "fearful"
  | "happy"
  | "neutral"
  | "sad"
  | "surprised";

export interface EmotionResult {
  emotion: Emotion;
  confidence: number;
  all_scores: Record<Emotion, number>;
}
