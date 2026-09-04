export function graphToMermaid(graph, options = {}) {
  const { maxNodes = 60 } = options;

  const truncated = graph.length > maxNodes;
  const nodesToRender = truncated ? graph.slice(0, maxNodes) : graph;
  const renderedIds = new Set(nodesToRender.map((n) => n.id));

  const lines = ["graph TD"];
  const nodeIds = new Map();
  let counter = 0;

  const safeId = (filePath) => {
    if (!nodeIds.has(filePath)) {
      nodeIds.set(filePath, `n${counter++}`);
    }
    return nodeIds.get(filePath);
  };

  for (const node of nodesToRender) {
    const id = safeId(node.id);
    const label = node.id.split("/").pop();
    lines.push(`  ${id}["${label}"]`);
  }

  for (const node of nodesToRender) {
    const fromId = safeId(node.id);
    for (const target of node.imports) {
      if (!renderedIds.has(target)) continue;
      const toId = safeId(target);
      lines.push(`  ${fromId} --> ${toId}`);
    }
  }

  return {
    diagram: lines.join("\n"),
    truncated,
    renderedCount: nodesToRender.length,
    totalCount: graph.length,
  };
}

function getFolderGroup(filePath) {
  const parts = filePath.split("/");
  if (parts.length <= 1) return "root";
  return parts[0];
}

export function graphToFolderMermaid(graph) {
  const folderEdges = new Map();
  const folders = new Set();

  for (const node of graph) {
    const fromFolder = getFolderGroup(node.id);
    folders.add(fromFolder);

    for (const target of node.imports) {
      const toFolder = getFolderGroup(target);
      folders.add(toFolder);
      if (fromFolder === toFolder) continue;

      const key = `${fromFolder}->${toFolder}`;
      folderEdges.set(key, (folderEdges.get(key) || 0) + 1);
    }
  }

  const folderIds = new Map();
  let counter = 0;
  const safeId = (folder) => {
    if (!folderIds.has(folder)) folderIds.set(folder, `f${counter++}`);
    return folderIds.get(folder);
  };

  const lines = ["graph TD"];
  for (const folder of folders) {
    lines.push(`  ${safeId(folder)}["${folder}/"]`);
  }
  for (const [key, count] of folderEdges) {
    const [from, to] = key.split("->");
    lines.push(`  ${safeId(from)} -->|${count}| ${safeId(to)}`);
  }
  for (const folder of folders) {
    lines.push(`  click ${safeId(folder)} call repomindNodeClick("${folder}")`);
  }

  return {
    diagram: lines.join("\n"),
    folderCount: folders.size,
  };
}