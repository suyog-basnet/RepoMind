import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { RepoChunk } from "./entities/RepoChunk.js";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  logging: false,
  entities: [RepoChunk],
});