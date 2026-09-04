import { describe, it, expect } from "vitest";
import { Project } from "ts-morph";
import path from "path";
import { findNestJsEndpoints, findExpressEndpoints } from "../lib/apiEndpoints.js";

function makeProject(files) {
  const project = new Project({ useInMemoryFileSystem: true });
  for (const [name, content] of Object.entries(files)) {
    project.createSourceFile(name, content);
  }
  return project;
}

describe("findNestJsEndpoints", () => {
  it("extracts a simple GET route with controller prefix", () => {
    const code = `
      import { Controller, Get } from '@nestjs/common';

      @Controller('trails')
      export class TrailsController {
        @Get()
        findAll() {}

        @Get(':id')
        findOne() {}
      }
    `;
    const project = makeProject({ "trails.controller.ts": code });
    const endpoints = findNestJsEndpoints(project, "/", path);

    expect(endpoints).toEqual([
      { method: "GET", path: "/trails", handler: "findAll", file: "trails.controller.ts" },
      { method: "GET", path: "/trails/:id", handler: "findOne", file: "trails.controller.ts" },
    ]);
  });

  it("handles multiple HTTP methods in one controller", () => {
    const code = `
      import { Controller, Get, Post, Delete } from '@nestjs/common';

      @Controller('favorites')
      export class FavoritesController {
        @Get()
        list() {}

        @Post()
        create() {}

        @Delete(':id')
        remove() {}
      }
    `;
    const project = makeProject({ "favorites.controller.ts": code });
    const endpoints = findNestJsEndpoints(project, "/", path);

    expect(endpoints.map((e) => e.method)).toEqual(["GET", "POST", "DELETE"]);
  });

  it("ignores non-controller files", () => {
    const code = `export class TrailsService { findAll() {} }`;
    const project = makeProject({ "trails.service.ts": code });
    const endpoints = findNestJsEndpoints(project, "/", path);
    expect(endpoints).toEqual([]);
  });
});

describe("findExpressEndpoints", () => {
  it("extracts routes registered via app.method()", () => {
    const code = `
      import express from 'express';
      const app = express();
      app.get('/health', (req, res) => res.json({ status: 'ok' }));
      app.post('/api/analyze', (req, res) => {});
    `;
    const project = makeProject({ "index.js": code });
    const endpoints = findExpressEndpoints(project, "/", path);

    expect(endpoints).toEqual([
      { method: "GET", path: "/health", handler: "<handler>", file: "index.js" },
      { method: "POST", path: "/api/analyze", handler: "<handler>", file: "index.js" },
    ]);
  });

  it("extracts routes registered via router.method()", () => {
    const code = `
      import express from 'express';
      const router = express.Router();
      router.get('/', (req, res) => {});
      router.delete('/:id', (req, res) => {});
    `;
    const project = makeProject({ "routes.js": code });
    const endpoints = findExpressEndpoints(project, "/", path);

    expect(endpoints.map((e) => e.method)).toEqual(["GET", "DELETE"]);
  });
});