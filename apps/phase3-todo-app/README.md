# Phase III — Todo AI Chatbot (MCP + Agents)

Added a natural language AI interface to the Phase II todo app. Users can now manage tasks by chatting instead of clicking buttons — powered by OpenAI Agents SDK and Model Context Protocol (MCP).

## What's New in Phase 3

Everything from Phase 2 (authentication, CRUD, user isolation) plus:

- **AI Chat Interface** — manage tasks through natural language conversation
- **OpenAI Agents SDK** — maps user intent to structured tool calls
- **MCP Tools** — 5 strict tool contracts the agent must use for all mutations
- **Conversation History** — persisted in PostgreSQL, reconstructed per request (stateless server)
- **DeepSeek API** — alternative AI provider support

## How the AI Chat Works

Users type natural language commands in the chat panel. The AI agent interprets the intent and calls the appropriate MCP tool:

```
User: "Add buy groceries for tomorrow"
Agent: → add_task(title="Buy groceries", due_date="2026-02-05")

User: "Show me what I need to do"
Agent: → list_tasks(status="pending")

User: "Mark task 3 as done"
Agent: → complete_task(task_id=3)

User: "Delete the groceries task"
Agent: → delete_task(task_id=7)
```

The agent cannot bypass MCP tools — all mutations go through the same validated endpoints as the web UI.

### Agent Guardrails

- No hallucinated task IDs — agent lists tasks before ambiguous mutations
- Explicit confirmations for all state changes
- Read-before-write pattern to prevent ID guessing
- Ambiguity resolution before mutation

## MCP Tool Contracts

| Tool | Parameters | Description |
|------|-----------|-------------|
| `add_task` | user_id, title, description | Create a new task |
| `list_tasks` | user_id, status? | List tasks (all/pending/completed) |
| `complete_task` | user_id, task_id | Mark a task as done |
| `delete_task` | user_id, task_id | Remove a task |
| `update_task` | user_id, task_id, title?, description? | Modify a task |

Each tool enforces strict validation, is idempotent, and scoped to the authenticated user.

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Sign in |
| `/register` | Create account |
| `/todos` | All tasks dashboard |
| `/chat` | **NEW** — AI chat interface |

## Tech Stack

### Inherited from Phase 2
- **Frontend:** Next.js 15+ (App Router), TypeScript 5+, React 18+, Better Auth
- **Backend:** FastAPI 0.104+, SQLModel 0.14+, PostgreSQL/SQLite, JWT auth
- **Server:** Uvicorn

### New in Phase 3
- **AI Agent:** OpenAI Agents SDK
- **Tool Protocol:** Model Context Protocol (MCP) SDK
- **AI Provider:** DeepSeek API (via OpenAI-compatible interface)
- **Conversation Storage:** Conversation + Message models in PostgreSQL

## Project Structure

```
phase3-todo-app/
├── backend/
│   ├── src/
│   │   ├── api/              # REST endpoints
│   │   │   ├── auth.py       # Authentication
│   │   │   ├── todos.py      # Todo CRUD
│   │   │   └── chat.py       # Chat endpoint (NEW)
│   │   ├── agent/            # AI agent logic (NEW)
│   │   ├── mcp/              # MCP tool definitions (NEW)
│   │   ├── auth/             # JWT utilities
│   │   ├── models/           # Database models
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── migrations/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── login/        # Login page
│   │   │   ├── register/     # Registration page
│   │   │   ├── todos/        # Todo dashboard
│   │   │   └── chat/         # AI chat page (NEW)
│   │   ├── components/
│   │   └── lib/
│   └── package.json
│
├── specs/
│   ├── 002-phase2-fullstack-todo/
│   └── 003-phase3-ai-chatbot/    # Phase 3 spec
│
├── docker-compose.yml
└── README.md
```

## Quick Start

### Prerequisites
- Python 3.11+, Node.js 18+, PostgreSQL (or Neon Serverless)

### Run with Docker Compose

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3002
- **Backend:** http://localhost:8000
- **Health:** http://localhost:8000/health

### Run Manually

**Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # Edit with your DATABASE_URL, BETTER_AUTH_SECRET, DEEPSEEK_API_KEY
uvicorn src.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local   # Edit with NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET
npm run dev
```

### Environment Variables

```env
# Required
DATABASE_URL=postgresql://user:password@host:port/database
BETTER_AUTH_SECRET=your-shared-secret

# Optional (enables AI chat)
DEEPSEEK_API_KEY=your-api-key
```

## Key Architectural Decisions

**Stateless chat server:** All conversation state is stored in PostgreSQL. The server holds zero state between requests — conversation history is reconstructed from the database on every chat message. This means any backend instance can handle any user's chat.

**MCP as the mutation boundary:** The AI agent cannot directly access the database. Every task operation must go through an MCP tool, which calls the same validated API endpoints that the web UI uses. This ensures consistent validation and security regardless of how the user interacts with the app.

## What Changed from Phase 2

| Aspect | Phase 2 | Phase 3 |
|--------|---------|---------|
| User Interface | Web forms only | Web forms + AI chat |
| Task Management | Click buttons | Click buttons OR type natural language |
| Backend Modules | api/, auth/, models/ | + agent/, mcp/, chat.py |
| Database Models | User, Todo | + Conversation, Message |
| External APIs | None | DeepSeek/OpenAI API |

## Documentation

- **Phase 3 Spec:** `specs/003-phase3-ai-chatbot/spec.md`
- **Phase 3 Plan:** `specs/003-phase3-ai-chatbot/plan.md`
- **Phase 2 Spec:** `specs/002-phase2-fullstack-todo/spec.md`
