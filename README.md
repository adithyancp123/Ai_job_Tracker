# 🚀 AI Job Tracker (MERN + AI)

A full-stack AI-powered job application tracker that helps users manage job applications and generate smart resume suggestions using OpenAI.

---

## 🌐 Live Demo

* **Frontend:** https://ai-job-tracker-vert.vercel.app/
* **Backend API:** https://ai-job-tracker-backend-nlna.onrender.com

---

## 📌 Features

### 🔐 Authentication

* JWT-based login & signup
* Secure password hashing using bcrypt

---

### 📊 Application Management

* Create, edit, delete job applications
* Track application status:

  * Applied
  * Phone Screen
  * Interview
  * Offer
  * Rejected
* Store:

  * Company
  * Role
  * Job description link (optional)
  * Notes
  * Applied date
  * Salary range (optional)

---

### 🤖 AI Features

* Parse job descriptions using OpenAI
* Extract:

  * Company name
  * Role
  * Required skills
  * Nice-to-have skills
  * Seniority
  * Location
* Generate AI-powered resume bullet suggestions

---

### 🧩 UI Features

* Drag-and-drop Kanban board
* Dashboard with application statistics
* Loading, error, and empty states handled
* Responsive UI with Tailwind CSS
* Dark mode support 🌙

---

## 🛠️ Tech Stack

### Frontend

* React + TypeScript
* Tailwind CSS
* Vite

### Backend

* Node.js + Express
* TypeScript

### Database

* MongoDB (Mongoose)

### Authentication

* JWT + bcrypt

### AI

* OpenAI API (structured JSON output)

---

## ⚙️ Environment Variables

### Backend (.env)

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret
OPENAI_API_KEY=your_openai_key
PORT=5000
```

### Frontend (.env)

```env
VITE_API_URL=https://ai-job-tracker-backend-nlna.onrender.com
```

---

## 🚀 Installation & Setup

### Clone the repository

```bash
git clone https://github.com/your-username/Ai_job_Tracker.git
cd Ai_job_Tracker
```

### Install dependencies

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Run locally

```bash
npm run dev
```

---

## 📦 Deployment

* Backend deployed on **Render**
* Frontend deployed on **Vercel**

---

## 🎯 Key Highlights

* Clean TypeScript-based architecture
* AI logic handled in service layer
* Proper error handling for AI responses
* No hardcoded API keys (uses environment variables)
* Fully functional full-stack deployment

---

## 👨‍💻 Author

**Adithyan C P**

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
