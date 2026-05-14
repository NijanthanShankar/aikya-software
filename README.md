# Aikya Courses — Online Learning Platform

A full-stack online course platform built with React + Vite (frontend) and Node.js + Express (backend), using MySQL as the database.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MySQL + Sequelize ORM |
| Auth | JWT (JSON Web Tokens) |
| Payments | PhonePe Payment Gateway |
| Video | Local file storage with streaming |

## Features

- **Authentication** — Register/Login as student or instructor
- **Course Management** — Create, edit, publish courses with modules & lessons
- **Video Lessons** — Upload & stream videos with range-request support
- **Text Lessons** — Rich text content lessons
- **Quizzes** — Multiple choice quizzes with auto-grading
- **Progress Tracking** — Track lesson completion and course progress
- **Payments** — PhonePe integration for paid course enrollment
- **Free Courses** — Instant enrollment for free courses

## Project Structure

```
Aikya Software/
├── client/          # React + Vite frontend
├── server/          # Node.js + Express backend
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MySQL 8.0+

### 1. Database Setup

```sql
CREATE DATABASE aikya_courses;
```

### 2. Backend Setup

```bash
cd server
npm install
```

Edit `server/.env` and update:
- `DB_PASSWORD` — your MySQL root password
- `JWT_SECRET` — a strong random string
- `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY` — from PhonePe dashboard (UAT credentials provided for testing)

```bash
npm run dev
```

The server will auto-create all database tables on first run.

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## API Endpoints

### Auth
- `POST /api/auth/register` — Register
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user
- `PATCH /api/auth/profile` — Update profile

### Courses
- `GET /api/courses` — List published courses (with search/filter/sort)
- `GET /api/courses/:slug` — Get course detail
- `POST /api/courses` — Create course (instructor)
- `PATCH /api/courses/:id` — Update course
- `PATCH /api/courses/:id/publish` — Toggle publish status
- `DELETE /api/courses/:id` — Delete course

### Modules & Lessons
- `POST /api/courses/:courseId/modules` — Add module
- `POST /api/modules/:moduleId/lessons` — Add lesson (with video upload)
- `GET /api/lessons/:id/stream` — Stream video

### Enrollment
- `POST /api/enrollments/courses/:courseId/enroll` — Enroll (free courses)
- `GET /api/enrollments/my` — My enrollments

### Progress
- `POST /api/progress/lessons/:lessonId/complete` — Mark lesson complete
- `GET /api/progress/courses/:courseId` — Get course progress

### Quizzes
- `POST /api/quizzes/lessons/:lessonId` — Create quiz
- `POST /api/quizzes/:quizId/questions` — Add question
- `GET /api/quizzes/lessons/:lessonId` — Get quiz
- `POST /api/quizzes/:quizId/submit` — Submit quiz

### Payments (PhonePe)
- `POST /api/payments/initiate` — Start payment
- `GET /api/payments/verify` — Verify after redirect

## PhonePe Integration

The app uses PhonePe PG UAT (test) credentials by default. For production:
1. Get live credentials from PhonePe merchant dashboard
2. Set `PHONEPE_ENV=PROD` in `.env`
3. Update `PHONEPE_MERCHANT_ID`, `PHONEPE_SALT_KEY`, `PHONEPE_SALT_INDEX`
