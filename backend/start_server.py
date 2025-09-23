#!/usr/bin/env python3
"""
Startup script for the RAG Backend Server
"""

import uvicorn
import sys
import os
from pathlib import Path

# Add the project root to the Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

if __name__ == "__main__":
    print("🚀 Starting RAG Backend Server...")
    print("📁 Project root:", project_root)
    print("🔗 Server will be available at: http://localhost:8000")
    print("📖 API docs will be available at: http://localhost:8000/docs")
    print("=" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(project_root)],
        log_level="info"
    )