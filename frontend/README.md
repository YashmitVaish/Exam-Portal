# Exam Portal — Frontend

React + Vite frontend for the Exam Portal API.

## Stack

- **React 18** with React Router v6
- **Vite** for dev server and bundling
- Plain CSS modules (no Tailwind, no CSS-in-JS)
- Fonts: Instrument Serif · Outfit · DM Mono (Google Fonts)

## Project structure

```
src/
├── api/
│   └── client.js              # All API calls grouped by resource
│                              # (authApi, examsApi, submissionsApi, analyticsApi)
├── hooks/
│   ├── useAuth.jsx            # AuthContext + useAuth hook
│   ├── useApi.js              # Generic data-fetch hook (loading/error/refetch)
│   └── useCountdown.js        # Exam countdown timer hook
├── components/
│   ├── Layout.jsx             # Sticky nav + <Outlet />
│   ├── ProtectedRoute.jsx     # Role-aware route guard
│   ├── ExamCard.jsx           # Teacher exam list item (publish/delete/navigate)
│   ├── QuestionBuilder.jsx    # MCQ / True-False / Short answer editor
│   └── ExamTimer.jsx          # Countdown bar with progress fill
├── pages/
│   ├── auth/
│   │   └── AuthPage.jsx       # Login + register tabs, role selector
│   ├── teacher/
│   │   ├── TeacherDashboard.jsx   # Exam list
│   │   ├── ExamForm.jsx           # Create / edit exam
│   │   ├── ResultsPage.jsx        # Submissions table + stats
│   │   └── AnalyticsPage.jsx      # Per-question breakdown
│   └── student/
│       ├── StudentDashboard.jsx   # Join-by-ID flow
│       ├── TakeExam.jsx           # Timer + question panel + answer tracking
│       └── ResultView.jsx         # Score display after submission
├── styles/
│   ├── globals.css            # CSS custom properties, reset, typography
│   └── components.css         # Buttons, cards, forms, badges, tables, alerts
├── App.jsx                    # BrowserRouter + all routes
└── main.jsx                   # createRoot entry point
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Make sure the API server is running on http://localhost:8000

# 3. Start the dev server (proxies /api → http://localhost:8000)
npm run dev
```

The app will be available at **http://localhost:3000**.

## API proxy

`vite.config.js` proxies all `/api/*` requests to `http://localhost:8000`,
stripping the `/api` prefix. The `client.js` file uses `/api` as the base URL.
If you deploy, update `VITE_API_BASE` or adjust the proxy target.

## Routes

| Path | Access | Description |
|---|---|---|
| `/login` | Public | Login / register |
| `/teacher` | Teacher | Exam list dashboard |
| `/teacher/exams/new` | Teacher | Create exam |
| `/teacher/exams/:id/edit` | Teacher | Edit exam |
| `/teacher/exams/:id/results` | Teacher | Submission results |
| `/teacher/exams/:id/analytics` | Teacher | Per-question analytics |
| `/student` | Student | Join exam by ID |
| `/student/exam/:id` | Student | Take exam (live timer) |
| `/student/result` | Student | Score after submission |

## Notes

- JWT is stored in `localStorage` under `ep_auth`. The role is decoded from
  the token payload; if your server doesn't embed `role` in the token, adjust
  `decodeRole()` in `useAuth.jsx`.
- The exam timer uses the server-provided `deadline` timestamp, not a locally
  computed one, matching the API spec.
- Answer timings (seconds per question) are tracked client-side and sent on
  submit for the analytics endpoint.
