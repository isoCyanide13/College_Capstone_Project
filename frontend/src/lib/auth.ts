/**
 * Auth Helpers
 * =============
 * Saves, retrieves, and removes the JWT token from localStorage.
 * All functions check if we're in the browser first (Next.js SSR safety).
 */

const TOKEN_KEY = "access_token";
const USER_KEY = "user_data";

// Check if we're running in the browser
const isBrowser = typeof window !== "undefined";

export function saveToken(token: string): void {
  if (isBrowser) localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (!isBrowser) return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  if (!isBrowser) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function saveUser(user: object): void {
  if (isBrowser) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUser(): any | null {
  if (!isBrowser) return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}