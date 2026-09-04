import fs from "fs";
import path from "path";

const SCALAR_TYPES = ["Int", "String", "Boolean", "DateTime", "Float", "Json", "BigInt", "Decimal", "Bytes"];

function findSchemaFile(rootDir) {
  const candidates = [
    "prisma/schema.prisma",
    "schema.prisma",
    "backend/prisma/schema.prisma",
    "server/prisma/schema.prisma",
    "src/prisma/schema.prisma",
  ];
  for (const rel of candidates) {
    const full = path.join(rootDir, rel);
    if (fs.existsSync(full)) return full;
  }
  return null;
}

function parseModelBlock(name, body, modelNames) {
  const columns = [];
  const relations = [];

  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("//") && !l.startsWith("@@"));

  for (const line of lines) {
    const match = line.match(/^(\w+)\s+(\w+)(\[\])?(\?)?/);
    if (!match) continue;
    const [, fieldName, fieldType] = match;

    if (SCALAR_TYPES.includes(fieldType)) {
      columns.push({ name: fieldName, type: fieldType });
    } else if (modelNames.has(fieldType)) {
      relations.push({ name: fieldName, target: fieldType });
    }
    // else: likely an enum or unrecognized type — skip rather than guess
  }

  return { name, className: name, columns, relations };
}

export function extractPrismaEntities(rootDir) {
  const schemaPath = findSchemaFile(rootDir);
  if (!schemaPath) return [];

  const content = fs.readFileSync(schemaPath, "utf8");
  const modelNames = new Set();
  const modelRegex = /model\s+(\w+)\s*\{([^}]*)\}/g;
  let match;
  const rawModels = [];

  while ((match = modelRegex.exec(content)) !== null) {
    modelNames.add(match[1]);
    rawModels.push(match);
  }

  return rawModels.map(([, name, body]) => parseModelBlock(name, body, modelNames));
}