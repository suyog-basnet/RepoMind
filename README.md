<div align="center">

<h1 align="center">RepoMind</h1>
<p align="center"><em>AI-powered README generator and codebase intelligence platform for GitHub repositories.</em></p>

![Last Commit](https://img.shields.io/github/last-commit/suyog-basnet/RepoMind?style=for-the-badge&color=a6e3a1) ![Issues](https://img.shields.io/github/issues/suyog-basnet/RepoMind?style=for-the-badge&color=f38ba8) ![Stars](https://img.shields.io/github/stars/suyog-basnet/RepoMind?label=Stars&style=for-the-badge) ![Forks](https://img.shields.io/github/forks/suyog-basnet/RepoMind?style=for-the-badge) ![License](https://img.shields.io/badge/license-MIT-89b4fa?style=for-the-badge)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## About

RepoMind is a three-part tool for working with GitHub repositories:

1. **README Builder** — generates polished, well-structured README files from your project's structure, with AI assistance for descriptions and features.
2. **Repo Analysis** — clones any public repository and runs real static analysis: dependency graphs, code quality scoring, API endpoint extraction, database schema visualization, and security scanning — all backed by AST parsing (via `ts-morph`), not just pattern matching on file names.
3. **Ask This Repository** — a RAG-based Q&A assistant that answers open-ended questions about the codebase, citing real files and line numbers. It cross-references its answers against the deterministic analysis results (dead code, duplicates, complexity, vulnerabilities) rather than guessing from retrieved snippets alone.

All three live in the same app, switchable via tabs.

---

## Features

### README Builder
- Import from a GitHub repo or a local zip file
- AI-assisted description, feature, and README generation
- Tech stack badge picker, quick-start templates for common stacks
- Live Markdown preview with GitHub-accurate rendering
- Export as `.md` or standalone `.html`
- Transparent, rule-based README completeness score

### Repo Analysis
- **Architecture diagrams** — auto-generated dependency graphs (file-level and folder-level), rendered as interactive Mermaid diagrams. Folder nodes are clickable and show scoped stats.
- **Code Quality Score** — combines dead-code detection, duplicate-function detection, cyclomatic complexity, and large-file hotspots into one score.
- **API endpoint map** — extracts real routes from NestJS (`@Controller`/`@Get`/etc.) and Express (`app.get()`/`router.post()`/etc.) codebases.
- **Database schema visualization** — extracts entities from TypeORM decorators or Prisma's `schema.prisma`, rendered as a Mermaid ER diagram with relationships.
- **Security warnings** — flags likely hardcoded secrets (API keys, tokens) with conservative false-positive guards, and surfaces high/critical severity dependency vulnerabilities via `npm audit`.

### Ask This Repository
- Chunks the codebase at function/class granularity and embeds each chunk (via OpenRouter)
- Retrieves the most relevant chunks for a question using cosine similarity
- Generates a cited answer (file paths + line numbers) using an LLM via OpenRouter
- For questions about dead code, duplicates, complexity, or security, injects the exact results from the deterministic analyzers into the prompt — so answers stay consistent with the Code Quality Score shown elsewhere in the app, instead of the model guessing from a handful of retrieved snippets

---

## How It Works

1. The backend shallow-clones the target repository into a temp directory.
2. `ts-morph` loads the project and builds a full AST.
3. A dependency graph is built from static imports across the codebase.
4. That graph feeds dead-code detection, complexity analysis, duplicate detection, and the architecture diagrams. Results are cached in Postgres, keyed by repo URL.
5. Separate extractors scan for framework-specific patterns: NestJS/Express decorators for API routes, TypeORM/Prisma for database schema.
6. A lightweight secret scanner and `npm audit` wrapper cover basic security checks.
7. For "Ask This Repository," an explicit indexing step chunks and embeds the codebase into Postgres. Questions are answered via retrieval-augmented generation, cross-checked against the cached deterministic results from step 4 when relevant.
8. Everything from the static analysis step is returned as one JSON payload and rendered in the Repo Analysis tab.

Currently supports JavaScript and TypeScript projects. Python support (FastAPI/Flask/Django, SQLAlchemy/Django ORM) is planned — see [Roadmap](#roadmap).

---

## Tech Stack

**Frontend:** React, Vite, Mermaid.js
**Backend:** Node.js, Express, ts-morph, simple-git, TypeORM
**Database:** PostgreSQL
**AI:** OpenRouter (embeddings + LLM chat completions)
**Testing:** Vitest

---

## Installation

Clone the repo and install both the frontend and backend dependencies:

```bash
git clone https://github.com/suyog-basnet/RepoMind.git
cd RepoMind

# Frontend
npm install

# Backend
cd server
npm install
cp .env.example .env
```

Fill in `.env` with:
```
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/repomind
OPENROUTER_API_KEY=your_key_here
```

You'll need a local PostgreSQL instance with a `repomind` database created.

---

## Usage

Run the backend and frontend in separate terminals:

```bash
# Terminal 1 — backend (from /server)
npm run dev

# Terminal 2 — frontend (from repo root)
npm run dev
```

Open the app, use **README Builder** to generate documentation, or switch to **Repo Analysis** and enter any public GitHub username/repo to run a full analysis. From there, click **Index Repository** to enable the **Ask This Repository** Q&A feature.

Run backend tests:

```bash
cd server
npm run test
```

---

## Folder Structure

```
.
├── src/                       # Frontend (React + Vite)
│   ├── components/            # UI components (FormPanel, RepoAnalysisView, MermaidBlock, etc.)
│   ├── data/                  # Static badge/theme/template data
│   ├── lib/                   # Frontend logic (analyzeClient, askClient, codeQualityScore, folderScope)
│   ├── styles/
│   └── utils/
│
├── server/                    # Backend (Node + Express)
│   ├── analyzers/             # Per-project-type analysis entry points
│   ├── entities/              # TypeORM entities (RepoChunk, AnalysisCache)
│   ├── lib/                   # Core analysis modules (graph, complexity, dead code,
│   │                            duplicates, API endpoints, schema extraction, security,
│   │                            chunking, embeddings)
│   ├── routes/                # /api/analyze, /api/index, /api/ask
│   ├── data-source.js         # TypeORM Postgres connection
│   └── tests/                 # Vitest unit tests
│
└── docs/
```

---

## Known Limitations

- JS/TS only — no Python analysis yet
- Project type detection and dependency auditing look for `package.json` at the repo root or in a few common subdirectory names (`frontend/`, `backend/`, `server/`, `api/`) — repos with different monorepo layouts may not be detected correctly
- Express router mount prefixes aren't resolved across files (a route's full path may be incomplete if defined via `app.use(prefix, router)` in a separate file)
- Duplicate detection compares whole function bodies only, not partial code blocks
- Dependency audit adds a few seconds of latency (runs `npm install` + `npm audit` against the cloned repo)
- Indexing for "Ask This Repository" is a separate, explicit step — not automatic — since embedding a full repo can take 30-60+ seconds
- Embeddings are stored as JSON arrays with similarity computed in application code, not via a native Postgres vector extension (pgvector wasn't available on the local Postgres setup used during development)

---

## Roadmap

- [ ] Python support (FastAPI/Flask/Django route extraction, SQLAlchemy/Django ORM schema extraction)
- [ ] Broader monorepo layout detection (workspaces, `packages/`, custom folder names)
- [ ] Cache analysis results by commit SHA instead of just repo URL
- [ ] CLI tool for headless analysis
- [ ] GitHub Actions integration for automated repo health checks
- [ ] Automatic indexing trigger alongside analysis (with clear time expectations shown to the user)

---

## Contributing

Contributions are welcome! Please open an issue first to discuss major changes before submitting a pull request.

---

## License

This project is licensed under the MIT License. See [LICENSE](https://choosealicense.com/licenses/mit/) for details.