# Deployment Guide for RAG Application

This guide explains how to deploy your RAG application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI**: Install with `npm i -g vercel`
3. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository structure looks like this:
```
your-repo/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── vercel.json
├── frontend/
│   ├── package.json
│   ├── src/
│   └── public/
├── 02_Embeddings_and_RAG/
│   └── aimakerspace/
├── vercel.json
└── package.json
```

### 2. Deploy via Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Build Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty (uses root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/build`
   - **Install Command**: `npm install`

3. **Environment Variables** (if needed):
   - Add any required environment variables in the Vercel dashboard

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete

### 3. Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from your project root
vercel

# Follow the prompts:
# - Link to existing project or create new one
# - Confirm build settings
# - Deploy
```

### 4. Configure Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Configuration Files

### Root `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "frontend/build"
      }
    },
    {
      "src": "backend/app.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/app.py"
    },
    {
      "src": "/static/(.*)",
      "dest": "/frontend/build/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/build/index.html"
    }
  ],
  "env": {
    "PYTHONPATH": "/var/task/02_Embeddings_and_RAG"
  }
}
```

## Post-Deployment

### 1. Test Your Application

1. **Frontend**: Visit your Vercel URL
2. **API**: Test `https://your-app.vercel.app/api/health`
3. **RAG Features**: Upload documents and test chat functionality

### 2. Environment Variables

If you need to set environment variables:
1. Go to Vercel dashboard
2. Select your project
3. Go to "Settings" → "Environment Variables"
4. Add any required variables

### 3. Monitoring

- Check Vercel dashboard for deployment status
- Monitor function logs for any errors
- Use Vercel Analytics for usage insights

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in Vercel dashboard
   - Ensure all dependencies are in package.json
   - Verify Python requirements.txt includes all packages

2. **API Not Working**:
   - Check that routes are configured correctly in vercel.json
   - Verify backend/app.py exists and is properly formatted
   - Check function logs for Python errors

3. **RAG Components Not Found**:
   - Ensure 02_Embeddings_and_RAG directory is included
   - Check PYTHONPATH environment variable
   - Verify all imports in app.py are correct

### Debug Commands

```bash
# Test locally with Vercel
vercel dev

# Check deployment logs
vercel logs [deployment-url]

# Inspect function logs
vercel logs --follow
```

## Production Considerations

1. **API Keys**: Store OpenAI API keys securely in environment variables
2. **Rate Limiting**: Consider implementing rate limiting for API endpoints
3. **Caching**: Add caching for frequently accessed data
4. **Monitoring**: Set up monitoring and alerting for production issues
5. **Backup**: Consider data persistence for uploaded documents

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **FastAPI on Vercel**: [vercel.com/docs/functions/serverless-functions/python](https://vercel.com/docs/functions/serverless-functions/python)
- **React on Vercel**: [vercel.com/docs/frameworks/react](https://vercel.com/docs/frameworks/react)