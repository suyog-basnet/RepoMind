import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import path from "path";
import { extractEntities } from "../lib/schemaExtractor.js";

function makeProject(files) {
  const project = new Project({ useInMemoryFileSystem: true });
  for (const [name, content] of Object.entries(files)) {
    project.createSourceFile(name, content);
  }
  return project;
}

describe("extractEntities", () => {
  it("extracts columns from a simple entity", () => {
    const code = `
      import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

      @Entity('users')
      export class User {
        @PrimaryGeneratedColumn()
        id: number;

        @Column()
        email: string;

        @Column()
        name: string;
      }
    `;
    const project = makeProject({ "user.entity.ts": code });
    const entities = extractEntities(project, "/", path);

    expect(entities).toHaveLength(1);
    expect(entities[0].name).toBe("users");
    expect(entities[0].columns.map((c) => c.name)).toEqual(["id", "email", "name"]);
  });

  it("extracts a relation with its target entity", () => {
    const code = `
      import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

      @Entity('reviews')
      export class Review {
        @PrimaryGeneratedColumn()
        id: number;

        @ManyToOne(() => Trail)
        trail: Trail;
      }
    `;
    const project = makeProject({ "review.entity.ts": code });
    const entities = extractEntities(project, "/", path);

    expect(entities[0].relations).toEqual([
      { name: "trail", type: "ManyToOne", target: "Trail" },
    ]);
  });

  it("falls back to class name when @Entity has no explicit name", () => {
    const code = `
      import { Entity, PrimaryGeneratedColumn } from 'typeorm';

      @Entity()
      export class Weather {
        @PrimaryGeneratedColumn()
        id: number;
      }
    `;
    const project = makeProject({ "weather.entity.ts": code });
    const entities = extractEntities(project, "/", path);

    expect(entities[0].name).toBe("Weather");
  });

  it("ignores non-entity classes", () => {
    const code = `export class TrailsService { findAll() {} }`;
    const project = makeProject({ "trails.service.ts": code });
    const entities = extractEntities(project, "/", path);
    expect(entities).toEqual([]);
  });
});