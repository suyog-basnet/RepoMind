<div align="center">

<h1 align="center">RepoMind</h1>
<p align="center"><em>Generate polished README files directly from your React and Vite project structure.</em></p>

![Last Commit](https://img.shields.io/github/last-commit/suyog-basnet/RepoMind?style=for-the-badge&color=a6e3a1) ![Issues](https://img.shields.io/github/issues/suyog-basnet/RepoMind?style=for-the-badge&color=f38ba8) ![Stars](https://img.shields.io/github/stars/suyog-basnet/RepoMind?style=for-the-badge&color=f9e2af) ![Forks](https://img.shields.io/github/forks/suyog-basnet/RepoMind?style=for-the-badge&color=89b4fa) ![License](https://img.shields.io/badge/license-MIT-89b4fa?style=for-the-badge)

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

RepoMind analyzes your React project's folder structure and source files to automatically create well-structured README documentation. It leverages context from your components, utils, and styles directories to produce accurate and helpful project overviews. Built with React and Vite for a fast, modern development experience.

---

## Features

- Analyzes React project structure from src/ directory and subfolders
- Extracts context from component, utility, and style modules
- Generates README sections based on Vite configuration and package.json
- Provides a clean UI built with React for editing generated content
- Outputs formatted Markdown files ready for GitHub

---

## Tech Stack

- React
- Vite
- Node.js

---

## Installation

```bash
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


## Roadmap

- [ ] Add support for TypeScript project analysis
- [ ] Implement CLI tool for headless README generation
- [ ] Integrate with GitHub Actions for automated updates
- [ ] Add template customization options

---

## Contributing

Contributions are welcome! Please open an issue first to discuss major changes before submitting a pull request. Ensure your changes align with the project's React and Vite tech stack.

---

## License

This project is licensed under the MIT License. See [LICENSE](https://choosealicense.com/licenses/mit/) for details.
