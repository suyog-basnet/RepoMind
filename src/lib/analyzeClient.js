const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function analyzeRepo(repoUrl) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoUrl }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Analysis failed: ${res.status}`);
  }

  return res.json();
}