PROJECT TASK MANAGEMENT SYSTEM
==============================

An AI-powered, real-time collaboration platform for managing projects,
tasks, teams, and team chat. Built with the MERN stack, Next.js, and
Socket.IO.

Live Demo:  https://ai-powered-project-management-system.onrender.com
Repository: https://github.com/kush-devx/Project-Task-Management-System


OVERVIEW
--------
This application helps teams plan their work, track progress, and stay in
sync. Members can create projects, break them into tasks, assign owners,
chat in real time, and lean on built-in AI to summarise activity and
suggest next steps.


KEY FEATURES
------------
  - Authentication & Authorization
        JWT-based login and registration with secure cookies and
        bcrypt-hashed passwords.

  - Project Management
        Create projects, invite members, and manage roles.

  - Task Management
        Create, assign, update, and track tasks within each project.

  - Real-Time Chat
        Project-level messaging powered by Socket.IO.

  - Invitations
        Invite collaborators to projects via email or username.

  - AI Assistance
        Integrated with Google Gemini and OpenAI for smart task
        suggestions, summaries, and project insights.

  - User Management
        Profile management and a searchable team directory.

  - Modern UI
        Responsive interface built with Next.js 16, React 19, and
        Tailwind CSS v4.


TECH STACK
----------
Frontend
    Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4,
    Axios, Socket.IO Client, jwt-decode.

Backend
    Node.js, Express 5, MongoDB with Mongoose, Socket.IO, JWT, bcrypt,
    Google Generative AI (Gemini), OpenAI, cookie-parser, cors, dotenv.


PROJECT STRUCTURE
-----------------
    Project-Task-Management-System/
    |
    +-- backend/
    |   +-- controllers/        Route handlers (auth, projects, tasks)
    |   +-- middleware/         Auth and error-handling middleware
    |   +-- models/             Mongoose schemas
    |   |     User.js
    |   |     Project.js
    |   |     Task.js
    |   |     Message.js
    |   |     Invitation.js
    |   +-- routes/             Express routers
    |   |     authRoutes.js
    |   |     projectRoutes.js
    |   |     taskRoutes.js
    |   |     messageRoutes.js
    |   |     invitationRoutes.js
    |   |     userRoutes.js
    |   |     aiRoutes.js
    |   +-- server.js           App entry and Socket.IO setup
    |   +-- package.json
    |
    +-- frontend/
        +-- app/                Next.js App Router pages
        +-- components/         Reusable UI components
        +-- context/            React contexts (auth, socket, etc.)
        +-- services/           API service layer
        +-- public/             Static assets
        +-- package.json


GETTING STARTED
---------------
Prerequisites
    - Node.js version 18 or higher
    - npm or yarn
    - A MongoDB instance (local or MongoDB Atlas)
    - API keys for Google Gemini and/or OpenAI (optional, for AI
      features)

1. Clone the repository

       git clone https://github.com/kush-devx/Project-Task-Management-System.git

2. Backend setup

       cd backend
       npm install

   Create a `.env` file inside the `backend/` directory:

       PORT=3000
       MONGO_URI=your_mongodb_connection_string
       JWT_SECRET=your_jwt_secret
       FRONTEND_URL=http://localhost:3001
       GEMINI_API_KEY=your_google_gemini_api_key
       OPENAI_API_KEY=your_openai_api_key
       NODE_ENV=development

   Start the backend:

       npm run dev

   The API will be available at http://localhost:3000.

3. Frontend setup

       cd ../frontend
       npm install

   Create a `.env.local` file inside the `frontend/` directory:

       NEXT_PUBLIC_API_URL=http://localhost:3000
       NEXT_PUBLIC_SOCKET_URL=http://localhost:3000

   Start the frontend:

       npm run dev

   The app will be available at http://localhost:3001.


API ENDPOINTS
-------------
    Base Path           Description
    ----------------    -------------------------------------------
    /api/auth           Register, login, logout, profile
    /api/projects       Project CRUD operations
    /api/tasks          Task CRUD and assignment
    /api/messages       Project chat messages
    /api/invitations    Send and accept project invitations
    /api/users          User listing and profile management
    /api/ai             AI-powered suggestions and insights

Real-time events are handled through Socket.IO on the same server.


CONTRIBUTORS
------------
    - @kush-devx  (https://github.com/kush-devx)
    - Kush Chaudhary | LinkedIn  (https://www.linkedin.com/in/kush-chaudhary/)


ACKNOWLEDGEMENTS
----------------
    - Next.js               https://nextjs.org/
    - Express.js            https://expressjs.com/
    - MongoDB               https://www.mongodb.com/
    - Socket.IO             https://socket.io/
    - Google Generative AI  https://ai.google.dev/
    - OpenAI                https://openai.com/
    - Tailwind CSS          https://tailwindcss.com/
