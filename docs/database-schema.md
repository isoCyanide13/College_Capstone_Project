# Database Schema Documentation

> Full PostgreSQL schema for the AI Interview Platform.
> See `AI_Interview_Platform_Implementation_Plan.md` Section 4 for the original schema definition.

---

## Entity Relationship Diagram

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ colleges │◄────│  users   │────►│  skill   │
│          │     │          │     │ vectors  │
└──────────┘     └────┬─────┘     └──────────┘
                      │
                 ┌────▼─────┐
                 │ sessions │
                 └────┬─────┘
                      │
         ┌────────────┼────────────┐
         │            │            │
    ┌────▼───┐  ┌─────▼──────┐  ┌─▼──────────┐
    │answers │  │conversation│  │cheat_events│
    └───┬────┘  │   _logs    │  └────────────┘
        │       └────────────┘
   ┌────▼──────┐
   │evaluations│
   └───────────┘
```

## Tables

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| role | VARCHAR(20) | CHECK (student, admin, placement_officer) |
| college_id | UUID | FK → colleges(id) |
| created_at | TIMESTAMP | DEFAULT NOW() |

### colleges
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| name | VARCHAR(200) | NOT NULL |
| batch_year | INT | |
| placement_officer_id | UUID | |

### questions
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| content | TEXT | NOT NULL |
| type | VARCHAR(30) | CHECK (mcq, coding, theory, system_design, behavioral) |
| difficulty | VARCHAR(10) | CHECK (easy, medium, hard) |
| topic | VARCHAR(100) | |
| company_tag | VARCHAR(100) | |
| expected_answer | TEXT | |
| test_cases | JSONB | For coding questions |
| ai_generated | BOOLEAN | DEFAULT FALSE |
| created_at | TIMESTAMP | DEFAULT NOW() |

### sessions
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FK → users(id) |
| session_type | VARCHAR(30) | CHECK (full_test, custom, ai_interview, mock_panel) |
| status | VARCHAR(20) | CHECK (scheduled, active, completed, aborted) |
| started_at | TIMESTAMP | |
| ended_at | TIMESTAMP | |
| cheat_flags | JSONB | DEFAULT [] |
| recording_url | TEXT | |
| created_at | TIMESTAMP | DEFAULT NOW() |

### answers
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| session_id | UUID | FK → sessions(id) |
| question_id | UUID | FK → questions(id) |
| user_id | UUID | FK → users(id) |
| response_text | TEXT | |
| response_code | TEXT | |
| voice_transcript | TEXT | |
| time_taken_seconds | INT | |
| submitted_at | TIMESTAMP | DEFAULT NOW() |

### evaluations
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| answer_id | UUID | FK → answers(id) |
| score | NUMERIC(4,2) | |
| strengths | TEXT | |
| weaknesses | TEXT | |
| model_answer | TEXT | |
| code_result | JSONB | Test case results |
| evaluated_by | VARCHAR(20) | CHECK (gemini, judge0, hybrid) |
| created_at | TIMESTAMP | DEFAULT NOW() |

### skill_vectors
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| user_id | UUID | FK → users(id), UNIQUE |
| arrays | NUMERIC(4,2) | DEFAULT 0 |
| linked_lists | NUMERIC(4,2) | DEFAULT 0 |
| trees | NUMERIC(4,2) | DEFAULT 0 |
| graphs | NUMERIC(4,2) | DEFAULT 0 |
| dynamic_programming | NUMERIC(4,2) | DEFAULT 0 |
| system_design | NUMERIC(4,2) | DEFAULT 0 |
| communication | NUMERIC(4,2) | DEFAULT 0 |
| coding_speed | NUMERIC(4,2) | DEFAULT 0 |
| edge_case_thinking | NUMERIC(4,2) | DEFAULT 0 |
| last_updated | TIMESTAMP | DEFAULT NOW() |

### cheat_events
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| session_id | UUID | FK → sessions(id) |
| event_type | VARCHAR(50) | |
| severity | VARCHAR(10) | CHECK (low, medium, high) |
| timestamp | TIMESTAMP | DEFAULT NOW() |
| metadata | JSONB | |

### conversation_logs
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PRIMARY KEY |
| session_id | UUID | FK → sessions(id) |
| speaker | VARCHAR(20) | CHECK (interviewer_1-3, candidate) |
| message | TEXT | NOT NULL |
| timestamp | TIMESTAMP | DEFAULT NOW() |
| sequence_number | INT | |
