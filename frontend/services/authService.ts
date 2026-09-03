const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface UserProfile extends User {
  total_trips: number;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

function parseErrorMessage(data: any, fallback: string): string {
  if (!data || !data.detail) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((d: any) => d.msg || d.detail || JSON.stringify(d)).join(", ");
  }
  return fallback;
}

export async function getProfile(): Promise<UserProfile> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(parseErrorMessage(data, "Gagal mengambil data profil."));
    }

    return data;
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error("Gagal terhubung ke server backend. Pastikan server FastAPI (port 8000) sedang berjalan.");
    }
    throw err;
  }
}

export async function loginWithGoogle(
  name: string,
  email: string
): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(parseErrorMessage(data, "Gagal masuk dengan Google."));
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error("Gagal terhubung ke server backend. Pastikan server FastAPI (port 8000) sedang berjalan.");
    }
    throw err;
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(parseErrorMessage(data, "Email atau password yang Anda masukkan salah."));
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error("Gagal terhubung ke server backend (http://localhost:8000). Pastikan server FastAPI sedang berjalan.");
    }
    throw err;
  }
}

export async function register(
  name: string,
  email: string,
  password: string
): Promise<{ message: string; user: User }> {
  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(parseErrorMessage(data, "Registrasi gagal. Email mungkin sudah terdaftar."));
    }

    return data;
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error("Gagal terhubung ke server backend (http://localhost:8000). Pastikan server FastAPI sedang berjalan.");
    }
    throw err;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function getCurrentUser(): User | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
