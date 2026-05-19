const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface FetchOptions extends RequestInit {
    token?: string;
}

class ApiError extends Error {
    status: number;
    detail: string;

    constructor(status: number, detail: string) {
        super(detail);
        this.name = "ApiError";
        this.status = status;
        this.detail = detail;
    }
}

async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
    };

    if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "An unknown error occurred" }));
        throw new ApiError(response.status, errorData.detail || "Request failed");
    }

    return response.json();
}

// --- Auth API ---

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    display_name?: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export interface TokenResponse {
    access_token: string;
    token_type: string;
}

export interface UserResponse {
    id: string;
    email: string;
    username: string;
    display_name: string | null;
    created_at: string;
}

export const authApi = {
    register: (data: RegisterData) =>
        fetchApi<UserResponse>("/auth/register", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    login: (data: LoginData) =>
        fetchApi<TokenResponse>("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getMe: (token: string) =>
        fetchApi<UserResponse>("/auth/me", { token }),
};

// --- Lesson API ---

export interface LessonResponse {
    id: string;
    topic_id: string;
    title: string;
    created_at: string;
}

export interface MessageResponse {
    id: string;
    role: string;
    content: string;
    created_at: string;
}

export const lessonsApi = {
    create: (data: { topic_id: string; title: string }, token: string) =>
        fetchApi<LessonResponse>("/lessons/", {
            method: "POST",
            body: JSON.stringify(data),
            token,
        }),

    getAll: (token: string) =>
        fetchApi<LessonResponse[]>("/lessons/", { token }),

    getMessages: (lessonId: string, token: string) =>
        fetchApi<MessageResponse[]>(`/lessons/${lessonId}/messages`, { token }),

    streamChat: async function* (
        lessonId: string,
        content: string,
        token: string,
    ): AsyncGenerator<string> {
        const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({ detail: "Chat failed" }));
            throw new ApiError(response.status, err.detail);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    if (data === "[DONE]") return;
                    try {
                        const parsed = JSON.parse(data);
                        if (parsed.content) yield parsed.content;
                    } catch {
                        // skip malformed chunks
                    }
                }
            }
        }
    },
};

export { ApiError, fetchApi };

