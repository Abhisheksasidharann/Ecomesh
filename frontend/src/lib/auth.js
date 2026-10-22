/**
 * JWT-based authentication for the EcoMesh FastAPI backend.
 *
 * Replaces the previous Supabase auth module while keeping the same
 * public surface so all existing components continue to work unchanged:
 *   - useAuth() → { user, profile, loading, isAuthenticated, signIn, signUp, signOut, token }
 *   - signIn(email, password) → resolves on success, throws on failure
 *   - signUp({ email, password, name, role, school, studentClass, studentHouse })
 *   - signOut()
 *
 * The JWT access token is stored in sessionStorage (cleared on tab close).
 * Only the token string is persisted — never passwords or raw secrets.
 */

import { useState, useEffect, useCallback } from 'react';
import { apiLogin, apiRegister, apiMe } from './api';

const TOKEN_KEY = 'ecomesh_access_token';

// ---------------------------------------------------------------------------
// Standalone helpers (called from AuthPage and other places that imported them)
// ---------------------------------------------------------------------------

export async function signIn(email, password) {
  const data = await apiLogin(email, password);
  // FastAPI OAuth2: { access_token, token_type }
  const token = data.access_token;
  sessionStorage.setItem(TOKEN_KEY, token);
  return token;
}

export async function signUp({
  email,
  password,
  name,
  role = 'student',
  school = 'Model Higher Secondary School',
  studentClass = 'Class 11-A',
  studentHouse = 'Terra House',
}) {
  await apiRegister({ email, password, name, role, school, studentClass, studentHouse });
  // Auto sign-in after successful registration
  return signIn(email, password);
}

export function signOut() {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// useAuth hook — keeps the same interface as the Supabase version
// ---------------------------------------------------------------------------

export function useAuth() {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the current user profile from /auth/me whenever the token changes
  const loadMe = useCallback(async (accessToken) => {
    if (!accessToken) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    try {
      const me = await apiMe(accessToken);
      // Backend returns a user object; normalise it to the shape the rest of the
      // app expects (same field names used by all components).
      const normalised = {
        id: me.id,
        email: me.email,
        name: me.name || me.email?.split('@')[0] || 'User',
        role: me.role || 'student',
        school: me.school || 'Model Higher Secondary School',
        studentClass: me.student_class || me.studentClass || 'Class 11-A',
        studentHouse: me.student_house || me.studentHouse || 'Terra House',
        // Aliases used by various components
        student_class: me.student_class || me.studentClass || 'Class 11-A',
        student_house: me.student_house || me.studentHouse || 'Terra House',
      };
      setUser(normalised);
      setProfile(normalised);
    } catch {
      // Token is invalid or expired — clear it
      sessionStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMe(token);
  }, [token, loadMe]);

  // Listen for storage events (other tabs signing out)
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === TOKEN_KEY) {
        const newToken = e.newValue;
        setToken(newToken);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Wrapped signIn that also updates local state
  const handleSignIn = async (email, password) => {
    const accessToken = await signIn(email, password);
    setToken(accessToken);
    await loadMe(accessToken);
  };

  // Wrapped signUp that also updates local state
  const handleSignUp = async (params) => {
    const accessToken = await signUp(params);
    setToken(accessToken);
    await loadMe(accessToken);
  };

  // Wrapped signOut that also clears local state
  const handleSignOut = () => {
    signOut();
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  return {
    user,
    profile,
    loading,
    token,
    isAuthenticated: !!user,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signOut: handleSignOut,
  };
}
