# 📈 FinAgent-Pro: AI-Powered Market intelligence

**FinAgent-Pro** is a state-of-the-art financial intelligence platform that combines real-time market data with advanced AI-driven analysis. Designed for the modern investor, it provides deep insights into stock sentiment, risk analysis, and portfolio health.

---

## ✨ Key Features

- 🧠 **AI-Powered Insights**: Leveraging Anthropic Claude for deep sentiment analysis and risk assessment of any stock.
- 📊 **Dynamic Visualization**: Interactive OHLC Candlestick, Volume, and RSI charts built with Chart.js.
- 💼 **Portfolio Management**: Comprehensive asset allocation tracking and historical performance review.
- 🛡️ **Risk Score Index**: Proprietary AI-calculated risk scores (0-10) with detailed reasoning.
- 📦 **Dockerized Ecosystem**: One-command deployment using Docker & Docker Compose.
- ☁️ **Cloud Native**: Optimized for Render (Backend) and Vercel (Frontend).
- 🔐 **Secure Auth**: JWT-based authentication system with encrypted user data.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: NeonDB (Serverless PostgreSQL)
- **AI Engine**: Anthropic Claude API
- **Data Source**: YFinance
- **Auth**: JWT (JSON Web Tokens)

### Frontend
- **Library**: React 19 + Vite
- **Styling**: Tailwind CSS + Framer Motion
- **Charts**: Chart.js v4
- **Icons**: Lucide React

---

## 🚀 Quick Start (Local Docker)

The fastest way to get started is using Docker Compose:

1. **Clone the Repo**
   ```bash
   git clone https://github.com/your-username/FinAgent-Pro.git
   cd FinAgent-Pro
   ```

2. **Configure Environment**
   Create a `.env` in the root and add:
   ```env
   ANTHROPIC_API_KEY=your_key_here
   DATABASE_URL=your_neondb_url_here
   SECRET_KEY=your_secure_random_string
   ```

3. **Launch Containers**
   ```bash
   docker-compose up -d --build
   ```
   *Access the app at [http://localhost](http://localhost)*

---

## 💻 Local Development Setup

### Backend setup
```bash
cd backend
pip install -r requirements.txt
uvicorn backend.api:app --reload
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Deployment

For detailed staging/production deployment instructions, refer to the [Deployment Guide](./deployment_guide.md).

- **Backend**: Render (Python 3 Web Service)
- **Frontend**: Vercel (Vite Preset)

---

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
