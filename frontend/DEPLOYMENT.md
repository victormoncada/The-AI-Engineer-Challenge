# Deployment Guide for AI Engineer Challenge Frontend

## Option 1: Deploy via Vercel Web Interface (Recommended)

Since the Vercel CLI has Node.js compatibility issues, the easiest way to deploy is through Vercel's web interface:

### Steps:

1. **Push your code to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add frontend React app with chat and document management"
   git push origin main
   ```

2. **Go to [vercel.com](https://vercel.com)** and sign in with your GitHub account

3. **Click "New Project"**

4. **Import your GitHub repository**:
   - Select your repository: `The-AI-Engineer-Challenge`
   - Choose the root directory: `frontend`
   - Framework Preset: `Create React App`

5. **Configure the project**:
   - Project Name: `ai-engineer-frontend` (or your preferred name)
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

6. **Environment Variables** (if needed):
   - `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-backend.vercel.app`)

7. **Click "Deploy"**

## Option 2: Deploy Backend to Vercel First

You'll also need to deploy your FastAPI backend to Vercel:

### Backend Deployment:

1. **Create `api/vercel.json`**:
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "api/app.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "api/app.py"
       }
     ]
   }
   ```

2. **Deploy the backend**:
   - Go to Vercel
   - Import the same repository
   - Choose root directory: `api`
   - Framework: `Other`
   - Deploy

3. **Update frontend API URL**:
   - Once backend is deployed, update the frontend's API calls to use the Vercel backend URL

## Option 3: Use Netlify (Alternative)

If you prefer Netlify over Vercel:

1. **Go to [netlify.com](https://netlify.com)**
2. **Connect your GitHub repository**
3. **Build settings**:
   - Build command: `cd frontend && npm run build`
   - Publish directory: `frontend/build`
4. **Deploy**

## Option 4: Manual Deployment

If you want to deploy manually:

1. **Build the project** (already done):
   ```bash
   cd frontend
   npm run build
   ```

2. **Upload the `build` folder** to any static hosting service:
   - GitHub Pages
   - Firebase Hosting
   - AWS S3 + CloudFront
   - Any other static hosting service

## Testing the Deployment

Once deployed, test the following:

1. **Frontend loads** at the deployed URL
2. **API Key management** works (Settings tab)
3. **Chat interface** connects to your backend
4. **Document upload** works (if backend supports it)

## Environment Configuration

### For Production:

Update the API endpoints in your components to use the production backend URL:

```javascript
// In ChatInterface.js, change:
const response = await fetch('/api/chat', {
  // to:
const response = await fetch('https://your-backend-url.vercel.app/api/chat', {
```

### For Development:

The current setup uses a proxy in `package.json`:
```json
"proxy": "http://localhost:8000"
```

This automatically redirects API calls to your local backend during development.

## Troubleshooting

### Common Issues:

1. **CORS errors**: Make sure your backend has CORS enabled for your frontend domain
2. **API not found**: Check that the backend is deployed and the URL is correct
3. **Build failures**: Check that all dependencies are in `package.json`

### Backend CORS Configuration:

Make sure your FastAPI backend allows your frontend domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Development
        "https://your-frontend.vercel.app",  # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Next Steps

1. Deploy the backend first
2. Update frontend API URLs to point to the deployed backend
3. Deploy the frontend
4. Test the complete application
5. Share the live URL!

The application is now ready for deployment with a modern, casual UI that provides:
- 🤖 AI Chat with streaming responses
- 📄 Document management for RAG
- 🔑 Secure API key management
- 📱 Responsive design
- ⚡ Real-time interactions
