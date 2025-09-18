import React from 'react';
import { motion } from 'framer-motion';
import './Header.css';

const Header = () => {
  return (
    <motion.header 
      className="header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="header-content">
        <div className="logo">
          <span className="logo-icon">🤖</span>
          <h1 className="logo-text">AI Engineer Challenge</h1>
        </div>
        <div className="header-subtitle">
          <span className="subtitle-text">Chat • RAG • Deploy</span>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
