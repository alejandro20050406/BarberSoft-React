const SESSION_KEY = "barbersoft:session";
const LEGACY_USER_KEY = "user";

export function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(LEGACY_USER_KEY, JSON.stringify(session.user));
}

export function getSession() {
  const rawSession = localStorage.getItem(SESSION_KEY);

  if (rawSession) {
    try {
      return JSON.parse(rawSession);
    } catch {
      clearSession();
      return null;
    }
  }

  const legacyUser = localStorage.getItem(LEGACY_USER_KEY);

  if (!legacyUser) {
    return null;
  }

  try {
    return { token: "", user: JSON.parse(legacyUser) };
  } catch {
    clearSession();
    return null;
  }
}

export function getAuthToken() {
  return getSession()?.token ?? "";
}

export function getCurrentUser() {
  return getSession()?.user ?? null;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}
