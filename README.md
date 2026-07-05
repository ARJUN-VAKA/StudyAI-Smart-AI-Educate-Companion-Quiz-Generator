# 🧠 StudyAI — Smart AI Study Companion & Quiz Generator

> Transform any study material into interactive flashcards, intelligent quizzes, and personalized study plans — powered by Llama 3.3 70B via Groq.

![StudyAI Banner](https://via.placeholder.com/1200x400/5B5FEF/FFFFFF?text=StudyAI+%E2%80%94+Study+Smarter+with+AI)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📄 **AI Summary** | Multi-level structured summaries with key concepts, definitions, and revision notes |
| 🃏 **Smart Flashcards** | AI-generated flip cards with difficulty levels and progress tracking |
| 🎯 **Quiz Generator** | MCQ, True/False, and Short Answer quizzes with timer and explanations |
| 📅 **Study Planner** | Personalized 7-day AI study schedule based on weak topics |
| 📊 **Analytics** | Beautiful charts: line, bar, radar, doughnut with progress metrics |
| 🎯 **Weak Topic Detection** | AI identifies and prioritizes your weakest areas |

---

## 🏗️ Tech Stack

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** — Custom glassmorphism design system
- **Framer Motion** — Page transitions, hover effects, micro-animations
- **React Router v6** — Client-side routing with lazy loading
- **Zustand** — Lightweight state management
- **Chart.js** — Performance analytics visualization
- **React Hook Form** + **Zod** — Form validation
- **Firebase SDK** — Auth + Firestore + Storage (client)

### Backend
- **Python Flask** — REST API
- **Groq SDK** — Llama 3.3 70B Versatile AI model
- **Firebase Admin SDK** — Server-side Firestore + Storage
- **PyMuPDF** — PDF text extraction
- **python-docx** — DOCX text extraction
- **PyJWT** — JWT authentication

### AI
- **Model**: Llama 3.3 70B Versatile
- **Provider**: Groq (fastest AI inference)
- **Capabilities**: Summary, Flashcards, Quiz, Study Plan, Weak Topic Analysis

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- A [Groq API key](https://console.groq.com)
- A Firebase project (optional — falls back to local JSON storage)

### 1. Clone & Setup Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your Firebase config
npm run dev
```

The frontend will be available at **http://localhost:5173**

### 2. Setup Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your Groq API key and Firebase credentials

python run.py
```

The backend API will be at **http://localhost:5000**

### 3. Open the App

Navigate to **http://localhost:5173** — you'll see the landing page with the full WOW effect! 🎉

> **Note**: The dashboard is accessible without authentication in demo mode. To enable full authentication, update `App.tsx` and uncomment the production route guard.

---

## 🔑 Environment Variables

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api

# Firebase Web App Config (from Firebase Console)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

### Backend (`backend/.env`)

```env
GROQ_API_KEY=gsk_your_groq_key

JWT_SECRET=your-secret-key-change-in-production

# Firebase Service Account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
```

---

## 🐳 Docker Deployment

```bash
# Copy env files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Edit both .env files with your credentials

# Build and start
docker-compose up --build
```

App will be available at **http://localhost:5173**

---

## 📁 Project Structure

```
StudyAI/
├── frontend/                    # React Vite App
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Button, Card, Input, Modal, Progress
│   │   │   ├── layout/         # LandingNavbar, Sidebar, DashboardNavbar
│   │   │   └── landing/        # HeroSection, Features, HowItWorks, etc.
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx
│   │   │   ├── auth/           # Login, Register
│   │   │   └── dashboard/      # DashboardLayout + all feature pages
│   │   ├── services/
│   │   │   ├── api.ts          # Axios client + all API methods
│   │   │   └── firebase.ts     # Firebase initialization
│   │   ├── store/              # Zustand stores (auth, UI, materials)
│   │   └── types/              # TypeScript interfaces
│   ├── tailwind.config.ts      # Design tokens
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── routes/             # auth, upload, summary, flashcards, quiz, etc.
│   │   ├── services/
│   │   │   ├── ai_service.py   # Groq/Llama integration
│   │   │   ├── firebase_service.py # Firestore + Storage
│   │   │   └── file_service.py  # PDF/DOCX/TXT extraction
│   │   └── middleware/
│   │       └── auth.py         # JWT middleware
│   ├── data/                   # Local JSON fallback storage
│   └── run.py
│
├── docker-compose.yml
└── README.md
```

---

## 🌐 API Documentation

### Base URL: `http://localhost:5000/api`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/firebase` | POST | Authenticate with Firebase token → JWT |
| `/auth/profile` | GET/PUT | User profile |
| `/upload` | POST | Upload file (PDF/DOCX/TXT) |
| `/upload/text` | POST | Upload pasted text |
| `/materials` | GET | List materials |
| `/materials/:id` | GET/DELETE | Material CRUD |
| `/summary/generate` | POST | AI summary generation |
| `/summary/:materialId` | GET | Get summary |
| `/flashcards/generate` | POST | AI flashcard generation |
| `/flashcards` | GET | List decks |
| `/quiz/generate` | POST | AI quiz generation |
| `/quiz/:id/submit` | POST | Submit quiz answers |
| `/schedule/generate` | POST | AI study plan generation |
| `/analytics/dashboard` | GET | Dashboard analytics |
| `/settings` | GET/PUT | User settings |
| `/health` | GET | API health check |

---

## 🎨 Design System

The app uses a custom glassmorphism design with:

| Token | Value |
|-------|-------|
| Primary | `#5B5FEF` |
| Accent | `#00E5FF` |
| Secondary | `#7C4DFF` |
| Background | `#09090B` |
| Card | `#111827` |
| Font | Inter |

CSS utilities: `.glass`, `.gradient-text`, `.gradient-border`, `.glow-primary`, `.btn-primary`

---

## 🔒 Security Notes

1. Change `JWT_SECRET` in production
2. Use environment variables — never commit `.env` files
3. Firebase Security Rules should restrict access by user ID
4. Rate limiting is recommended for production (use nginx or Flask-Limiter)
5. File uploads are validated by extension and size (50MB limit)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Made with ❤️ and AI · Powered by <strong>Llama 3.3 70B</strong> via <strong>Groq</strong>
</div>
