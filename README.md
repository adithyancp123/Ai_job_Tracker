# AI Job Application Tracker

AI Job Application Tracker is a full-stack MERN application built with TypeScript that helps users manage their job search pipeline in a visual Kanban workflow.  
It also includes AI-assisted productivity features to parse job descriptions and generate resume bullet suggestions tailored to each role.

## Features

- **Authentication (JWT)**
  - Secure register/login flow
  - Token-based protected API access
- **Kanban Board (Drag & Drop)**
  - Columns: Applied, Phone Screen, Interview, Offer, Rejected
  - Drag-and-drop status updates with optimistic UI behavior
- **AI Job Description Parsing**
  - Extracts company, role, skills, seniority, and location from pasted job descriptions
- **Resume Bullet Suggestions**
  - Generates 3-5 targeted resume bullets using OpenAI
  - One-click copy support in the UI
- **Application CRUD**
  - Create, read, update, and delete job applications scoped to the authenticated user

## Tech Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios, dnd-kit
- **Backend:** Node.js, Express, TypeScript, JWT, bcrypt
- **Database:** MongoDB with Mongoose
- **AI:** OpenAI API

## Folder Structure

```text
ai-job-tracker/
├─ backend/
│  ├─ src/
│  │  ├─ config/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/
│  │  ├─ routes/
│  │  ├─ services/
│  │  ├─ app.ts
│  │  └─ server.ts
│  ├─ .env.example
│  └─ package.json
├─ frontend/
│  ├─ src/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ pages/
│  │  ├─ services/
│  │  ├─ types/
│  │  ├─ App.tsx
│  │  └─ main.tsx
│  ├─ .env.example
│  └─ package.json
└─ package.json
```

## Setup Instructions

### 1) Clone the repository

```bash
git clone <your-repo-url>
cd ai-job-tracker
```

### 2) Install dependencies

Install root dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

### 3) Configure environment variables

Create `.env` files from examples:

- `backend/.env` from `backend/.env.example`
- `frontend/.env` from `frontend/.env.example`

### 4) Run frontend and backend

From the project root:

```bash
npm run dev
```

This runs both services concurrently:

- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

## Environment Variables

Use these keys in `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/ai-job-tracker
JWT_SECRET=replace-with-strong-secret
OPENAI_API_KEY=your-openai-api-key
```

## Architecture Decisions

- **Service Layer for AI**
  - OpenAI integration is isolated in service modules
  - Controllers orchestrate requests/responses; routes remain thin
- **Separation of Concerns**
  - Distinct layers for routes, controllers, services, models, and middleware
  - Improves maintainability, testability, and extensibility
- **Typed Contracts**
  - TypeScript types for payloads and responses reduce runtime bugs
  - Strong typing across frontend and backend data flow
- **User-Scoped Data Access**
  - All application operations are tied to authenticated user context for security

## Future Improvements

- Add automated tests (unit/integration/e2e)
- Add refresh token/session management strategy
- Add role-based access control (RBAC)
- Add analytics and reporting (application conversion funnel)
- Add calendar reminders and interview scheduling
- Add file attachments (resume versions, cover letters)
- Add deployment pipeline (Docker + CI/CD)
- Add observability (structured logs, error tracking, metrics)

---

Built as a recruiter-friendly portfolio project demonstrating full-stack architecture, secure authentication, AI integration, and modern frontend UX.
