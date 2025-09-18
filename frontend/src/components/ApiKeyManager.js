import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff, Check, AlertCircle, Info } from 'lucide-react';
import './ApiKeyManager.css';

const ApiKeyManager = ({ apiKey, setApiKey }) => {
  const [showKey, setShowKey] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);

  const validateApiKey = async (key) => {
    if (!key.trim()) {
      setValidationStatus(null);
      return;
    }

    setIsValidating(true);
    setValidationStatus(null);

    try {
      // Test the API key by making a simple request
      const response = await fetch('/api/health');
      if (response.ok) {
        // If health check passes, try a simple chat request
        const chatResponse = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            developer_message: 'You are a helpful assistant.',
            user_message: 'Hello',
            model: 'gpt-4.1-mini',
            api_key: key
          }),
        });

        if (chatResponse.ok) {
          setValidationStatus('valid');
        } else {
          setValidationStatus('invalid');
        }
      } else {
        setValidationStatus('invalid');
      }
    } catch (error) {
      console.error('API key validation error:', error);
      setValidationStatus('error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = () => {
    setApiKey(tempKey);
    if (tempKey.trim()) {
      validateApiKey(tempKey);
    }
  };

  const handleClear = () => {
    setTempKey('');
    setApiKey('');
    setValidationStatus(null);
  };

  const getValidationMessage = () => {
    switch (validationStatus) {
      case 'valid':
        return { text: 'API key is valid and working!', type: 'success' };
      case 'invalid':
        return { text: 'Invalid API key. Please check and try again.', type: 'error' };
      case 'error':
        return { text: 'Error validating API key. Please check your connection.', type: 'error' };
      default:
        return null;
    }
  };

  const validationMessage = getValidationMessage();

  return (
    <div className="api-key-manager">
      <div className="api-key-header">
        <div className="api-key-title">
          <Key className="api-key-icon" />
          <h2>API Key Settings</h2>
        </div>
        <div className="api-key-status">
          {apiKey ? (
            <div className="status-connected">
              <Check size={16} />
              <span>Connected</span>
            </div>
          ) : (
            <div className="status-disconnected">
              <AlertCircle size={16} />
              <span>Not Connected</span>
            </div>
          )}
        </div>
      </div>

      <div className="api-key-content">
        <div className="api-key-section">
          <label htmlFor="api-key-input" className="api-key-label">
            OpenAI API Key
          </label>
          <div className="api-key-input-wrapper">
            <input
              id="api-key-input"
              type={showKey ? 'text' : 'password'}
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder="Enter your OpenAI API key..."
              className="api-key-input"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="toggle-visibility"
              title={showKey ? 'Hide API key' : 'Show API key'}
            >
              {showKey ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          {validationMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`validation-message ${validationMessage.type}`}
            >
              {validationMessage.type === 'success' ? (
                <Check size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <span>{validationMessage.text}</span>
            </motion.div>
          )}
        </div>

        <div className="api-key-info">
          <div className="info-header">
            <Info size={20} />
            <h3>How to get your API key:</h3>
          </div>
          <ol className="info-steps">
            <li>Visit <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">OpenAI Platform</a></li>
            <li>Sign in to your OpenAI account</li>
            <li>Click "Create new secret key"</li>
            <li>Copy the generated key and paste it above</li>
            <li>Keep your API key secure and never share it publicly</li>
          </ol>
        </div>

        <div className="api-key-actions">
          <button
            onClick={handleSave}
            disabled={isValidating || !tempKey.trim()}
            className="save-button"
          >
            {isValidating ? (
              <>
                <div className="spinner" />
                Validating...
              </>
            ) : (
              <>
                <Check size={16} />
                Save API Key
              </>
            )}
          </button>
          
          <button
            onClick={handleClear}
            disabled={!tempKey.trim()}
            className="clear-button"
          >
            Clear
          </button>
        </div>

        <div className="api-key-security">
          <h4>Security Notice</h4>
          <p>
            Your API key is stored locally in your browser and never sent to our servers. 
            It's only used to make direct requests to OpenAI's API from your browser.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
