# Architecture Overview

> System architecture for the AI Interview Platform — updated with full vision.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 14)                   │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Test UI  │  │ Code IDE │  │ Interview│  │ Anti-Cheat    │   │
│  │ (MCQ +   │  │ (Monaco) │  │ Room UI  │  │ (MediaPipe +  │   │
│  │  Theory) │  │          │  │ (Voice)  │  │  Audio API)   │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ REST API + WebSocket (Socket.io)
┌────────────────────────▼────────────────────────────────────────┐
│                        BACKEND (FastAPI)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                  Interview Orchestrator                  │   │
│  │  Manages 4 AI Agents, conversation memory, turn order    │   │
│  └────────┬──────────┬──────────┬──────────┬────────────────┘   │
│           │          │          │          │                    │
│  ┌────────▼──┐ ┌─────▼────┐ ┌──▼───────┐ ┌▼────────────────┐  │
│  │ Agent 1:  │ │ Agent 2: │ │Agent 3:  │ │ Agent 4:        │  │
│  │ DSA Expert│ │ System   │ │HR/Behav- │ │ Project Review  │  │
│  │ (Gemini   │ │ Designer │ │ioral     │ │ (Gemini Pro +   │  │
│  │  Pro)     │ │ (Flash)  │ │(Flash)   │ │  GitHub Data)   │  │
│  └───────────┘ └──────────┘ └──────────┘ └─────────────────┘  │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ Whisper  │  │ Kokoro   │  │ Judge0   │  │ OpenCV +      │   │
│  │ (STT)    │  │ (TTS)    │  │ (Code)   │  │ DeepFace      │   │
│  └──────────┘  └──────────┘  └──────────┘  └───────────────┘   │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Crawl4AI │  │ Audio    │  │ Skill    │                      │
│  │ (GitHub) │  │ Analyzer │  │ Engine   │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                       DATABASE                                  │
│              PostgreSQL + Redis                                 │
│  users | sessions | questions | answers | evaluations           │
│  skill_vectors | cheat_events | conversation_logs               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Interview Mode Flow

```
Student enters interview room → webcam + mic activated
                    │
                    ├── Crawl4AI scrapes GitHub profile → feeds Agent 4
                    │
                    ▼
Orchestrator selects Agent 1 (HR/Behavioral) → opening question
                    │
   ┌────────────────┼────────────────┐
   │                │                │
   ▼                ▼                ▼
Student speaks    Webcam feed     Mic audio
   │              │                │
   ▼              ▼                ▼
Whisper STT    OpenCV/MediaPipe  Audio Analyzer
   │           (eye + head +     (confidence +
   │            face tracking)    silence detect)
   │              │                │
   └──────────────┼────────────────┘
                  │
                  ▼
      Interview Orchestrator
      ├── Evaluates answer (correct/partial/wrong)
      ├── Checks for contradictions with earlier claims
      ├── Reads emotion + confidence data
      ├── Decides: follow-up? next question? switch agent?
      ├── If silent >10s → comfort message
      └── Generates response with appropriate tone
                  │
                  ▼
         Kokoro TTS → voice output
                  │
                  ▼
      Audio plays in student's browser
```

---

## Anti-Cheat Pipeline

```
                  BROWSER SIDE                    SERVER SIDE
                  ───────────                     ───────────
Tab switch      ──────────────────►  Log event (severity: medium)
Fullscreen exit ──────────────────►  Warn student, log event
Copy-paste      ──────────────────►  Block + log event

                  MEDIAPIPE (WASM)
                  ────────────────
Face missing    ──────────────────►  Warn after 3s, flag after 10s
Multiple faces  ──────────────────►  Immediate flag (severity: high)
Eyes away >5s   ──────────────────►  Log (severity: low)
Eyes away >15s  ──────────────────►  Warning popup

                  OPENCV (SERVER)
                  ───────────────
Head turn >30°  ──────────────────►  Log (severity: medium)

                  AUDIO ANALYSIS
                  ──────────────
Background voice ─────────────────►  Flag (severity: high)
Unusual sounds  ──────────────────►  Log (severity: low)
```

---

## Scoring System

```
Final Score = Weighted Average of:

  ┌──────────────────────────────┬────────┐
  │ Answer Correctness           │  30%   │ ← Gemini evaluates accuracy
  │ Depth of Knowledge           │  20%   │ ← How well they handle follow-ups
  │ Communication Clarity        │  15%   │ ← Structured thinking, examples
  │ Confidence Level             │  15%   │ ← Voice stability, speech rate
  │ Problem-Solving Approach     │  10%   │ ← Thinks aloud, edge cases
  │ Project Understanding        │  10%   │ ← Can explain their own code
  └──────────────────────────────┴────────┘
```

---

## Technology Stack

| Layer | Tool | Why |
|-------|------|-----|
| Frontend | Next.js 14 + TypeScript | SSR, App Router, type safety |
| Styling | Tailwind CSS | Rapid UI development |
| Code Editor | Monaco Editor | VS Code in the browser |
| Backend | FastAPI (Python) | Async, auto-docs, AI ecosystem |
| Database | PostgreSQL | JSONB, UUID, reliability |
| Cache | Redis | Session cache, Celery broker |
| Primary LLM | Gemini 2.5 Pro/Flash | Free tier, 1M token context |
| STT | faster-whisper | Free, runs locally on CPU |
| TTS | Kokoro | Free, no API key needed |
| Code Execution | Judge0 | Sandboxed, multi-language |
| Eye Tracking | MediaPipe Face Mesh | Browser WASM, no server needed |
| Face Analysis | DeepFace + OpenCV | Emotion + head pose |
| Audio Analysis | librosa + webrtcvad | Confidence + cheat detection |
| GitHub Scraping | Crawl4AI | Extract project data for agents |
| Real-time | Socket.io | WebSocket for interview sessions |
| Auth | JWT (python-jose) | Stateless, scalable |

---

## File Organization

```
backend/
├── main.py                          # FastAPI entry point
├── config.py                        # All settings from .env
├── routers/                         # API endpoints
│   ├── auth.py                      # Register, login, JWT
│   ├── questions.py                 # Question CRUD + AI generation
│   ├── sessions.py                  # Interview session lifecycle
│   ├── answers.py                   # Answer submission
│   ├── evaluations.py              # AI-scored results
│   └── dashboard.py                # Analytics endpoints
├── models/                          # Database tables (SQLAlchemy)
├── schemas/                         # Request/response validation (Pydantic)
├── services/                        # Business logic
│   ├── ai_agents.py                # 4 interviewer agent configs
│   ├── interview_orchestrator.py   # Core conversation brain
│   ├── interview_memory.py         # Contradiction detection
│   ├── question_generator.py       # Gemini question generation
│   ├── answer_evaluator.py         # Gemini answer scoring
│   ├── code_judge.py               # Judge0 code execution
│   ├── speech_to_text.py           # faster-whisper STT
│   ├── text_to_speech.py           # Kokoro TTS
│   ├── github_scraper.py           # Crawl4AI GitHub scraping
│   ├── audio_analyzer.py           # Confidence + cheat audio analysis
│   ├── emotion_detector.py         # DeepFace emotion detection
│   ├── skill_engine.py             # Skill vector updates
│   └── llm_router.py              # Multi-model routing
├── socket_handlers/                 # Real-time events
│   ├── interview.py                # Voice interview pipeline
│   └── anti_cheat.py              # Cheat event logging
└── database/                        # DB connection + migrations
```
