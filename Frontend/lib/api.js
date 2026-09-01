const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
export async function api(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...options.headers } });
  const data = await response.json().catch(() => ({ success: false, message: "Unexpected server response" }));
  if (response.status === 401 && path !== "/auth/refresh" && !options._retried) {
    try { await api("/auth/refresh", { method: "POST", _retried: true }); return api(path, { ...options, _retried: true }); } catch {}
  }
  if (!response.ok) { const fieldMessage = data.fields ? Object.values(data.fields).flat()[0] : null; const error = new Error(fieldMessage || data.message || "Request failed"); error.data = data; error.status = response.status; throw error; }
  return data;
}
export const request = (path, body, method = "POST") => api(path, { method, body: JSON.stringify(body) });
