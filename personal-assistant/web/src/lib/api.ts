const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

// Auth
export const api = {
  auth: {
    register: (data: { email: string; name: string; password: string; timezone?: string }) =>
      request<{ access_token: string; refresh_token: string }>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      request<{ access_token: string; refresh_token: string }>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    me: () => request<{ id: string; email: string; name: string; timezone: string }>("/api/v1/auth/me"),
  },

  projects: {
    list: (status?: string) =>
      request<Project[]>(`/api/v1/projects${status ? `?status=${status}` : ""}`),
    get: (id: string) => request<Project>(`/api/v1/projects/${id}`),
    create: (data: Partial<Project>) =>
      request<Project>("/api/v1/projects", { method: "POST", body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Project>) =>
      request<Project>(`/api/v1/projects/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    tasks: {
      list: (projectId: string, status?: string) =>
        request<Task[]>(`/api/v1/projects/${projectId}/tasks${status ? `?status=${status}` : ""}`),
      create: (projectId: string, data: Partial<Task>) =>
        request<Task>(`/api/v1/projects/${projectId}/tasks`, {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (taskId: string, data: Partial<Task>) =>
        request<Task>(`/api/v1/projects/tasks/${taskId}`, {
          method: "PATCH",
          body: JSON.stringify(data),
        }),
    },
  },

  briefings: {
    list: () => request<Briefing[]>("/api/v1/briefings"),
    latest: () => request<Briefing>("/api/v1/briefings/latest"),
    get: (id: string) => request<Briefing>(`/api/v1/briefings/${id}`),
    generate: () => request<Briefing>("/api/v1/briefings/generate", { method: "POST" }),
    markRead: (id: string) =>
      request<Briefing>(`/api/v1/briefings/${id}/read`, { method: "PATCH" }),
  },

  conversations: {
    list: () => request<Conversation[]>("/api/v1/conversations"),
    get: (id: string) => request<ConversationDetail>(`/api/v1/conversations/${id}`),
  },
};

// Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  github_repos: string[];
  notion_pages: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  source: string;
  source_ref?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Briefing {
  id: string;
  type: string;
  content_md: string;
  sections: Record<string, unknown>;
  delivered_at?: string;
  read_at?: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  title?: string;
  project_id?: string;
  created_at: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  agent_name?: string;
  created_at: string;
}

export interface ConversationDetail extends Conversation {
  messages: Message[];
}

// SSE chat stream helper
export function chatStream(
  message: string,
  conversationId?: string,
  projectId?: string,
  onEvent?: (event: { type: string; [key: string]: unknown }) => void,
): () => void {
  const token = getToken();
  const controller = new AbortController();

  fetch(`${API_BASE}/api/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, conversation_id: conversationId, project_id: projectId }),
    signal: controller.signal,
  }).then(async (res) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      let eventType = "message";
      for (const line of lines) {
        if (line.startsWith("event: ")) {
          eventType = line.slice(7).trim();
        } else if (line.startsWith("data: ")) {
          try {
            const data = JSON.parse(line.slice(6));
            onEvent?.({ type: eventType, ...data });
          } catch {}
        }
      }
    }
  });

  return () => controller.abort();
}
