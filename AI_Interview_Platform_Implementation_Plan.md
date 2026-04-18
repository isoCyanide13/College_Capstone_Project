# AI Interview Simulator — Capstone Project Implementation Plan

> A full-stack, AI-powered mock interview platform with real-time voice interaction, coding evaluation, computer vision monitoring, and adaptive skill tracking.

---

## Table of Contents

1.  [Project Overview](#1-project-overview)
2.  [Core Architecture](#2-core-architecture)
3.  [Tech Stack](#3-tech-stack)
4.  [Database Schema](#4-database-schema)
5.  [Phase-by-Phase Implementation](#5-phase-by-phase-implementation)
6.  [Feature Deep Dives](#6-feature-deep-dives)
7.  [AI Prompt System](#7-ai-prompt-system)
8.  [Anti-Cheat Pipeline](#8-anti-cheat-pipeline)
9.  [Deployment Strategy](#9-deployment-strategy)
10. [Timeline Summary](#10-timeline-summary)
11. [Open Source AI Models and APIs](#11-open-source-ai-models-and-apis)

---

## 1. Project Overview

### What You're Building

An AI-powered interview simulator that goes beyond basic MCQ + coding platforms. It simulates a real technical interview panel — with voice, follow-up questions, memory, code execution, and behavioral tracking.

### Who It Serves

| Stakeholder | What They Get |
|---|---|
| Student | Realistic mock interviews, skill diagnosis, personalized training plans |
| Placement Cell | Batch readiness dashboard, weak area tracking, company-match analytics |
| Faculty | Session logs, performance trends, intervention triggers |

### What Makes It Different

- AI interviewers that **remember earlier answers** and challenge contradictions
- **Skill vectors** — not just scores, but per-topic diagnosis
- **Voice-first** interaction (not just text boxes)
- **Screen sharing + AI watching** the candidate's code in real-time
- **Adaptive difficulty** — the system gets harder or easier based on your performance

---

## 2. Core Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│          React / Next.js + WebRTC + Monaco Editor           │
└────────────────────────┬────────────────────────────────────┘
                         │ REST / WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                        BACKEND                              │
│                    Python FastAPI                           │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Interview   │  │   Question   │  │   Evaluation     │   │
│  │  Orchestrator│  │   Engine     │  │   Pipeline       │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘   │
└─────────┼─────────────────┼─────────────────┼───────────────┘
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼───────────────┐
│                      AI + SERVICES LAYER                    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐    │
│  │  Gemini  │  │  Whisper │  │ElevenLabs│  │  Judge0   │    │
│  │   API    │  │  (STT)   │  │  (TTS)   │  │ (Code Run)│    │
│  └──────────┘  └──────────┘  └──────────┘  └───────────┘    │
└─────────────────────────────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────────────────┐
│                       DATABASE                              │
│                      PostgreSQL                             │
│  users | sessions | questions | answers | skill_vectors     │
└─────────────────────────────────────────────────────────────┘
```

### System Interaction Flow

```
Student starts session
        ↓
Backend fetches/generates questions via Gemini
        ↓
Interview Orchestrator manages conversation flow
        ↓
Student speaks → Whisper converts to text
        ↓
Gemini evaluates answer + generates follow-up
        ↓
ElevenLabs converts AI response to voice
        ↓
If coding question → Judge0 runs code
        ↓
Screen frames captured → Gemini watches code
        ↓
MediaPipe tracks gaze + head pose (anti-cheat)
        ↓
All data stored → Skill vectors updated
        ↓
Post-session report generated
```

---

## 3. Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| Next.js 14 | App framework, routing, SSR |
| TypeScript | Type safety across the codebase |
| Tailwind CSS | Styling |
| Monaco Editor | In-browser VS Code editor for coding questions |
| WebRTC | Camera, mic, screen sharing |
| MediaPipe (WASM) | Face mesh, gaze tracking in-browser |
| Socket.io Client | Real-time communication with backend |

### Backend
| Tool | Purpose |
|---|---|
| Python FastAPI | Main API server |
| Socket.io | WebSocket for real-time interview sessions |
| Celery + Redis | Async task queue for evaluations |
| SQLAlchemy | ORM for database operations |
| Pydantic | Request/response validation |
| JWT Auth | Session management |

### AI and Services
| Tool | Purpose |
|---|---|
| Gemini 1.5 Pro | Question generation, answer evaluation, screen analysis |
| Whisper (OpenAI) | Speech-to-text for student voice |
| ElevenLabs | Text-to-speech for AI interviewer voices |
| Judge0 API | Sandboxed code execution + test cases |

### Database
| Tool | Purpose |
|---|---|
| PostgreSQL | Main relational database |
| Redis | Cache + Celery message broker |
| AWS S3 / Supabase Storage | Session recordings, uploaded files |

### DevOps
| Tool | Purpose |
|---|---|
| Docker + Docker Compose | Local development environment |
| GitHub Actions | CI/CD pipeline |
| AWS EC2 / Railway | Backend hosting |
| Vercel | Frontend hosting |

---

## 4. Database Schema

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  role VARCHAR(20) CHECK (role IN ('student', 'admin', 'placement_officer')),
  college_id UUID REFERENCES colleges(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Colleges
CREATE TABLE colleges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  batch_year INT,
  placement_officer_id UUID
);

-- Questions
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  type VARCHAR(30) CHECK (type IN ('mcq', 'coding', 'theory', 'system_design', 'behavioral')),
  difficulty VARCHAR(10) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  topic VARCHAR(100),
  company_tag VARCHAR(100),
  expected_answer TEXT,
  test_cases JSONB,         -- for coding questions
  ai_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Interview Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  session_type VARCHAR(30) CHECK (session_type IN ('full_test', 'custom', 'ai_interview', 'mock_panel')),
  status VARCHAR(20) CHECK (status IN ('scheduled', 'active', 'completed', 'aborted')),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  cheat_flags JSONB DEFAULT '[]',
  recording_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Answers
CREATE TABLE answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  question_id UUID REFERENCES questions(id),
  user_id UUID REFERENCES users(id),
  response_text TEXT,
  response_code TEXT,
  voice_transcript TEXT,
  time_taken_seconds INT,
  submitted_at TIMESTAMP DEFAULT NOW()
);

-- Evaluations
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  answer_id UUID REFERENCES answers(id),
  score NUMERIC(4,2),
  strengths TEXT,
  weaknesses TEXT,
  model_answer TEXT,
  code_result JSONB,        -- test case pass/fail, runtime, memory
  evaluated_by VARCHAR(20) CHECK (evaluated_by IN ('gemini', 'judge0', 'hybrid')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Skill Vectors (updated after every session)
CREATE TABLE skill_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  arrays NUMERIC(4,2) DEFAULT 0,
  linked_lists NUMERIC(4,2) DEFAULT 0,
  trees NUMERIC(4,2) DEFAULT 0,
  graphs NUMERIC(4,2) DEFAULT 0,
  dynamic_programming NUMERIC(4,2) DEFAULT 0,
  system_design NUMERIC(4,2) DEFAULT 0,
  communication NUMERIC(4,2) DEFAULT 0,
  coding_speed NUMERIC(4,2) DEFAULT 0,
  edge_case_thinking NUMERIC(4,2) DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Anti-Cheat Events
CREATE TABLE cheat_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  event_type VARCHAR(50),   -- 'tab_switch', 'gaze_away', 'face_missing', 'multiple_faces'
  severity VARCHAR(10) CHECK (severity IN ('low', 'medium', 'high')),
  timestamp TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- AI Interview Conversation Log
CREATE TABLE conversation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id),
  speaker VARCHAR(20) CHECK (speaker IN ('interviewer_1', 'interviewer_2', 'interviewer_3', 'candidate')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  sequence_number INT
);
```

---

## 5. Phase-by-Phase Implementation

---

### Phase 1 — Foundation (Weeks 1–4)

**Goal**: Running app with auth, dashboard, and basic question generation.

#### Week 1: Project Setup

- Initialize Next.js frontend + FastAPI backend
- Set up PostgreSQL with Docker Compose
- Implement JWT authentication (register/login)
- Create basic user dashboard

```bash
# Project structure
interview-platform/
├── frontend/          # Next.js app
│   ├── app/
│   ├── components/
│   └── lib/
├── backend/           # FastAPI app
│   ├── routers/
│   ├── models/
│   ├── services/
│   └── schemas/
├── docker-compose.yml
└── README.md
```

#### Week 2: Question Bank + Gemini Integration

- Build question CRUD API
- Integrate Gemini API for question generation
- Create question generation service with structured prompts
- Seed database with initial question bank

```python
# backend/services/question_generator.py
import google.generativeai as genai
import json

class QuestionGenerator:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-1.5-pro')

    async def generate_questions(self, topic: str, difficulty: str, count: int) -> list:
        prompt = f"""
        Generate {count} {difficulty} interview questions on the topic: {topic}.
        Return ONLY a valid JSON array. No preamble.
        
        Format:
        [
          {{
            "content": "question text",
            "type": "theory or coding",
            "topic": "{topic}",
            "difficulty": "{difficulty}",
            "expected_answer": "detailed answer outline",
            "company_tag": "Google/Amazon/etc or null"
          }}
        ]
        """
        response = self.model.generate_content(prompt)
        raw = response.text.strip().replace("```json", "").replace("```", "")
        return json.loads(raw)
```

#### Week 3: Test Session Engine

- Build session creation and management API
- Implement Full Test mode (predefined DSA, system design mix)
- Implement Custom Test mode (user selects topic + difficulty)
- Build question serving logic with adaptive selection

```python
# backend/routers/sessions.py
@router.post("/sessions/start")
async def start_session(config: SessionConfig, user: User = Depends(get_current_user)):
    # 1. Create session record
    session = await create_session(user.id, config)
    
    # 2. Fetch questions from DB
    questions = await fetch_questions(config.topic, config.difficulty, config.count)
    
    # 3. If not enough questions, generate with Gemini
    if len(questions) < config.count:
        needed = config.count - len(questions)
        new_questions = await question_generator.generate_questions(
            config.topic, config.difficulty, needed
        )
        questions += await save_and_return(new_questions)
    
    # 4. Return session with questions
    return {"session_id": session.id, "questions": questions}
```

#### Week 4: Answer Submission + Basic Evaluation

- Build answer submission API
- Implement Gemini-based answer evaluation pipeline
- Generate basic score + feedback for theory questions
- Build results page with per-question feedback

---

### Phase 2 — Coding Interview System (Weeks 5–8)

**Goal**: Students can solve coding problems with a real editor, get execution results, and AI feedback on code quality.

#### Week 5: Monaco Editor Integration

- Embed Monaco Editor in the frontend
- Support Python, Java, C++, JavaScript
- Add syntax highlighting, autocomplete, theme switching

```tsx
// frontend/components/CodeEditor.tsx
import Editor from "@monaco-editor/react";

export function CodeEditor({ language, value, onChange }) {
  return (
    <Editor
      height="400px"
      language={language}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
      }}
    />
  );
}
```

#### Week 6: Judge0 Code Execution

- Set up Judge0 API integration (or self-hosted instance)
- Build code submission service
- Run code against test cases, capture stdout/stderr/runtime
- Display test case results to student

```python
# backend/services/code_judge.py
import httpx

class CodeJudge:
    BASE_URL = "https://judge0-ce.p.rapidapi.com"
    
    LANGUAGE_IDS = {
        "python": 71,
        "java": 62,
        "cpp": 54,
        "javascript": 63
    }

    async def submit(self, code: str, language: str, test_cases: list) -> dict:
        results = []
        for tc in test_cases:
            payload = {
                "source_code": code,
                "language_id": self.LANGUAGE_IDS[language],
                "stdin": tc["input"],
                "expected_output": tc["expected_output"]
            }
            async with httpx.AsyncClient() as client:
                res = await client.post(f"{self.BASE_URL}/submissions", json=payload)
                token = res.json()["token"]
                result = await self.poll_result(token)
                results.append({
                    "passed": result["status"]["id"] == 3,
                    "runtime": result.get("time"),
                    "memory": result.get("memory"),
                    "stderr": result.get("stderr")
                })
        return results
```

#### Week 7: AI Code Review

- After code submission, send code to Gemini for quality review
- Evaluate: readability, edge cases, time complexity, structure
- Display suggestions alongside test case results

```python
async def review_code(code: str, question: str) -> dict:
    prompt = f"""
    Review this interview solution.
    
    Question: {question}
    
    Code:
    {code}
    
    Return JSON only:
    {{
      "score": 7,
      "time_complexity": "O(n log n)",
      "space_complexity": "O(n)",
      "edge_cases_handled": ["empty array", "single element"],
      "edge_cases_missed": ["negative numbers"],
      "readability_notes": "...",
      "improvement_suggestions": ["...", "..."]
    }}
    """
    response = model.generate_content(prompt)
    return json.loads(response.text.strip())
```

#### Week 8: Testing + Polishing Phase 1–2

- End-to-end test of full test flow
- Custom test flow
- Code submission + evaluation
- Fix bugs, improve UI feedback

---

### Phase 3 — Voice Interview Engine (Weeks 9–12)

**Goal**: Student can have a real voice conversation with an AI interviewer.

#### Week 9: Speech-to-Text Integration

- Set up Whisper API (or Deepgram for real-time)
- Capture audio from browser microphone via WebRTC
- Stream audio to backend, return transcript

```python
# backend/services/speech.py
import openai

async def transcribe_audio(audio_bytes: bytes) -> str:
    client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    transcript = client.audio.transcriptions.create(
        model="whisper-1",
        file=("audio.webm", audio_bytes, "audio/webm"),
        response_format="text"
    )
    return transcript
```

#### Week 10: Text-to-Speech (AI Interviewer Voice)

- Integrate ElevenLabs API
- Create distinct voice profiles for 3 interviewers
- Stream audio back to student browser

```python
# backend/services/tts.py
from elevenlabs import ElevenLabs

INTERVIEWER_VOICES = {
    "algorithm": "voice_id_1",     # authoritative, analytical
    "system_design": "voice_id_2", # calm, thoughtful
    "behavioral": "voice_id_3"     # warm, conversational
}

async def speak(text: str, interviewer: str) -> bytes:
    client = ElevenLabs(api_key=settings.ELEVENLABS_API_KEY)
    audio = client.generate(
        text=text,
        voice=INTERVIEWER_VOICES[interviewer],
        model="eleven_multilingual_v2"
    )
    return b"".join(audio)
```

#### Week 11: Interview Orchestrator (Core Brain)

This is the most critical service. It controls conversation flow, follow-up logic, and interviewer memory.

```python
# backend/services/interview_orchestrator.py

class InterviewOrchestrator:
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.conversation_history = []  # Full conversation log
        self.current_topic = None
        self.current_interviewer = "algorithm"

    async def process_candidate_answer(self, transcript: str) -> dict:
        # Add to history
        self.conversation_history.append({
            "speaker": "candidate",
            "message": transcript
        })

        # Build full context prompt with memory
        history_text = self._format_history()

        prompt = f"""
        You are conducting a technical interview.
        
        Conversation so far:
        {history_text}
        
        Candidate just said:
        "{transcript}"
        
        Instructions:
        - Check if answer is correct and complete
        - Look for contradictions with earlier statements
        - Decide: ask follow-up OR move to next question
        - Keep context of everything said before
        
        Return JSON only:
        {{
          "evaluation": "correct/partial/incorrect",
          "score": 7,
          "follow_up": true,
          "next_message": "Interviewer's next statement",
          "next_interviewer": "algorithm/system_design/behavioral",
          "contradiction_detected": false,
          "contradiction_note": null
        }}
        """

        response = await gemini.generate(prompt)
        result = json.loads(response)

        # Add interviewer message to history
        self.conversation_history.append({
            "speaker": result["next_interviewer"],
            "message": result["next_message"]
        })

        return result

    def _format_history(self) -> str:
        lines = []
        for entry in self.conversation_history[-20:]:  # Last 20 turns for context
            lines.append(f"{entry['speaker'].upper()}: {entry['message']}")
        return "\n".join(lines)
```

#### Week 12: Real-time Session with WebSockets

- Set up Socket.io for real-time communication
- Stream audio chunks, handle conversation state server-side
- Implement silence detection (if no audio for 15s, AI prompts)
- Handle interruption logic

```python
# backend/socket_handlers.py
@sio.on("audio_chunk")
async def handle_audio(sid, data):
    session = sessions[sid]

    # Transcribe
    transcript = await transcribe_audio(data["audio"])

    # Process through orchestrator
    result = await session.orchestrator.process_candidate_answer(transcript)

    # Generate voice response
    audio = await speak(result["next_message"], result["next_interviewer"])

    # Send back
    await sio.emit("ai_response", {
        "text": result["next_message"],
        "audio": audio,
        "interviewer": result["next_interviewer"],
        "evaluation": result["evaluation"]
    }, to=sid)
```

---

### Phase 4 — Anti-Cheat + Camera Monitoring (Weeks 13–16)

**Goal**: Real proctoring with gaze tracking, tab monitoring, and behavioral flags.

#### Week 13: Browser-Side Anti-Cheat

```typescript
// frontend/lib/anti-cheat.ts
export class AntiCheatMonitor {
  private violations: CheatEvent[] = [];

  init() {
    this.monitorTabSwitch();
    this.monitorFullscreen();
  }

  private monitorTabSwitch() {
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.flagEvent("tab_switch", "medium");
      }
    });
  }

  private monitorFullscreen() {
    document.addEventListener("fullscreenchange", () => {
      if (!document.fullscreenElement) {
        this.flagEvent("fullscreen_exit", "low");
      }
    });
  }

  private flagEvent(type: string, severity: string) {
    const event = { type, severity, timestamp: new Date().toISOString() };
    this.violations.push(event);
    socket.emit("cheat_event", event);
  }
}
```

#### Week 14: MediaPipe Gaze Tracking

```typescript
// frontend/lib/gaze-tracker.ts
import { FaceMesh } from "@mediapipe/face_mesh";

export class GazeTracker {
  private faceMesh: FaceMesh;

  async init(videoElement: HTMLVideoElement) {
    this.faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
    });

    this.faceMesh.setOptions({
      maxNumFaces: 2,  // detect if 2 faces present
      refineLandmarks: true
    });

    this.faceMesh.onResults((results) => this.analyzeResults(results));
  }

  private analyzeResults(results: any) {
    if (results.multiFaceLandmarks.length === 0) {
      this.report("face_missing", "high");
    } else if (results.multiFaceLandmarks.length > 1) {
      this.report("multiple_faces", "high");
    } else {
      const landmarks = results.multiFaceLandmarks[0];
      const gazeDirection = this.estimateGaze(landmarks);
      if (gazeDirection !== "center") {
        this.report("gaze_away", "low", { direction: gazeDirection });
      }
    }
  }

  private estimateGaze(landmarks: any[]): string {
    // Left eye: landmarks 33, 133, 159, 145
    // Right eye: landmarks 362, 263, 386, 374
    // Compare iris position relative to eye corners
    const leftIrisX = landmarks[468].x;
    const leftEyeLeft = landmarks[33].x;
    const leftEyeRight = landmarks[133].x;
    const ratio = (leftIrisX - leftEyeLeft) / (leftEyeRight - leftEyeLeft);

    if (ratio < 0.35) return "left";
    if (ratio > 0.65) return "right";
    return "center";
  }
}
```

#### Week 15: Screen Sharing + AI Screen Watching

```typescript
// frontend/lib/screen-share.ts
async function startScreenShare() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: 5 },  // Low frame rate — just enough for analysis
    audio: false
  });

  const captureInterval = setInterval(async () => {
    const frame = captureFrame(stream);
    socket.emit("screen_frame", { frame });
  }, 5000);  // Capture every 5 seconds

  return stream;
}
```

```python
# backend: analyze screen frame with Gemini Vision
async def analyze_screen_frame(frame_base64: str, current_question: str) -> str:
    prompt = f"""
    You are an interviewer watching a candidate's screen during a technical interview.
    
    They are working on: {current_question}
    
    Look at their screen and generate ONE natural interviewer comment or follow-up question
    based on what you see. Be specific to what's visible.
    
    Keep it under 2 sentences. Sound natural, not robotic.
    """
    response = model.generate_content([
        prompt,
        {"mime_type": "image/jpeg", "data": frame_base64}
    ])
    return response.text
```

#### Week 16: Anti-Cheat Dashboard + Severity Logic

- Build proctoring report per session
- Show timeline of flagged events with severity
- Implement warning system (warn at medium, flag at high)
- Add question randomization engine

---

### Phase 5 — Adaptive Engine + Analytics (Weeks 17–20)

**Goal**: The system learns about the student, adapts difficulty, and provides real diagnostic value.

#### Week 17: Skill Vector Engine

```python
# backend/services/skill_engine.py
class SkillEngine:
    TOPIC_WEIGHTS = {
        "arrays": 1.0,
        "graphs": 1.5,  # Harder topic, weighted higher
        "dynamic_programming": 2.0,
        "system_design": 1.8,
        "communication": 1.0
    }

    async def update_skill_vector(self, user_id: str, evaluation: dict):
        topic = evaluation["topic"]
        score = evaluation["score"] / 10.0

        vector = await get_skill_vector(user_id)

        # Exponential moving average — recent performance weighs more
        alpha = 0.3
        current = getattr(vector, topic, 0)
        new_score = alpha * score + (1 - alpha) * current

        await update_topic_score(user_id, topic, new_score)
```

#### Week 18: Adaptive Question Selection

```python
async def select_next_question(user_id: str, topic: str) -> Question:
    vector = await get_skill_vector(user_id)
    skill_level = getattr(vector, topic, 0)

    # Determine difficulty from skill level
    if skill_level < 0.4:
        difficulty = "easy"
    elif skill_level < 0.7:
        difficulty = "medium"
    else:
        difficulty = "hard"

    # Fetch question at appropriate difficulty
    question = await fetch_question(topic, difficulty)
    return question
```

#### Week 19: Student Dashboard + Personalized Roadmap

- Build skill radar chart visualization
- Show per-topic score with history over time
- Generate AI-powered weekly training roadmap based on weak areas

```python
async def generate_training_plan(user_id: str) -> dict:
    vector = await get_skill_vector(user_id)
    weaknesses = sorted(vector.items(), key=lambda x: x[1])[:3]

    prompt = f"""
    Create a 4-week interview preparation plan for a student with these skill scores:
    {json.dumps(weaknesses)}
    
    Return JSON:
    {{
      "weeks": [
        {{
          "week": 1,
          "focus": "topic name",
          "daily_goals": ["...", "..."],
          "resources": ["...", "..."]
        }}
      ]
    }}
    """
    response = model.generate_content(prompt)
    return json.loads(response.text.strip())
```

#### Week 20: Placement Cell Dashboard

- College admin interface showing batch readiness
- Per-student skill breakdown
- Company-match logic (compare student skills to company requirements)
- Export reports as PDF

---

### Phase 6 — Polish, Integration, and Launch (Weeks 21–24)

**Goal**: Bug-free, production-ready, demo-ready system.

#### Week 21: Interview Replay Feature

- Store full conversation log with timestamps
- Build playback UI showing conversation timeline
- Mark moments: "missed edge case", "hesitation", "good explanation"

#### Week 22: End-to-End Testing

- Test complete interview flows (voice, coding, behavioral)
- Load test the backend
- Fix latency issues in voice pipeline

#### Week 23: Performance + Security

- Add rate limiting on AI endpoints
- Implement input sanitization
- Optimize database queries with indexes
- Add CDN for audio/video assets

#### Week 24: Demo Prep + Documentation

- Set up demo environment with sample students
- Write technical documentation
- Prepare presentation flow
- Record demo video

---

## 6. Feature Deep Dives

### AI Interviewer Memory System

This is what makes the platform feel genuinely different. The interviewer never forgets what was said.

```python
class InterviewMemory:
    def __init__(self):
        self.key_claims = []  # Factual claims made by candidate
    
    def extract_claims(self, answer: str):
        prompt = f"""
        Extract technical claims from this answer as a JSON list.
        Answer: "{answer}"
        
        Example output: ["BFS is O(n)", "uses a queue", "handles disconnected graphs"]
        Return JSON array only.
        """
        raw = model.generate_content(prompt).text
        new_claims = json.loads(raw.strip())
        self.key_claims.extend(new_claims)
    
    def check_for_contradictions(self, new_answer: str) -> dict:
        if not self.key_claims:
            return {"contradiction": False}
        
        prompt = f"""
        Previous claims by candidate:
        {json.dumps(self.key_claims)}
        
        New answer: "{new_answer}"
        
        Does this contradict any earlier claim?
        Return JSON:
        {{
          "contradiction": true/false,
          "earlier_claim": "what they said before",
          "current_claim": "what they said now",
          "follow_up": "Interviewer challenge question"
        }}
        """
        return json.loads(model.generate_content(prompt).text.strip())
```

### Post-Session Detailed Report

```
Interview Report — John Doe — April 15, 2025
─────────────────────────────────────────────

Overall Score: 6.4/10

Skill Breakdown:
  Algorithm Knowledge    ████████░░  7.8/10
  Coding Implementation  ██████░░░░  5.9/10
  Edge Case Thinking     █████░░░░░  4.2/10
  Communication Clarity  ██████░░░░  5.5/10
  Time Management        ███████░░░  7.0/10

Session Timeline:
  02:14  ✓ Good explanation of BFS approach
  07:33  ⚠ Missed edge case: empty graph input
  12:08  ✓ Correctly identified O(n+m) complexity
  15:44  ✗ Contradiction: earlier said O(n), now said O(n²)
  19:22  ⚠ Long silence (22 seconds) before coding

Anti-Cheat Events:
  None detected

Recommended Focus Areas:
  1. Edge case identification — practice with boundary inputs
  2. Consistency in complexity analysis
  3. Dynamic Programming (score: 3.1/10)
```

---

## 7. AI Prompt System

### Question Generation

```python
QUESTION_GEN_PROMPT = """
Generate {count} {difficulty} interview questions on {topic}.

Requirements:
- Company-style phrasing (like real Google/Amazon interviews)
- Include expected answer outline
- Add difficulty rating (1-10)
- Add topic tags

Return ONLY a valid JSON array. No preamble, no backticks.

[
  {
    "content": "question text",
    "type": "theory/coding/system_design",
    "difficulty": "{difficulty}",
    "topic": "{topic}",
    "company_tag": "Google/Amazon/null",
    "expected_answer": "detailed outline",
    "time_estimate_minutes": 10
  }
]
"""
```

### Answer Evaluation

```python
EVALUATION_PROMPT = """
Evaluate this interview answer.

Question: {question}

Candidate Answer: {answer}

Return ONLY valid JSON:
{
  "score": 7,
  "correctness": "correct/partial/incorrect",
  "strengths": ["..."],
  "weaknesses": ["..."],
  "missed_concepts": ["..."],
  "model_answer": "ideal answer outline",
  "follow_up_suggestion": "next question to ask"
}
"""
```

### Behavioral Interviewer

```python
BEHAVIORAL_SYSTEM_PROMPT = """
You are a behavioral interviewer at a top tech company.

Your style:
- Ask about real past experiences (STAR format)
- Ask follow-up questions based on what the candidate says
- Probe for specifics: exact numbers, timelines, outcomes
- Challenge vague answers with "Can you be more specific?"

Current question: {question}
Candidate answer: {answer}

Generate your next response. Sound natural, conversational.
Return JSON:
{
  "message": "your next statement",
  "type": "follow_up/redirect/close"
}
"""
```

---

## 8. Anti-Cheat Pipeline

```
Browser Events                  Server Side
─────────────────               ──────────────────────
Tab switch detected  ──────►   Log event (severity: medium)
Fullscreen exit      ──────►   Warn student, log event
                                
MediaPipe Events
─────────────────
Face missing         ──────►   Warn after 3 seconds, log
Multiple faces       ──────►   Immediate flag (severity: high)
Gaze away > 5s       ──────►   Log event (severity: low)
Gaze away > 15s      ──────►   Warning popup

Aggregation Logic
─────────────────
< 3 low events       →  No action
3+ low events        →  Suspicious label on report
Any high event       →  Flagged for review
2+ high events       →  Auto-flagged as compromised
```

Important: The system uses **flagging + human review**, not auto-fail. Eye tracking has false positives. Always label as "suspicious behavior detected" rather than "cheated." Final decision belongs to the placement officer.

---

## 9. Deployment Strategy

### Development

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  
  backend:
    build: ./backend
    ports: ["8000:8000"]
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/interview_db
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - ELEVENLABS_API_KEY=${ELEVENLABS_API_KEY}
  
  db:
    image: postgres:15
    volumes: ["postgres_data:/var/lib/postgresql/data"]
  
  redis:
    image: redis:7-alpine
```

### Production

```
Frontend    →  Vercel (free tier sufficient)
Backend     →  AWS EC2 t3.medium OR Railway
Database    →  AWS RDS PostgreSQL OR Supabase
Redis       →  AWS ElastiCache OR Upstash
Storage     →  AWS S3 (session recordings)
AI APIs     →  Gemini, ElevenLabs, Whisper via API keys
```

---

## 10. Timeline Summary

| Phase | Weeks | Deliverable |
|---|---|---|
| 1 — Foundation | 1–4 | Auth, dashboard, question generation, basic evaluation |
| 2 — Coding System | 5–8 | Monaco editor, Judge0, AI code review |
| 3 — Voice Engine | 9–12 | Speech, TTS, AI orchestrator, WebSocket session |
| 4 — Anti-Cheat | 13–16 | Gaze tracking, tab monitoring, screen sharing |
| 5 — Adaptive Engine | 17–20 | Skill vectors, adaptive questions, analytics dashboards |
| 6 — Polish + Launch | 21–24 | Replay, testing, optimization, demo prep |

**Total: 24 weeks / 6 months** (solo developer, full-time or near full-time)

### Minimum Viable Version (8 weeks)

If you need to demo something working fast:

- Week 1–2: Auth + question generation
- Week 3–4: Custom test + basic evaluation
- Week 5–6: Coding editor + Judge0
- Week 7–8: Basic AI text interview + evaluation report

That gives you something genuinely impressive for a mid-project review.

---

## Critical Advice Before You Start

**Design before you code.** Spend the first 1–2 weeks doing only this:

1. Finalize the database schema
2. Map out the API endpoints
3. Write the core Gemini prompts and test them manually
4. Draw the interview orchestrator logic on paper

The interview orchestrator is the hardest part. If the conversation logic is messy, everything else falls apart. Get that right first.

**The single biggest mistake** teams make with AI interview simulators is treating it like a static Q&A system — question in, answer out, score returned. The magic is in the conversation memory, the follow-ups, and the contradictions. Build the orchestrator properly from the start, not as an afterthought.

---

## 11. Open Source AI Models and APIs

This section covers every AI tool layer you need — from unlimited question generation to real-time emotional voice interaction — with free and open-source options at each layer.

---

### 11.1 LLM — Question Generation, Answer Evaluation, Conversation Brain

These models handle the core intelligence: generating interview questions, evaluating answers, running the conversation memory, and detecting contradictions.

#### Primary Recommendation

| Model | Access | Context Window | Best For |
|---|---|---|---|
| Gemini 1.5 Pro / 2.5 Flash | Google AI Studio (free) | 1M tokens | Primary LLM, screen analysis |
| Llama 3.1 405B | Groq / Together AI | 128K | Fallback, offline deploy |
| DeepSeek V3 | OpenRouter / self-host | 128K | Scale question generation |
| Mixtral 8x22B | Groq free tier | 64K | Fast follow-up logic |
| Qwen 3 235B | HuggingFace / self-host | 32K | Multilingual students |

**Google AI Studio** gives you the most generous free tier: up to 1 million tokens per minute with Gemini 2.5 Flash. This is enough to run multiple simultaneous interview sessions without hitting billing.

**Groq** runs Llama and Mixtral at 300+ tokens per second — fast enough for real-time follow-up generation with no perceptible delay.

#### Smart Multi-Model Routing

Don't lock into one model. Route by task:

```python
# backend/services/llm_router.py

class LLMRouter:
    async def route(self, task: str, payload: dict) -> str:
        if task == "question_generation":
            # High quality, no latency requirement
            return await self.call_gemini(payload)
        
        elif task == "realtime_followup":
            # Speed critical — use Groq
            return await self.call_groq(payload, model="llama-3.3-70b")
        
        elif task == "answer_evaluation":
            # Quality critical — use Gemini
            return await self.call_gemini(payload)
        
        elif task == "screen_analysis":
            # Needs vision — Gemini only
            return await self.call_gemini_vision(payload)
        
        elif task == "bulk_questions":
            # High volume, use DeepSeek (cheapest)
            return await self.call_deepseek(payload)
```

#### Free API Gateways

| Gateway | Models Available | Free Limit | Best Use |
|---|---|---|---|
| Google AI Studio | Gemini 1.5 Pro, 2.5 Flash | 1M tokens/min | Primary workhorse |
| Groq | Llama 3.3 70B, Mixtral 8x22B | 300+ tokens/sec | Real-time follow-ups |
| OpenRouter | 300+ models | Request-based | Multi-model fallback |
| HuggingFace Inference | Most open models | Rate limited | Testing and dev |
| Together AI | Llama 4, Qwen, DeepSeek | $25 free credit | Multimodal tasks |
| Cerebras | Llama 3.1 70B | Very fast | Low latency tasks |

---

### 11.2 Speech-to-Text — Student Voice Input

Every student answer needs to be transcribed in real-time. Latency here directly affects how natural the interview feels.

| Tool | Type | Latency | Cost | Best For |
|---|---|---|---|---|
| faster-whisper | Local / self-hosted | ~300ms | Free | Offline deployment |
| Deepgram | API (free tier) | ~100ms | Free tier | Real-time streaming |
| Vosk | Local / offline | ~200ms | Free | No-internet campuses |
| RealtimeSTT | Python library | ~150ms | Free | Live transcription |
| Whisper (OpenAI) | API | ~500ms | Paid | Highest accuracy |

**Recommendation**: Run `faster-whisper` locally for offline/college deployments. Use Deepgram free tier if you need real-time streaming with lower infrastructure overhead.

```python
# backend/services/speech_to_text.py
from faster_whisper import WhisperModel

class SpeechTranscriber:
    def __init__(self):
        # Use "base" for speed, "large-v3" for accuracy
        self.model = WhisperModel("base", device="cpu", compute_type="int8")
    
    async def transcribe(self, audio_bytes: bytes) -> str:
        # Save bytes to temp file
        with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
            f.write(audio_bytes)
            temp_path = f.name
        
        segments, _ = self.model.transcribe(temp_path, beam_size=5)
        transcript = " ".join([seg.text for seg in segments])
        return transcript.strip()
```

**RealtimeSTT** is worth using for the live interview — it has built-in sentence-end detection and wake-word support, so you don't have to manually figure out when the student has finished speaking.

---

### 11.3 Text-to-Speech with Emotional Intelligence

This is the layer most platforms get wrong. Flat, robotic TTS immediately breaks immersion. Your AI interviewer needs to sound like an actual person — with impatience, warmth, curiosity, or pressure depending on the situation.

#### Top Open-Source Emotional TTS Options

**Maya1 TTS (Most Recommended)**
- 20+ built-in emotions: laughter, anger, whispering, sighing, crying, gasping, and more
- Describe voice behavior in plain English — "speak with mild impatience and a slight edge"
- Apache 2.0 license — completely free for commercial use
- Runs on a single 16GB VRAM GPU (RTX 4090 works)
- Supports real-time streaming
- GitHub: `maya-research/maya1-tts`

**Chatterbox (Resemble AI)**
- MIT licensed, first major open-source model with emotion exaggeration control
- Single `exaggeration` parameter from 0.0 (monotone) to 1.0 (dramatic)
- Voice cloning from a few seconds of reference audio — clone distinct voices for each interviewer
- Consistently outperforms ElevenLabs in blind tests according to its benchmark suite
- GitHub: `resemble-ai/chatterbox`

**CosyVoice 2**
- Ultra-low latency: 150ms in streaming mode
- Fine-grained emotion and dialect control
- Supports English, Chinese, Japanese, Korean — good for multilingual deployments
- GitHub: `FunAudioLLM/CosyVoice`

**Kokoro**
- Lightweight, fully local, no API key
- Less expressive but zero latency and zero cost
- Good fallback when GPU is not available

**IndexTTS-2**
- Industrial-strength model with voice consistency across long sessions
- Good for keeping the AI interviewer's voice stable through a 30-minute session

#### Emotion-Responsive Voice Logic

The real innovation is making the interviewer's tone adapt to the student's emotional state:

```python
# backend/services/emotional_tts.py

EMOTION_TO_VOICE_STYLE = {
    "fearful": {
        "style": "warm and reassuring, slower pace",
        "exaggeration": 0.3
    },
    "confused": {
        "style": "patient and clear, slightly slower",
        "exaggeration": 0.2
    },
    "frustrated": {
        "style": "calm and encouraging",
        "exaggeration": 0.25
    },
    "confident": {
        "style": "engaged and slightly challenging",
        "exaggeration": 0.5
    },
    "neutral": {
        "style": "professional and focused",
        "exaggeration": 0.4
    }
}

async def speak_with_emotion(text: str, detected_emotion: str, interviewer: str) -> bytes:
    style = EMOTION_TO_VOICE_STYLE.get(detected_emotion, EMOTION_TO_VOICE_STYLE["neutral"])
    
    # Using Chatterbox
    audio = chatterbox.generate(
        text=text,
        voice_ref=INTERVIEWER_VOICE_REFS[interviewer],
        exaggeration=style["exaggeration"],
        style_prompt=style["style"]
    )
    return audio
```

---

### 11.4 Real-Time Emotion Detection and Face Analysis

This is what gives your platform genuine emotional intelligence. The system reads how the student is feeling and adapts in real time.

#### Emotion Detection Tools

**DeepFace (Primary Recommendation)**
- Python library wrapping multiple state-of-the-art face analysis models
- Detects 7 emotions: angry, disgusted, fearful, happy, neutral, sad, surprised
- Estimates age, gender, and race as secondary outputs
- Real-time stream mode built in
- Completely free and open-source

```python
# backend/services/emotion_detector.py
from deepface import DeepFace
import cv2
import base64
import numpy as np

class EmotionDetector:
    def analyze_frame(self, frame_base64: str) -> dict:
        # Decode base64 frame from browser
        img_bytes = base64.b64decode(frame_base64)
        img_array = np.frombuffer(img_bytes, dtype=np.uint8)
        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        try:
            result = DeepFace.analyze(
                frame,
                actions=["emotion"],
                enforce_detection=False,  # don't crash if face partially visible
                silent=True
            )
            dominant_emotion = result[0]["dominant_emotion"]
            confidence = result[0]["emotion"][dominant_emotion] / 100.0
            return {
                "emotion": dominant_emotion,
                "confidence": confidence,
                "all_scores": result[0]["emotion"]
            }
        except Exception:
            return {"emotion": "neutral", "confidence": 0.0, "all_scores": {}}
```

**Hume AI Expression API**
- Analyzes emotions from both face and voice simultaneously
- The only tool in this list that does bi-directional emotion (detects student state AND adjusts AI response tone)
- Free tier available, usage-based after that
- Best for production-quality emotion reading without running your own GPU

**MediaPipe Face Mesh**
- Already in your architecture for gaze tracking
- Combine with DeepFace: MediaPipe handles gaze + presence detection, DeepFace handles emotional state
- Runs fully in the browser via WASM — no server round trip for basic monitoring

**InsightFace**
- Sub-2ms inference on edge devices
- Best when you need emotion detection on low-end college laptops
- More accurate face detection than DeepFace on partially obscured faces

**FER2013 Custom CNN**
- Train your own model on the FER2013 dataset (35,887 labeled images, 7 emotions)
- Excellent for capstone portfolio — you can say you trained a custom emotion model
- Simple to build with PyTorch or TensorFlow

```python
# Simple FER2013 CNN architecture
import torch.nn as nn

class EmotionCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 32, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(32, 64, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
            nn.Conv2d(64, 128, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2),
        )
        self.classifier = nn.Sequential(
            nn.Flatten(),
            nn.Linear(128 * 6 * 6, 256), nn.ReLU(), nn.Dropout(0.5),
            nn.Linear(256, 7)  # 7 emotion classes
        )
    
    def forward(self, x):
        return self.classifier(self.features(x))
```

#### How Emotion Data Flows Into the Interview

```
Webcam frame (every 3 seconds)
         ↓
DeepFace.analyze() → dominant_emotion + confidence
         ↓
If confidence > 0.6:
    → Adjust TTS voice style
    → Optionally insert empathetic AI remark
    → Log emotional timeline for post-session report
         ↓
Post-session report includes emotion graph:
    "Minutes 5–8: candidate showed sustained anxiety"
    "Minute 14: confidence spike after solving the problem"
```

---

### 11.5 Real-Time Voice Pipeline Frameworks

Instead of manually wiring STT → LLM → TTS together yourself, these frameworks handle the plumbing.

**Pipecat (Primary Recommendation)**
- Open-source framework built specifically for voice and multimodal conversational AI
- Native support for Whisper, Deepgram, ElevenLabs, Gemini, Chatterbox — basically your entire stack
- Handles audio streaming, turn detection, interruption logic, and latency management
- Active community, well-documented
- GitHub: `pipecat-ai/pipecat`

```python
# Example Pipecat pipeline setup
from pipecat.pipeline.pipeline import Pipeline
from pipecat.services.deepgram import DeepgramSTTService
from pipecat.services.google import GoogleLLMService
from pipecat.services.elevenlabs import ElevenLabsTTSService

pipeline = Pipeline([
    transport.input(),           # WebRTC audio in
    DeepgramSTTService(),        # Student voice → text
    interview_orchestrator,      # Your custom logic
    GoogleLLMService(),          # Gemini response
    ElevenLabsTTSService(),      # Text → interviewer voice
    transport.output()           # Audio back to student
])
```

**LiveKit**
- WebRTC infrastructure with AI agent support built in
- Handles all the real-time audio/video transport so you never touch WebRTC internals
- Has a free self-hosted option
- Best choice if you want the interview room to also support video

**TEN Framework (Agora)**
- Open-source self-hosted framework for real-time multimodal conversational AI
- More enterprise-grade, designed for high-concurrency college deployments
- Good if you're planning to run this for hundreds of students simultaneously

**Vocode**
- Open-source library for building voice agents
- Has built-in conversation abstractions: endpointing, emotion tracking, turn management
- Good for custom conversation logic where you need more control than Pipecat gives

---

### 11.6 Recommended Stack by Deployment Type

#### College Capstone Demo (Zero Budget)

| Layer | Tool | Why |
|---|---|---|
| LLM | Gemini 2.5 Flash via Google AI Studio | Free, 1M tokens/min |
| STT | faster-whisper (local) | Free, runs on CPU |
| TTS | Kokoro or Chatterbox | Free, local, no API key |
| Emotion | DeepFace + MediaPipe | Free, open-source |
| Pipeline | Pipecat | Ties everything together |
| Coding Judge | Judge0 free tier | 100 submissions/day |

#### Production College Deployment (Minimal Cost)

| Layer | Tool | Why |
|---|---|---|
| LLM | Gemini 1.5 Pro (primary) + Groq (real-time) | Best quality + speed combo |
| STT | Deepgram free tier | 200 hours/month free |
| TTS | Maya1 TTS (self-hosted) | Best emotional range, free |
| Emotion | Hume AI (free tier) | Bi-directional emotion |
| Pipeline | LiveKit + Pipecat | Production WebRTC + AI |
| Coding Judge | Self-hosted Judge0 | Unlimited submissions |

---

### 11.7 Emotional Intelligence System Design

The real differentiator is combining all these tools into a system that actually feels human. Here's the complete emotional loop:

```
                    ┌─────────────────────────────┐
                    │     Student in interview     │
                    └──────────────┬──────────────┘
                                   │
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
        Voice input           Webcam feed          Screen share
              │                    │                     │
        Deepgram STT          DeepFace EDA          Gemini Vision
              │                    │                     │
        Transcript           Emotion score          Code analysis
              │                    │                     │
              └────────────────────┼─────────────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │    Interview Orchestrator    │
                    │                             │
                    │  1. Evaluate answer         │
                    │  2. Check for contradiction │
                    │  3. Read emotion state      │
                    │  4. Pick next action        │
                    │  5. Set TTS voice style     │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │    Maya1 / Chatterbox TTS    │
                    │  Emotion-matched voice out   │
                    └─────────────────────────────┘
```

#### Emotion-Driven Interviewer Behaviors

| Student Emotion | Confidence | AI Interviewer Response |
|---|---|---|
| Fearful | > 0.7 | Slows pace, uses warmer tone, offers a hint |
| Confused | > 0.6 | Rephrases the question differently |
| Frustrated | > 0.65 | Acknowledges difficulty, asks what's blocking them |
| Confident | > 0.6 | Increases challenge level, asks harder follow-up |
| Happy/excited | > 0.7 | Matches energy, pushes deeper |
| Neutral | any | Continues normal interview flow |

#### Post-Session Emotion Report

Every interview session generates an emotional timeline alongside the technical evaluation:

```
Emotional Timeline — 25 minute session

00:00 – 02:30   Neutral (baseline)
02:30 – 05:00   Fearful (0.74) — question: "Design a distributed cache"
05:00 – 08:00   Confused (0.68) — AI rephrased the question at 06:15
08:00 – 12:00   Neutral — candidate found their footing
12:00 – 15:30   Confident (0.71) — solved the core problem correctly
15:30 – 18:00   Frustrated (0.66) — edge case challenge
18:00 – 25:00   Neutral → Happy (0.62) — wrapped up well

Insight: Candidate struggles under initial pressure but recovers well.
Communication confidence improves significantly after first correct answer.
Recommend: practice timed cold-start problems to reduce early anxiety.
```

This output is something no current interview platform produces. It's the kind of feedback a professional coach would give.

---

*Document version 2.0 — Updated with Open Source AI Models and Emotional Intelligence Stack*
