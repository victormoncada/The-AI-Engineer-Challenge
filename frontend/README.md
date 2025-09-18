# AI Engineer Challenge Frontend

A modern, casual React frontend application for the AI Engineer Challenge. This app provides a beautiful interface for chatting with AI models and managing documents for RAG (Retrieval Augmented Generation) queries.

## Features

- 🤖 **AI Chat Interface** - Stream chat with OpenAI models (GPT-4.1 Mini, GPT-4, GPT-3.5 Turbo)
- 📄 **Document Management** - Upload and manage documents for RAG queries
- 🔑 **API Key Management** - Secure local storage of OpenAI API keys
- 🎨 **Modern UI** - Casual, friendly design with smooth animations
- 📱 **Responsive** - Works great on desktop and mobile devices
- ⚡ **Real-time Streaming** - Live chat responses with typing indicators

## Prerequisites

- Node.js (version 14 or higher)
- npm or yarn package manager
- OpenAI API key
- Backend API running on `http://localhost:8000`

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`.

## Usage

### 1. Set up your API Key
- Go to the **Settings** tab
- Enter your OpenAI API key
- Click "Save API Key" to validate and store it

### 2. Start Chatting
- Switch to the **Chat** tab
- Type your message and press Enter or click Send
- Watch the AI respond in real-time with streaming

### 3. Manage Documents
- Go to the **Documents** tab
- Drag and drop files or click to upload
- Supported formats: .txt, .pdf, .md
- Search through your uploaded documents

## API Integration

This frontend connects to the FastAPI backend with the following endpoints:

- `POST /api/chat` - Stream chat with OpenAI models
- `GET /api/health` - Health check endpoint
- `POST /api/upload-document` - Upload documents for RAG (planned)

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Header.js
│   │   ├── Header.css
│   │   ├── ChatInterface.js
│   │   ├── ChatInterface.css
│   │   ├── DocumentManager.js
│   │   ├── DocumentManager.css
│   │   ├── ApiKeyManager.js
│   │   └── ApiKeyManager.css
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## Technologies Used

- **React 18** - Modern React with hooks
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icons
- **React Markdown** - Markdown rendering for AI responses
- **React Dropzone** - File upload functionality
- **Axios** - HTTP client for API requests

## Customization

### Styling
The app uses CSS modules and custom properties for easy theming. Main color variables are defined in the CSS files and can be easily modified.

### API Endpoints
Update the API endpoints in the component files if your backend runs on a different port or domain.

### Models
Add or modify available AI models in the `ChatInterface.js` component.

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Building for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

## Troubleshooting

### Common Issues

1. **API Key not working**
   - Ensure your OpenAI API key is valid and has sufficient credits
   - Check that the backend is running on `http://localhost:8000`

2. **CORS errors**
   - Make sure the backend has CORS enabled for `http://localhost:3000`

3. **File upload not working**
   - Ensure the backend has the document upload endpoint implemented
   - Check file size limits and supported formats

### Getting Help

If you encounter any issues:
1. Check the browser console for error messages
2. Verify the backend API is running and accessible
3. Ensure all dependencies are installed correctly

## Contributing

Feel free to submit issues and enhancement requests! This is a learning project, so contributions and suggestions are welcome.

## License

This project is part of the AI Engineer Challenge and is for educational purposes.