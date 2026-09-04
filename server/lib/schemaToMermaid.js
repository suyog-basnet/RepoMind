function sanitizeType(type) {
  return type
    .replace(/['"]/g, "")
    .replace(/[<>[\](),|]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 30) || "unknown";
}

function sanitizeName(name) {
  return name.replace(/[^A-Za-z0-9_]/g, "_");
}

export function schemaToMermaid(entities) {
  const lines = ["erDiagram"];
  const entityNames = new Set(entities.map((e) => e.className));

  for (const entity of entities) {
    const id = sanitizeName(entity.className);
    lines.push(`  ${id} {`);
    for (const col of entity.columns) {
      lines.push(`    ${sanitizeType(col.type)} ${sanitizeName(col.name)}`);
    }
    lines.push(`  }`);
  }

  const seenEdges = new Set();
  for (const entity of entities) {
    const fromId = sanitizeName(entity.className);
    for (const rel of entity.relations) {
      if (!rel.target || !entityNames.has(rel.target)) continue;
      const toId = sanitizeName(rel.target);

      const edgeKey = [fromId, toId].sort().join("--");
      if (seenEdges.has(edgeKey)) continue;
      seenEdges.add(edgeKey);

      const cardinality =
        rel.type === "OneToMany" ? "||--o{" :
        rel.type === "ManyToOne" ? "}o--||" :
        rel.type === "ManyToMany" ? "}o--o{" :
        "||--||"; // OneToOne

      lines.push(`  ${fromId} ${cardinality} ${toId} : "${rel.name}"`);
    }
  }

  return {
    diagram: lines.join("\n"),
    entityCount: entities.length,
  };
}