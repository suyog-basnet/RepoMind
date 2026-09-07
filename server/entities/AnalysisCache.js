import { EntitySchema } from "typeorm";

export const AnalysisCache = new EntitySchema({
  name: "AnalysisCache",
  tableName: "analysis_cache",
  columns: {
    id: { type: "int", primary: true, generated: true },
    repoUrl: { type: "text", unique: true },
    resultJson: { type: "text" },
    updatedAt: { type: "timestamptz", updateDate: true },
  },
});