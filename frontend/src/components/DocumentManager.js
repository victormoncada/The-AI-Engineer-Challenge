import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Trash2, Search, X } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import './DocumentManager.css';

const DocumentManager = ({ documents, setDocuments, apiKey }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = async (acceptedFiles) => {
    if (!apiKey) {
      alert('Please enter your OpenAI API key in Settings first');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    for (const file of acceptedFiles) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 90));
        }, 200);

        const response = await fetch('/api/upload-document', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (response.ok) {
          const result = await response.json();
          const newDocument = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            type: file.type,
            content: result.content || 'Document content processed',
            uploadedAt: new Date().toISOString(),
            chunks: result.chunks || 0,
          };
          setDocuments(prev => [...prev, newDocument]);
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        alert(`Error uploading ${file.name}: ${error.message}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'text/markdown': ['.md'],
    },
    multiple: true,
  });

  const deleteDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="document-manager">
      <div className="document-header">
        <div className="document-title">
          <FileText className="document-icon" />
          <h2>Document Manager</h2>
        </div>
        <div className="document-stats">
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="search-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="upload-section">
        <div
          {...getRootProps()}
          className={`upload-area ${isDragActive ? 'drag-active' : ''} ${!apiKey ? 'disabled' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="upload-content">
            <Upload className="upload-icon" size={48} />
            <div className="upload-text">
              <h3>Drop files here or click to upload</h3>
              <p>Supports .txt, .pdf, .md files</p>
            </div>
          </div>
        </div>

        {isUploading && (
          <div className="upload-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="progress-text">Uploading... {uploadProgress}%</span>
          </div>
        )}

        {!apiKey && (
          <div className="api-key-warning">
            ⚠️ Please enter your OpenAI API key in Settings to upload documents
          </div>
        )}
      </div>

      <div className="documents-list">
        <AnimatePresence>
          {filteredDocuments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state"
            >
              <FileText className="empty-icon" size={64} />
              <h3>No documents yet</h3>
              <p>Upload some documents to get started with RAG queries</p>
            </motion.div>
          ) : (
            filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="document-item"
              >
                <div className="document-info">
                  <div className="document-name">
                    <FileText className="file-icon" size={20} />
                    <span>{doc.name}</span>
                  </div>
                  <div className="document-meta">
                    <span className="file-size">{formatFileSize(doc.size)}</span>
                    <span className="file-date">{formatDate(doc.uploadedAt)}</span>
                    {doc.chunks > 0 && (
                      <span className="file-chunks">{doc.chunks} chunks</span>
                    )}
                  </div>
                  <div className="document-preview">
                    {doc.content.substring(0, 150)}...
                  </div>
                </div>
                <div className="document-actions">
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="delete-button"
                    title="Delete document"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default DocumentManager;
