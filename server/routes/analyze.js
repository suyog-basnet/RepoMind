import express from "express";
import { cloneRepo, cleanupRepo } from "../lib/cloneRepo.js";
import { detectProjectType } from "../lib/detectProjectType.js";
import { runAnalyzer } from "../analyzers/index.js";
import { AppDataSource } from "../data-source.js";
import { AnalysisCache } from "../entities/AnalysisCache.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const repoUrl = req.body?.repoUrl;
  if (!repoUrl) return res.status(400).json({ error: "repoUrl is required" });

  let dir;
  try {
    dir = await cloneRepo(repoUrl);
    const projectType = detectProjectType(dir);
    const result = runAnalyzer(projectType, dir);
    const fullResult = { repoUrl, projectType, ...result };

    // cache the deterministic analysis so /api/ask can reference it later
    const cacheRepo = AppDataSource.getRepository(AnalysisCache);
    const existing = await cacheRepo.findOneBy({ repoUrl });
    if (existing) {
      existing.resultJson = JSON.stringify(fullResult);
      await cacheRepo.save(existing);
    } else {
      await cacheRepo.save(cacheRepo.create({ repoUrl, resultJson: JSON.stringify(fullResult) }));
    }

    res.json(fullResult);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (dir) cleanupRepo(dir);
  }
});

export default router;