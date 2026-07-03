import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { User } from "./types";

/**
 * Point this at your auth backend.
 * In dev this must be your laptop's LAN IP (same network as the phone),
 * NOT localhost — localhost on the phone is the phone itself.
 */
export const API_URL = "http://192.168.1.13:4000";

const TOKEN_KEY = "cliper_jwt";

WebBrowser.maybeCompleteAuthSession();

export interface Session {
  token: string;
  user: User;
}

/**
 * Backend-driven GitHub OAuth:
 * 1. Open the system auth browser at {API_URL}/auth/github/start,
 *    passing where GitHub should ultimately send us back
 *    (exp://.../--/auth in Expo Go, cliper://auth in a dev/prod build).
 * 2. Backend handles GitHub + client secret, signs a JWT,
 *    and redirects to that deep link with ?token=...
 * 3. We store the JWT and fetch the profile.
 */
export async function signInWithGitHub(): Promise<Session | null> {
  const redirect = Linking.createURL("auth");
  const startUrl = `${API_URL}/auth/github/start?redirect=${encodeURIComponent(redirect)}`;

  const result = await WebBrowser.openAuthSessionAsync(startUrl, redirect);
  if (result.type !== "success") return null; // user cancelled

  const { queryParams } = Linking.parse(result.url);
  const token = typeof queryParams?.token === "string" ? queryParams.token : null;
  if (!token) return null;

  const user = await fetchMe(token);
  if (!user) return null;

  await SecureStore.setItemAsync(TOKEN_KEY, token);
  return { token, user };
}

/** Restore a session on app launch, if a valid JWT is stored. */
export async function restoreSession(): Promise<Session | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) return null;
  const user = await fetchMe(token);
  if (!user) {
    await SecureStore.deleteItemAsync(TOKEN_KEY); // expired/invalid
    return null;
  }
  return { token, user };
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function fetchMe(token: string): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { username: data.username, avatarUrl: data.avatarUrl };
  } catch {
    return null;
  }
}
