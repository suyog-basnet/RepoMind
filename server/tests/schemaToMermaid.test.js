import { describe, it, expect } from "vitest";
import { schemaToMermaid } from "../lib/schemaToMermaid.js";

describe("schemaToMermaid", () => {
  it("renders entities with columns", () => {
    const entities = [
      {
        name: "users",
        className: "User",
        columns: [
          { name: "id", type: "string" },
          { name: "email", type: "string" },
        ],
        relations: [],
      },
    ];
    const result = schemaToMermaid(entities);

    expect(result.diagram).toContain("erDiagram");
    expect(result.diagram).toContain("User {");
    expect(result.diagram).toContain("string id");
    expect(result.diagram).toContain("string email");
  });

  it("renders a relation with correct cardinality", () => {
    const entities = [
      {
        className: "User",
        columns: [],
        relations: [{ name: "trails", type: "OneToMany", target: "Trail" }],
      },
      {
        className: "Trail",
        columns: [],
        relations: [{ name: "user", type: "ManyToOne", target: "User" }],
      },
    ];
    const result = schemaToMermaid(entities);

    // only one edge should appear, not two duplicates
    const edgeLines = result.diagram.split("\n").filter((l) => l.includes("--"));
    expect(edgeLines).toHaveLength(1);
  });

  it("sanitizes special characters in types", () => {
    const entities = [
      {
        className: "Trail",
        columns: [{ name: "routePath", type: "RoutePoint[]" }],
        relations: [],
      },
    ];
    const result = schemaToMermaid(entities);
    expect(result.diagram).not.toContain("[");
    expect(result.diagram).not.toContain("]");
  });

  it("ignores relations pointing to unknown entities", () => {
    const entities = [
      {
        className: "Trail",
        columns: [],
        relations: [{ name: "ghost", type: "ManyToOne", target: "NonExistent" }],
      },
    ];
    const result = schemaToMermaid(entities);
    expect(result.diagram).not.toContain("NonExistent");
  });
});