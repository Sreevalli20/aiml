# Deployment Guide

This guide covers deploying XYZ AI School Assistant to production using:
- **Frontend**: Vercel
- **Backend**: Render (FastAPI)
- **Database**: Render PostgreSQL

## Architecture

```
Frontend (Vercel)
    ↓
FastAPI Backend (Render)
    ↓
PostgreSQL (Render)
    ↓
AI Provider API (OpenAI/Anthropic/Gemini)
```

## Prerequisites

- Render account (free tier available)
- Vercel account (free tier available)
- AI Provider API key (OpenAI, Anthropic, or Google Gemini)
- Git repository with this code

## Step 1: Deploy PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **PostgreSQL**
3. Configure:
   - **Name**: `xyz-ai-postgres`
   - **Database**: `xyz_ai`
   - **User**: `xyz_ai_user`
   - **Region**: Choose nearest to your users
   - **Plan**: Free (or paid for production)
4. Click **Create Database**

**Important**: Save the internal database URL from Render. It will be used automatically by the backend.

## Step 2: Deploy FastAPI Backend on Render

### Option A: Using render.yaml (Recommended)

1. Push your code to GitHub/GitLab
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click **New** → **Blueprint**
4. Connect your repository
5. Render will automatically detect `backend/render.yaml`
6. Review the configuration and click **Apply**

### Option B: Manual Deployment

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your repository
4. Configure:
   - **Name**: `xyz-ai-backend`
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Working Directory**: `backend`
5. Add Environment Variables:
   - `DATABASE_URL`: (from Render PostgreSQL - select from database)
   - `JWT_SECRET`: (generate a strong random secret)
   - `JWT_ALGORITHM`: `HS256`
   - `JWT_ACCESS_TOKEN_EXPIRE_MINUTES`: `60`
   - `OPENAI_API_KEY`: (your OpenAI API key) OR
   - `ANTHROPIC_API_KEY`: (your Anthropic API key) OR
   - `GEMINI_API_KEY`: (your Google Gemini API key)
   - `CORS_ORIGINS`: `https://your-frontend.vercel.app,http://localhost:3000,http://localhost:5173`
   - `APP_NAME`: `XYZ AI School Assistant`
   - `APP_VERSION`: `1.0.0`
   - `DEBUG`: `false`
6. Click **Create Web Service**

### Run Database Migrations

After the backend is deployed:

1. Go to your backend service on Render
2. Click **Shell** (or use SSH)
3. Run:
   ```bash
   cd /opt/render/project/backend
   alembic upgrade head
   ```

### Run Seed Data (Optional)

To populate initial demo data:

```bash
cd /opt/render/project/backend
python -m app.db.seed
```

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `.` (or leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   - `VITE_API_BASE_URL`: `https://xyz-ai-backend.onrender.com` (your Render backend URL)
6. Click **Deploy**

## Step 4: Update CORS Configuration

After deploying both frontend and backend:

1. Go to your Render backend service
2. Click **Environment**
3. Update `CORS_ORIGINS` to include your Vercel frontend URL:
   ```
   https://your-frontend.vercel.app,http://localhost:3000,http://localhost:5173
   ```
4. Save and redeploy the backend

## Step 5: Verify Deployment

### Check Backend Health

```bash
curl https://xyz-ai-backend.onrender.com/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "status": "healthy",
  "school": "XYZ AI International Academy",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00",
  "database_connected": true
}
```

### Check Frontend

1. Open your Vercel frontend URL
2. Open browser DevTools → Console
3. Check for API connectivity in the diagnostics panel
4. Test login with seed credentials

## Environment Variables Reference

### Backend (Render)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql+asyncpg://...` |
| `JWT_SECRET` | Yes | Secret for JWT token signing | Random 32+ character string |
| `JWT_ALGORITHM` | No | JWT algorithm | `HS256` |
| `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` | No | Token expiration time | `60` |
| `OPENAI_API_KEY` | Conditional | OpenAI API key | `sk-...` |
| `ANTHROPIC_API_KEY` | Conditional | Anthropic API key | `sk-ant-...` |
| `GEMINI_API_KEY` | Conditional | Google Gemini API key | `AIza...` |
| `CORS_ORIGINS` | Yes | Allowed frontend origins | Comma-separated URLs |
| `APP_NAME` | No | Application name | `XYZ AI School Assistant` |
| `APP_VERSION` | No | Application version | `1.0.0` |
| `DEBUG` | No | Debug mode | `false` |

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_BASE_URL` | Yes | Backend API URL | `https://xyz-ai-backend.onrender.com` |

## Local Development

### Backend

1. Copy `backend/.env.example` to `backend/.env`
2. Configure environment variables
3. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```
4. Run migrations:
   ```bash
   alembic upgrade head
   ```
5. Run seed data (optional):
   ```bash
   python -m app.db.seed
   ```
6. Start server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set environment variable:
   ```bash
   export VITE_API_BASE_URL=http://localhost:8000
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Backend fails to start

- Check Render logs for errors
- Verify `DATABASE_URL` is correctly set
- Ensure all required environment variables are configured
- Check Python version compatibility (3.9+)

### Database connection errors

- Verify PostgreSQL database is running on Render
- Check `DATABASE_URL` format
- Ensure migrations have been run

### CORS errors in browser

- Verify `CORS_ORIGINS` includes your frontend URL
- Check that frontend URL uses HTTPS (production)
- Clear browser cache and retry

### Chat not working

- Verify AI provider API key is set
- Check API key has credits/quota
- Review backend logs for LLM errors

### Frontend can't connect to backend

- Verify `VITE_API_BASE_URL` is set correctly
- Check backend is running and accessible
- Test backend health endpoint directly
- Verify CORS configuration

## Security Notes

- Never commit `.env` files or real API keys
- Use strong, randomly generated `JWT_SECRET` in production
- Rotate secrets periodically
- Enable HTTPS in production (automatic on Render/Vercel)
- Review and update dependencies regularly
- Monitor logs for suspicious activity

## Scaling

### Backend Scaling

- Upgrade Render plan for more CPU/RAM
- Add horizontal scaling with multiple instances
- Consider Redis for session caching (if needed)

### Database Scaling

- Upgrade PostgreSQL plan for more storage
- Add read replicas for better performance
- Optimize queries and add indexes

### Frontend Scaling

- Vercel automatically scales
- Consider CDN for static assets
- Optimize bundle size

## Monitoring

### Render Monitoring

- View metrics in Render dashboard
- Check logs for errors
- Set up alert notifications

### Vercel Monitoring

- View analytics in Vercel dashboard
- Monitor build times
- Check deployment logs

## Backup and Recovery

### Database Backups

- Render automatically backs up PostgreSQL
- Manual backups can be created in Render dashboard
- Export data regularly for additional safety

### Code Backups

- Code is stored in Git repository
- Tag releases for easy rollback
- Keep deployment configurations in version control

## Support

For issues or questions:
1. Check this documentation
2. Review logs in Render/Vercel dashboards
3. Check GitHub Issues
4. Contact support if needed
