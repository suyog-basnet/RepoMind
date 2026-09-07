import express from "express";
import { cloneRepo, cleanupRepo } from "../lib/cloneRepo.js";
import { loadProject } from "../lib/parseProject.js";
import { chunkProject } from "../lib/chunker.js";
import { getEmbedding } from "../lib/embeddings.js";
import { AppDataSource } from "../data-source.js";
import { RepoChunk } from "../entities/RepoChunk.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const repoUrl = req.body?.repoUrl;
  const limit = req.body?.limit;
  if (!repoUrl) return res.status(400).json({ error: "repoUrl is required" });

  let dir;
  try {
    dir = await cloneRepo(repoUrl);
    const project = loadProject(dir);
    let chunks = chunkProject(project, dir);
    const totalChunksFound = chunks.length;
    if (limit) chunks = chunks.slice(0, limit);

    const repo = AppDataSource.getRepository(RepoChunk);
    await repo.delete({ repoUrl });

    let indexed = 0;
    let skipped = 0;

    for (const chunk of chunks) {
      try {
        let content = chunk.content;
        let embedding;

        try {
          embedding = await getEmbedding(content);
        } catch (err) {
          if (err.isTokenLimitError) {
            content = content.slice(0, 800); // hard fallback, well under 512-token limit
            embedding = await getEmbedding(content);
          } else {
            throw err;
          }
        }

        await repo.save(
          repo.create({
            repoUrl,
            filePath: chunk.filePath,
            chunkName: chunk.name,
            startLine: chunk.startLine,
            endLine: chunk.endLine,
            content,
            embedding: JSON.stringify(embedding),
          })
        );
        indexed++;
      } catch (err) {
        console.warn(`Skipping chunk ${chunk.filePath}:${chunk.name} — ${err.message}`);
        skipped++;
      }
    }

    res.json({ repoUrl, chunksIndexed: indexed, chunksSkipped: skipped, totalChunksFound });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (dir) cleanupRepo(dir);
  }
});

export default router;