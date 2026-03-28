import type { Skill, Graph } from "@/types";

const BASE = "/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? res.statusText);
  }
  return res.json();
}

export const api = {
  listSkills: (params?: {
    category?: string;
    tag?: string;
    search?: string;
  }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.tag) qs.set("tag", params.tag);
    if (params?.search) qs.set("search", params.search);
    const query = qs.toString();
    return request<Skill[]>(`/skills${query ? `?${query}` : ""}`);
  },
  getSkill: (name: string) => request<Skill>(`/skills/${name}`),
  createSkill: (
    data: Partial<Skill> & {
      name: string;
      displayName: string;
      description: string;
      content: string;
    },
  ) =>
    request<Skill>("/skills", { method: "POST", body: JSON.stringify(data) }),
  updateSkill: (name: string, data: Partial<Skill>) =>
    request<Skill>(`/skills/${name}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSkill: (name: string) =>
    request<{ ok: boolean }>(`/skills/${name}`, { method: "DELETE" }),
  getGraph: () => request<Graph>("/graph"),
  getCategories: () => request<string[]>("/categories"),
  getTags: () => request<string[]>("/tags"),
  createRelation: (source: string, target: string, type?: string) =>
    request("/relations", {
      method: "POST",
      body: JSON.stringify({ source, target, type }),
    }),
};
