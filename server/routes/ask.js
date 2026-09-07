import express from "express";
import { getEmbedding, cosineSimilarity } from "../lib/embeddings.js";
import { AppDataSource } from "../data-source.js";
import { RepoChunk } from "../entities/RepoChunk.js";

const router = express.Router();
const TOP_K = 6;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const ANSWER_MODEL = "anthropic/claude-haiku-4.5";

router.post("/", async (req, res) => {
  const { repoUrl, question } = req.body || {};
  if (!repoUrl || !question) {
    return res.status(400).json({ error: "repoUrl and question are required" });
  }

  try {
    const repo = AppDataSource.getRepository(RepoChunk);
    const allChunks = await repo.findBy({ repoUrl });

    if (allChunks.length === 0) {
      return res.status(404).json({ error: "This repo hasn't been indexed yet. Call /api/index first." });
    }

    const questionEmbedding = await getEmbedding(question);

    const scored = allChunks.map((chunk) => ({
      chunk,
      score: cosineSimilarity(questionEmbedding, JSON.parse(chunk.embedding)),
    }));

    scored.sort((a, b) => b.score - a.score);
    const topChunks = scored.slice(0, TOP_K).map((s) => s.chunk);

    const context = topChunks
      .map((c) => `File: ${c.filePath} (lines ${c.startLine}-${c.endLine})\n${c.content}`)
      .join("\n\n---\n\n");

    const prompt = `You are answering a question about a codebase using only the context below. Cite file paths and line numbers when relevant. If the context doesn't answer the question, say so.

Context:
${context}

Question: ${question}`;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const answerRes = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: ANSWER_MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
      }),
    });

    if (!answerRes.ok) {
      const errText = await answerRes.text();
      throw new Error(`OpenRouter chat request failed: ${answerRes.status} ${errText}`);
    }

    const answerData = await answerRes.json();
    const answer = answerData.choices[0].message.content;

    res.json({
      answer,
      sources: topChunks.map((c) => ({
        filePath: c.filePath,
        chunkName: c.chunkName,
        startLine: c.startLine,
        endLine: c.endLine,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;