import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './ChatInterface.css';

const ChatInterface = ({ apiKey, documents }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [developerMessage, setDeveloperMessage] = useState('You are a helpful AI assistant. Answer questions clearly and concisely.');
  const [model, setModel] = useState('gpt-4.1-mini');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !apiKey || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message to chat
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          developer_message: developerMessage,
          user_message: userMessage,
          model: model,
          api_key: apiKey
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      // Add assistant message placeholder
      setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

      const updateMessage = (content) => {
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: 'assistant',
            content: content,
            isStreaming: true
          };
          return updated;
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        assistantMessage += chunk;

        // Update the last message with streaming content
        updateMessage(assistantMessage);
      }

      // Mark streaming as complete
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: assistantMessage,
          isStreaming: false
        };
        return updated;
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message}`,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-title">
          <Bot className="chat-icon" />
          <h2>AI Chat Assistant</h2>
        </div>
        <div className="chat-controls">
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className="model-select"
          >
            <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
            <option value="gpt-4">GPT-4</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          </select>
          <button onClick={clearChat} className="clear-button">
            Clear Chat
          </button>
        </div>
      </div>

      <div className="developer-message-section">
        <label htmlFor="developer-message" className="developer-label">
          System Message:
        </label>
        <textarea
          id="developer-message"
          value={developerMessage}
          onChange={(e) => setDeveloperMessage(e.target.value)}
          className="developer-textarea"
          placeholder="Enter system instructions for the AI..."
          rows={2}
        />
      </div>

      <div className="messages-container">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`message ${message.role} ${message.isError ? 'error' : ''}`}
            >
              <div className="message-avatar">
                {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    message.content
                  )}
                </div>
                {message.isStreaming && (
                  <div className="streaming-indicator">
                    <Loader2 className="spinner" size={16} />
                    <span>AI is typing...</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={apiKey ? "Type your message here..." : "Please enter your OpenAI API key in Settings first"}
            className="message-input"
            disabled={!apiKey || isLoading}
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || !apiKey || isLoading}
            className="send-button"
          >
            {isLoading ? <Loader2 className="spinner" size={20} /> : <Send size={20} />}
          </button>
        </div>
        {!apiKey && (
          <div className="api-key-warning">
            ⚠️ Please enter your OpenAI API key in the Settings tab to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
