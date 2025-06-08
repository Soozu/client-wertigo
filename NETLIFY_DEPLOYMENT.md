# WerTigo Frontend - Netlify Deployment Guide

## 🚀 Environment Variables Setup

### Step 1: Configure Netlify Environment Variables

Go to your Netlify dashboard: https://app.netlify.com/projects/wertigo/deploys

Navigate to **Site settings** → **Environment variables** and add:

```bash
# Python Backend (AI, Recommendations, Geocoding, Routes)
VITE_PYTHON_API_URL=https://server-wertigo.onrender.com

# Express Backend (Authentication, Tickets, Reviews, Trip Sharing)  
VITE_EXPRESS_API_URL=https://server-python-x2au.onrender.com

# Application Settings
VITE_APP_NAME=WerTigo
VITE_APP_VERSION=1.0.0

# External APIs (optional - add if you have keys)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

### Step 2: Build Settings

Ensure your Netlify build settings are:
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18.x` or higher

### Step 3: Redirects Configuration

Create a `_redirects` file in your `public` directory:

```
/*    /index.html   200
```

## 🔧 Troubleshooting Common Issues

### Issue 1: API Connection Errors
**Symptoms**: `Failed to load resource: net::ERR_BLOCKED_BY_CLIENT`

**Solutions**:
1. Check that environment variables are set correctly in Netlify
2. Verify backend servers are running:
   - Python: https://server-wertigo.onrender.com/api/health
   - Express: https://server-python-x2au.onrender.com/health
3. Check browser console for CORS errors

### Issue 2: Missing Images (404 errors)
**Symptoms**: Images not loading, 404 errors for image assets

**Solutions**:
1. Move images from `images/` to `public/images/`
2. Update image references to use absolute paths: `/images/...`
3. Ensure images are included in the build

### Issue 3: Environment Variables Not Loading
**Symptoms**: API calls going to localhost instead of production URLs

**Solutions**:
1. Prefix all environment variables with `VITE_`
2. Redeploy after adding environment variables
3. Clear browser cache and hard refresh

## 🚀 Deployment Steps

### Option 1: Automatic Deployment (Recommended)
1. Push changes to your Git repository
2. Netlify will automatically build and deploy
3. Check deployment logs for any errors

### Option 2: Manual Deployment
1. Build locally: `npm run build`
2. Upload `dist` folder to Netlify
3. Configure environment variables in Netlify dashboard

## 🔍 Health Check URLs

After deployment, verify these endpoints work:

- **Frontend**: https://wertigo.netlify.app
- **Python Backend**: https://server-wertigo.onrender.com/api/health
- **Express Backend**: https://server-python-x2au.onrender.com/health

## 📝 Backend CORS Configuration

Ensure your backends allow requests from `https://wertigo.netlify.app`:

### Python Backend (Flask)
```python
from flask_cors import CORS
CORS(app, origins=['https://wertigo.netlify.app'])
```

### Express Backend
```javascript
app.use(cors({
  origin: ['https://wertigo.netlify.app'],
  credentials: true
}));
```

## 🐛 Common Error Messages & Fixes

| Error | Cause | Solution |
|-------|-------|----------|
| `Both backends are unavailable` | Environment variables not set | Set VITE_* variables in Netlify |
| `net::ERR_BLOCKED_BY_CLIENT` | Ad blocker or CORS issue | Check CORS settings, disable ad blocker |
| `404 for images` | Images not in public directory | Move images to `public/images/` |
| `Failed to get platform review stats` | Express backend not responding | Check Express server health |

## 🔄 Redeployment Process

1. Update environment variables if needed
2. Clear build cache: **Site settings** → **Build & deploy** → **Clear cache**
3. Trigger new deployment: **Deploys** → **Trigger deploy** → **Deploy site**
4. Monitor deployment logs for errors

---

**Need help?** Check the deployment logs in Netlify dashboard for detailed error messages. 