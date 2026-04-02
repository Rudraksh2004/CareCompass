<div align="center">

<img src="public/logo.png" alt="CareCompass Logo" width="80" height="80" />

# CareCompass

### AI-Powered Health Intelligence Platform

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

*A premium, clinical-grade health companion powered by Google Gemini AI*

</div>

---

## Overview

**CareCompass** is a full-stack AI health intelligence platform designed to make medical information accessible, understandable, and actionable. It combines advanced AI models with a beautifully crafted "Liquid Glass" UI to deliver a premium clinical experience — from decoding complex medical reports to predicting potential health conditions.

> ⚠️ **Disclaimer:** CareCompass is an **informational tool only**. It does not provide medical diagnoses or replace professional healthcare advice. Always consult a qualified physician for medical decisions.

---

## ✨ Features

### 🧠 AI-Powered Clinical Modules

| Module | Description |
|--------|-------------|
| **Report Explainer** | Upload medical lab reports and get plain-language, AI-powered explanations with OCR support |
| **Prescription Simplifier** | Scan or upload a prescription — AI breaks down each medication, dosage, and usage |
| **Disease Predictor** | Input symptoms and receive AI-generated condition insights with specialist referrals |
| **Medicine Describer** | Lookup any medicine — AI explains its use, side effects, and interactions |
| **AI Health Chat** | A persistent, context-aware AI health assistant for any health-related question |
| **Health Tracking** | Log biometric data (weight, BP, glucose) with trend charts and AI-generated health summaries |
| **Medicine Reminders** | Set and manage medication schedules with smart scheduling tools |
| **Emergency ID Card** | Generate a shareable digital emergency card with critical health info and a QR code |

### 🔐 Authentication & User Management
- Firebase Email/Password Authentication
- User profile with photo upload
- Persistent session management
- Protected dashboard routes

### 🎨 UI/UX Highlights
- **Liquid Glass Aesthetic** — glassmorphism design with ambient gradient backgrounds
- **Dark / Light Mode** — system-aware with manual toggle
- **Responsive Design** — fully mobile-optimized with collapsible sidebar
- **Micro-animations** — hover effects, transitions, and floating orbs for a premium feel
- **Scroll-Responsive Navbar** — hides on scroll-down, reveals on scroll-up

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript 5 |
| **UI Library** | React 19 |
| **Styling** | Tailwind CSS 4 |
| **AI Engine** | Google Gemini (`@google/generative-ai`) |
| **Auth & DB** | Firebase 12 (Auth + Firestore) |
| **OCR** | Tesseract.js |
| **PDF Parsing** | pdfjs-dist |
| **Charts** | Recharts |
| **QR Code** | react-qr-code |
| **PDF Export** | jsPDF + html-to-image |
| **Icons** | Lucide React + React Icons |
| **Markdown** | react-markdown + remark-gfm |

---

## 📁 Project Structure

```
carecompass/
├── app/
│   ├── api/
│   │   └── ai/                    # Server-side AI API routes
│   │       ├── chat/
│   │       ├── disease-predictor/
│   │       ├── explain/
│   │       ├── extract-medicines/
│   │       ├── generate-title/
│   │       ├── health-insight/
│   │       ├── health-summary/
│   │       ├── medicine-describer/
│   │       ├── simplify-prescription/
│   │       ├── suggestions/
│   │       └── trend-detection/
│   ├── auth/
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/
│   │   ├── chat/
│   │   ├── disease-predictor/
│   │   ├── emergency/
│   │   ├── health/
│   │   ├── medicine/
│   │   ├── prescription/
│   │   ├── profile/
│   │   ├── reminders/
│   │   └── report/
│   ├── about/
│   ├── layout.tsx                 # Root layout with providers
│   └── page.tsx                   # Landing page
├── components/                    # Shared UI components
├── context/
│   ├── AuthContext.js             # Firebase auth state
│   └── ThemeContext.tsx           # Dark/light mode state
├── lib/                           # Utility libraries
├── services/                      # Firebase service layer
└── utils/                         # Helper utilities
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- A **Firebase** project (for Auth + Firestore)
- A **Google Gemini API Key** (from [Google AI Studio](https://aistudio.google.com/))

### 1. Clone the Repository

```bash
git clone https://github.com/Rudraksh2004/CareCompass.git
cd CareCompass
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 🔑 Key AI Endpoints

All AI endpoints live under `/api/ai/*` and are secured as Next.js server-side routes (your Gemini API key is never exposed to the client).

| Endpoint | Purpose |
|----------|---------|
| `/api/ai/chat` | Conversational health AI |
| `/api/ai/explain` | Medical report explanation |
| `/api/ai/simplify-prescription` | Prescription breakdown |
| `/api/ai/disease-predictor` | Symptom-based condition insights |
| `/api/ai/medicine-describer` | Drug information lookup |
| `/api/ai/health-summary` | Biometric trend summaries |
| `/api/ai/health-insight` | Personalized health insights |
| `/api/ai/trend-detection` | Health metric pattern analysis |
| `/api/ai/suggestions` | AI-powered health recommendations |
| `/api/ai/extract-medicines` | OCR-extracted medicine parsing |
| `/api/ai/generate-title` | Chat session title generation |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client (Browser)               │
│   React 19 + Next.js App Router + Tailwind CSS   │
└────────────────────┬────────────────────────────┘
                     │ HTTP
┌────────────────────▼────────────────────────────┐
│              Next.js Server (API Routes)         │
│         /api/ai/* — Gemini AI Integration        │
└────────────┬──────────────────────┬─────────────┘
             │                      │
┌────────────▼──────┐   ┌──────────▼────────────┐
│   Google Gemini   │   │   Firebase Services    │
│   (AI Engine)     │   │  Auth + Firestore DB   │
└───────────────────┘   └───────────────────────┘
```

---

## 🖥️ Screenshots

> Landing Page — Liquid Glass hero with scroll animations  
> Dashboard — Collapsible sidebar, dark mode, bio-status center  
> Disease Predictor — Symptom input with AI diagnostic output  
> Emergency Card — Downloadable QR-enabled medical ID

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 👨‍💻 Author

**Rudraksh Ganguly**

[![GitHub](https://img.shields.io/badge/GitHub-Rudraksh2004-181717?logo=github)](https://github.com/Rudraksh2004)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-rudraksh--ganguly-0A66C2?logo=linkedin)](https://www.linkedin.com/in/rudraksh-ganguly-411a39328/)
[![Instagram](https://img.shields.io/badge/Instagram-__ninja18__-E4405F?logo=instagram)](https://www.instagram.com/__ninja18__/)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

*Built with ❤️ and a passion for making healthcare more accessible through AI*

**CareCompass — Navigate Your Health with Intelligence**

</div>
