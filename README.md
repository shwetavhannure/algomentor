# AlgoMentor: Interactive AI-Powered DSA Practice Platform

An interactive, AI-assisted Data Structures and Algorithms (DSA) practice platform designed to help developers strengthen their problem-solving skills through progressive hints, personalized guidance, and performance analytics—without immediately relying on complete solutions.

---

## Key Features

- **Progressive 4-Tier Hint System:** Guides users through a structured learning path: Nudge → Approach → Pseudocode → Full Solution, encouraging independent problem-solving before revealing the complete answer.
- **Dynamic Multi-Model AI Engine:** Powered by the Groq API for fast hint generation, code complexity analysis, and configurable fallback models for improved reliability.
- **Interactive Workspace & Code Editor:** Provides an integrated coding workspace with dedicated actions for requesting hints, analyzing time and space complexity, and marking problems as solved.
- **Progress Tracking & Analytics:** Tracks daily solving streaks, completed problems, and an **Independence Score** that measures how often users solve problems using Hint 2 or an earlier hint level.
- **Personalized Learning Experience:** Allows users to configure their preferred programming language and target difficulty for a more customized practice experience.

---

## System Architecture & Data Flow

```text
[ Browser / Frontend ]
          │
          │ HTTP Requests
          ▼
[ Express.js Backend ]
          │
          ├──────> [ Authentication & Authorization ]
          │                    │
          │                    ▼
          │              [ JWT / Google OAuth ]
          │
          ├──────> [ AI Hint Engine ]
          │                    │
          │                    ▼
          │              [ Groq API / Optional Models ]
          │                    │
          │                    ▼
          │              [ Generated Guidance ]
          │
          └──────> [ MongoDB Database ]
                              │
                    (Store User Progress)
                              │
                              ▼
                    [ Dashboard Analytics ]
```

1. **Authentication:** Users sign in using email/password authentication or Google OAuth 2.0. The backend validates credentials and manages authenticated requests.
2. **Problem Selection:** Users select a DSA problem based on their preferred difficulty and programming language.
3. **Code Workspace:** Users write and modify their solutions in the integrated coding workspace.
4. **AI Assistance:** When users request a hint, the frontend sends the problem statement, relevant code context, and requested hint level to the backend.
5. **Model Inference:** The backend communicates with the Groq API or configured fallback models to generate contextual guidance, pseudocode, or a complete solution according to the requested hint tier.
6. **Complexity Analysis:** Users can request AI-assisted analysis of the expected time and space complexity of their approach.
7. **Progress Tracking:** When a problem is marked as solved, the backend updates the user's progress, streak information, and independence metrics in MongoDB.
8. **Dashboard Synchronization:** The dashboard retrieves persisted user statistics and displays updated learning progress.

---

## Tech Stack

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| Frontend | React, Vite, Tailwind CSS | Responsive interface, interactive workspace, and dashboard |
| Backend | Node.js, Express.js | REST API, business logic, authentication, and AI integration |
| Database | MongoDB | User profiles, problem data, solving history, and analytics |
| AI Inference | Groq API, optional OpenAI/Anthropic models | Progressive hint generation and complexity analysis |
| Authentication | JWT, Google OAuth 2.0 | User identity verification and protected API access |
| API Communication | REST APIs, Fetch/Axios | Communication between frontend and backend |
| Configuration | Environment variables, `.env` | Secure management of API keys and application settings |
| Version Control | Git, GitHub | Source code management and collaboration |

---

## Project Structure

```text
algomentor/
├── backend/
│   ├── config/
│   │   └── db.js                  # Database connection and configuration
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── problemController.js   # Problem retrieval and management
│   │   ├── hintController.js      # AI hints and complexity analysis
│   │   └── progressController.js  # Solved status and analytics
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification and route protection
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Problem.js             # Problem schema
│   │   └── Progress.js            # User progress schema
│   ├── routes/
│   │   ├── authRoutes.js           # Authentication endpoints
│   │   ├── problemRoutes.js        # Problem endpoints
│   │   ├── hintRoutes.js           # AI assistance endpoints
│   │   └── progressRoutes.js       # Progress endpoints
│   ├── services/
│   │   └── aiService.js            # AI model integration and fallbacks
│   ├── server.js                   # Express server entry point
│   ├── .env                        # Backend environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GoogleButton.jsx    # Google sign-in component
│   │   │   ├── MentorPanel.jsx     # AI mentor and hint interface
│   │   │   ├── CodeEditor.jsx      # Coding workspace
│   │   │   └── ProgressCard.jsx    # Dashboard metric cards
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication state
│   │   ├── pages/
│   │   │   ├── Auth.jsx            # Login and registration
│   │   │   ├── Dashboard.jsx       # User progress dashboard
│   │   │   ├── Workspace.jsx       # Problem-solving workspace
│   │   │   └── Profile.jsx         # User preferences
│   │   ├── utils/
│   │   │   └── api.js              # Backend API communication
│   │   ├── App.jsx                 # Main React application
│   │   └── main.jsx                # Frontend entry point
│   ├── .env                        # Frontend environment variables
│   └── package.json
│
├── .gitignore
└── README.md
```

*Note: The structure above is a reference layout. Adjust file and folder names to match your actual implementation.*

---

## Local Setup Instructions

### 1. Prerequisites

- **Node.js:** Version 18.0.0 or higher.
- **npm:** Included with Node.js.
- **MongoDB:** A local MongoDB instance or MongoDB Atlas connection string.
- **Groq API Key:** Required for AI hint generation.
- **Google Cloud Project:** Required if Google OAuth 2.0 authentication is enabled.

### 2. Installation & Running

The backend and frontend run independently. Use two terminals.

#### Backend Setup

```bash
# Clone the repository
git clone <YOUR_GITHUB_REPOSITORY_URL>

# Navigate to the project directory
cd algomentor

# Navigate to backend
cd backend

# Install dependencies
npm install

# Start the backend development server
npm run dev
```

The backend is expected to run at `http://localhost:5000` if configured to use port 5000.

If your project exposes a health endpoint, verify it at:

`http://localhost:5000/api/health`

#### Frontend Setup

Open a second terminal:

```bash
# Navigate to the frontend directory
cd algomentor/frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend is expected to run at `http://localhost:5173` with the default Vite configuration.

*Note: The repository URL, available npm scripts, port numbers, and health endpoint must match your actual project configuration.*

### 3. Environment Variables Configuration

Create a `.env` file inside the `backend/` directory:

```ini
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017/algomentor

JWT_SECRET=your_strong_jwt_secret_here

GROQ_API_KEY=your_groq_api_key_here

OPENAI_API_KEY=your_openai_api_key_optional
ANTHROPIC_API_KEY=your_anthropic_api_key_optional

EXTRA_MODELS=openai:gpt-4.1-mini

GOOGLE_CLIENT_ID=your_google_client_id_here
```

Create a `.env` file inside the `frontend/` directory:

```ini
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_API_BASE_URL=http://localhost:5000/api
```

**Important configuration notes:**

- Use only the AI provider keys required by your implementation.
- Configure fallback models according to the model identifiers and provider logic supported by your backend.
- The Google client ID used by the frontend and backend must belong to the appropriate configured Google Cloud OAuth client.
- Add `.env` files to `.gitignore`. Never commit API keys, JWT secrets, or other credentials to GitHub.
- Restart the backend and frontend after modifying environment variables.
- Configure Google OAuth authorized origins and redirect URIs according to your authentication flow.

---

## Workspace & Dashboard Highlights

### 1. Progressive Hint System

The AI mentor provides four levels of assistance:

| Hint Level | Guidance | Learning Objective |
| :--- | :--- | :--- |
| Hint 1 — Nudge | A small clue or observation | Encourage independent thinking |
| Hint 2 — Approach | A strategy or algorithmic direction | Help users identify the right approach |
| Hint 3 — Pseudocode | A step-by-step algorithm outline | Translate the approach into implementation |
| Hint 4 — Full Solution | A complete solution with explanation, when supported | Understand the final implementation |

The progressive structure encourages users to attempt each problem independently before requesting more detailed assistance.

### 2. Workspace Action Buttons

The primary workspace actions are:

- **Next Hint:** Requests the next available level of AI guidance.
- **Analyze Complexity:** Requests an explanation of the expected time and space complexity.
- **Mark as Solved:** Records the problem as solved and updates progress metrics.
- **Reset Code & Hints:** Clears the current code and resets the hint progression so the user can attempt the problem again.

### 3. Dashboard Metrics

- **Current Streak:** Tracks consecutive calendar days with at least one problem marked as solved, according to the application's streak rules.
- **Problems Solved:** Displays the number of problems recorded as completed by the user.
- **Independence Score:** Measures the proportion of solved problems completed using Hint 2 or a lower hint level.

For example, if a user solves 8 problems and 6 of those were completed using Hint 2 or lower, the Independence Score is 75%.

*The exact metric depends on how the backend records hint usage and solved attempts.*



---



Add a `LICENSE` file to specify how others may use, modify, and distribute the project. If no license has been selected, the project remains subject to the default applicable copyright rules.
