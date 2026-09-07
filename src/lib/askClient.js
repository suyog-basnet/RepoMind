const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function indexRepo(repoUrl) {
  const res = await fetch(`${API_BASE}/api/index`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoUrl }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Indexing failed: ${res.status}`);
  }
  return res.json();
}

export async function askRepo(repoUrl, question) {
  const res = await fetch(`${API_BASE}/api/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoUrl, question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Ask failed: ${res.status}`);
  }
  return res.json();
}