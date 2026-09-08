export function getApiUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  const isBrowser = typeof window !== "undefined";
  const isProductionBrowser =
    isBrowser &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";

  // If in production browser and envUrl is missing or points to localhost, fallback to FastAPI Cloud URL
  if (isProductionBrowser) {
    if (!envUrl || envUrl.includes("localhost") || envUrl.includes("127.0.0.1")) {
      return "https://kelanaai-mainacademy-d7c718be.fastapicloud.dev/api/v1";
    }
  }

  return envUrl || "http://localhost:8000/api/v1";
}

function getNetworkErrorMessage(): string {
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  return isLocal
    ? "Gagal terhubung ke server backend. Pastikan server FastAPI (port 8000) sedang berjalan."
    : "Gagal terhubung ke server backend KelanaAI. Mohon pastikan URL backend (NEXT_PUBLIC_API_URL) telah terkonfigurasi di Vercel.";
}

export interface User {
  id: number;
  name: string;
  email: string;
  google_id?: string | null;
  avatar?: string | null;
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
    const res = await fetch(`${getApiUrl()}/auth/me`, {
      headers: getAuthHeaders(),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(parseErrorMessage(data, "Gagal mengambil data profil."));
    }

    return data;
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error(getNetworkErrorMessage());
    }
    throw err;
  }
}

export async function loginWithGoogle(
  credential?: string,
  name?: string,
  email?: string,
  google_id?: string,
  avatar?: string
): Promise<AuthResponse> {
  try {
    const res = await fetch(`${getApiUrl()}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential, token: credential, name, email, google_id, avatar }),
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
      throw new Error(getNetworkErrorMessage());
    }
    throw err;
  }
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${getApiUrl()}/auth/login`, {
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
      throw new Error(getNetworkErrorMessage());
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
    const res = await fetch(`${getApiUrl()}/auth/register`, {
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
      throw new Error(getNetworkErrorMessage());
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

export async function requestForgotPassword(email: string): Promise<{ message: string; otp?: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(parseErrorMessage(data, "Gagal meminta kode OTP."));
    }
    return data;
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error("Gagal terhubung ke server backend (http://localhost:8000). Pastikan server FastAPI sedang berjalan.");
    }
    throw err;
  }
}

export async function verifyOTP(email: string, otp: string): Promise<{ message: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(parseErrorMessage(data, "Kode OTP salah atau kadaluarsa."));
    }
    return data;
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error("Gagal terhubung ke server backend.");
    }
    throw err;
  }
}

export async function resetPassword(
  email: string,
  otp: string,
  new_password: string
): Promise<{ message: string }> {
  try {
    const res = await fetch(`${getApiUrl()}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, new_password }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(parseErrorMessage(data, "Gagal menyetel ulang password."));
    }
    return data;
  } catch (err: any) {
    if (err.name === "TypeError" || err.message?.includes("fetch")) {
      throw new Error("Gagal terhubung ke server backend.");
    }
    throw err;
  }
}
