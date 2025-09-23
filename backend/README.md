# RAG Backend Server

This is a FastAPI backend server that provides RAG (Retrieval Augmented Generation) functionality for the frontend application.

## Features

- **Document Upload**: Upload and process text documents for RAG
- **Chat with RAG**: Enhanced chat interface with document context
- **Direct RAG Queries**: Query documents directly with RAG
- **Document Management**: View and manage uploaded documents

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Set up Python Path

Make sure the `02_Embeddings_and_RAG` directory is accessible to the backend:

```bash
# From the project root
export PYTHONPATH="${PYTHONPATH}:$(pwd)/02_Embeddings_and_RAG"
```

### 3. Start the Server

```bash
python start_server.py
```

The server will start on `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Chat
- `POST /api/chat` - Send chat messages with optional RAG enhancement

### Documents
- `POST /api/upload-document` - Upload a document for RAG processing
- `GET /api/documents` - Get information about uploaded documents
- `DELETE /api/documents` - Clear all documents

### RAG
- `POST /api/rag-query` - Direct RAG query against uploaded documents

## API Documentation

Once the server is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Environment Variables

- `OPENAI_API_KEY` - Your OpenAI API key (passed in requests)

## Usage with Frontend

The frontend is configured to proxy requests to `http://localhost:8000/api`. Make sure both the backend and frontend are running:

1. Backend: `python start_server.py` (port 8000)
2. Frontend: `npm start` (port 3000)

## Supported File Types

- `.txt` - Plain text files
- `.md` - Markdown files
- `.pdf` - PDF files (basic support)

## Architecture

The backend integrates the RAG components from the `02_Embeddings_and_RAG` module:

- **VectorDatabase**: Stores document embeddings
- **EmbeddingModel**: Handles OpenAI embeddings
- **ChatOpenAI**: Manages chat completions
- **Prompt Templates**: System and user prompts for RAG