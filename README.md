# AlgoMentor

Learn DSA with hints, one level at a time.

## Run it (two terminals)

Backend:
    cd backend
    npm install
    npm run dev          # http://localhost:5000  (check http://localhost:5000/api/health)

Frontend:
    cd frontend
    npm install
    npm run dev          # http://localhost:5173

## Keys (backend/.env)
- MONGO_URI    local MongoDB works by default; or paste your Atlas string
- JWT_SECRET   already generated
- GROQ_API_KEY paste your key (needed for hints / complexity)
- OPENAI_API_KEY / ANTHROPIC_API_KEY (optional) add more models to the dropdown
  If a model fails (retired, rate limited) the next available model is used automatically.
  Add new models without code changes: EXTRA_MODELS=openai:gpt-4.1-mini
- GOOGLE_CLIENT_ID (optional) also set VITE_GOOGLE_CLIENT_ID in frontend/.env

Restart the backend after editing .env.

## Workspace
The three action buttons (next hint, analyze complexity, mark as solved) sit at the top of the
Mentor panel on the right. "Reset code & hints" clears your code and re-locks all four hint
levels so you can start the problem again.

## Dashboard numbers
- Current streak: days in a row with at least one problem marked as solved.
- Independence score: share of solved problems where you needed hint 2 or less.

## Profile
Preferred programming language and target difficulty are the defaults for every new problem.
