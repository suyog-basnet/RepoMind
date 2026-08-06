# README AI Studio

> Generate a polished GitHub README from a repo, a zip, or a blank form — with AI assist and a live preview.

Instead of filling in 20 form fields by hand, point this at an existing GitHub repository (or drop in a project zip) and it reads `package.json`, the license, and the folder structure to prefill your tech stack, install steps, and badges automatically. AI is used only where it actually adds value — writing the prose description and suggesting a feature list — everything else is deterministic.

## Features

- **Import from GitHub** — paste a repo URL; fetches metadata, `package.json`, and folder structure directly from the GitHub REST API (client-side, no backend)
- **Import from a zip** — same analysis, done entirely in the browser with JSZip; nothing is uploaded anywhere
- **Auto-detected tech stack badges** — dependency names are mapped to shields.io badges automatically
- **Auto-generated install/usage commands** — derived from `package.json` scripts
- **Live GitHub-style preview** — split screen, renders exactly like GitHub would, including Mermaid architecture diagrams
- **6 themes** — Minimal, Modern, Corporate, Developer, Animated, Open Source — change structure and tone, not your content
- **9 stack templates** — React, React+Node, NestJS, Python, Go, Rust, Flutter, React Native, Next.js
- **Deterministic quality score** — a transparent 0–100 rubric (not an AI guess) that tells you exactly what's missing
- **Optional AI assist** — bring your own Anthropic API key to get a rewritten description or a suggested feature list
- **Export** — download as `README.md` or standalone `.html`

## Installation

```bash
git clone <your-repo-url>
cd readme-ai-studio
npm install
npm run dev
```

## Usage

1. On the home screen, choose **Import GitHub Repository**, **Upload Project**, or **Start from Scratch**.
2. For GitHub import, paste a public repo URL — analysis takes a couple seconds.
3. Fill in or adjust anything in the form on the left; the preview on the right updates live.
4. Optionally add your own Anthropic API key under **AI Assist** to get a rewritten description or feature suggestions.
5. Check the **Quality Score** panel to see what's still missing.
6. Copy or download the result.

## Tech Stack

React + Vite, `react-markdown` + `remark-gfm` + `rehype-raw` for the live preview, `mermaid` (lazy-loaded) for architecture diagrams, `jszip` for client-side zip parsing.

## Notes on the AI feature

AI calls go directly from your browser to Anthropic's API using a key you provide yourself — this app never ships with, stores, or proxies an API key. That also means the key is visible in your own browser's network requests, which is fine for personal, local use but is **not** a safe pattern if you deploy this app for other people to use with a shared key.

## GitHub API rate limits

Unauthenticated GitHub API requests are limited to 60/hour per IP. That's normally plenty for occasional use; if you hit it, wait a bit or try a different network.

## Deployment

```bash
npm run build
```

Outputs a static `dist/` folder — deploy to Vercel, Netlify, GitHub Pages, or any static host.

## License

MIT — see [LICENSE](LICENSE).
