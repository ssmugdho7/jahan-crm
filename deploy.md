# Deployment Guide - Jahan CRM on Render

## Prerequisites
- GitHub account with the repo `https://github.com/ssmugdho7/jahan-crm`
- Render account (https://render.com)

## Steps to Deploy

### 1. Push Code to GitHub
```bash
cd C:\Users\user\Herd\crm
git add -A
git commit -m "Production ready"
git push origin main
```

### 2. Deploy on Render

#### Option A: Using Blueprint (Recommended)
1. Go to https://dashboard.render.com/blueprints
2. Click **New Blueprint**
3. Connect your GitHub repo: `ssmugdho7/jahan-crm`
4. Render will auto-detect `render.yaml` and create the service
5. Click **Apply** to start deployment

#### Option B: Manual Setup
1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect GitHub repo: `ssmugdho7/jahan-crm`
4. Configure:
   - **Name**: `jahan-crm`
   - **Runtime**: PHP
   - **Build Command**:
     ```
     composer install --no-dev --optimize-autoloader
     npm install
     npm run build
     php artisan storage:link || true
     php artisan migrate --force
     php artisan config:cache
     php artisan route:cache
     php artisan view:cache
     ```
   - **Start Command**:
     ```
     php artisan serve --host=0.0.0.0 --port=$PORT
     ```
5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | APP_ENV | production |
   | APP_DEBUG | false |
   | APP_KEY | (Generate new) |
   | DB_CONNECTION | sqlite |
   | SESSION_DRIVER | database |
   | CACHE_STORE | database |
   | QUEUE_CONNECTION | database |
   | LOG_CHANNEL | stack |
   | LOG_LEVEL | error |

6. Click **Create Web Service**

### 3. Post-Deployment
- Render will automatically run migrations
- Your app will be live at `https://jahan-crm.onrender.com`

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| APP_ENV | Application environment | production |
| APP_DEBUG | Debug mode | false |
| APP_KEY | Encryption key | Auto-generated |
| APP_URL | Application URL | Auto-detected |
| DB_CONNECTION | Database type | sqlite |
| SESSION_DRIVER | Session storage | database |
| CACHE_STORE | Cache storage | database |
| QUEUE_CONNECTION | Queue driver | database |
| LOG_CHANNEL | Log channel | stack |
| LOG_LEVEL | Log verbosity | error |

## Troubleshooting

### Build Fails
- Check Render logs for specific errors
- Ensure all dependencies are in `package.json` and `composer.json`

### Database Issues
- SQLite is used by default (no external DB needed)
- Migrations run automatically on deploy

### Assets Not Loading
- Run `npm run build` locally and commit `public/build` folder
- Or let Render build it during deployment

### Storage Link Issues
- `php artisan storage:link` runs during build
- If it fails, the `|| true` allows build to continue

## Free Tier Limitations
- 750 hours/month runtime
- 100GB bandwidth/month
- Spins down after 15 min inactivity
- First request after spin-down takes ~30s

## Useful Commands
```bash
# Check logs on Render dashboard or:
render logs --service jahan-crm

# SSH into service (if needed):
render ssh --service jahan-crm
```
