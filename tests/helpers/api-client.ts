/**
 * API Client for integration tests.
 *
 * Provides a clean interface to make authenticated/unauthenticated
 * requests against the running dev server.
 *
 * Usage:
 *   const client = new ApiClient();
 *   await client.register({ ... });
 *   await client.login(email, password);
 *   const habits = await client.get("/api/habits");
 */

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3000";

export interface ApiResponse<T = Record<string, unknown>> {
  status: number;
  body: {
    success: boolean;
    data?: T;
    error?: string;
  };
}

export class ApiClient {
  private sessionCookie = "";

  /** Check if the client has an active session */
  get isAuthenticated(): boolean {
    return this.sessionCookie.includes("authjs.session-token");
  }

  /** Clear the session (simulate logged out state) */
  clearSession(): void {
    this.sessionCookie = "";
  }

  /** Save and restore session for temporary unauthenticated requests */
  withoutAuth<T>(fn: () => Promise<T>): Promise<T> {
    const saved = this.sessionCookie;
    this.sessionCookie = "";
    return fn().finally(() => {
      this.sessionCookie = saved;
    });
  }

  // ==================== Core Request Methods ====================

  async get<T = Record<string, unknown>>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "GET" });
  }

  async post<T = Record<string, unknown>>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T = Record<string, unknown>>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T = Record<string, unknown>>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: "DELETE" });
  }

  /** Raw fetch for non-JSON responses (e.g., redirects) */
  async raw(path: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {};
    if (this.sessionCookie) {
      headers["Cookie"] = this.sessionCookie;
    }
    return fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string>) },
      redirect: "manual",
    });
  }

  // ==================== Auth Helpers ====================

  async register(data: { username: string; email: string; password: string }): Promise<ApiResponse> {
    return this.post("/api/auth/register", data);
  }

  async login(email: string, password: string): Promise<void> {
    // Step 1: Get CSRF token
    const csrfRes = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = (await csrfRes.json()) as { csrfToken: string };
    const csrfCookies = csrfRes.headers.getSetCookie?.() || [];
    const csrfCookieStr = csrfCookies.map((c) => c.split(";")[0]).join("; ");

    // Step 2: POST credentials
    const signInRes = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Cookie: csrfCookieStr,
      },
      body: new URLSearchParams({
        csrfToken: csrfData.csrfToken,
        email,
        password,
        json: "true",
      }),
      redirect: "manual",
    });

    const signInCookies = signInRes.headers.getSetCookie?.() || [];
    const sessionToken = signInCookies
      .map((c) => c.split(";")[0])
      .find((c) => c.includes("authjs.session-token"));

    if (!sessionToken) {
      throw new Error("Login failed — no session token returned");
    }

    this.sessionCookie = [csrfCookieStr, sessionToken].filter(Boolean).join("; ");
  }

  // ==================== Private ====================

  private async request<T>(path: string, options: RequestInit): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.sessionCookie) {
      headers["Cookie"] = this.sessionCookie;
    }

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
      redirect: "manual",
    });

    let body: ApiResponse<T>["body"] = { success: false };
    try {
      body = (await res.json()) as ApiResponse<T>["body"];
    } catch {
      // Non-JSON response
    }

    return { status: res.status, body };
  }
}
