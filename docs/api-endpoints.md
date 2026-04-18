# API Endpoints Reference

> Auto-generated endpoint documentation. See also: `/docs` (Swagger) and `/redoc` (ReDoc) when running the backend.

---

## Authentication (`/api/auth`)

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| POST | `/api/auth/register` | Create new user account | 1 |
| POST | `/api/auth/login` | Login and receive JWT token | 1 |
| POST | `/api/auth/refresh` | Refresh access token | 1 |
| GET | `/api/auth/me` | Get current authenticated user | 1 |

## Users (`/api/users`)

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/api/users/` | List all users (admin) | 1 |
| GET | `/api/users/{id}` | Get user profile | 1 |
| PUT | `/api/users/{id}` | Update user profile | 1 |
| DELETE | `/api/users/{id}` | Delete user (admin) | 1 |

## Questions (`/api/questions`)

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/api/questions/` | List questions with filters | 1 |
| POST | `/api/questions/` | Create question manually | 1 |
| POST | `/api/questions/generate` | AI-generate questions | 1 |
| GET | `/api/questions/{id}` | Get question details | 1 |
| PUT | `/api/questions/{id}` | Update question | 1 |
| DELETE | `/api/questions/{id}` | Delete question | 1 |

## Sessions (`/api/sessions`)

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| POST | `/api/sessions/start` | Start new interview session | 1 |
| GET | `/api/sessions/` | List user's sessions | 1 |
| GET | `/api/sessions/{id}` | Get session details | 1 |
| PUT | `/api/sessions/{id}/end` | End active session | 1 |
| GET | `/api/sessions/{id}/report` | Get session report | 1 |

## Answers (`/api/answers`)

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| POST | `/api/answers/` | Submit an answer | 1 |
| GET | `/api/answers/{session_id}` | Get answers for a session | 1 |
| POST | `/api/answers/code` | Submit code for execution | 2 |

## Evaluations (`/api/evaluations`)

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/api/evaluations/{answer_id}` | Get evaluation result | 1 |
| GET | `/api/evaluations/session/{id}` | Get all evaluations for session | 1 |

## Dashboard (`/api/dashboard`)

| Method | Endpoint | Description | Phase |
|--------|----------|-------------|-------|
| GET | `/api/dashboard/student` | Student skill overview | 5 |
| GET | `/api/dashboard/student/history` | Session history with trends | 5 |
| GET | `/api/dashboard/admin/batch` | Batch readiness (admin) | 5 |
| GET | `/api/dashboard/admin/students` | Per-student breakdown | 5 |

## WebSocket Events (Socket.io)

| Event | Direction | Description | Phase |
|-------|-----------|-------------|-------|
| `audio_chunk` | Client → Server | Student voice audio | 3 |
| `ai_response` | Server → Client | AI interviewer response | 3 |
| `cheat_event` | Client → Server | Anti-cheat violation | 4 |
| `screen_frame` | Client → Server | Screen share capture | 4 |
