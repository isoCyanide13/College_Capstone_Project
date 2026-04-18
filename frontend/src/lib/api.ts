/**
 * API Client
 * ===========
 * Centralized HTTP client for communicating with the FastAPI backend.
 *
 * Phase: 1 — Week 1
 * Status: 🔲 Not Started
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Base fetch wrapper with auth token injection and error handling.
 */
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `API Error: ${response.status}`);
  }

  return response.json();
}

// ─── Auth API ───────────────────────────────────────────────────────
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    fetchAPI("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchAPI("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getMe: () => fetchAPI("/api/auth/me"),
};

// ─── Questions API ──────────────────────────────────────────────────
export const questionsAPI = {
  list: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return fetchAPI(`/api/questions/${query}`);
  },

  generate: (data: { topic: string; difficulty: string; count: number }) =>
    fetchAPI("/api/questions/generate", { method: "POST", body: JSON.stringify(data) }),
};

// ─── Sessions API ───────────────────────────────────────────────────
export const sessionsAPI = {
  start: (config: { session_type: string; topic?: string; difficulty?: string; count?: number }) =>
    fetchAPI("/api/sessions/start", { method: "POST", body: JSON.stringify(config) }),

  list: () => fetchAPI("/api/sessions/"),

  get: (id: string) => fetchAPI(`/api/sessions/${id}`),

  end: (id: string) => fetchAPI(`/api/sessions/${id}/end`, { method: "PUT" }),

  report: (id: string) => fetchAPI(`/api/sessions/${id}/report`),
};

// ─── Answers API ────────────────────────────────────────────────────
export const answersAPI = {
  submit: (data: {
    session_id: string;
    question_id: string;
    response_text?: string;
    response_code?: string;
    language?: string;
  }) => fetchAPI("/api/answers/", { method: "POST", body: JSON.stringify(data) }),

  getForSession: (sessionId: string) => fetchAPI(`/api/answers/${sessionId}`),
};

// ─── Dashboard API ──────────────────────────────────────────────────
export const dashboardAPI = {
  studentOverview: () => fetchAPI("/api/dashboard/student"),
  studentHistory: () => fetchAPI("/api/dashboard/student/history"),
  adminBatch: () => fetchAPI("/api/dashboard/admin/batch"),
};

export default fetchAPI;
