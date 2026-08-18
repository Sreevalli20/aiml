# XYZ AI — Human-Like AI School Assistant

> **Production-Quality AI School Assistant for Modern Indian Schools**

XYZ AI is an intelligent conversational school assistant that unites **Students, Parents, Teachers, and Principals** through role-aware AI interactions, voice processing, visual avatar assistance, and multilingual capabilities (11 Indian languages).

---

## 🌟 Key Features

- **Role-Based AI Assistant**: Different experiences for Students, Parents, Teachers, and Principals
- **Attendance Management**: Real-time attendance tracking, marking, and analytics
- **Natural Language Chat**: Conversational AI with intent detection and entity extraction
- **Voice Integration**: Speech-to-text and text-to-speech with animated avatar
- **Multilingual Support**: English, Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Punjabi, Kannada, Malayalam, Urdu
- **Escalation System**: Parents can request callbacks from teachers or management
- **Secure Authorization**: JWT authentication with role-based access control
- **Audit Logging**: Complete audit trail for all sensitive operations

---

## 🏗️ Architecture

```
Frontend (Vercel)
    ↓ HTTPS
FastAPI Backend (Render)
    ↓
PostgreSQL (Render)
    ↓
AI Provider API (OpenAI/Anthropic/Gemini)
```

### Technology Stack

**Frontend:**
- React 19 with TypeScript
- Vite for build tooling
- TailwindCSS 4 for styling
- Lucide React for icons
- Motion for animations

**Backend:**
- FastAPI (Python)
- SQLAlchemy 2.0 (async)
- PostgreSQL
- Alembic for migrations
- JWT authentication
- OpenAI/Anthropic/Google Gemini integration

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: Render PostgreSQL

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.9+
- PostgreSQL (or use Render PostgreSQL)
- AI Provider API key (OpenAI, Anthropic, or Google Gemini)

### Local Development

**Backend:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
alembic upgrade head

# Seed database (optional)
python -m app.db.seed

# Start server
uvicorn app.main:app --reload
```

**Frontend:**
```bash
# Install dependencies
npm install

# Configure environment
echo "VITE_API_BASE_URL=http://localhost:8000" > .env

# Start dev server
npm run dev
```

---

## 📦 Production Deployment

### Step 1: Deploy PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **PostgreSQL**
3. Configure:
   - **Name**: `xyz-ai-postgres`
   - **Database**: `xyz_ai`
   - **User**: `xyz_ai_user`
   - **Plan**: Free (or paid for production)
4. Click **Create Database**

### Step 2: Deploy FastAPI Backend on Render

**Using render.yaml (Recommended):**
1. Push code to GitHub/GitLab
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Blueprint**
4. Connect repository and deploy

**Manual Deployment:**
1. Click **New** → **Web Service**
2. Configure:
   - **Name**: `xyz-ai-backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Working Directory**: `backend`
3. Add Environment Variables:
   - `DATABASE_URL`: (from Render PostgreSQL)
   - `JWT_SECRET`: (generate strong random secret)
   - `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` or `GEMINI_API_KEY`
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app`
   - `DEBUG`: `false`

**Run Migrations:**
```bash
cd /opt/render/project/backend
alembic upgrade head
```

**Seed Database (Optional):**
```bash
python -m app.db.seed
```

### Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import repository
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variable:
   - `VITE_API_BASE_URL`: `https://xyz-ai-backend.onrender.com`
6. Click **Deploy**

### Step 4: Update CORS

After deploying both:
1. Go to Render backend service
2. Update `CORS_ORIGINS` to include your Vercel URL
3. Redeploy backend

---

## 🔐 Environment Variables

### Backend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `JWT_SECRET` | JWT signing secret | Random 32+ character string |
| `OPENAI_API_KEY` | OpenAI API key | `sk-...` |
| `ANTHROPIC_API_KEY` | Anthropic API key | `sk-ant-...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `CORS_ORIGINS` | Allowed frontend origins | `https://your-frontend.vercel.app` |
| `DEBUG` | Debug mode | `false` |

### Frontend (Required)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://xyz-ai-backend.onrender.com` |

---

## 📚 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/logout` - Logout

### Chat
- `POST /api/v1/chat` - Send message to AI
- `GET /api/v1/chat/conversations` - List conversations
- `POST /api/v1/chat/conversations` - Create conversation
- `DELETE /api/v1/chat/conversations/{id}` - Delete conversation

### Attendance
- `GET /api/v1/attendance/me` - Get own attendance (student)
- `GET /api/v1/attendance/child/{id}` - Get child's attendance (parent)
- `POST /api/v1/attendance/mark` - Mark attendance (teacher)
- `GET /api/v1/attendance/analytics` - School analytics (principal)

### Escalations
- `POST /api/v1/escalations/teacher` - Request teacher call (parent)
- `POST /api/v1/escalations/management` - Request management call (parent)
- `GET /api/v1/escalations` - List escalations

### Health
- `GET /api/v1/health` - Health check

---

## 👥 User Roles & Permissions

### Student
- View own attendance
- Chat with AI assistant
- Cannot view other students' data

### Parent
- View linked children's attendance
- Request teacher/management escalations
- Chat with AI assistant
- Cannot view other children's data

### Teacher
- View assigned students' attendance
- Mark attendance for assigned students
- Chat with AI assistant
- Cannot access school analytics

### Principal
- View all students' attendance
- Access school-wide analytics
- Chat with AI assistant
- Cannot modify individual attendance

---

## 🛡️ Security

- **Authentication**: JWT tokens with 60-minute expiration
- **Authorization**: Role-based access control with resource ownership verification
- **Password Security**: bcrypt hashing with 12 rounds
- **Prompt Injection Protection**: Fixed system prompt, controlled tools, input validation
- **Audit Logging**: All sensitive operations logged
- **CORS**: Configured for specific origins only
- **Rate Limiting**: 100 requests per minute in production

See [docs/security.md](docs/security.md) for detailed security documentation.

---

## � Documentation

- [Deployment Guide](docs/deployment.md) - Complete deployment instructions
- [Architecture Documentation](docs/architecture.md) - System architecture and design
- [Security Documentation](docs/security.md) - Security model and best practices
- [API Contract](docs/API_CONTRACT.md) - API endpoint specifications

---

## 🧪 Testing

**Backend Tests:**
```bash
cd backend
pytest
```

**Frontend Tests:**
```bash
npm test
```

---

## � Troubleshooting

### Backend fails to start
- Check DATABASE_URL is correctly set
- Verify all environment variables are configured
- Check Python version compatibility (3.9+)

### Database connection errors
- Verify PostgreSQL database is running
- Check DATABASE_URL format
- Ensure migrations have been run

### CORS errors
- Verify CORS_ORIGINS includes your frontend URL
- Check that frontend uses HTTPS in production
- Clear browser cache

### Chat not working
- Verify AI provider API key is set
- Check API key has credits/quota
- Review backend logs for errors

---

## 📝 License

This project is licensed under the MIT License.

---

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

---

## 📞 Support

For issues or questions:
1. Check documentation
2. Review logs in Render/Vercel dashboards
3. Open an issue on GitHub
