const ADMIN_PASSWORD = "Unique@Parfum1";
const SESSION_KEY = "admin_session";

export function login(password: string): boolean {
  if (password !== ADMIN_PASSWORD) return false;
  localStorage.setItem(SESSION_KEY, "1");
  return true;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(SESSION_KEY) === "1";
}
