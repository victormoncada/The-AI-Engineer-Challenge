import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import DocumentManager from './components/DocumentManager';
import ApiKeyManager from './components/ApiKeyManager';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    }
  }, [apiKey]);

  const tabs = [
    { id: 'chat', label: 'Chat', icon: '💬' },
    { id: 'documents', label: 'Documents', icon: '📄' },
    { id: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="app">
      <Header />
      
      <div className="app-container">
        <nav className="tab-navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </nav>

        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="tab-content"
            >
              {activeTab === 'chat' && (
                <ChatInterface apiKey={apiKey} documents={documents} />
              )}
              {activeTab === 'documents' && (
                <DocumentManager 
                  documents={documents} 
                  setDocuments={setDocuments}
                  apiKey={apiKey}
                />
              )}
              {activeTab === 'settings' && (
                <ApiKeyManager apiKey={apiKey} setApiKey={setApiKey} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
