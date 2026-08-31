import express from "express";
import { cloneRepo, cleanupRepo } from "../lib/cloneRepo.js";
import { detectProjectType } from "../lib/detectProjectType.js";
import { runAnalyzer } from "../analyzers/index.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const repoUrl = req.body?.repoUrl;
  if (!repoUrl) return res.status(400).json({ error: "repoUrl is required" });

  let dir;
  try {
    dir = await cloneRepo(repoUrl);
    const projectType = detectProjectType(dir);
    const result = runAnalyzer(projectType, dir);

    res.json({ repoUrl, projectType, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (dir) cleanupRepo(dir);
  }
});

export default router;