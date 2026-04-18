# Master Implementation Plan — AI Mock Interview Platform

> **This is the single source of truth for the entire project.**
> Every feature, every phase, every file — tracked here.
> Both you and the AI assistant should reference this before building anything.

---

## The 6 Phases (In Order)

```
Phase 1 ── Foundation & Auth          ← Database + Login system
Phase 2 ── Question Practice + AI     ← LLM question generation + scoring
Phase 3 ── Coding IDE + Judge         ← In-app code editor + test cases
Phase 4 ── Full Interview Mode        ← AI interviewers + voice + WebSockets
Phase 5 ── Anti-Cheat System          ← OpenCV + tab detection + noise
Phase 6 ── Post-Test Analytics        ← Results, mistakes, progress tracking
```

Each phase builds on the previous one. You CANNOT skip phases.

---

## Phase 1: Foundation & Authentication

### What We're Building
- PostgreSQL database running via Docker
- User registration + login system
- JWT-based authentication (access tokens)
- Protected API endpoints (only logged-in users can access)
- User profile data (name, email, role, college)
- Admin vs Student roles
- Frontend login/register forms connected to the backend
- Navbar showing real user info after login

### What You Need to Learn
| Topic | Depth | Why | YouTube Search |
|-------|-------|-----|----------------|
| Docker Compose | Surface | Start PostgreSQL + Redis with one command | `"Docker Compose tutorial 15 min"` |
| SQL basics | Surface | Understand tables, rows, columns, JOINs | `"SQL tutorial for beginners"` |
| Python async/await | Intermediate | Every backend function is async | `"Python asyncio explained"` |
| FastAPI | Intermediate | Build routes, handle requests | `"FastAPI full course 2024"` |
| SQLAlchemy ORM | Intermediate | Python classes ↔ database tables | `"SQLAlchemy 2.0 ORM tutorial"` |
| Alembic | Surface | Apply model changes to database | `"Alembic migrations FastAPI"` |
| JWT tokens | Surface | How login tokens work | `"JWT explained in 5 minutes"` |
| bcrypt | Surface | Password hashing (never store plain text) | `"password hashing bcrypt Python"` |

### Files We'll Touch

**Backend (implement):**
```
backend/database/connection.py      ← Already written, just needs Docker running
backend/models/user.py              ← Already defined
backend/models/college.py           ← Already defined
backend/schemas/auth.py             ← Already defined
backend/middleware/auth.py           ← Code exists (commented out), uncomment + connect
backend/routers/auth.py             ← Stub exists, implement 4 endpoints
backend/main.py                     ← Uncomment router registrations
```

**Frontend (connect):**
```
frontend/src/hooks/useAuth.ts        ← Implement login/register/logout state
frontend/src/lib/auth.ts             ← Token storage (localStorage)
frontend/src/(auth)/login/page.tsx   ← Restyle + connect to API
frontend/src/(auth)/register/page.tsx← Restyle + connect to API
frontend/src/components/Navbar.tsx   ← Replace isAuthenticated=false with real hook
```

### Backend Endpoints

| Method | URL | What It Does | Who Can Access |
|--------|-----|--------------|----------------|
| POST | `/api/auth/register` | Create account, hash password, save to DB | Anyone |
| POST | `/api/auth/login` | Verify password, return JWT token | Anyone |
| GET | `/api/auth/me` | Return current user's profile | Logged-in users |
| POST | `/api/auth/refresh` | Get new token before old one expires | Logged-in users |

### How the Flow Works (End-to-End)

```
1. User fills register form on frontend
2. Frontend calls POST /api/auth/register with {name, email, password}
3. Backend:
   a. Checks if email already exists in database
   b. Hashes the password with bcrypt (never stores plain text)
   c. Creates User row in PostgreSQL
   d. Returns success
4. User fills login form
5. Frontend calls POST /api/auth/login with {email, password}
6. Backend:
   a. Finds user by email in database
   b. Compares hashed passwords
   c. Creates JWT token containing user_id
   d. Returns {access_token, user_id, role}
7. Frontend stores token in localStorage
8. Every future API call includes header: Authorization: Bearer <token>
9. Backend middleware decodes token → knows who the user is
```

### Database Tables Created in Phase 1

```
┌──────────────────────┐       ┌──────────────────────┐
│       users           │       │      colleges         │
├──────────────────────┤       ├──────────────────────┤
│ id (UUID, PK)        │──┐    │ id (UUID, PK)        │
│ name (string)        │  │    │ name (string)        │
│ email (string, unique│  │    │ code (string)        │
│ password_hash (str)  │  └───→│ created_at           │
│ role (student/admin) │       └──────────────────────┘
│ college_id (FK)      │
│ created_at           │
└──────────────────────┘
```

---

## Phase 2: Question Practice + AI Scoring

### What We're Building
- LLM integration (Gemini API for question generation)
- Multiple question types: MCQ, Theory, Short Answer
- Interactive question-solving UI (timer, question list, submit)
- AI-powered answer evaluation and scoring
- Per-subject score tracking in database
- Scores reflected on user dashboard (no more hardcoded data)
- Topic-specific practice using the curriculumMap we already built
- Session history stored in database

### What You Need to Learn
| Topic | Depth | Why | YouTube Search |
|-------|-------|-----|----------------|
| Google Gemini API | Intermediate | Generate questions + evaluate answers | `"Gemini API Python tutorial 2024"` |
| Prompt engineering | Surface | Write prompts that return structured JSON | `"prompt engineering for developers"` |
| JSON parsing | Surface | Parse AI responses into usable data | `"Python JSON tutorial"` |
| React state management | Intermediate | Timer, question navigation, answer tracking | `"React useState useEffect tutorial"` |
| HTTP requests from React | Surface | Frontend calling backend APIs | `"React fetch API tutorial"` |

### How It Works

```
1. User selects domains + subjects + difficulty on Question Practice page
2. Frontend calls POST /api/sessions/start with configuration
3. Backend:
   a. Creates a Session row in database
   b. Calls Gemini API: "Generate 15 medium DSA questions as JSON"
   c. Parses response → saves Questions to database
   d. Returns session_id + list of questions
4. Frontend shows interactive question-solving interface:
   - Question text
   - Answer input (text area for theory, MCQ options for MCQ)
   - Timer counting down
   - Question list sidebar (Q1, Q2, ... with status dots)
   - Next/Previous buttons
5. User answers each question → Frontend calls POST /api/answers/submit
6. After all questions answered, Frontend calls PUT /api/sessions/{id}/end
7. Backend:
   a. Sends each answer to Gemini: "Evaluate this answer, score 0-10"
   b. Saves Evaluation to database (score, strengths, weaknesses)
   c. Updates SkillVector for this user (per-topic scores)
   d. Returns session report
8. Dashboard now shows REAL data from database (not hardcoded)
```

### New API Endpoints

| Method | URL | What It Does |
|--------|-----|--------------|
| POST | `/api/sessions/start` | Create session, generate questions via AI |
| GET | `/api/sessions/{id}` | Get session details + questions |
| POST | `/api/answers/submit` | Submit answer for a question |
| PUT | `/api/sessions/{id}/end` | End session, trigger AI evaluation |
| GET | `/api/sessions/{id}/report` | Get scored results for a session |
| GET | `/api/dashboard/student` | Get current user's stats + skill scores |
| GET | `/api/dashboard/student/history` | Get list of past sessions |

### LLM API Keys You'll Need

| Provider | Free Tier? | What We Use It For | How to Get |
|----------|-----------|-------------------|------------|
| Google Gemini | Yes, generous free tier | Question generation + answer evaluation | `aistudio.google.com` → Get API Key |
| Groq | Yes, fast free tier | Quick theory questions (fast inference) | `console.groq.com` → Create API Key |

You add them to a `.env` file in the backend folder:
```
GEMINI_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
```

### New Frontend Pages/Components

```
frontend/src/app/question-practice/session/page.tsx   ← [NEW] Active question-solving UI
frontend/src/components/QuestionView.tsx               ← [NEW] Question display + answer input
frontend/src/components/QuestionNav.tsx                ← [NEW] Sidebar question list with status
frontend/src/components/SessionTimer.tsx               ← [NEW] Countdown timer
```

### Database Tables Used

```
┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
│     sessions        │     │     questions       │     │      answers       │
├────────────────────┤     ├────────────────────┤     ├────────────────────┤
│ id (UUID)          │←──┐ │ id (UUID)          │←──┐ │ id (UUID)          │
│ user_id (FK→users) │   │ │ content (text)     │   │ │ session_id (FK)    │
│ session_type       │   │ │ type (mcq/theory)  │   │ │ question_id (FK)   │
│ status             │   └─│ session_id (FK)    │   └─│ response_text      │
│ started_at         │     │ difficulty         │     │ time_taken_seconds │
│ ended_at           │     │ topic              │     │ submitted_at       │
└────────────────────┘     │ expected_answer    │     └────────────────────┘
                           └────────────────────┘
                                                      ┌────────────────────┐
┌────────────────────┐                                │   evaluations      │
│   skill_vectors     │                                ├────────────────────┤
├────────────────────┤                                │ id (UUID)          │
│ user_id (FK)       │                                │ answer_id (FK)     │
│ arrays (0-100)     │                                │ score (0-10)       │
│ trees (0-100)      │                                │ strengths (text)   │
│ graphs (0-100)     │                                │ weaknesses (text)  │
│ system_design      │                                │ model_answer       │
│ ... etc            │                                └────────────────────┘
└────────────────────┘
```

---

## Phase 3: Coding IDE + Code Execution

### What We're Building
- Full in-browser code editor (Monaco Editor — same engine as VS Code)
- Support for C++, Java, Python, Kotlin, JavaScript
- Codeforces-style problem display (problem statement, input/output format, examples)
- 20+ test cases per problem (including hidden test cases)
- Judge0 API integration for sandboxed code execution
- Real-time verdict: Accepted, Wrong Answer, TLE, Runtime Error
- Per-test-case results with runtime and memory

### What You Need to Learn
| Topic | Depth | Why | YouTube Search |
|-------|-------|-----|----------------|
| Monaco Editor | Surface | Embed VS Code editor in React | `"Monaco Editor React tutorial"` |
| Judge0 API | Intermediate | Execute code in cloud sandbox | `"Judge0 code execution API"` |
| Stdin/Stdout | Surface | How programs read input/produce output | `"stdin stdout explained programming"` |

### How It Works

```
1. AI generates a coding problem with:
   - Problem statement (like Codeforces)
   - Input format, Output format
   - 3 visible examples + 17 hidden test cases
   - Expected output for each test case
   - Time limit (e.g., 2 seconds), Memory limit (e.g., 256 MB)

2. Frontend shows:
   Left panel: Problem statement + examples + constraints
   Right panel: Monaco code editor with language dropdown

3. User writes code, clicks "Run" (tests against visible examples only)
4. User clicks "Submit" (tests against ALL 20 test cases)

5. For each test case:
   a. Frontend sends code + language + input to backend
   b. Backend calls Judge0 API:
      POST https://judge0.../submissions
      { source_code, language_id, stdin, expected_output, time_limit }
   c. Judge0 runs code in sandbox, returns result
   d. Backend returns: Accepted / Wrong Answer / TLE / RE / CE

6. Results shown per test case:
   Test 1: ✅ Accepted (12ms, 3.2 MB)
   Test 2: ✅ Accepted (15ms, 3.2 MB)
   Test 3: ❌ Wrong Answer
   Test 4: ⏱️ Time Limit Exceeded
   ...
```

### New Dependencies
```
npm install @monaco-editor/react    ← Code editor component
```

### New Frontend Components
```
frontend/src/components/MonacoEditor.tsx     ← [NEW] Replace basic textarea with Monaco
frontend/src/components/ProblemStatement.tsx  ← [NEW] Codeforces-style problem display
frontend/src/components/TestCaseResults.tsx   ← [NEW] Per-test-case verdict display
frontend/src/components/LanguageSelector.tsx  ← [NEW] C++/Java/Python/Kotlin dropdown
```

---

## Phase 4: Full Interview Mode (AI Interviewers)

### What We're Building
- 4 AI interviewer agents (already defined in `services/ai_agents.py`):
  - Dr. Priya Sharma — DSA Expert
  - Arjun Mehta — System Design
  - Sneha Verma — Behavioral/HR
  - Vikram Patel — Project Reviewer (reads your GitHub)
- Real-time voice conversation via WebSockets
- Speech-to-Text (Whisper) so AI understands your voice
- Text-to-Speech (Kokoro) so AI speaks back
- Conversation memory (AI remembers what you said earlier)
- 30-minute structured interview rotating between agents
- GitHub project scraping for personalized questions

### What You Need to Learn
| Topic | Depth | Why | YouTube Search |
|-------|-------|-----|----------------|
| WebSockets | Intermediate | Real-time bidirectional communication | `"Python SocketIO FastAPI"` |
| Whisper (STT) | Surface | Convert student's speech to text | `"faster-whisper Python tutorial"` |
| Text-to-Speech | Surface | Make AI responses audible | `"Python text to speech tutorial"` |
| Conversation design | Surface | How to manage multi-turn AI conversations | `"LLM conversation memory"` |

### How It Works

```
1. User clicks "Start Full Interview"
2. Frontend opens WebSocket connection to backend
3. Backend initializes 4 AI agents with their personalities
4. Interview flow (30 min total):
   
   [0-7 min]  Sneha (HR) — behavioral questions
               "Tell me about a time you led a team project"
               
   [7-14 min] Dr. Priya (DSA) — algorithm questions  
               "How would you find the shortest path in a weighted graph?"
               
   [14-21 min] Arjun (System Design) — architecture
               "Design a URL shortener that handles 10M requests/day"
               
   [21-28 min] Vikram (Projects) — based on YOUR GitHub repos
               "I see you used Redis in your e-commerce project. Why not Memcached?"

5. Each exchange:
   a. User speaks → browser captures audio
   b. Audio sent to backend via WebSocket
   c. Whisper converts speech → text
   d. Text sent to Gemini with agent personality + conversation history
   e. Gemini responds with follow-up/evaluation
   f. Kokoro converts response → speech audio
   g. Audio sent back to frontend → plays through speakers

6. After interview:
   - Each answer scored on 6 dimensions (correctness, depth, communication...)
   - Overall score calculated
   - Detailed report generated
```

---

## Phase 5: Anti-Cheat System

### What We're Building
- **Tab switch detection** — logs when student leaves the test tab
- **Fullscreen enforcement** — warns if student exits fullscreen
- **Face detection (OpenCV)** — "Is the student visible in camera?"
- **Gaze tracking (MediaPipe)** — "Is the student looking at the screen?"
- **Multiple face detection** — "Is someone else in the frame?"
- **Noise detection** — "Is someone dictating answers?"
- **Safe browser mode** — disable right-click, copy-paste, dev tools
- **Admin cheat log** — detailed report sent to admin dashboard

### What You Need to Learn
| Topic | Depth | Why | YouTube Search |
|-------|-------|-----|----------------|
| OpenCV basics | Surface | Capture and analyze webcam frames | `"OpenCV Python face detection"` |
| MediaPipe Face Mesh | Surface | 468-point face landmark detection | `"MediaPipe face mesh Python"` |
| Browser APIs | Surface | Visibility API, Fullscreen API | `"JavaScript Page Visibility API"` |
| WebRTC | Surface | Access webcam/mic from browser | `"WebRTC getUserMedia tutorial"` |

### How It Works

```
During a test session:

FRONTEND (browser-side):
├── Tab switch detection
│   document.addEventListener("visibilitychange", () => {
│     if (document.hidden) logEvent("TAB_SWITCH", severity: "high")
│   })
│
├── Fullscreen enforcement
│   document.addEventListener("fullscreenchange", () => {
│     if (!document.fullscreenElement) showWarning("Please return to fullscreen")
│   })
│
├── Copy/paste/right-click disabled
│   document.addEventListener("copy", e => e.preventDefault())
│   document.addEventListener("contextmenu", e => e.preventDefault())
│
└── Webcam stream → sends frames to backend every 2 seconds

BACKEND (Python-side):
├── OpenCV analyzes each frame:
│   ├── Face detected? → ✅ or ❌ "NO_FACE_DETECTED"
│   ├── Multiple faces? → ❌ "MULTIPLE_FACES"
│   ├── Face position → calculate gaze direction
│   └── Eyes looking away for >5 sec → ⚠️ "GAZE_AWAY"
│
├── Audio analysis:
│   ├── Background noise level
│   ├── Multiple voice detection
│   └── Unusual audio patterns
│
└── All events saved to cheat_events table:
    { session_id, type: "TAB_SWITCH", severity: "high", timestamp, metadata }

ADMIN DASHBOARD:
├── List of all sessions with cheat scores
├── Per-student cheat event timeline
├── "⚠️ 3 tab switches, 2 gaze-away events, 1 multiple-face detection"
└── Final verdict: "Suspicious" / "Clean"
```

---

## Phase 6: Post-Test Analytics & Dashboard

### What We're Building
- Detailed session results page
- Per-question breakdown (your answer vs correct answer)
- Topic strength/weakness analysis
- Historical progress charts (score over time)
- "Topics to Improve" recommendations
- Skill radar chart with REAL data
- Admin view — batch analytics, per-student performance

### What Shows on the Results Page

```
┌─────────────────────────────────────────────────────────────────┐
│ Session: DSA Practice — April 17, 2026                          │
│ Duration: 42 min | Score: 73/100 | Rank estimate: Top 35%      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ SUBJECT BREAKDOWN                                               │
│ ┌──────────────────────┬────────┬───────────────────────┐      │
│ │ Topic                │ Score  │ Status                │      │
│ ├──────────────────────┼────────┼───────────────────────┤      │
│ │ Arrays & Strings     │ 9/10   │ ✅ Strong             │      │
│ │ Trees & Graphs       │ 7/10   │ 🟡 Needs Practice     │      │
│ │ Dynamic Programming  │ 4/10   │ 🔴 Weak — Focus Here  │      │
│ │ System Design        │ 8/10   │ ✅ Strong             │      │
│ └──────────────────────┴────────┴───────────────────────┘      │
│                                                                 │
│ QUESTION-BY-QUESTION                                            │
│ Q1. ✅ "Two Sum" (Easy) — Score: 10/10                          │
│     Your answer: Used HashMap for O(n) solution                 │
│     Feedback: Perfect. Optimal approach.                        │
│                                                                 │
│ Q2. ❌ "LRU Cache" (Medium) — Score: 4/10                       │
│     Your answer: Used simple dict without ordering              │
│     Correct approach: OrderedDict or HashMap + Doubly LL        │
│     Feedback: Missing the O(1) eviction requirement.            │
│     📖 Study: "LRU Cache design pattern"                       │
│                                                                 │
│ RECOMMENDATIONS                                                 │
│ 1. Practice 5 more Dynamic Programming problems                 │
│ 2. Review graph traversal (BFS/DFS) — you mixed them up in Q7  │
│ 3. Time management: spent 12 min on Q3, only 2 min on Q8       │
│                                                                 │
│ ANTI-CHEAT REPORT                                               │
│ Tab switches: 0 | Gaze warnings: 1 | Status: ✅ Clean          │
└─────────────────────────────────────────────────────────────────┘
```

---

## How Everything Connects (Architecture Diagram)

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                         │
│                                                                     │
│  Landing → Login/Register → Dashboard → Question Practice          │
│                                          │                          │
│                         ┌────────────────┼────────────────┐        │
│                         │                │                │        │
│                    Topic Practice    Coding IDE      Full Interview │
│                    (Theory/MCQ)     (Monaco+Judge0)  (Voice+AI)    │
│                         │                │                │        │
│                         └────────────────┼────────────────┘        │
│                                          │                          │
│                                     Results Page                    │
│                                     Dashboard Stats                 │
└────────────────────────────────────────┬────────────────────────────┘
                                         │ HTTP + WebSocket
                                         ▼
┌────────────────────────────────────────────────────────────────────┐
│                         BACKEND (FastAPI)                          │
│                                                                    │
│  Routers:     /auth  /sessions  /questions  /answers  /dashboard  │
│                 │         │          │          │          │        │
│  Services:   Auth    Session    QuestionGen  Evaluator  SkillEngine│
│              Mgr     Manager   (Gemini API)  (Gemini)   (Stats)   │
│                                                                    │
│  AI Services:   CodeJudge(Judge0)  |  SpeechToText(Whisper)       │
│                 TextToSpeech(Kokoro)|  AntiCheat(OpenCV+MediaPipe) │
│                 InterviewOrchestrator | GitHubScraper(Crawl4AI)   │
│                                                                    │
│  Database Layer:  SQLAlchemy ORM → PostgreSQL                      │
│  Cache Layer:     Redis                                            │
│  Task Queue:      Celery (background AI evaluation)                │
└────────────────────────────────────────────────────────────────────┘
                          │              │
                          ▼              ▼
                    ┌──────────┐   ┌──────────┐
                    │PostgreSQL│   │  Redis    │
                    │(all data)│   │ (cache +  │
                    │          │   │  tasks)   │
                    └──────────┘   └──────────┘
```

---

## What To Study For Each Phase

### Phase 1 (Auth) — Study Time: ~1 week
```
Day 1-2: Python basics refresher (async/await, type hints, decorators)
Day 3-4: FastAPI full tutorial (watch a 2+ hour video, code along)
Day 5:   Docker Compose (just starting PostgreSQL) + SQL basics
Day 6:   SQLAlchemy ORM + Alembic migrations
Day 7:   JWT auth (follow a FastAPI JWT tutorial)
```

### Phase 2 (Questions + AI) — Study Time: ~1 week
```
Day 1:   Gemini API setup + basic prompting
Day 2:   Prompt engineering (getting structured JSON from LLMs)
Day 3-4: Build question generation + answer evaluation services
Day 5-6: Frontend interactive question-solving UI
Day 7:   Connect dashboard to real database data
```

### Phase 3 (Coding IDE) — Study Time: ~4-5 days
```
Day 1:   Monaco Editor in React (embed the editor)
Day 2:   Judge0 API (submit code, get results)
Day 3-4: Codeforces-style problem format + test case display
Day 5:   Multi-language support + edge case handling
```

### Phase 4 (Full Interview) — Study Time: ~1.5 weeks
```
Day 1-2: WebSocket basics (python-socketio)
Day 3:   Speech-to-text (Whisper setup)
Day 4:   Text-to-speech (Kokoro setup)
Day 5-7: AI agent conversation loop with memory
Day 8-9: GitHub scraping for personalized questions
Day 10:  Integration testing
```

### Phase 5 (Anti-Cheat) — Study Time: ~1 week
```
Day 1-2: Browser APIs (visibility, fullscreen, clipboard)
Day 3-4: OpenCV face detection + MediaPipe gaze tracking
Day 5:   Audio analysis for noise/voice detection
Day 6-7: Admin logging dashboard
```

### Phase 6 (Analytics) — Study Time: ~3-4 days
```
Day 1-2: Results page UI + per-question breakdown
Day 3:   Historical progress charts (recharts)
Day 4:   Recommendation engine + admin batch view
```

---

## Free LLM APIs to Use

| Provider | Model | Free Tier | Best For | Get Key At |
|----------|-------|-----------|----------|------------|
| Google Gemini | gemini-2.5-flash | 15 RPM, generous | Question gen, evaluation | aistudio.google.com |
| Google Gemini | gemini-2.5-pro | 2 RPM, limited | Complex interview agents | aistudio.google.com |
| Groq | llama-3.3-70b | 30 RPM, very fast | Quick theory questions | console.groq.com |
| Groq | mixtral-8x7b | 30 RPM | MCQ generation | console.groq.com |
| OpenRouter | Various | $5 free credit | Fallback/routing | openrouter.ai |

**Strategy:** Use Groq for speed (theory questions, MCQs). Use Gemini for quality (coding problems, answer evaluation, interview agents). Use OpenRouter as fallback.

---

## Environment Variables (.env file)

Create `backend/.env`:
```
# App
APP_ENV=development
APP_DEBUG=true

# Database (matches docker-compose.yml)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/interview_db

# Redis
REDIS_URL=redis://localhost:6379/0

# Auth
JWT_SECRET_KEY=generate-a-random-64-char-string-here

# AI APIs
GEMINI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key

# Code Execution
JUDGE0_API_KEY=your_judge0_key
JUDGE0_BASE_URL=https://judge0-ce.p.rapidapi.com
```

---

## Current Status

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 1 — Auth & Database | 🔲 Not Started | Backend scaffolded, models defined |
| Phase 2 — Questions + AI | 🔲 Not Started | curriculumMap + Question Practice UI done |
| Phase 3 — Coding IDE | 🔲 Not Started | Basic CodeEditor component exists |
| Phase 4 — Full Interview | 🔲 Not Started | AI agent configs defined |
| Phase 5 — Anti-Cheat | 🔲 Not Started | AntiCheatOverlay component exists |
| Phase 6 — Analytics | 🔲 Not Started | Dashboard UI exists with hardcoded data |

**Next Action:** Start Phase 1 — spin up Docker, implement auth endpoints,
connect frontend login.

---

*Update this file as phases are completed. This is your project bible.*
