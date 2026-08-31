import simpleGit from "simple-git";

export async function getFileChurn(rootDir, filePath) {
  try {
    const git = simpleGit(rootDir);
    const log = await git.log({ file: filePath });
    return log.total;
  } catch {
    return 0;
  }
}