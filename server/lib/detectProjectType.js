import fs from "fs";
import path from "path";

export function detectProjectType(rootDir) {
  const has = (f) => fs.existsSync(path.join(rootDir, f));

  if (has("package.json")) {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, "package.json"), "utf8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (deps.next) return "nextjs";
    if (deps.react) return "react";
    if (deps.express) return "express-node";
    if (deps.vue) return "vue";
    return "node";
  }

  if (has("requirements.txt") || has("pyproject.toml")) {
    const file = has("requirements.txt") ? "requirements.txt" : "pyproject.toml";
    const text = fs.readFileSync(path.join(rootDir, file), "utf8");

    if (/fastapi/i.test(text)) return "fastapi";
    if (/flask/i.test(text)) return "flask";
    if (/django/i.test(text)) return "django";
    return "python";
  }

  return "unknown";
}