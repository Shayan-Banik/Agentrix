# Agentrix

Agentrix is a multi-agent AI platform that combines a modern React frontend with a modular backend system for conversations, authentication, and specialized AI agents. The platform supports chat-based interactions, code-focused workflows, web search, PDF generation, slide generation, and image generation through a unified user experience.

## Overview

The application is structured as a distributed service architecture:

- Client application: a Vite + React interface for end users
- API gateway: routes and protects client traffic to backend services
- Authentication service: handles user login/logout and Firebase-based identity management
- Chat service: manages conversations and message history
- Agent service: orchestrates specialized AI agents and content-generation workflows
- Redis: used for shared memory and caching
- MongoDB: stores application data such as users, conversations, and messages
- AWS S3: stores generated assets such as PDFs, PPT files, and other uploaded/generated artifacts

## Key Features

- AI-powered chat experience with conversation history
- Role-based agent routing for different use cases
- Specialized agents for:
  - general chat
  - coding and debugging support
  - web search and live retrieval
  - PDF generation
  - slide deck generation
  - image generation
- Protected API access through a gateway middleware layer
- Firebase authentication integration
- Responsive front-end built with React and Tailwind CSS
- Service-based architecture for scaling and independent development

## Architecture

```text
Client (React + Vite)
        |
        v
Gateway (Express)
  |----> Auth Service
  |----> Chat Service
  |----> Agent Service
  |----> Redis
  |----> MongoDB
  |----> AWS S3
  |----> Firebase
```

## Tech Stack

### Frontend
- React 19
- Vite
- Redux Toolkit
- Axios
- Tailwind CSS
- Firebase client SDK
- Lucide icons

### Backend
- Node.js
- Express.js
- Mongoose
- Redis
- Firebase Admin SDK
- LangChain / LLM integrations
- AWS SDK for S3
- PDFKit and PPTXGenJS for document generation

## Repository Structure

```text
.
├── backend/
│   ├── docker-compose.yml
│   ├── gateway/
│   │   ├── index.js
│   │   ├── controller/
│   │   ├── middleware/
│   │   └── utils/
│   ├── services/
│   │   ├── agent/
│   │   ├── auth/
│   │   ├── chat/
│   │   └── shared/
│   └── shared/
│       └── redis/
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── README.md
└── .gitignore
```

## Prerequisites

Before running the project, make sure you have the following installed:

- Node.js 18+
- npm or yarn
- MongoDB instance
- Redis server
- Firebase project configuration
- AWS credentials for S3 access
- Docker (recommended for Redis setup)

## Environment Variables

Create environment files for the backend services and set the required values.

Example configuration:

```env
# Gateway
PORT=8000
FRONTEND_URL=http://localhost:5173
AUTH_SERVICE_URL=http://localhost:8001
CHAT_SERVICE_URL=http://localhost:8002
AGENT_SERVICE_URL=http://localhost:8003
NODE_ENV=development

# Shared / MongoDB
MONGO_URI=mongodb://localhost:27017/agentrix

# Redis
REDIS_URL=redis://localhost:6379

# AWS S3
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY=your_private_key
```

> Note: The exact environment keys may vary depending on your local configuration and service setup. Review the service configuration files before running the app in production.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/agentrix.git
cd agentrix
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend service dependencies

```bash
cd ../backend
# Gateway
cd gateway && npm install && cd ..

# Auth service
cd services/auth && npm install && cd ../..

# Chat service
cd services/chat && npm install && cd ../..

# Agent service
cd services/agent && npm install && cd ../..
```

## Running the Application

### Start Redis with Docker

```bash
cd backend
docker compose up -d redis
```

### Start backend services

Run each service in a separate terminal:

```bash
cd backend/gateway
npm run dev
```

```bash
cd backend/services/auth
npm run dev
```

```bash
cd backend/services/chat
npm run dev
```

```bash
cd backend/services/agent
npm run dev
```

### Start the frontend

```bash
cd client
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

## API Overview

The gateway exposes a unified API layer for clients:

- `GET /health` — health check endpoint
- `GET /api/me` — fetch currently authenticated user
- `POST /api/auth/login` — login flow
- `POST /api/auth/logout` — logout flow
- `GET /api/chat/*` — conversation retrieval endpoints
- `POST /api/chat/*` — conversation and message creation endpoints
- `GET /api/agent/agents` — list available agents
- `POST /api/agent/chat` — route user prompts to the appropriate agent

## Agent Capabilities

The platform includes several agent modes, including:

- Chat: general conversation and reasoning
- Coding: debugging, coding assistance, and implementation help
- Search: current and recent information lookup
- PDF: structured document generation
- PPT: presentation generation
- Image Generator: image creation from textual prompts

## Development Notes

This project follows a modular backend architecture that separates concerns across multiple services. This pattern makes it easier to scale specific features independently and extend the platform with additional AI agents in the future.

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes with clear messages
4. Open a pull request with a description of the update

## License

This project is currently distributed under the terms specified in the repository. Please review the project license file before production use or redistribution.

## Contact

For questions, feature requests, or collaboration opportunities, please reach out through the project maintainer or repository issue tracker.
