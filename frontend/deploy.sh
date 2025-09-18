#!/bin/bash

# AI Engineer Challenge Frontend Deployment Script

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📁 Build files are ready in the 'build' directory"
    echo ""
    echo "🌐 Deployment options:"
    echo "1. Vercel: Upload the 'build' folder or connect your GitHub repo"
    echo "2. Netlify: Drag and drop the 'build' folder"
    echo "3. GitHub Pages: Push the 'build' folder to gh-pages branch"
    echo "4. Any static hosting: Upload the contents of 'build' folder"
    echo ""
    echo "🔗 Don't forget to:"
    echo "- Deploy your backend API first"
    echo "- Update API URLs in the frontend code for production"
    echo "- Configure CORS on your backend for the frontend domain"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi
