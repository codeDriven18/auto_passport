import type {
  JobDetail,
  JobsResponse,
  SummaryStats,
  TimeSeriesStats,
  ImportResult,
  Tag,
  Source
} from "./types";

const API_BASE = "http://localhost:5000/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

export const api = {
  getJobs: (query: string) => request<JobsResponse>(`/jobs${query}`),
  getJob: (id: string) => request<JobDetail>(`/jobs/${id}`),
  createJob: (body: unknown) => request<{ id: string }>("/jobs", { method: "POST", body: JSON.stringify(body) }),
  updateJob: (id: string, body: unknown) => request<void>(`/jobs/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteJob: (id: string) => request<void>(`/jobs/${id}`, { method: "DELETE" }),
  updateStatus: (id: string, status: string) =>
    request(`/jobs/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  toggleBookmark: (id: string, value?: boolean) =>
    request(`/jobs/${id}/bookmark`, {
      method: "POST",
      body: value === undefined ? undefined : JSON.stringify({ value })
    }),
  toggleApplied: (id: string, value?: boolean) =>
    request(`/jobs/${id}/applied`, {
      method: "POST",
      body: value === undefined ? undefined : JSON.stringify({ value })
    }),
  updateNote: (id: string, notes: string) =>
    request(`/jobs/${id}/note`, { method: "PUT", body: JSON.stringify({ notes }) }),
  getTags: (search?: string) =>
    request<Tag[]>(`/tags${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  createTag: (name: string) => request("/tags", { method: "POST", body: JSON.stringify({ name }) }),
  updateTag: (id: number, name: string) =>
    request(`/tags/${id}`, { method: "PUT", body: JSON.stringify({ name }) }),
  deleteTag: (id: number) => request(`/tags/${id}`, { method: "DELETE" }),
  getSources: () => request<Source[]>("/sources"),
  createSource: (body: { name: string; url?: string }) =>
    request("/sources", { method: "POST", body: JSON.stringify(body) }),
  updateSource: (id: number, body: { name: string; url?: string }) =>
    request(`/sources/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteSource: (id: number) => request(`/sources/${id}`, { method: "DELETE" }),
  seedDemo: () => request<{ seeded: boolean }>("/seed", { method: "POST" }),
  getSummary: () => request<SummaryStats>("/stats/summary"),
  getTimeSeries: (days: number) => request<TimeSeriesStats>(`/stats/timeseries?days=${days}`),
  exportJobs: (query: string, format: "csv" | "json") =>
    fetch(`${API_BASE}/export${query}${query.includes("?") ? "&" : "?"}format=${format}`),
  importFile: async (file: File, format: "csv" | "json") => {
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${API_BASE}/import?format=${format}`, { method: "POST", body: form });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Import failed");
    }
    return (await res.json()) as ImportResult;
  }
};
