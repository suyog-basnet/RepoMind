import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { extractPrismaEntities } from "../lib/prismaExtractor.js";

describe("extractPrismaEntities", () => {
  it("extracts models with scalar fields and relations", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "test-"));
    fs.mkdirSync(path.join(dir, "prisma"));
    fs.writeFileSync(
      path.join(dir, "prisma", "schema.prisma"),
      `
        model User {
          id    Int    @id @default(autoincrement())
          email String @unique
          posts Post[]
        }

        model Post {
          id       Int  @id
          title    String
          author   User @relation(fields: [authorId], references: [id])
          authorId Int
        }
      `
    );

    const entities = extractPrismaEntities(dir);
    expect(entities).toHaveLength(2);

    const user = entities.find((e) => e.name === "User");
    expect(user.columns.map((c) => c.name)).toEqual(["id", "email"]);
    expect(user.relations.map((r) => r.target)).toEqual(["Post"]);

    rmSync(dir, { recursive: true, force: true });
  });

  it("returns empty array when no schema.prisma exists", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "test-"));
    expect(extractPrismaEntities(dir)).toEqual([]);
    rmSync(dir, { recursive: true, force: true });
  });

  it("finds schema.prisma in a nested backend folder", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "test-"));
    fs.mkdirSync(path.join(dir, "backend", "prisma"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, "backend", "prisma", "schema.prisma"),
      `model Shop { id Int @id name String }`
    );

    const entities = extractPrismaEntities(dir);
    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe("Shop");

    rmSync(dir, { recursive: true, force: true });
  });

  it("does not treat enum fields as relations", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "test-"));
  fs.mkdirSync(path.join(dir, "prisma"));
  fs.writeFileSync(
    path.join(dir, "prisma", "schema.prisma"),
    `
      enum Role {
        USER
        ADMIN
      }

      model User {
        id   String @id
        role Role
      }
    `
  );

  const entities = extractPrismaEntities(dir);
  const user = entities.find((e) => e.name === "User");
  expect(user.relations).toEqual([]);

  rmSync(dir, { recursive: true, force: true });
});
});