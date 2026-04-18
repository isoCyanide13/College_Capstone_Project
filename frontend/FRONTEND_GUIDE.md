# Frontend Guide — MockAI Platform

> **Last Updated:** April 17, 2026
> **Framework:** Next.js 16 (App Router) + React 19 + Tailwind CSS v4
> **Theme:** "Old-Times Professional" — Retro-Academic, Light Mode
>
> This document explains **everything** in the frontend — what each file does,
> how features are implemented, and what still needs work. Written in plain
> language so you can read the code, verify it, and plan backend work.

---

## Table of Contents

1. [How to Run the Project](#1-how-to-run-the-project)
2. [Project Folder Structure](#2-project-folder-structure)
3. [The Design System (Colors, Fonts, Utilities)](#3-the-design-system)
4. [Root Layout — The Shell Around Every Page](#4-root-layout)
5. [Navigation Bar (Navbar)](#5-navigation-bar)
6. [Pages — One by One](#6-pages)
   - [Landing Page (Home)](#61-landing-page)
   - [Dashboard](#62-dashboard)
   - [Question Practice Hub](#63-question-practice-hub)
   - [Interview Lobby](#64-interview-lobby)
   - [Interview Session (Live)](#65-interview-session)
   - [Login & Register (Auth)](#66-login--register)
   - [Results, Profile, Admin (Placeholder)](#67-placeholder-pages)
7. [Reusable Components](#7-reusable-components)
8. [Hooks (Custom React Logic)](#8-hooks)
9. [Library Files (Utilities & Data)](#9-library-files)
10. [Type Definitions (TypeScript)](#10-type-definitions)
11. [Implementation Status Tracker](#11-implementation-status-tracker)
12. [How to Add New Features / What the Backend Needs](#12-backend-integration-notes)

---

## 1. How to Run the Project

Open a terminal, navigate to the `frontend` folder, and run:

```bash
cd frontend
npm install      # only needed the first time, or after adding new packages
npm run dev      # starts the local development server
```

Then open your browser to **http://localhost:3000**.

The `dev` command uses Next.js's built-in development server with hot-reload —
meaning every time you save a file, the browser updates automatically.

**Key npm scripts:**

| Command          | What it Does                                         |
|------------------|------------------------------------------------------|
| `npm run dev`    | Starts dev server on port 3000                       |
| `npm run build`  | Creates a production-ready build (use to check for errors) |
| `npm run lint`   | Runs ESLint to check for code issues                 |

---

## 2. Project Folder Structure

```
frontend/
├── src/
│   ├── app/                          ← PAGES (each folder = one URL)
│   │   ├── layout.tsx                ← Root layout (wraps ALL pages)
│   │   ├── globals.css               ← All colors, fonts, CSS utilities
│   │   ├── page.tsx                  ← Landing page (localhost:3000/)
│   │   ├── dashboard/page.tsx        ← Dashboard (localhost:3000/dashboard)
│   │   ├── question-practice/page.tsx← Question hub (localhost:3000/question-practice)
│   │   ├── interview/page.tsx        ← Interview lobby (configure session)
│   │   ├── interview/session/page.tsx← Live interview session
│   │   ├── mock-interview/           ← (empty — future)
│   │   ├── full-interview/           ← (empty — future)
│   │   ├── profile/                  ← (empty — future)
│   │   ├── results/[sessionId]/      ← Results page (placeholder)
│   │   ├── admin/page.tsx            ← Admin dashboard (placeholder)
│   │   └── (auth)/                   ← Auth pages (login + register)
│   │       ├── login/page.tsx
│   │       └── register/page.tsx
│   │
│   ├── components/                   ← REUSABLE UI PIECES
│   │   ├── Navbar.tsx                ← Top navigation bar
│   │   ├── TopicSelector.tsx         ← Domain/subject picker grid
│   │   ├── SkillRadar.tsx            ← Radar chart on dashboard
│   │   ├── InterviewPanel.tsx        ← AI interviewer chat panel
│   │   ├── CodeEditor.tsx            ← Code editing area
│   │   └── AntiCheatOverlay.tsx      ← Proctoring badge/alert overlay
│   │
│   ├── hooks/                        ← CUSTOM REACT HOOKS (reusable logic)
│   │   ├── useTypewriter.ts          ← Typewriter text animation
│   │   ├── useAuth.ts                ← (stub — not started)
│   │   ├── useInterview.ts           ← (stub — not started)
│   │   └── useSocket.ts             ← (stub — not started)
│   │
│   ├── lib/                          ← UTILITIES & DATA
│   │   ├── curriculum.ts             ← Domain → Subject mapping data
│   │   ├── api.ts                    ← HTTP client for backend API calls
│   │   ├── auth.ts                   ← (stub — not started)
│   │   ├── socket.ts                 ← (stub — not started)
│   │   ├── anti-cheat.ts             ← (stub — not started)
│   │   └── gaze-tracker.ts           ← (stub — not started)
│   │
│   └── types/
│       └── index.ts                  ← All TypeScript type definitions
│
├── package.json                      ← Dependencies and scripts
├── postcss.config.mjs                ← PostCSS config (needed by Tailwind v4)
├── tsconfig.json                     ← TypeScript configuration
└── next.config.ts                    ← Next.js configuration
```

**Key Concept — How Next.js Routing Works:**

In Next.js App Router, every folder inside `src/app/` that has a `page.tsx`
becomes a URL route. For example:

- `src/app/page.tsx` → `localhost:3000/`
- `src/app/dashboard/page.tsx` → `localhost:3000/dashboard`
- `src/app/question-practice/page.tsx` → `localhost:3000/question-practice`

Folders without a `page.tsx` (like `mock-interview/`) exist but show a 404.

---

## 3. The Design System

**File:** `src/app/globals.css`

This is where all colors, fonts, and reusable CSS classes are defined. Every
page and component pulls from these — so if you change a color here, it
changes everywhere.

### 3.1 Color Palette

All colors are stored as CSS variables in the `:root` block:

```css
:root {
  --surface: #FAFAF8;         /* Main background — warm off-white */
  --surface-alt: #F0EDE8;     /* Slightly darker background for sections */
  --surface-raised: #FFFFFF;  /* Cards and elevated elements — pure white */
  --ink: #1A1A1A;             /* Main text color — near-black */
  --ink-muted: #6B6B6B;       /* Secondary text — gray */
  --ink-faint: #9E9E9E;       /* Faintest text — light gray */
  --accent: #8B7355;          /* Primary accent — warm brown/ochre */
  --accent-hover: #6F5B42;    /* Darker brown for hover states */
  --accent-light: rgba(139, 115, 85, 0.08);  /* Very subtle brown tint */
  --border: #E0DCD6;          /* Thin divider lines */
  --border-strong: #C4BEB5;   /* Heavier divider / hover borders */
  --success: #3D7A4A;         /* Green — for "ready", "passed" */
  --warning: #B8860B;         /* Gold — for warnings or scores */
  --danger: #A63D3D;          /* Red — for errors or violations */
  --code-bg: #1E1E1E;         /* Dark background for code editor */
}
```

**How to use them in code:** In any `.tsx` file with Tailwind classes, you
write things like `text-ink`, `bg-surface`, `border-accent`. These work
because of the `@theme inline` block that maps CSS variables to Tailwind:

```css
@theme inline {
  --color-surface: var(--surface);    /* Makes "bg-surface" and "text-surface" work */
  --color-ink: var(--ink);            /* Makes "text-ink" and "bg-ink" work */
  --color-accent: var(--accent);      /* Makes "text-accent" and "bg-accent" work */
  /* ... all other colors ... */
  --font-headline: var(--font-headline);  /* Makes "font-headline" class work */
  --font-body: var(--font-body);
  --font-typewriter: var(--font-typewriter);
}
```

### 3.2 Typography (Fonts)

Three fonts are used throughout the app, each for a specific purpose:

| CSS Variable         | Font Name      | Where It's Used                                   |
|----------------------|----------------|---------------------------------------------------|
| `--font-headline`    | Public Sans    | Headings, navigation items, labels, buttons        |
| `--font-body`        | Merriweather   | Body text, descriptions, paragraphs               |
| `--font-typewriter`  | Special Elite  | Typewriter effects, accent labels, timestamps       |

**In Tailwind classes:** `font-headline`, `font-body`, `font-typewriter`.

Example from the landing page headline:

```tsx
<h1 className="font-typewriter text-4xl md:text-6xl leading-tight text-ink">
```

This means: use the typewriter font (Special Elite), size 4xl on mobile →
6xl on desktop, with tight line spacing, in the main ink color.

### 3.3 Reusable CSS Utility Classes

These are custom classes defined in `globals.css` that you can add to any
element:

#### Dividers

```css
.hairline {
  border-bottom: 1px solid var(--border);  /* A thin horizontal line */
}
.hairline-top {
  border-top: 1px solid var(--border);     /* Same, but on top */
}
```

**Usage:** `<div className="hairline" />` creates a subtle 1px separator.

#### Cards

```css
.section-card {
  background: var(--surface-raised);   /* White background */
  border: 1px solid var(--border);     /* Light border */
  border-radius: 2px;                  /* Very slightly rounded (academic look) */
}
```

**Usage:** `<div className="section-card p-6">content</div>` wraps content
in a clean white card.

#### Transitions

```css
.snap-transition {
  transition: all 100ms ease-in-out;   /* Fast 100ms animation on hover */
}
```

**Usage:** Added to any element that needs quick hover/click feedback.

#### Tab Indicators (Question Practice page)

```css
.practice-tab { ... }           /* Base tab style — gray text */
.practice-tab-active { ... }    /* Active tab — dark text + brown underline */
```

The active tab gets a 2px brown accent line under it via `::after` pseudo-element.

#### Subject Pills (Topic Selector)

```css
.subject-pill { ... }           /* Default — gray border, muted text */
.subject-pill-active { ... }    /* Active — accent border, brown tint bg */
```

#### Domain Cards (Topic Selector)

```css
.domain-card { ... }            /* Default — white card with light border */
.domain-card-active { ... }     /* Active — accent border + 2px top accent line */
```

---

## 4. Root Layout

**File:** `src/app/layout.tsx`

This file wraps **every page** in the app. Think of it as the outer shell —
it loads the fonts, applies global styles, and renders the Navbar.

```tsx
const publicSans = Public_Sans({
  variable: "--font-headline",    // This CSS variable name links to Tailwind
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",                // Show fallback font while loading (no blank flash)
});
```

Each font is loaded from Google Fonts and assigned a CSS variable name.
These variables are what `globals.css` references.

**The actual render:**

```tsx
<html className={`${publicSans.variable} ${merriweather.variable} ${specialElite.variable} h-full antialiased`}>
  <body className="min-h-full flex flex-col pt-16 bg-surface text-ink">
    <Navbar />        {/* Always visible at top */}
    {children}        {/* Whatever page you're on gets rendered here */}
  </body>
</html>
```

Key things:
- `pt-16` = padding-top of 64px. This creates space for the fixed Navbar
  (which is 64px tall and sits on top with `position: fixed`).
- `{children}` is a React concept — it means "whatever page content goes here."
  When you visit `/dashboard`, the Dashboard page component fills this slot.

---

## 5. Navigation Bar

**File:** `src/components/Navbar.tsx`

The Navbar appears on every page. It is "fixed" to the top of the screen
(stays visible when you scroll).

### 5.1 Navigation Links

Four main sections are defined in an array:

```tsx
const navLinks = [
  { name: "Dashboard",         href: "/dashboard",          icon: LayoutDashboard },
  { name: "Question Practice", href: "/question-practice",  icon: BookOpen },
  { name: "Mock Interview",    href: "/mock-interview",     icon: MonitorPlay },
  { name: "Full Interview",    href: "/full-interview",     icon: Layers },
];
```

Each object has a `name` (display text), `href` (URL path), and `icon`
(from the lucide-react icon library).

### 5.2 Active Link Detection

The navbar highlights which page you're currently on:

```tsx
const isActive =
  pathname === link.href ||
  (link.href !== "/" && pathname.startsWith(link.href));
```

`usePathname()` is a Next.js hook that returns the current URL path.
For example, if you're at `/question-practice`, `pathname` equals
`"/question-practice"`. The code checks: "does the current URL match
this link's URL?" If yes, it adds dark text + a brown underline.

```tsx
{isActive && (
  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-accent" />
)}
```

This is the small brown line under the active nav item — it's a `<span>`
positioned at the bottom of the link.

### 5.3 Auth State (Login vs Profile)

The Navbar checks `isAuthenticated` to decide what to show on the right side:

```tsx
const isAuthenticated = false;  // Hardcoded for now — replace with real auth hook later
```

- **When `false`** (not logged in): Shows "Login" and "Sign Up" buttons.
- **When `true`** (logged in): Shows a user icon that opens a dropdown with
  Profile, Settings, and Sign Out options.

**⚠️ Backend TODO:** When you build the authentication backend, you need to:
1. Implement the `useAuth` hook in `src/hooks/useAuth.ts`
2. Replace `const isAuthenticated = false` with `const { isAuthenticated } = useAuth()`
3. Replace the hardcoded name "Alex Johnson" with the real user data

### 5.4 Mobile Hamburger Menu

On small screens (below `lg` breakpoint = 1024px), the center nav links
hide and a hamburger menu (☰) button appears:

```tsx
<button
  id="mobile-menu-toggle"
  className="lg:hidden ..."   // "lg:hidden" = only visible below 1024px width
  onClick={() => setMobileOpen((prev) => !prev)}
>
```

When clicked, it toggles a dropdown drawer that shows all nav links and
auth buttons stacked vertically.

### 5.5 Click-Outside-to-Close (Profile Dropdown)

The profile dropdown uses a "click outside to close" pattern:

```tsx
useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
      setProfileOpen(false);
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);
```

This tells the browser: "whenever the user clicks anywhere, check if they
clicked inside the dropdown box (`profileRef`). If not, close it."

---

## 6. Pages

### 6.1 Landing Page

**File:** `src/app/page.tsx` — URL: `localhost:3000/`

The first page visitors see. Has three sections:

**Hero Section** — Big typewriter-animated headline + two CTA buttons:

```tsx
const { displayText, cursorVisible } = useTypewriter({
  text: "Mock Interview Simulator Using Artificial Intelligence",
  speed: 55,         // Each character appears every 55ms
  startDelay: 300,   // Wait 300ms before starting the animation
});
```

The `useTypewriter` hook (explained in section 8) types out the headline
character by character, with a blinking cursor at the end.

**Features Grid** — 4 feature cards describing platform capabilities.
Uses a CSS trick for thin borders between cards:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
```

`gap-px` creates a 1-pixel gap between each card. Since the parent div
has `bg-border` (a gray background), the 1px gaps look like thin grid
lines between the white cards. This avoids using actual borders.

**Footer** — Simple one-liner in typewriter font.

---

### 6.2 Dashboard

**File:** `src/app/dashboard/page.tsx` — URL: `localhost:3000/dashboard`

Shows the user's progress stats, skill radar chart, recent sessions, and focus recommendations.

**Stats Grid** — 4 stat boxes (score, sessions, streak, time):

```tsx
const stats = [
  { label: "Overall Score", value: "88/100", icon: Trophy, accent: "text-warning" },
  { label: "Sessions Done", value: "12",     icon: Target, accent: "text-success" },
  ...
];
```

Each stat is rendered inside the same `gap-px bg-border` grid trick as the
landing page features.

**⚠️ All data is hardcoded right now.** The score, sessions, streak —
these are all fake numbers. When the backend is ready, these will be
fetched from `dashboardAPI.studentOverview()` (defined in `src/lib/api.ts`).

**Skill Radar Chart** — Uses the `recharts` library to draw a spider/radar
chart. Loaded with `dynamic import` to avoid server-side rendering issues:

```tsx
const SkillRadar = dynamic(() => import("@/components/SkillRadar"), {
  ssr: false,       // Don't try to render this on the server
  loading: () => <div>Loading chart…</div>,
});
```

`ssr: false` is needed because `recharts` uses browser APIs (like canvas)
that don't exist on the server.

---

### 6.3 Question Practice Hub

**File:** `src/app/question-practice/page.tsx` — URL: `localhost:3000/question-practice`

This is the most complex page. It has **4 tabs**, each showing different
content.

#### Tab Switching Mechanism

```tsx
const [activeTab, setActiveTab] = useState("topic");  // Default to "topic" tab
```

`useState("topic")` creates a variable called `activeTab` that starts
as `"topic"`. When you click a tab button, it calls `setActiveTab("coding")`
(for example) to switch.

The tab buttons are rendered from an array:

```tsx
const practiceTabs = [
  { id: "topic",   label: "Topic-Specific", icon: BookOpen },
  { id: "coding",  label: "Coding Only",    icon: Code2 },
  { id: "classic", label: "Classic Tests",   icon: ClipboardList },
  { id: "custom",  label: "Custom Builder",  icon: Wrench },
];
```

Each button uses `clsx` to conditionally apply CSS classes:

```tsx
className={clsx(
  "practice-tab",                          // Always applied
  isActive && "practice-tab-active"        // Only applied when this tab is selected
)}
```

`clsx` is a tiny library that combines CSS class names. If `isActive` is
`true`, the button gets both `practice-tab` and `practice-tab-active`.
If `false`, only `practice-tab`.

#### Tab Content

Only the active tab's content is rendered:

```tsx
{activeTab === "topic" && (
  <div className="section-card p-6 sm:p-8">
    <TopicSelector />     {/* The interactive domain/subject selector */}
  </div>
)}

{activeTab === "coding" && (
  <div>...Coding Only content...</div>
)}
```

The `&&` is a JavaScript shorthand for "if the left side is true, render the
right side." So `activeTab === "topic" && <TopicSelector />` only shows the
TopicSelector when you're on the Topic tab.

#### Topic Selector — The Interactive Domain/Subject Grid

**File:** `src/components/TopicSelector.tsx`

This is the core interactive feature. Here's how it works:

**1. The Data Source** (`src/lib/curriculum.ts`):

A mapping of 8 career domains to their relevant subjects:

```typescript
export const curriculumMap = {
  "Web Development": [
    "Data Structures & Algorithms",
    "Database Management Systems",
    "Computer Networks",
    "System Design",
    "Web Technologies & API Design",
  ],
  // ... 7 more domains
};
```

Two helper arrays are also computed:

```typescript
export const allDomains = Object.keys(curriculumMap);
// → ["Web Development", "Mobile App Development", ...]

export const allSubjects = Array.from(
  new Set(Object.values(curriculumMap).flat())
);
// → A unique list of all subjects across all domains (11 total)
```

`Object.keys()` gets the domain names. `Object.values().flat()` gets all
subject arrays and combines them into one. `new Set()` removes duplicates.

**2. Domain Selection State:**

```tsx
const [selectedDomains, setSelectedDomains] = useState<Set<string>>(new Set());
```

A `Set` is a JavaScript data structure that stores unique values. It starts
empty. When you click a domain card, it gets added to the Set. Click again,
it gets removed:

```tsx
const toggleDomain = (domain: string) => {
  setSelectedDomains((prev) => {
    const next = new Set(prev);
    if (next.has(domain)) {
      next.delete(domain);    // Unselect
    } else {
      next.add(domain);       // Select
    }
    return next;
  });
};
```

**3. Auto-Selecting Subjects (the magic part):**

```tsx
const activeSubjects = useMemo(() => {
  const subjects = new Set<string>();
  selectedDomains.forEach((domain) => {
    curriculumMap[domain]?.forEach((s) => subjects.add(s));
  });
  return subjects;
}, [selectedDomains]);
```

`useMemo` is a React hook that says: "compute this value, and only
recompute it when `selectedDomains` changes."

How it works step-by-step:
1. Create an empty Set called `subjects`
2. For each selected domain, look up its subject list in `curriculumMap`
3. Add each subject to the Set (duplicates are automatically ignored)
4. Return the Set of all active subjects

So if you select "Web Development" (5 subjects) and "Cyber Security" (4
subjects), `activeSubjects` will contain the **union** — all unique
subjects from both, which might be 7 or 8 depending on overlap.

**4. Rendering the Subject Pills:**

```tsx
{allSubjects.map((subject) => {
  const isActive = activeSubjects.has(subject);
  return (
    <span className={clsx("subject-pill", isActive && "subject-pill-active")}>
      {isActive && <CheckCircle2 className="w-3 h-3 text-accent" />}
      {subject}
    </span>
  );
})}
```

Every subject is shown as a pill. If it's in the `activeSubjects` Set, it
gets the active style (brown border + check icon). Otherwise, it stays gray.

**5. Difficulty and Question Count:**

```tsx
const [difficulty, setDifficulty] = useState("medium");
const [questionCount, setQuestionCount] = useState(15);
```

Three difficulty buttons (Easy/Medium/Hard) work exactly like the Interview
Lobby page. The question counter uses `Math.max(5, c - 5)` and
`Math.min(50, c + 5)` so it stays between 5 and 50, in steps of 5.

**6. Begin Practice Button:**

```tsx
disabled={selectedDomains.size === 0}
```

The button is disabled (grayed out, unclickable) when no domains are selected.
When clicked, it calls the `onStart` callback with the configuration:

```tsx
onStart?.({
  domains: Array.from(selectedDomains),
  subjects: Array.from(activeSubjects),
  difficulty,
  questionCount,
});
```

**⚠️ Backend TODO:** The `onStart` callback currently does nothing. When the
backend is ready, this should call `questionsAPI.generate()` or
`sessionsAPI.start()` with the selected configuration.

#### Classic Tests Tab

Shows 4 predefined test formats in a grid:

```tsx
const classicTests = [
  { id: "dsa-45",        title: "Standard 45-min DSA",   duration: "45 min", questions: 20, desc: "..." },
  { id: "sys-design-60", title: "System Design Sprint",  duration: "60 min", questions: 8,  desc: "..." },
  { id: "full-stack-90", title: "Full-Stack Assessment",  duration: "90 min", questions: 30, desc: "..." },
  { id: "quick-fire-15", title: "Quick-Fire Theory",      duration: "15 min", questions: 25, desc: "..." },
];
```

These are clickable cards but don't navigate anywhere yet — they need backend
endpoints to create actual test sessions.

#### Custom Builder Tab

Shows a "Coming Soon" placeholder. This tab will eventually let users
configure custom tests with mixed question types and time limits.

---

### 6.4 Interview Lobby

**File:** `src/app/interview/page.tsx` — URL: `localhost:3000/interview`

A pre-interview configuration page. The user picks:

1. **Interview Type** — 4 options (Technical, System Design, Behavioral, Mixed)
2. **Difficulty** — Easy, Medium, Hard
3. **System Check** — Shows microphone and screen share status

The selection pattern is the same as the Question Practice difficulty:

```tsx
const [selectedType, setSelectedType] = useState<string>("technical");
```

Each option card uses `clsx` to switch between default and selected styles:

```tsx
className={clsx(
  "p-4 rounded-sm text-left border snap-transition",
  isSelected
    ? "bg-accent-light border-accent"       // Brown tint + brown border
    : "bg-surface border-border hover:border-border-strong"  // Normal
)}
```

The "Start Interview" button links to `/interview/session`.

---

### 6.5 Interview Session

**File:** `src/app/interview/session/page.tsx` — URL: `localhost:3000/interview/session`

A full-screen split view:
- **Left 40%:** `InterviewPanel` — AI interviewer chat with transcript
- **Right 60%:** `CodeEditor` — Code writing area with console output
- **Overlay:** `AntiCheatOverlay` — Proctoring status badge

```tsx
<div className="flex-1 flex w-full relative h-[calc(100vh-4rem)]">
```

`h-[calc(100vh-4rem)]` means "height = full viewport minus 4rem (the navbar)."
This makes the interview fill the entire screen below the navbar.

**All three components use mock/hardcoded data right now.** See Section 7
for details.

---

### 6.6 Login & Register

**Files:** `src/app/(auth)/login/page.tsx` and `src/app/(auth)/register/page.tsx`

**⚠️ IMPORTANT: These pages still use the OLD dark theme** (from before the
retro-academic redesign). They have dark backgrounds, indigo colors, and
glassmorphism effects. They need to be re-styled to match the current
light theme.

The `(auth)` folder uses Next.js **route groups** — the parentheses
mean this folder name is NOT included in the URL. So:
- `(auth)/login/page.tsx` → `localhost:3000/login` (not `/auth/login`)
- `(auth)/register/page.tsx` → `localhost:3000/register`

The forms have no backend connection — the buttons don't submit anything yet.

---

### 6.7 Placeholder Pages

These pages exist as folders but have no real content yet:

| Route               | File                               | Status           |
|----------------------|------------------------------------|------------------|
| `/mock-interview`    | `mock-interview/` (empty dir)      | No `page.tsx`    |
| `/full-interview`    | `full-interview/` (empty dir)      | No `page.tsx`    |
| `/profile`           | `profile/` (empty dir)             | No `page.tsx`    |
| `/results/[id]`      | `results/[sessionId]/page.tsx`     | Placeholder text |
| `/admin`             | `admin/page.tsx`                   | Placeholder text |

The `[sessionId]` folder uses Next.js **dynamic routes** — the brackets
mean it catches any value in that URL position. So `/results/abc123`
would render the page with `params.sessionId = "abc123"`.

---

## 7. Reusable Components

### 7.1 Navbar (`components/Navbar.tsx`)

Already covered in Section 5 above.

### 7.2 TopicSelector (`components/TopicSelector.tsx`)

Already covered in Section 6.3 above.

### 7.3 SkillRadar (`components/SkillRadar.tsx`)

A radar/spider chart showing skill levels across 6 categories.

```tsx
const data: SkillData[] = [
  { subject: "Algorithms",      A: 85, fullMark: 100 },
  { subject: "Data Structures", A: 90, fullMark: 100 },
  { subject: "System Design",   A: 70, fullMark: 100 },
  { subject: "Communication",   A: 80, fullMark: 100 },
  { subject: "Problem Solving", A: 95, fullMark: 100 },
  { subject: "Code Quality",    A: 75, fullMark: 100 },
];
```

Uses the `recharts` library. `A` is the score (0-100), `fullMark` is
the max. The chart colors match the accent palette:

```tsx
<Radar
  stroke="#8B7355"      // Line color = accent brown
  fill="#8B7355"        // Fill color = same brown
  fillOpacity={0.15}    // Very transparent fill
/>
```

**⚠️ Hardcoded data.** Backend needs to provide real skill vectors from
the `SkillVector` type (see `src/types/index.ts`).

### 7.4 InterviewPanel (`components/InterviewPanel.tsx`)

The left side of the interview session. Contains:
- AI interviewer info (name, role, status)
- Conversation transcript (scrollable)
- Mic/video toggle buttons
- "End Session" button

All transcript messages are hardcoded in `mockTranscript`. The mic/video
buttons toggle visual state only (no actual audio/video):

```tsx
const [micMuted, setMicMuted] = useState(false);
const [videoOff, setVideoOff] = useState(false);
```

**⚠️ Backend TODO:** Replace mockTranscript with real WebSocket messages.
The `useSocket` and `useInterview` hooks are stubs for this purpose.

### 7.5 CodeEditor (`components/CodeEditor.tsx`)

A simple code textarea with line numbers, copy/reset buttons, and a
mock console output section.

```tsx
const [code, setCode] = useState(`class Solution { ... }`);
```

The editor uses a dark background (`bg-code-bg` = `#1E1E1E`) which is
the standard for code editors. Line numbers are rendered separately
in a narrow column on the left.

**⚠️ Not a real code execution environment.** The console output is
hardcoded. Backend needs a code execution service (e.g., Judge0) to
actually run the code.

### 7.6 AntiCheatOverlay (`components/AntiCheatOverlay.tsx`)

Displays proctoring status during interview sessions. Has three states:

```tsx
interface AntiCheatOverlayProps {
  status: "active" | "warning" | "violation";
  message?: string;
}
```

- `"active"` → Small green "Proctoring Active" badge in top-right
- `"warning"` → Yellow warning banner
- `"violation"` → Red violation banner

Currently receives status as a prop from the parent. Will be driven by
the `anti-cheat.ts` and `gaze-tracker.ts` utilities once implemented.

---

## 8. Hooks

### 8.1 useTypewriter (`hooks/useTypewriter.ts`) — ✅ Working

Animates text appearing character by character, like someone typing.

```tsx
const { displayText, cursorVisible } = useTypewriter({
  text: "Some text to type out",
  speed: 55,          // Milliseconds between each character
  startDelay: 300,    // Wait before starting
});
```

Returns:
- `displayText` — The text typed so far (starts empty, grows char by char)
- `isComplete` — `true` when all characters have been typed
- `cursorVisible` — `true` while cursor should blink (hides 3 seconds after completion)

Internally, it uses `setTimeout` with a small random jitter (`± 20ms`)
to make the typing speed feel natural.

### 8.2 useAuth (`hooks/useAuth.ts`) — 🔲 Not Started

Stub file with TODO comments. Will manage:
- `login(email, password)`, `register(...)`, `logout()`
- `user` state, `isAuthenticated` state, `isLoading` state

### 8.3 useInterview (`hooks/useInterview.ts`) — 🔲 Not Started

Stub file. Will manage:
- `startSession(config)`, `endSession()`, `submitAnswer(answer)`
- `currentQuestion`, `sessionStatus`, `conversationHistory`

### 8.4 useSocket (`hooks/useSocket.ts`) — 🔲 Not Started

Stub file. Will manage:
- `connect()`, `disconnect()`, `emit(event, data)`, `on(event, callback)`
- `isConnected` state

---

## 9. Library Files

### 9.1 curriculum.ts — ✅ Working

The domain → subject mapping data. Used only by `TopicSelector.tsx`.
Already covered in Section 6.3.

### 9.2 api.ts — ✅ Code Written, Backend Not Connected

HTTP client for backend API calls. All endpoints are defined but none
are called from the UI yet because the backend server isn't running.

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
```

This reads the API URL from environment variables. If not set, defaults
to `localhost:8000` (where your FastAPI backend will run).

**Available API functions:**

| Function                     | HTTP Method | Endpoint                   |
|------------------------------|-------------|----------------------------|
| `authAPI.register(data)`     | POST        | `/api/auth/register`       |
| `authAPI.login(data)`        | POST        | `/api/auth/login`          |
| `authAPI.getMe()`            | GET         | `/api/auth/me`             |
| `questionsAPI.list(params)`  | GET         | `/api/questions/`          |
| `questionsAPI.generate(data)`| POST        | `/api/questions/generate`  |
| `sessionsAPI.start(config)`  | POST        | `/api/sessions/start`      |
| `sessionsAPI.list()`         | GET         | `/api/sessions/`           |
| `sessionsAPI.get(id)`        | GET         | `/api/sessions/:id`        |
| `sessionsAPI.end(id)`        | PUT         | `/api/sessions/:id/end`    |
| `sessionsAPI.report(id)`     | GET         | `/api/sessions/:id/report` |
| `answersAPI.submit(data)`    | POST        | `/api/answers/`            |
| `answersAPI.getForSession(id)` | GET       | `/api/answers/:id`         |
| `dashboardAPI.studentOverview()` | GET     | `/api/dashboard/student`   |
| `dashboardAPI.studentHistory()` | GET      | `/api/dashboard/student/history` |

The `fetchAPI` wrapper automatically:
- Adds `Content-Type: application/json` header
- Attaches the auth token from localStorage (if exists)
- Throws an error with `error.detail` if the response is not OK

### 9.3 auth.ts — 🔲 Stub

Token storage helpers. Needs `saveToken()`, `getToken()`, `removeToken()`,
`isAuthenticated()`, `getUserFromToken()`.

### 9.4 socket.ts — 🔲 Stub

WebSocket client for real-time interview communication.

### 9.5 anti-cheat.ts — 🔲 Stub

Browser-side anti-cheat: tab switch detection, fullscreen exit detection.

### 9.6 gaze-tracker.ts — 🔲 Stub

MediaPipe Face Mesh integration for gaze tracking and face detection.

---

## 10. Type Definitions

**File:** `src/types/index.ts`

All the TypeScript interfaces that define what data looks like. These
ensure your frontend and backend agree on data shapes.

Key types and what they represent:

| Type              | Purpose                                | Fields (key ones)                                  |
|-------------------|----------------------------------------|---------------------------------------------------|
| `User`            | A registered user                      | `id`, `name`, `email`, `role`                     |
| `LoginRequest`    | Data sent to login endpoint            | `email`, `password`                               |
| `RegisterRequest` | Data sent to register endpoint         | `name`, `email`, `password`                       |
| `TokenResponse`   | What login/register returns            | `access_token`, `user_id`, `role`                 |
| `Question`        | A single question                      | `id`, `content`, `type`, `difficulty`, `topic`    |
| `QuestionType`    | Allowed question categories            | `"mcq"`, `"coding"`, `"theory"`, `"system_design"`, `"behavioral"` |
| `Difficulty`      | Allowed difficulty levels              | `"easy"`, `"medium"`, `"hard"`                    |
| `Session`         | An interview/practice session          | `id`, `user_id`, `session_type`, `status`         |
| `Answer`          | User's answer to a question            | `session_id`, `question_id`, `response_text/code` |
| `Evaluation`      | AI's evaluation of an answer           | `score`, `strengths`, `weaknesses`                |
| `SkillVector`     | User's skill levels across categories  | `arrays`, `trees`, `graphs`, `dp`, etc.           |
| `CheatEvent`      | A detected proctoring event            | `type`, `severity`, `timestamp`                   |

---

## 11. Implementation Status Tracker

### ✅ Fully Implemented (Frontend UI)

| Feature                    | File(s)                                      | Notes                              |
|----------------------------|----------------------------------------------|------------------------------------|
| Landing page               | `app/page.tsx`                               | Typewriter animation, features grid |
| Dashboard                  | `app/dashboard/page.tsx`                     | Stats, radar chart, recent activity |
| Question Practice Hub      | `app/question-practice/page.tsx`             | 4 tabs, fully interactive          |
| Topic Selector             | `components/TopicSelector.tsx`               | Domain ↔ subject auto-mapping      |
| Curriculum Data            | `lib/curriculum.ts`                          | 8 domains, 11 subjects             |
| Navbar (5-hub + mobile)    | `components/Navbar.tsx`                      | Active states, auth toggle, mobile  |
| Interview Lobby            | `app/interview/page.tsx`                     | Type + difficulty selection         |
| Interview Session (demo)   | `app/interview/session/page.tsx`             | Split view with mock data          |
| Code Editor                | `components/CodeEditor.tsx`                  | Editable textarea with line nums    |
| Interview Panel            | `components/InterviewPanel.tsx`              | Chat transcript, mic/video toggle   |
| Anti-Cheat Overlay         | `components/AntiCheatOverlay.tsx`            | 3-state badge/alert overlay         |
| Skill Radar Chart          | `components/SkillRadar.tsx`                  | recharts radar with mock data       |
| Typewriter Hook            | `hooks/useTypewriter.ts`                     | Reusable text animation             |
| API Client                 | `lib/api.ts`                                 | All endpoints defined               |
| Type Definitions           | `types/index.ts`                             | All data shapes defined             |
| Design System              | `app/globals.css` + `app/layout.tsx`         | Full color palette + 3 fonts        |

### ⚠️ Needs Restyling

| Feature                    | File(s)                                     | Issue                               |
|----------------------------|---------------------------------------------|-------------------------------------|
| Login page                 | `(auth)/login/page.tsx`                     | Old dark theme, needs retro restyle |
| Register page              | `(auth)/register/page.tsx`                  | Old dark theme, needs retro restyle |

### 🔲 Not Started (Need Backend + Frontend Work)

| Feature                    | File(s)                                     | What's Needed                       |
|----------------------------|---------------------------------------------|-------------------------------------|
| Mock Interview page        | `mock-interview/` (empty)                   | `page.tsx` with AI voice/video flow |
| Full Interview page        | `full-interview/` (empty)                   | `page.tsx` with combined loop       |
| User Profile page          | `profile/` (empty)                          | `page.tsx` with settings, auth      |
| Results page               | `results/[sessionId]/page.tsx`              | Real session report UI              |
| Admin dashboard            | `admin/page.tsx`                            | Batch analytics, student breakdown  |
| Authentication hook        | `hooks/useAuth.ts`                          | Connect to backend auth endpoints   |
| Interview hook             | `hooks/useInterview.ts`                     | Session state management            |
| Socket hook                | `hooks/useSocket.ts`                        | WebSocket connection                |
| Auth helpers               | `lib/auth.ts`                               | Token storage utilities             |
| Socket client              | `lib/socket.ts`                             | Socket.io setup                     |
| Anti-cheat logic           | `lib/anti-cheat.ts`                         | Tab/screen monitoring               |
| Gaze tracking              | `lib/gaze-tracker.ts`                       | MediaPipe integration               |
| Backend API connections    | Various pages                               | Replace all hardcoded data          |

---

## 12. Backend Integration Notes

When building the backend, here are the exact frontend touchpoints:

### Authentication Flow

1. **Backend needs:** `POST /api/auth/register`, `POST /api/auth/login`,
   `GET /api/auth/me` endpoints
2. **Frontend files to update:**
   - `hooks/useAuth.ts` — implement the hook
   - `lib/auth.ts` — implement token storage
   - `components/Navbar.tsx` — replace `const isAuthenticated = false`
   - `(auth)/login/page.tsx` — connect form submit → `authAPI.login()`
   - `(auth)/register/page.tsx` — connect form → `authAPI.register()`

### Dashboard Data

1. **Backend needs:** `GET /api/dashboard/student` returning stats and
   skill vectors
2. **Frontend files to update:**
   - `app/dashboard/page.tsx` — replace hardcoded `stats` and `recentActivity`
   - `components/SkillRadar.tsx` — replace hardcoded `data` array

### Question Practice → Starting a Session

1. **Backend needs:** `POST /api/sessions/start` accepting
   `{ domains, subjects, difficulty, questionCount }`
2. **Frontend files to update:**
   - `app/question-practice/page.tsx` — add `onStart` handler to `TopicSelector`
   - `components/TopicSelector.tsx` — the `onStart` callback already
     sends  `{ domains, subjects, difficulty, questionCount }`

### Live Interview

1. **Backend needs:** WebSocket endpoint for real-time AI conversation
2. **Frontend files to update:**
   - `lib/socket.ts` — Socket.io client setup
   - `hooks/useSocket.ts` — connection management hook
   - `hooks/useInterview.ts` — session state hook
   - `components/InterviewPanel.tsx` — replace `mockTranscript`
   - `components/CodeEditor.tsx` — add code execution via Judge0

---

*End of Frontend Guide. This file should be updated whenever new frontend
features are added or backend connections are established.*
