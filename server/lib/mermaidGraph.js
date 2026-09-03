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
      if (!renderedIds.has(target)) continue; // skip edges to nodes we cut
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