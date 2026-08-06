<div align="center">

<h1 align="center">ReadMeAI</h1>
<p align="center"><em>AI-powered README generator for developers.</em></p>

![Last Commit](https://img.shields.io/github/last-commit/suyog-basnet/ReadMeAI?style=for-the-badge&color=a6e3a1) ![Issues](https://img.shields.io/github/issues/suyog-basnet/ReadMeAI?style=for-the-badge&color=f38ba8) ![Stars](https://img.shields.io/github/stars/suyog-basnet/ReadMeAI?style=for-the-badge&color=f9e2af) ![Forks](https://img.shields.io/github/forks/suyog-basnet/ReadMeAI?style=for-the-badge&color=89b4fa) ![License](https://img.shields.io/badge/license-MIT-89b4fa?style=for-the-badge)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Folder Structure](#folder-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## About

ReadMeAI uses AI to create professional README files based on your project's tech stack and structure. It includes live previews, quality scoring, and customizable templates. Built with React and Vite for a fast, modern interface.

---

## Features

- AI-driven README generation with tech stack context from src/data/ files
- Live preview pane showing generated markdown updates in real-time
- Quality scoring system evaluating README completeness from src/lib/qualityScore.js
- GitHub repository import functionality via src/lib/githubImport.js
- Customizable themes and templates managed in src/data/themes.js and templates.js
- Mermaid diagram support through src/components/MermaidBlock.jsx
- Modular component architecture with dedicated panels for AI, forms, and previews

---

## Tech Stack

- React
- Vite
- Node.js

---

## Installation

```bash
git clone https://github.com/suyog-basnet/ReadMeAI.git
cd readme-ai-studio
npm install
npm run dev
```

---

## Usage

```bash
npm run dev
```

---

## Folder Structure

```
.gitignore/
LICENSE/
README.md/
index.html/
package-lock.json/
package.json/
public/
  └── favicon.svg/
  └── icons.svg/
src/
  └── App.jsx/
  └── components/
    └── AiPanel.jsx/
    └── FormPanel.jsx/
    └── Home.jsx/
    └── MermaidBlock.jsx/
    └── PreviewPane.jsx/
    └── QualityScore.jsx/
    └── TopBar.jsx/
  └── data/
    └── badgeOptions.js/
    └── techStackMap.js/
    └── templates.js/
    └── themes.js/
  └── lib/
    └── aiClient.js/
    └── githubImport.js/
    └── qualityScore.js/
    └── zipImport.js/
  └── main.jsx/
  └── styles/
    └── app.css/
  └── utils/
    └── generateMarkdown.js/
vite.config.js/
```

---

## Roadmap

- [ ] Add support for additional documentation formats like CHANGELOG.md
- [ ] Implement user authentication to save and manage generated READMEs
- [ ] Expand AI model options beyond the current src/lib/aiClient.js configuration
- [ ] Integrate real-time collaboration features for team projects
- [ ] Add export options for direct publishing to GitHub repositories

---

## Contributing

We welcome pull requests for bug fixes, feature additions, and improvements. For major changes, please open an issue first to discuss your ideas. Follow the existing code structure in src/components/, src/lib/, and src/data/.

---

## License

This project is licensed under the MIT License. See [LICENSE](https://choosealicense.com/licenses/mit/) for details.
