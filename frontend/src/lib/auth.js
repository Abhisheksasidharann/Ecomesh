import { useState, useEffect, useCallback } from 'react';
import {
  apiLogin,
  apiSignup,
  apiMe,
  saveToken,
  getToken,
  clearToken,
} from './api';
import { DEFAULT_SCHOOL_ID } from './constants';

// ── Token decode (no library needed; JWT payload is plain base64) ─────────────
function decodeToken(token) {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(b64));
  } catch {
    return null;
  }
}

function isExpired(payload) {
  if (!payload?.exp) return true;
  // exp is in seconds; add a 10-second buffer
  return Date.now() / 1000 > payload.exp - 10;
}

// ── Public auth functions ──────────────────────────────────────────────────────

/**
 * Sign up a new student account.
 * username = their chosen username (used as student_id in the backend)
 */
export async function signUp({
  username,
  password,
  name,
  school_id = DEFAULT_SCHOOL_ID,
  studentClass = '10A',
  studentHouse = '',
}) {
  const data = await apiSignup({
    username,
    password,
    name,
    school_id,
    class_name: studentClass,
    house: studentHouse,
  });
  return data; // { username, student_id, role }
}

/**
 * Sign in and save JWT to localStorage.
 * Returns the raw login response: { access_token, role, school_id, student_id }
 */
export async function signIn(username, password) {
  const data = await apiLogin({ username, password });
  saveToken(data.access_token);
  return data;
}

/** Sign out — just clear the local token. No backend call needed. */
export function signOut() {
  clearToken();
}

// ── useAuth hook ──────────────────────────────────────────────────────────────
/**
 * Drop-in replacement for the Supabase useAuth hook.
 * Reads the JWT from localStorage, validates it, and if valid fetches /auth/me
 * to get the full user object.
 *
 * Returned `user` shape:
 *  {
 *    username, role, school_id, student_id,
 *    name, studentClass, studentHouse,
 *    // convenience aliases
 *    id: student_id,
 *    email: username,
 *  }
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const payload = decodeToken(token);
    if (!payload || isExpired(payload)) {
      clearToken();
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // /auth/me returns { username, role, school_id, student_id }
      const me = await apiMe();
      setUser(buildUser(me));
    } catch {
      // Token rejected by server (revoked, tampered, etc.)
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  // Expose a refreshUser so other components can call it after login
  const refreshUser = loadUser;

  const handleSignIn = async (username, password) => {
    await signIn(username, password);
    await loadUser();
  };

  const handleSignOut = () => {
    signOut();
    setUser(null);
  };

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn: handleSignIn,
    signUp,
    signOut: handleSignOut,
    refreshUser,
    // Legacy alias so components that still read profile work
    profile: user,
  };
}

// ── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Shape the raw /auth/me payload into the richer user object the
 * rest of the app expects.
 */
function buildUser(me) {
  return {
    // Backend fields
    username: me.username,
    role: me.role,
    school_id: me.school_id || DEFAULT_SCHOOL_ID,
    student_id: me.student_id || me.username,

    // Convenience aliases used across components
    id: me.student_id || me.username,
    email: me.username,                         // some components still read user.email
    name: me.name || me.username,

    // Class & house come from /students/{id}/summary; seeded with defaults here.
    // App.jsx or Dashboard can overwrite these once the student summary loads.
    studentClass: me.class_name || me.studentClass || '',
    studentHouse: me.house || me.studentHouse || '',
    student_class: me.class_name || me.studentClass || '',
    student_house: me.house || me.studentHouse || '',
  };
}
