import { Project } from "ts-morph";
import fs from "fs";
import path from "path";

export function loadProject(rootDir) {
  const tsConfigPath = path.join(rootDir, "tsconfig.json");
  const hasTsConfig = fs.existsSync(tsConfigPath);

  const project = new Project({
    tsConfigFilePath: hasTsConfig ? tsConfigPath : undefined,
    skipAddingFilesFromTsConfig: !hasTsConfig,
    compilerOptions: { allowJs: true },
  });

  if (!project.getSourceFiles().length) {
    project.addSourceFilesAtPaths([
      `${rootDir}/**/*.{js,jsx,ts,tsx}`,
      `!${rootDir}/**/node_modules/**`,
      `!${rootDir}/**/dist/**`,
      `!${rootDir}/**/build/**`,
    ]);
  }

  return project;
}