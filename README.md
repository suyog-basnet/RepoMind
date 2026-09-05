<div align="center">

<h1 align="center">RepoMind</h1>
<p align="center"><em>AI-powered README generator and codebase intelligence platform for GitHub repositories.</em></p>

![Last Commit](https://img.shields.io/github/last-commit/suyog-basnet/RepoMind?style=for-the-badge&color=a6e3a1) ![Issues](https://img.shields.io/github/issues/suyog-basnet/RepoMind?style=for-the-badge&color=f38ba8) ![Stars](https://img.shields.io/github/stars/suyog-basnet/RepoMind?label=Stars&style=for-the-badge) ![Forks](https://img.shields.io/github/forks/suyog-basnet/RepoMind?style=for-the-badge) ![License](https://img.shields.io/badge/license-MIT-89b4fa?style=for-the-badge)

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)

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

RepoMind is a two-part tool for working with GitHub repositories:

1. **README Builder** — generates polished, well-structured README files from your project's structure, with AI assistance for descriptions and features.
2. **Repo Analysis** — clones any public repository and runs real static analysis: dependency graphs, code quality scoring, API endpoint extraction, database schema visualization, and security scanning — all backed by AST parsing (via `ts-morph`), not just pattern matching on file names.

Both live in the same app, switchable via tabs.

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

---

## How It Works

1. The backend shallow-clones the target repository into a temp directory.
2. `ts-morph` loads the project and builds a full AST.
3. A dependency graph is built from static imports across the codebase.
4. That graph feeds dead-code detection, complexity analysis, duplicate detection, and the architecture diagrams.
5. Separate extractors scan for framework-specific patterns: NestJS/Express decorators for API routes, TypeORM/Prisma for database schema.
6. A lightweight secret scanner and `npm audit` wrapper cover basic security checks.
7. Everything is returned as one JSON payload and rendered in the Repo Analysis tab.

Currently supports JavaScript and TypeScript projects. Python support (FastAPI/Flask/Django, SQLAlchemy/Django ORM) is planned — see [Roadmap](#roadmap).

---

## Tech Stack

**Frontend:** React, Vite, Mermaid.js
**Backend:** Node.js, Express, ts-morph, simple-git
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

---

## Usage

Run the backend and frontend in separate terminals:

```bash
# Terminal 1 — backend (from /server)
npm run dev

# Terminal 2 — frontend (from repo root)
npm run dev
```

Open the app, use **README Builder** to generate documentation, or switch to **Repo Analysis** and enter any public GitHub username/repo to run a full analysis.

Run backend tests:

```bash
cd server
npm run test
```

---

## Folder Structure

```
├── src/ # Frontend (React + Vite)
│ ├── components/ # UI components (FormPanel, RepoAnalysisView, MermaidBlock, etc.)
│ ├── data/ # Static badge/theme/template data
│ ├── lib/ # Frontend logic (analyzeClient, codeQualityScore, folderScope)
│ ├── styles/
│ └── utils/
│
├── server/ # Backend (Node + Express)
│ ├── analyzers/ # Per-project-type analysis entry points
│ ├── lib/ # Core analysis modules (graph, complexity, dead code,
│ │ duplicates, API endpoints, schema extraction, security)
│ ├── routes/
│ └── tests/
```

---

## Roadmap

- [ ] Add support for additional programming languages (Java, Go, Rust)
- [ ] Implement real-time collaboration features for team code reviews
- [ ] Develop VS Code extension for inline analysis and visualization
- [ ] Add automated refactoring suggestions based on detected code issues
- [ ] Implement historical trend analysis with time-series visualization of code quality metrics

---

## Contributing

We welcome pull requests for bug fixes, new analyzers, or feature enhancements. Please open an issue first to discuss significant changes or new functionality to ensure alignment with the project direction.

---

## License

This project is licensed under the MIT License. See [LICENSE](https://choosealicense.com/licenses/mit/) for details.
