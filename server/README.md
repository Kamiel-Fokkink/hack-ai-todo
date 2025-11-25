# Simply Server

FastAPI backend for document simplification and task management.

## Files

**main.py** - Core FastAPI server with 5 endpoints:
- `POST /upload` - Upload .txt document, extract structure via Orq AI, save to `data/output/`
- `POST /simplify` - Simplify latest document by language/level, classify tasks, return structured JSON
- `POST /task` - Submit completed task (name, task text, metadata)
- `GET /tasks` - List all submitted tasks
- `POST /tasks/reset` - Clear task store

**extraction.py** - Document extraction service using Orq deployment `instructions_extraction`. Converts raw text to structured JSON.

**simplify.py** - Simplification service using Orq deployment `instructions_user_simplify`. Supports 3 levels (Basic/Intermediate/Fluent) with embedded grammar/vocabulary guidelines for each level.

**taskify.py** - Task classification service using Orq deployment `instructions_classify`. Returns `{section: true/false}` indicating which sections contain actionable tasks.

## Flow

1. Upload document → Extract structure → Save JSON
2. Mobile app requests simplification → Simplify + Classify tasks → Return with task flags
3. User completes tasks → Submit to `/task` endpoint → Track completion

## Prompts

The `prompt/` directory contains system prompts and guidelines used by Orq AI deployments:

**prompt/base/** - System prompts for AI deployments:
- `extraction.txt` - Instructions for `instructions_extraction` deployment. Extracts structured JSON from raw work instruction documents.
- `tasks.txt` - Instructions for `instructions_classify` deployment. Classifies sections as containing completable tasks (true/false).
- `simplify.txt` - Base instructions for `instructions_user_simplify` deployment.

**prompt/user/** - Language proficiency level guidelines:
- `basic.txt` - Grammar rules, vocabulary limits, and examples for Basic level (simple sentences, top 1000-2000 words).
- `intermediate.txt` - Guidelines for Intermediate level.
- `fluent.txt` - Guidelines for Fluent level.

These prompts are used to configure the Orq AI deployments. The level guidelines are also embedded in `simplify.py` for runtime access.

## Deployment

**Current Setup:** Azure VM (any cloud VM or server works)

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variable:
```bash
export ORQ_API_KEY="your-api-key-here"
```
And make sure you have AI endpoints deployed on Orq. Or on a different AI provider.

3. Ensure directory structure:
```
server/
├── main.py
├── extraction.py
├── simplify.py
├── taskify.py
├── static/
└── data/
    └── output/      # Created automatically
```

### Running

**Development:**
```bash
python -m server.main
# Server runs on http://0.0.0.0:8000
```

**Production:**
```bash
uvicorn server.main:app --host 0.0.0.0 --port 8000
```

### Endpoint Configuration

Update the mobile app's API endpoint in the following files to point to your deployment:

- `frontend/services/HelpService.js` (line 3)
- `frontend/services/TaskService.js` (line 1)

```javascript
const API_BASE_URL = 'http://your-server-ip:port';
```

**Current deployment Azure VM:** `http://20.224.45.128:80`