# What to Learn — Backend & Database Roadmap

> **Purpose:** This is your personal learning roadmap.
> It tells you exactly WHAT topics to study, WHY you need them for this
> project, and HOW DEEP to go — so you can search YouTube or courses
> confidently.
>
> Every topic is tagged with a priority:
> 🔴 **MUST LEARN FIRST** — Can't start backend without this
> 🟡 **LEARN NEXT** — Needed for core features
> 🟢 **LEARN LATER** — Advanced features, Phase 3-4

---

## Table of Contents

1. [Python Fundamentals](#1-python-fundamentals)
2. [FastAPI — Your Backend Framework](#2-fastapi--your-backend-framework)
3. [Databases — PostgreSQL + SQLAlchemy](#3-databases--postgresql--sqlalchemy)
4. [Authentication — JWT Tokens](#4-authentication--jwt-tokens)
5. [Docker — Running Services Locally](#5-docker--running-services-locally)
6. [API Design — REST Concepts](#6-api-design--rest-concepts)
7. [Pydantic — Data Validation](#7-pydantic--data-validation)
8. [Alembic — Database Migrations](#8-alembic--database-migrations)
9. [AI / LLM Integration — Gemini API](#9-ai--llm-integration--gemini-api)
10. [WebSockets — Real-Time Communication](#10-websockets--real-time-communication)
11. [Redis — Caching and Background Jobs](#11-redis--caching-and-background-jobs)
12. [Code Execution — Judge0 API](#12-code-execution--judge0-api)
13. [Speech / Audio — Whisper + TTS](#13-speech--audio--whisper--tts)
14. [Computer Vision — OpenCV + MediaPipe](#14-computer-vision--opencv--mediapipe)
15. [Testing — pytest](#15-testing--pytest)
16. [Recommended Study Order](#16-recommended-study-order)

---

## 1. Python Fundamentals

**Priority:** 🔴 MUST LEARN FIRST
**Depth needed:** Intermediate
**YouTube search:** `"Python for backend development"`, `"Python async await tutorial"`

### What You Need to Know

You don't need to master ALL of Python — just the parts the backend uses.

#### Basics (skip if you already know these)
- Variables, data types (strings, numbers, lists, dicts)
- Functions, parameters, return values
- `if/else`, `for` loops
- Classes and objects (basic OOP)
- Importing modules (`from x import y`)

#### Intermediate (IMPORTANT for this project)

**Type Hints** — Python can annotate what type each variable/parameter is.
Your project uses this heavily:

```python
def create_user(name: str, email: str, age: int) -> dict:
    # "name: str" means the 'name' parameter should be a string
    # "-> dict" means this function returns a dictionary
    return {"name": name, "email": email, "age": age}
```

**YouTube search:** `"Python type hints tutorial"`

**Async/Await** — Your backend uses "asynchronous" Python, which means it
can handle multiple requests at the same time instead of one-by-one:

```python
# Normal (synchronous) — blocks while waiting for database
def get_user(id):
    user = database.fetch(id)   # Everything stops here until DB responds
    return user

# Async — continues processing other requests while waiting
async def get_user(id):
    user = await database.fetch(id)   # Handles other requests while waiting
    return user
```

**YouTube search:** `"Python asyncio tutorial for beginners"`, `"async await Python explained"`

**Decorators** — Functions that wrap other functions. FastAPI uses them
everywhere:

```python
@app.get("/users")       # This "@" thing is a decorator
async def list_users():  # It tells FastAPI: "when someone visits /users, run this function"
    return [...]
```

**YouTube search:** `"Python decorators explained simply"`

**Context Managers** (`with` and `async with`) — Used for database
connections:

```python
async with async_session() as session:   # Opens a database connection
    user = await session.get(User, id)   # Uses it
# Connection automatically closes here, even if there's an error
```

**YouTube search:** `"Python context managers with statement"`

---

## 2. FastAPI — Your Backend Framework

**Priority:** 🔴 MUST LEARN FIRST
**Depth needed:** Intermediate
**YouTube search:** `"FastAPI full tutorial"`, `"FastAPI crash course 2024"`

### What is FastAPI?

FastAPI is a Python framework for building web APIs (the backend server
that your frontend talks to). When your React frontend calls
`fetch("/api/auth/login")`, FastAPI receives that request and responds.

### Key Concepts to Learn

**1. Routes (Endpoints)** — Each URL gets mapped to a Python function:

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/users")                  # GET request to /users
async def list_users():
    return [{"name": "Alice"}, {"name": "Bob"}]

@router.post("/users")                 # POST request to /users
async def create_user(data: UserCreate):
    # data is automatically parsed from the JSON body
    return {"id": 1, "name": data.name}

@router.get("/users/{user_id}")        # GET request to /users/123 (dynamic URL)
async def get_user(user_id: str):
    return {"id": user_id}
```

This is exactly what your `backend/routers/auth.py`, `sessions.py`,
`questions.py` etc. will contain.

**2. Request/Response Models** — FastAPI uses Pydantic models (see section 7)
to validate incoming data:

```python
@router.post("/login")
async def login(credentials: LoginRequest):
    # FastAPI automatically:
    # 1. Reads the JSON from the request body
    # 2. Validates it matches LoginRequest (has email + password fields)
    # 3. Returns 422 error if validation fails
    # 4. Passes the parsed data as 'credentials'
    pass
```

**3. Dependency Injection** — FastAPI can automatically provide things
your functions need:

```python
@router.get("/me")
async def get_me(
    current_user = Depends(get_current_user),   # FastAPI calls get_current_user() automatically
    db: AsyncSession = Depends(get_db),          # FastAPI gives you a database connection
):
    # Both 'current_user' and 'db' are ready to use
    pass
```

Your project already has `get_db()` in `database/connection.py` and
`get_current_user()` in `middleware/auth.py` — they just need to be
uncommented and connected.

**4. CORS Middleware** — Already configured in your `main.py`. This lets
your frontend (localhost:3000) talk to your backend (localhost:8000)
without the browser blocking it.

**5. Auto-Generated API Docs** — When your backend is running, visit
`localhost:8000/docs` to see automatic Swagger documentation with a
"Try It Out" button for every endpoint. This is incredibly useful for
testing.

### Where Your Files Fit

```
Your frontend calls:  POST /api/auth/login
                      ↓
main.py:              app.include_router(auth.router, prefix="/api/auth")
                      ↓
routers/auth.py:      @router.post("/login")
                      async def login(credentials: LoginRequest):
                      ↓
                      Validates data → Queries database → Returns JWT token
```

**Recommended tutorial:** `"FastAPI full course 2024"` (look for 2+ hour
ones that cover routing, Pydantic, database, and auth)

---

## 3. Databases — PostgreSQL + SQLAlchemy

**Priority:** 🔴 MUST LEARN FIRST
**Depth needed:** Intermediate
**YouTube search:** `"SQLAlchemy 2.0 async tutorial"`, `"PostgreSQL for beginners"`,
`"FastAPI SQLAlchemy PostgreSQL tutorial"`

### What You Need to Know

#### PostgreSQL (the database)

PostgreSQL is where all your data lives permanently — users, questions,
sessions, answers, scores. Think of it as a collection of spreadsheets
(called "tables").

Your docker-compose.yml already runs PostgreSQL for you:

```yaml
db:
  image: postgres:15-alpine
  environment:
    POSTGRES_USER: postgres      # Username to connect
    POSTGRES_PASSWORD: postgres  # Password to connect
    POSTGRES_DB: interview_db    # Database name
  ports:
    - "5432:5432"                # Accessible on your machine at port 5432
```

**Basic SQL concepts to learn:**
- `CREATE TABLE` — defining tables (columns, types, constraints)
- `INSERT INTO` — adding new rows
- `SELECT ... FROM ... WHERE` — reading data with filters
- `UPDATE` — changing existing data
- `DELETE` — removing data
- `JOIN` — combining data from related tables
- Primary keys, foreign keys, indexes
- `UUID` — your project uses UUIDs instead of auto-incrementing IDs

**YouTube search:** `"SQL for beginners"`, `"PostgreSQL basics tutorial"`

#### SQLAlchemy (the Python ↔ Database bridge)

Instead of writing raw SQL, your project uses SQLAlchemy — a Python library
that lets you interact with the database using Python classes:

```python
# Instead of:  INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com')
# You write:
new_user = User(name="Alice", email="alice@example.com", password_hash="...")
session.add(new_user)
await session.commit()

# Instead of:  SELECT * FROM users WHERE email = 'alice@example.com'
# You write:
result = await session.execute(select(User).where(User.email == "alice@example.com"))
user = result.scalar_one_or_none()
```

#### ORM Models (Object-Relational Mapping)

Your `backend/models/` folder already has these defined. Each file maps a
Python class to a database table:

```python
# backend/models/user.py — This IS your "users" table definition
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)       # Required text, max 100 chars
    email = Column(String(150), unique=True)          # Must be unique across all users
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="student")
    college_id = Column(UUID, ForeignKey("colleges.id"))  # Links to colleges table
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships — lets you access related data
    sessions = relationship("Session", back_populates="user")
    # Now you can do: user.sessions → list of all sessions for this user
```

Your project has 9 models already defined:
`User`, `College`, `Question`, `Session`, `Answer`, `Evaluation`,
`SkillVector`, `CheatEvent`, `ConversationLog`

**YouTube search:** `"SQLAlchemy 2.0 ORM tutorial"`, `"SQLAlchemy async FastAPI"`

#### Async Database Access

Your project uses **async** database connections (faster, handles more
users). The key file is `database/connection.py`:

```python
engine = create_async_engine(settings.DATABASE_URL)  # Connection to PostgreSQL
async_session = async_sessionmaker(engine)            # Creates sessions

async def get_db():            # Gives each request its own database "session"
    async with async_session() as session:
        yield session          # "yield" means: give this to the function that needs it
        await session.commit() # Then commit changes when done
```

**YouTube search:** `"SQLAlchemy async session tutorial"`, `"FastAPI async database"`

---

## 4. Authentication — JWT Tokens

**Priority:** 🔴 MUST LEARN FIRST
**Depth needed:** Surface level (understand the concept, copy the pattern)
**YouTube search:** `"JWT authentication explained"`, `"FastAPI JWT authentication tutorial"`

### How JWT Auth Works (in plain English)

1. User sends email + password to `/api/auth/login`
2. Backend checks if password is correct
3. If yes, backend creates a **JWT Token** — a long string that contains
   the user's ID, encoded with a secret key
4. Frontend stores this token in localStorage
5. For every future request, frontend sends the token in the header:
   `Authorization: Bearer eyJhbGciOi...`
6. Backend decodes the token → gets the user ID → knows who's making the request

### What's Already in Your Project

Your `middleware/auth.py` already has the implementation (just commented out):

```python
# Password hashing — never store plain text passwords
pwd_context = CryptContext(schemes=["bcrypt"])
def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)    # "hello123" → "$2b$12$LJ3m..."

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)  # Checks if they match

# Token creation
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.utcnow() + timedelta(minutes=30)  # Expires in 30 min
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    # Returns something like: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVC..."

# Token verification — runs on every protected request
async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
    user_id = payload.get("sub")   # "sub" = subject = the user ID we encoded
    # Fetch user from database using this ID
```

**Libraries involved:**
- `python-jose` — creates and decodes JWT tokens
- `passlib` + `bcrypt` — hashes passwords securely

**YouTube search:** `"FastAPI JWT auth from scratch"`, `"python-jose JWT tutorial"`

---

## 5. Docker — Running Services Locally

**Priority:** 🔴 MUST LEARN FIRST
**Depth needed:** Surface level (just enough to run `docker compose up`)
**YouTube search:** `"Docker for beginners"`, `"Docker Compose explained"`

### Why You Need Docker

Your project needs PostgreSQL and Redis running on your computer. Instead
of installing them manually, Docker runs them in isolated "containers" —
like lightweight virtual machines.

### What You Need to Know

**Just 3 commands are enough:**

```bash
# Start PostgreSQL + Redis (from the College_Capstone_Project folder)
docker compose up -d

# See running containers
docker compose ps

# Stop everything
docker compose down
```

Your `docker-compose.yml` already defines both services. When you run
`docker compose up -d`, it:
1. Downloads PostgreSQL 15 and Redis 7 images (first time only)
2. Creates containers for each
3. Makes PostgreSQL available at `localhost:5432`
4. Makes Redis available at `localhost:6379`

You DON'T need to learn:
- ❌ Writing Dockerfiles (we might need this later, but not now)
- ❌ Docker networking (docker-compose handles it)
- ❌ Kubernetes, Docker Swarm, etc.

**YouTube search:** `"Docker Compose tutorial for beginners"` (watch a 10-15 min one)

---

## 6. API Design — REST Concepts

**Priority:** 🔴 MUST LEARN FIRST
**Depth needed:** Surface level
**YouTube search:** `"REST API explained"`, `"RESTful API design beginner"`

### The Core Idea

Your frontend sends HTTP requests to specific URLs, and the backend responds
with JSON data. REST is the convention for how those URLs and methods are
organized:

```
GET    /api/users          → List all users        (READ)
POST   /api/users          → Create a new user     (CREATE)
GET    /api/users/123      → Get user #123         (READ one)
PUT    /api/users/123      → Update user #123      (UPDATE)
DELETE /api/users/123      → Delete user #123      (DELETE)
```

**HTTP Methods:**
- `GET` = "Give me data" (no body)
- `POST` = "Here's new data, create something" (has body)
- `PUT` = "Here's updated data, change it" (has body)
- `DELETE` = "Remove this" (no body)

**HTTP Status Codes:**
- `200` = OK, success
- `201` = Created successfully
- `400` = Bad request (your fault — missing required field, etc.)
- `401` = Unauthorized (not logged in)
- `403` = Forbidden (logged in but not allowed)
- `404` = Not found
- `422` = Validation error (FastAPI auto-returns this)
- `500` = Server error (backend crash)

Your frontend's `api.ts` is already built to call these exact patterns.

---

## 7. Pydantic — Data Validation

**Priority:** 🟡 LEARN NEXT
**Depth needed:** Surface level
**YouTube search:** `"Pydantic v2 tutorial"`, `"FastAPI Pydantic models"`

### What It Does

Pydantic validates and converts incoming data automatically. Your project
has these in `backend/schemas/`:

```python
# backend/schemas/auth.py
class UserCreate(BaseModel):
    name: str                          # Required, must be a string
    email: str                         # Required, must be a string
    password: str                      # Required, must be a string
    role: str = "student"              # Optional, defaults to "student"
    college_id: Optional[UUID] = None  # Optional, can be None
```

When someone sends a POST request to `/api/auth/register`, FastAPI
automatically:
1. Reads the JSON body
2. Checks if `name`, `email`, and `password` exist and are strings
3. If `role` is missing, uses `"student"`
4. If anything is wrong, returns a 422 error with details
5. If everything is fine, creates a `UserCreate` object you can use

**The difference between Models and Schemas:**
- `models/user.py` (SQLAlchemy) = How the data is STORED in the database
- `schemas/auth.py` (Pydantic) = How the data is SENT/RECEIVED via the API

They look similar but serve different purposes. Think of schemas as the
"filter" that validates API data before it reaches the database.

---

## 8. Alembic — Database Migrations

**Priority:** 🟡 LEARN NEXT
**Depth needed:** Surface level
**YouTube search:** `"Alembic database migrations tutorial"`, `"FastAPI Alembic PostgreSQL"`

### What Problem It Solves

When you change a model (add a new column, rename a field), you need to
update the actual database table too. Alembic tracks these changes:

```bash
# After you change a model:
alembic revision --autogenerate -m "Added phone number to users"
# → Creates a migration file that describes the change

alembic upgrade head
# → Applies the change to the actual database
```

Without Alembic, you'd have to manually write SQL alter statements or
drop and recreate all tables (losing all data).

**YouTube search:** `"Alembic SQLAlchemy migration tutorial FastAPI"`

---

## 9. AI / LLM Integration — Gemini API

**Priority:** 🟡 LEARN NEXT
**Depth needed:** Intermediate
**YouTube search:** `"Google Gemini API tutorial Python"`, `"Gemini API structured output"`

### What Your Project Uses It For

1. **Question Generation** — "Generate 15 medium difficulty DSA questions"
2. **Answer Evaluation** — "Score this answer out of 10, explain strengths/weaknesses"
3. **AI Interviewers** — 4 AI agents with different personalities that
   conduct mock interviews (see `services/ai_agents.py`)
4. **Follow-up Questions** — AI remembers previous answers and asks deeper questions

### What to Learn

```python
import google.generativeai as genai

genai.configure(api_key="your-key-here")
model = genai.GenerativeModel("gemini-2.5-flash")

# Simple text generation
response = model.generate_content("Explain binary search in 3 sentences")
print(response.text)

# Structured output (what your project needs)
response = model.generate_content("""
Generate 5 easy Python coding questions. Return ONLY valid JSON.
Format: [{"question": "...", "difficulty": "easy", "topic": "..."}]
""")
questions = json.loads(response.text)  # Parse the JSON string into a Python list
```

Your `services/question_generator.py` already has this pattern (commented
out). The AI agents in `services/ai_agents.py` will use conversation
history to maintain context.

**YouTube search:** `"Google Gemini API Python tutorial"`, `"Gemini structured JSON output"`

---

## 10. WebSockets — Real-Time Communication

**Priority:** 🟢 LEARN LATER (Phase 3)
**Depth needed:** Surface level
**YouTube search:** `"Python SocketIO tutorial"`, `"FastAPI WebSocket tutorial"`

### When You'll Need This

For the live interview feature, where the AI interviewer talks to the user
in real-time. Normal HTTP requests are "ask → wait → answer." WebSockets
stay open for a continuous conversation.

```
Normal REST:
  Frontend: "Hey, give me data"  →  Backend: "Here's data"  [connection closed]

WebSocket:
  Frontend: "Let's talk"  →  [connection stays open]
  Frontend: "User said XYZ"  →  Backend: "AI responds with ABC"
  Frontend: "User said DEF"  →  Backend: "AI responds with GHI"
  ... ongoing ...
```

Your project uses `python-socketio` for this. The stubs are in:
- `backend/socket_handlers/interview.py`
- `backend/socket_handlers/anti_cheat.py`

**YouTube search:** `"Python Socket.IO FastAPI"`, `"real-time chat FastAPI WebSocket"`

---

## 11. Redis — Caching and Background Jobs

**Priority:** 🟢 LEARN LATER (Phase 2-3)
**Depth needed:** Surface level
**YouTube search:** `"Redis for beginners"`, `"Celery Python background tasks"`

### Two uses in your project:

**1. Caching** — Store frequently-accessed data in memory (faster than database):
```python
# Instead of querying PostgreSQL every time:
cached_user = await redis.get(f"user:{user_id}")
if cached_user:
    return json.loads(cached_user)   # Fast! Already in memory
else:
    user = await db.get(User, user_id)   # Slow, but only happens once
    await redis.set(f"user:{user_id}", json.dumps(user), ex=300)  # Cache for 5 minutes
```

**2. Background Jobs (Celery)** — Run long tasks without making the user wait:
```python
# AI evaluation takes 10-15 seconds. Don't make the user wait!
# Instead:
@celery_app.task
def evaluate_answer(answer_id):
    # This runs in the background
    score = ai.evaluate(answer)
    save_to_database(score)

# In your API endpoint:
@router.post("/submit")
async def submit_answer(data: AnswerSubmit):
    answer = save_answer(data)
    evaluate_answer.delay(answer.id)   # ".delay()" = run in background
    return {"status": "submitted, evaluation in progress"}
```

**YouTube search:** `"Celery Python tutorial"`, `"Redis caching tutorial Python"`

---

## 12. Code Execution — Judge0 API

**Priority:** 🟢 LEARN LATER (Phase 2)
**Depth needed:** Surface level
**YouTube search:** `"Judge0 API tutorial"`, `"online code execution API"`

### What It Does

When a student writes code in the CodeEditor, you need to actually RUN it
and check if it passes test cases. Judge0 is a cloud API that does this:

```python
# Send code to Judge0
response = httpx.post("https://judge0-ce.p.rapidapi.com/submissions", json={
    "source_code": "print('hello')",
    "language_id": 71,          # 71 = Python
    "stdin": "",                # Input for the program
    "expected_output": "hello"  # What the correct output should be
})
# Judge0 runs it in a sandboxed environment and returns: passed/failed, runtime, memory
```

Your config already has `JUDGE0_API_KEY` and `JUDGE0_BASE_URL` ready.
The stub is in `services/code_judge.py`.

---

## 13. Speech / Audio — Whisper + TTS

**Priority:** 🟢 LEARN LATER (Phase 3)
**Depth needed:** Surface level
**YouTube search:** `"Faster Whisper Python tutorial"`, `"Kokoro TTS Python"`

### Two directions:

**Speech-to-Text (STT)** — Converts spoken words to text.
The student speaks → Whisper converts → text sent to AI agent:
```python
from faster_whisper import WhisperModel
model = WhisperModel("base", device="cpu")
segments, _ = model.transcribe("audio.wav")
text = " ".join([segment.text for segment in segments])
```

**Text-to-Speech (TTS)** — Makes AI agent's text responses audible.
AI generates text → Kokoro converts → audio sent to student.

These are Phase 3 (advanced) features. Don't worry about them now.

---

## 14. Computer Vision — OpenCV + MediaPipe

**Priority:** 🟢 LEARN LATER (Phase 4)
**Depth needed:** Surface level
**YouTube search:** `"MediaPipe face mesh Python"`, `"OpenCV Python tutorial"`

### What Your Project Uses It For

- **Face detection** — Is the student visible in the camera?
- **Gaze tracking** — Are they looking at the screen or at notes?
- **Multiple face detection** — Is someone helping them off-screen?

These power the Anti-Cheat Overlay component on the frontend.
Phase 4 feature — learn this last.

---

## 15. Testing — pytest

**Priority:** 🟢 LEARN LATER
**Depth needed:** Surface level
**YouTube search:** `"pytest tutorial for beginners"`, `"FastAPI testing tutorial"`

### Basic Pattern

```python
# backend/tests/test_auth.py
def test_register():
    response = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "test@example.com",
        "password": "secret123"
    })
    assert response.status_code == 201
    assert response.json()["name"] == "Test User"
```

Your project already has `tests/` folder. Tests help ensure your code
works and doesn't break when you make changes.

---

## 16. Recommended Study Order

Here's the exact order I recommend. Each step builds on the previous one:

### Week 1-2: The Foundation (Can't Skip These)

```
Step 1 → Python fundamentals (if needed)
           Focus on: type hints, async/await, decorators, classes
           Time: 3-5 hours of video

Step 2 → Docker basics
           Just learn: docker compose up, docker compose down
           Time: 30 minutes

Step 3 → SQL basics
           Focus on: CREATE TABLE, SELECT, INSERT, WHERE, JOIN
           Time: 2-3 hours of video

Step 4 → FastAPI crash course
           Watch a FULL tutorial (2+ hours) that builds a REST API
           This covers routes, Pydantic, and database together
           Time: 3-4 hours
```

### Week 3-4: Build the Core Backend

```
Step 5 → SQLAlchemy ORM
           Understand how Python classes map to database tables
           Your models/ folder already has everything defined
           Time: 2-3 hours

Step 6 → JWT Authentication
           Follow a "FastAPI JWT auth" tutorial
           Your middleware/auth.py already has the code (commented out)
           Time: 2 hours

Step 7 → Alembic migrations
           Learn to create and apply database migrations
           Time: 1 hour

Step 8 → Pydantic schemas
           Your schemas/ folder is already ready
           Time: 1 hour
```

### Week 5-6: AI Features

```
Step 9 → Gemini API
           Set up API key, generate text, parse JSON responses
           Time: 2 hours

Step 10 → Build the question generator
            services/question_generator.py (already has the pattern)
            Time: 2-3 hours

Step 11 → Build the answer evaluator
            services/answer_evaluator.py
            Time: 2-3 hours
```

### Week 7+: Advanced Features (As Needed)

```
Step 12 → WebSockets (for live interview)
Step 13 → Redis + Celery (for background tasks)
Step 14 → Judge0 (for code execution)
Step 15 → Whisper + TTS (for voice)
Step 16 → OpenCV + MediaPipe (for proctoring)
```

---

## Quick Reference — Technologies in Your Project

| Technology       | What It Is                     | Where in Project                     |
|------------------|-------------------------------|--------------------------------------|
| FastAPI          | Backend web framework          | `backend/main.py`                   |
| SQLAlchemy       | Database ORM (Python ↔ SQL)    | `backend/models/`, `database/`      |
| PostgreSQL       | Main database                  | `docker-compose.yml`                |
| Redis            | Cache + task queue broker      | `docker-compose.yml`                |
| Pydantic         | Data validation                | `backend/schemas/`                  |
| Alembic          | Database migrations            | Not set up yet                      |
| python-jose      | JWT token create/verify        | `backend/middleware/auth.py`        |
| passlib + bcrypt | Password hashing               | `backend/middleware/auth.py`        |
| Gemini API       | AI question gen + evaluation   | `backend/services/`                |
| python-socketio  | WebSocket real-time comms      | `backend/socket_handlers/`          |
| Celery           | Background job processing      | Not set up yet                      |
| Judge0           | Code execution API             | `backend/services/code_judge.py`    |
| faster-whisper   | Speech-to-text                 | `backend/services/speech_to_text.py`|
| Kokoro           | Text-to-speech                 | `backend/services/text_to_speech.py`|
| OpenCV           | Computer vision                | `backend/services/screen_analyzer.py`|
| MediaPipe        | Face mesh / gaze tracking      | `backend/services/emotion_detector.py`|
| pytest           | Automated testing              | `backend/tests/`                    |
| Docker Compose   | Run databases locally          | `docker-compose.yml`                |

---

## Best YouTube Channels for These Topics

- **Tech With Tim** — Great FastAPI + Python tutorials
- **Traversy Media** — REST API concepts, Docker basics
- **ArjanCodes** — Python patterns, async, clean code
- **Patrick Loeber (Python Engineer)** — FastAPI, SQLAlchemy, ML
- **Fireship** — Quick concept explainers (100-second videos)
- **NetworkChuck** — Docker made fun

---

*This file should be updated as you progress through the learning roadmap.
Check off topics as you complete them, and add notes about any parts that
were confusing or needed extra study.*
