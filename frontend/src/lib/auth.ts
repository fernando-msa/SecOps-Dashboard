export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("secops_user");
  return stored ? JSON.parse(stored) : null;
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("secops_token");
}

export function storeAuth(token: string, user: User) {
  localStorage.setItem("secops_token", token);
  localStorage.setItem("secops_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("secops_token");
  localStorage.removeItem("secops_user");
}
