# <img src="https://img.shields.io/badge/⚡-UcarOS-D4AF37?style=for-the-badge&labelColor=0a0d15" alt="UcarOS" /> University Intelligence Platform

<div align="center">

### 🏆 Hack4UCAR 2025 — University of Carthage

**UcarOS** is an AI-powered executive dashboard for university leadership.  
Real-time analytics, predictive ML models, and an AI assistant — all in one premium interface.

[![React](https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL_15-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://postgresql.org)
[![Mistral AI](https://img.shields.io/badge/Mistral_AI-FF7000?style=flat-square&logo=data:image/svg+xml;base64,&logoColor=white)](https://mistral.ai)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)](https://docker.com)

<!-- 
  Add your demo video/GIF here after recording:
  ![UcarOS Demo](./docs/demo.gif)
-->

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Executive Dashboard** | Real-time KPI cards, interactive charts, enrollment trends, and budget analysis |
| 🗺️ **Interactive Map** | Leaflet-based map showing all 33 University of Carthage institutions with click-to-compare |
| 🤖 **AI Chat Assistant** | Ask questions in natural language — the AI queries the database and responds intelligently |
| 🧠 **Smart Insights** | AI auto-generates 3 actionable recommendations based on live data |
| 📈 **Predictive Analytics** | ML models forecast enrollment, budget, and dropout risk |
| 📄 **PDF Report Generator** | One-click executive report download |
| 🌍 **Multilingual (i18n)** | Full support for English, French, and Arabic (RTL) |
| 🎨 **Premium Dark/Light Mode** | Glassmorphic, gold-accented design with smooth animations |
| 🔐 **Role-Based Access** | President, Dean, Admin, Researcher — each sees relevant data |
| 📱 **QR Code Login** | Scan from phone to access the platform instantly |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────┐
│              FRONTEND — React 19 + Vite          │
│   Dashboard │ Map │ Charts │ AI Chat │ i18n      │
├──────────────────────────────────────────────────┤
│              BACKEND — FastAPI (Python)           │
│                                                   │
│   ┌─────────────────────────────────────────┐    │
│   │           3 AI AGENTS (Mistral)         │    │
│   │  💬 Chat Q&A  │ 💡 Insights │ 🗂️ Mapper │    │
│   └─────────────────────────────────────────┘    │
│   ┌─────────────────────────────────────────┐    │
│   │        3 ML MODELS (scikit-learn)       │    │
│   │  📉 Dropout  │ 📊 Enrollment │ 💰 Budget │    │
│   └─────────────────────────────────────────┘    │
├──────────────────────────────────────────────────┤
│   PostgreSQL 15  │  Redis 7  │  n8n Workflows    │
└──────────────────────────────────────────────────┘
```

---

## 🤖 AI & Machine Learning

### AI Agents (Mistral AI — `mistral-small-latest`)

| Agent | Role |
|-------|------|
| **Chat Assistant** | Answers user questions with live database context. Role-aware (President vs Dean), language-aware (EN/FR/AR) |
| **Smart Insights** | Generates 3 actionable executive recommendations from KPI data |
| **Column Mapper** | Intelligently maps uploaded CSV/Excel columns (French, Arabic, English) to the database schema |

### ML Models (scikit-learn)

| Model | Algorithm | Purpose |
|-------|-----------|---------|
| **Dropout Risk** | Linear Regression | Scores institutions by dropout risk (HIGH/MEDIUM/LOW) |
| **Enrollment Forecast** | Linear Regression | Projects student headcount for 2026-2027 |
| **Budget Forecast** | Linear Regression | Predicts next-year budget allocation & consumption |

---

## 🛠️ Tech Stack

### Frontend
`React 19` · `TypeScript` · `Vite 8` · `TailwindCSS 4` · `Recharts` · `Leaflet` · `React Query` · `i18next` · `Framer Motion` · `Lucide Icons` · `Axios`

### Backend
`Python` · `FastAPI` · `SQLAlchemy 2` · `Alembic` · `Pandas` · `scikit-learn` · `FPDF2` · `pdfplumber` · `httpx` · `JWT Auth`

### Infrastructure
`PostgreSQL 15` · `Redis 7` · `n8n` · `Docker Compose` · `ngrok`

---

## 🚀 Quick Start

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Node.js 18+](https://nodejs.org)
- [Python 3.11+](https://www.python.org)

### 1. Clone & Setup
```bash
git clone https://github.com/louayakermi2816-gif/hack4ucar-2025.git
cd hack4ucar-2025
```

### 2. Environment Variables
Create a `.env` file in the root:
```env
POSTGRES_USER=hack4ucar
POSTGRES_PASSWORD=secret
POSTGRES_DB=hack4ucar_db
DATABASE_URL=postgresql://hack4ucar:secret@localhost:5432/hack4ucar_db
MISTRAL_API_KEY=your_mistral_api_key
SECRET_KEY=your_jwt_secret
```

### 3. Start Infrastructure
```bash
docker-compose up -d db redis n8n
```

### 4. Start Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 6. Open
Visit **http://localhost:5173** — login with demo accounts:

| Role | Email | Password |
|------|-------|----------|
| President | `president@ucar.tn` | `president123` |
| Dean | `dean@ucar.tn` | `dean123` |
| Admin | `admin@ucar.tn` | `admin123` |
| Researcher | `researcher@ucar.tn` | `researcher123` |

---

## 📸 Screenshots

<!-- 
  Replace these with actual screenshots from your platform.
  Save screenshots in the docs/ folder, then uncomment:
  
  ### 🖥️ Dashboard
  ![Dashboard](./docs/dashboard.png)

  ### 🗺️ Interactive Map
  ![Map](./docs/map.png)

  ### 🤖 AI Chat
  ![AI Chat](./docs/ai-chat.png)

  ### 🔐 Login Page
  ![Login](./docs/login.png)
-->

> 📷 *Screenshots coming soon — see the demo video above*

---

## 📊 Project Stats

| Metric | Value |
|--------|-------|
| AI Agents | 3 |
| ML Models | 3 |
| Languages | 3 (EN, FR, AR) |
| Database Tables | 14 |
| Institutions Seeded | 33 |
| KPI Domains | 8 |
| User Roles | 4 |

---

## 👥 Team

Built for **Hack4UCAR 2025** — University of Carthage Hackathon

---

## 📄 License

This project was built for the Hack4UCAR 2025 hackathon.
