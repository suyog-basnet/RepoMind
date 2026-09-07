import { EntitySchema } from "typeorm";

export const RepoChunk = new EntitySchema({
  name: "RepoChunk",
  tableName: "repo_chunks",
  columns: {
    id: { type: "int", primary: true, generated: true },
    repoUrl: { type: "text" },
    filePath: { type: "text" },
    chunkName: { type: "text", nullable: true },
    startLine: { type: "int", nullable: true },
    endLine: { type: "int", nullable: true },
    content: { type: "text" },
    embedding: { type: "text" }, // JSON-stringified float array, similarity computed in JS
    createdAt: { type: "timestamptz", createDate: true },
  },
  indices: [{ columns: ["repoUrl"] }],
});