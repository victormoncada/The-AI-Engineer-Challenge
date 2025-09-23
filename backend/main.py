from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import asyncio
import tempfile
import shutil
from pathlib import Path
import logging
import sys

# Import our RAG components
import sys
sys.path.append('../02_Embeddings_and_RAG')

from aimakerspace.text_utils import TextFileLoader, CharacterTextSplitter, DocumentWithMetadata
from aimakerspace.vectordatabase import VectorDatabase
from aimakerspace.openai_utils.chatmodel import ChatOpenAI
from aimakerspace.openai_utils.prompts import SystemRolePrompt, UserRolePrompt
from aimakerspace.openai_utils.embedding import EmbeddingModel

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="RAG Backend API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8890"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for RAG components
vector_db = None
chat_model = None
rag_system_prompt = None
rag_user_prompt = None

# Pydantic models
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    api_key: str
    model: str = "gpt-4.1-mini"
    use_rag: bool = False

class DocumentUpload(BaseModel):
    filename: str
    content: str
    file_type: str
    size: int

class RAGQuery(BaseModel):
    query: str
    api_key: str
    k: int = 4
    response_style: str = "detailed"

@app.on_event("startup")
async def startup_event():
    """Initialize RAG components on startup"""
    global rag_system_prompt, rag_user_prompt
    
    # Initialize RAG prompts
    RAG_SYSTEM_TEMPLATE = """You are a knowledgeable assistant that answers questions based strictly on provided context.

Instructions:
- Only answer questions using information from the provided context
- If the context doesn't contain relevant information, respond with "I don't know"
- Be accurate and cite specific parts of the context when possible
- Keep responses {response_style} and {response_length}
- Only use the provided context. Do not use external knowledge.
- Only provide answers when you are confident the context supports your response."""

    RAG_USER_TEMPLATE = """Context Information:
{context}

Number of relevant sources found: {context_count}
{similarity_scores}

Question: {user_query}

Please provide your answer based solely on the context above."""

    rag_system_prompt = SystemRolePrompt(
        RAG_SYSTEM_TEMPLATE,
        strict=True,
        defaults={
            "response_style": "concise",
            "response_length": "brief"
        }
    )

    rag_user_prompt = UserRolePrompt(
        RAG_USER_TEMPLATE,
        strict=True,
        defaults={
            "context_count": "",
            "similarity_scores": ""
        }
    )
    
    logger.info("RAG Backend initialized successfully")

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Handle chat requests with optional RAG"""
    try:
        if not request.api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
        # Initialize chat model
        chat_model = ChatOpenAI(model_name=request.model)
        chat_model.openai_api_key = request.api_key
        
        # Prepare messages
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
        
        if request.use_rag and vector_db and len(vector_db.vectors) > 0:
            # Use RAG for the last user message
            user_query = request.messages[-1].content if request.messages[-1].role == 'user' else ""
            
            if user_query:
                # Retrieve relevant contexts
                context_list = vector_db.search_by_text(user_query, k=4)
                
                context_prompt = ""
                similarity_scores = []
                
                for i, (context, score, metadata) in enumerate(context_list, 1):
                    context_prompt += f"[Source {i}]: {context}\n\n"
                    similarity_scores.append(f"Source {i}: {score:.3f}")
                
                # Create RAG messages
                system_params = {
                    "response_style": "detailed",
                    "response_length": "comprehensive"
                }
                
                formatted_system_prompt = rag_system_prompt.create_message(**system_params)
                
                user_params = {
                    "user_query": user_query,
                    "context": context_prompt.strip(),
                    "context_count": len(context_list),
                    "similarity_scores": f"Relevance scores: {', '.join(similarity_scores)}"
                }
                
                formatted_user_prompt = rag_user_prompt.create_message(**user_params)
                
                messages = [formatted_system_prompt, formatted_user_prompt]
        
        # Get response from OpenAI
        response = chat_model.run(messages)
        
        return JSONResponse(content={
            "response": response,
            "used_rag": request.use_rag and vector_db and len(vector_db.vectors) > 0,
            "context_count": len(context_list) if request.use_rag and vector_db else 0
        })
        
    except Exception as e:
        logger.error(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    api_key: str = Form(...)
):
    """Upload and process a document for RAG"""
    global vector_db
    
    try:
        if not api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name
        
        try:
            # Process the file based on type
            if file.filename.endswith('.txt') or file.filename.endswith('.md'):
                # Read text file
                with open(temp_file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Create document with metadata
                document = DocumentWithMetadata(
                    content=content,
                    metadata={
                        'filename': file.filename,
                        'file_type': file.content_type,
                        'size': file.size
                    }
                )
                
                # Split into chunks
                text_splitter = CharacterTextSplitter()
                split_documents = text_splitter.split_texts([document.content])
                
                # Initialize vector database if not exists
                if vector_db is None:
                    vector_db = VectorDatabase()
                
                # Build embeddings and add to vector database
                await vector_db.abuild_from_list(split_documents)
                
                return JSONResponse(content={
                    "message": f"Successfully processed {file.filename}",
                    "chunks": len(split_documents),
                    "total_documents": len(vector_db.vectors)
                })
            
            elif file.filename.endswith('.pdf'):
                # For PDF files, we'd need additional processing
                # For now, return an error
                raise HTTPException(status_code=400, detail="PDF processing not implemented yet")
            
            else:
                raise HTTPException(status_code=400, detail="Unsupported file type")
                
        finally:
            # Clean up temporary file
            os.unlink(temp_file_path)
            
    except Exception as e:
        logger.error(f"Error uploading document: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/rag-query")
async def rag_query(request: RAGQuery):
    """Direct RAG query"""
    global vector_db
    
    try:
        if not request.api_key:
            raise HTTPException(status_code=400, detail="API key is required")
        
        if not vector_db or len(vector_db.vectors) == 0:
            raise HTTPException(status_code=400, detail="No documents available for RAG. Please upload documents first.")
        
        # Initialize chat model
        chat_model = ChatOpenAI(model_name="gpt-4.1-mini")
        chat_model.openai_api_key = request.api_key
        
        # Retrieve relevant contexts
        context_list = vector_db.search_by_text(request.query, k=request.k)
        
        context_prompt = ""
        similarity_scores = []
        
        for i, (context, score, metadata) in enumerate(context_list, 1):
            context_prompt += f"[Source {i}]: {context}\n\n"
            similarity_scores.append(f"Source {i}: {score:.3f}")
        
        # Create RAG messages
        system_params = {
            "response_style": request.response_style,
            "response_length": "comprehensive"
        }
        
        formatted_system_prompt = rag_system_prompt.create_message(**system_params)
        
        user_params = {
            "user_query": request.query,
            "context": context_prompt.strip(),
            "context_count": len(context_list),
            "similarity_scores": f"Relevance scores: {', '.join(similarity_scores)}"
        }
        
        formatted_user_prompt = rag_user_prompt.create_message(**user_params)
        
        # Get response
        response = chat_model.run([formatted_system_prompt, formatted_user_prompt])
        
        return JSONResponse(content={
            "response": response,
            "context_count": len(context_list),
            "similarity_scores": similarity_scores,
            "contexts": [{"content": ctx, "score": score} for ctx, score, _ in context_list]
        })
        
    except Exception as e:
        logger.error(f"Error in RAG query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/documents")
async def get_documents():
    """Get information about uploaded documents"""
    global vector_db
    
    if not vector_db:
        return JSONResponse(content={"documents": [], "total": 0})
    
    return JSONResponse(content={
        "documents": list(vector_db.vectors.keys())[:10],  # First 10 keys
        "total": len(vector_db.vectors)
    })

@app.delete("/api/documents")
async def clear_documents():
    """Clear all documents from the vector database"""
    global vector_db
    
    vector_db = None
    return JSONResponse(content={"message": "All documents cleared"})

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return JSONResponse(content={"status": "healthy", "has_documents": vector_db is not None and len(vector_db.vectors) > 0})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)