# 🎯 AI Interview Platform

> An AI-powered interview simulator with real-time voice interaction, coding evaluation, computer vision monitoring, and adaptive skill tracking.

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+ (via Conda)
- Node.js 18+
- Docker & Docker Compose (for PostgreSQL + Redis)
- Git

### 1. Clone & Setup Environment

```bash
# Clone the repository
git clone <repository-url>
cd College_Capstone_Project

# Activate conda environment
conda activate D:\College_Capstone_Project\.venv

# Install Python dependencies
pip install -r backend/requirements.txt
```

### 2. Start Database Services

```bash
# Start PostgreSQL and Redis
docker-compose up -d
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys
# At minimum, set: GEMINI_API_KEY
```

### 4. Run Backend

```bash
# Start FastAPI server
uvicorn backend.main:app --reload --port 8000
```

### 5. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

### 6. Open in Browser

- **Frontend**: http://localhost:3000
- **Backend API Docs**: http://localhost:8000/docs
- **Backend ReDoc**: http://localhost:8000/redoc

---

## 📁 Project Structure

```
College_Capstone_Project/
├── backend/                    # Python FastAPI application
│   ├── main.py                 # App entry point
│   ├── config.py               # Environment settings
│   ├── routers/                # API route handlers
│   ├── models/                 # SQLAlchemy ORM models
│   ├── schemas/                # Pydantic validation models
│   ├── services/               # Business logic + AI integrations
│   ├── middleware/              # Auth, CORS, rate limiting
│   ├── database/               # DB connection + migrations
│   ├── socket_handlers/        # Real-time WebSocket handlers
│   ├── utils/                  # Shared utilities
│   └── tests/                  # Backend tests
│
├── frontend/                   # Next.js 14 application
│   ├── app/                    # Pages (App Router)
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Client utilities
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript definitions
│
├── docs/                       # Documentation
│   ├── api-endpoints.md
│   ├── database-schema.md
│   └── architecture.md
│
├── .gitignore
├── .env.example
├── docker-compose.yml
├── IMPLEMENTATION_HISTORY.md   # Module progress tracker
└── README.md
```

---

## 🏗️ Architecture

```
Frontend (Next.js) ←→ Backend (FastAPI) ←→ AI Services (Gemini, Whisper, Judge0)
                                        ←→ Database (PostgreSQL + Redis)
```

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

---

## 📊 Implementation Phases

| Phase                | Weeks  | Focus                                               |
| -------------------- | ------ | --------------------------------------------------- |
| 1 — Foundation      | 1–4   | Auth, dashboard, question generation, evaluation    |
| 2 — Coding System   | 5–8   | Monaco editor, Judge0, AI code review               |
| 3 — Voice Engine    | 9–12  | STT, TTS, AI orchestrator, WebSocket                |
| 4 — Anti-Cheat      | 13–16 | Gaze tracking, screen monitoring, emotion detection |
| 5 — Adaptive Engine | 17–20 | Skill vectors, adaptive difficulty, analytics       |
| 6 — Polish + Launch | 21–24 | Replay, testing, optimization, demo                 |

See [IMPLEMENTATION_HISTORY.md](IMPLEMENTATION_HISTORY.md) for detailed module progress.

---

## 🔑 API Keys Required

| Service    | Purpose                                          | Get Key                                                       |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------- |
| Gemini API | Question generation, evaluation, screen analysis | [Google AI Studio](https://aistudio.google.com/)               |
| Judge0     | Code execution                                   | [RapidAPI](https://rapidapi.com/judge0-official/api/judge0-ce) |
| ElevenLabs | Text-to-Speech (optional)                        | [ElevenLabs](https://elevenlabs.io/)                           |
| Deepgram   | Speech-to-Text (optional)                        | [Deepgram](https://deepgram.com/)                              |

---

## 📄 License

This project is developed as a college capstone project.
