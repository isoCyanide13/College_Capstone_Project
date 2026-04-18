# 🗺️ NEXT STEPS — What To Do Now

> Your step-by-step guide to building the AI Interview Platform.
> Follow this order. Each step builds on the previous one.

---

## 📊 Current State (as of 2026-03-28)

| ✅ Done | ❌ Not Done |
|---------|------------|
| Folder structure (60+ files) | Actual working code (all placeholders) |
| Core Python libs (FastAPI, SQLAlchemy, Pydantic, Gemini, JWT) | AI/ML libs (OpenCV, Whisper, TTS, etc.) |
| Next.js frontend initialized | Frontend npm packages (Monaco, Socket.io) |
| .gitignore, docker-compose, .env.example | Database migrations |
| ORM models defined (code exists) | Database tables created |
| Pydantic schemas defined | API endpoints wired up |
| AI agent configs (4 agents defined) | Interview orchestrator logic |

**Bottom line: The skeleton is ready. Zero working features yet.**

---

## 🔴 STEP 1: Install Remaining Libraries (Do This First)

### Backend (Python)
```bash
conda activate D:\College_Capstone_Project\.venv
pip install -r backend/requirements.txt
```
> This will install OpenCV, MediaPipe, DeepFace, faster-whisper, Kokoro TTS, Crawl4AI, and audio analysis tools.
> ⚠️ Some of these are large downloads (OpenCV ~50MB, MediaPipe ~30MB). Be patient.

### Frontend (npm)
```bash
cd frontend
npm install @monaco-editor/react socket.io-client recharts lucide-react
npm install @mediapipe/face_mesh @mediapipe/camera_utils
```

---

## 🔴 STEP 2: Database Setup (30 minutes)

### 2a. Start PostgreSQL + Redis
```bash
cd D:\College_Capstone_Project
docker-compose up -d
```
> This starts PostgreSQL on port 5432 and Redis on port 6379.
> If you don't have Docker, install PostgreSQL and Redis locally.

### 2b. Create your .env file
```bash
copy .env.example .env
```
Then edit `.env` and set at minimum:
- `GEMINI_API_KEY=your-key-from-aistudio.google.com`
- `JWT_SECRET_KEY=any-random-long-string`

### 2c. Initialize Alembic (database migrations)
```bash
conda activate D:\College_Capstone_Project\.venv
cd D:\College_Capstone_Project
alembic init backend/alembic
```
Then:
1. Edit `alembic.ini` → set `sqlalchemy.url = postgresql://postgres:postgres@localhost:5432/interview_db`
2. Edit `backend/alembic/env.py` → import your models and set `target_metadata = Base.metadata`
3. Generate migration: `alembic revision --autogenerate -m "initial tables"`
4. Apply migration: `alembic upgrade head`

---

## 🔴 STEP 3: Build Auth System (1–2 days)

This is your first working feature. Everything else needs auth.

### Files to code:
1. **`backend/middleware/auth.py`** — Uncomment the code, it's mostly written:
   - Password hashing with bcrypt
   - JWT token creation
   - `get_current_user` dependency

2. **`backend/routers/auth.py`** — Write 3 endpoints:
   - `POST /register` → validate input, hash password, save user, return JWT
   - `POST /login` → find user, verify password, return JWT
   - `GET /me` → return current user from JWT

3. **`frontend/src/app/(auth)/login/page.tsx`** — Build the login form UI
4. **`frontend/src/app/(auth)/register/page.tsx`** — Build the register form UI
5. **`frontend/src/hooks/useAuth.ts`** — Token storage, login/logout functions

### Test it:
```bash
# Start backend
uvicorn backend.main:app --reload --port 8000

# Open http://localhost:8000/docs — try register and login in Swagger
```

---

## 🟡 STEP 4: Build Question Generation + Test Mode (3–5 days)

### Files to code:
1. **`backend/services/question_generator.py`** — Uncomment the code:
   - Connect to Gemini API
   - Send prompt with topic + difficulty + count
   - Parse JSON response
   - **TEST THE PROMPT IN GOOGLE AI STUDIO FIRST** before coding

2. **`backend/routers/questions.py`** — CRUD endpoints:
   - `GET /api/questions/` — list with filters (topic, difficulty)
   - `POST /api/questions/generate` — generate via Gemini
   - `GET /api/questions/{id}` — get single question

3. **`backend/routers/sessions.py`** — Session management:
   - `POST /api/sessions/start` — create session, generate/fetch questions
   - `GET /api/sessions/{id}` — get session with questions
   - `PUT /api/sessions/{id}/end` — end session

4. **`backend/routers/answers.py`** — Answer submission:
   - `POST /api/answers/` — save answer
   - Trigger Gemini evaluation

5. **`backend/services/answer_evaluator.py`** — AI scoring:
   - Send answer + question to Gemini
   - Get score, strengths, weaknesses, model answer

6. **Frontend pages** — Build the actual UI:
   - Interview lobby (select topic, difficulty, start)
   - Question display (MCQ options, text input, timer)
   - Results page (scores, per-question feedback)

### 🎉 MILESTONE: After this step, you have a WORKING interview test app!

---

## 🟡 STEP 5: Add Code Editor + Execution (2–3 days)

### Files to code:
1. **`frontend/src/components/CodeEditor.tsx`** — Monaco Editor wrapper
2. **`backend/services/code_judge.py`** — Judge0 API integration
3. Split the test UI: MCQ/theory → text input, coding → Monaco editor

### Get Judge0 API key:
- Go to https://rapidapi.com/judge0-official/api/judge0-ce
- Sign up for free tier (100 submissions/day)

---

## 🟡 STEP 6: Build Interview Mode (1–2 weeks)

This is the most complex part. Build in order:

### 6a. Speech-to-Text
- **`backend/services/speech_to_text.py`** — faster-whisper model loading + transcription
- **Frontend** — microphone recording using `navigator.mediaDevices.getUserMedia()`

### 6b. Text-to-Speech
- **`backend/services/text_to_speech.py`** — Kokoro TTS for free local voice generation
- **Frontend** — play audio responses

### 6c. Interview Orchestrator (THE hardest part)
- **`backend/services/interview_orchestrator.py`** — Conversation state machine:
  - Manages which agent is active
  - Builds context from conversation history
  - Sends to appropriate AI model
  - Decides: follow-up OR next question OR switch agent
  - Uses agent configs from `ai_agents.py`

### 6d. GitHub Integration
- **`backend/services/github_scraper.py`** — Uncomment Crawl4AI code
- Feed scraped data to the Project Deep-Dive agent

### 6e. WebSocket Real-Time Pipeline
- **`backend/socket_handlers/interview.py`** — Wire it all together:
  ```
  Audio in → STT → Orchestrator → Gemini → TTS → Audio out
  ```

### 6f. Frontend Interview Room
- **`frontend/src/components/InterviewPanel.tsx`** — The interview UI:
  - Video feed (webcam)
  - Conversation transcript
  - Audio controls (mic toggle)
  - Current agent indicator
  - Timer

---

## 🟢 STEP 7: Add Anti-Cheat (3–5 days)

### Files to code:
1. **`frontend/src/lib/anti-cheat.ts`** — Browser monitoring (tab switch, fullscreen)
2. **`frontend/src/lib/gaze-tracker.ts`** — MediaPipe gaze estimation
3. **`backend/services/audio_analyzer.py`** — Uncomment audio analysis code
4. **`backend/socket_handlers/anti_cheat.py`** — Receive + store cheat events
5. **`frontend/src/components/AntiCheatOverlay.tsx`** — Warning overlays

---

## 🟢 STEP 8: Add Dashboards (3–5 days)

1. **`backend/services/skill_engine.py`** — Update skill vectors after each session
2. **`backend/routers/dashboard.py`** — Aggregation queries
3. **`frontend/src/app/dashboard/page.tsx`** — Radar chart, session history
4. **`frontend/src/app/admin/page.tsx`** — Placement officer view
5. **`frontend/src/components/SkillRadar.tsx`** — Recharts radar chart

---

## 🏁 STEP 9: Polish for Demo

- Test complete flows end-to-end
- Fix UI rough edges
- Add loading states, error handling
- Create demo accounts with pre-seeded data

---

## ⚡ Quick Reference: File → What To Code

| When you're ready to build... | Open these files |
|-------------------------------|-----------------|
| Auth system | `middleware/auth.py` → `routers/auth.py` → frontend auth pages |
| Question generation | `services/question_generator.py` → `routers/questions.py` |
| Test sessions | `routers/sessions.py` → `routers/answers.py` → `services/answer_evaluator.py` |
| Code editor | `components/CodeEditor.tsx` → `services/code_judge.py` |
| Interview mode | `services/ai_agents.py` → `services/interview_orchestrator.py` → `socket_handlers/interview.py` |
| Voice pipeline | `services/speech_to_text.py` → `services/text_to_speech.py` |
| Anti-cheat | `lib/anti-cheat.ts` → `lib/gaze-tracker.ts` → `socket_handlers/anti_cheat.py` |
| Dashboards | `services/skill_engine.py` → `routers/dashboard.py` → frontend dashboard pages |

---

## 💡 Pro Tips

1. **Test Gemini prompts in Google AI Studio first** — don't code until the prompt works
2. **Get auth working before anything else** — every endpoint needs it
3. **Use `http://localhost:8000/docs` constantly** — FastAPI auto-generates Swagger docs
4. **Build backend API first, then frontend** — test APIs in Swagger before building UI
5. **The Interview Orchestrator is 50% of the project complexity** — plan it on paper first
