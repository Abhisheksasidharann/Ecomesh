// Central API client for EcoMesh FastAPI backend
// Every HTTP call to the backend goes through here.
import { useState, useEffect } from 'react';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const TOKEN_KEY = 'ecomesh_token';

// ── Token helpers ──────────────────────────────────────────────────────────────
export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────────
/**
 * Wrapper around fetch that attaches the JWT and throws on non-2xx.
 * For multipart requests, pass formData as body and omit Content-Type
 * (browser sets it with the correct boundary automatically).
 */
export async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      // Only set JSON content-type when not uploading a file
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      detail = err.detail || detail;
    } catch {
      // ignore parse errors, use default message
    }
    const error = new Error(detail);
    error.status = res.status;
    throw error;
  }

  // 204 No Content has no body
  if (res.status === 204) return null;
  return res.json();
}

// ── Auth endpoints ─────────────────────────────────────────────────────────────
export async function apiLogin({ username, password }) {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function apiSignup({ username, password, name, school_id, class_name, house }) {
  return apiFetch('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password, name, school_id, class_name, house }),
  });
}

export async function apiMe() {
  return apiFetch('/auth/me');
}

// ── Submissions endpoints ──────────────────────────────────────────────────────

/**
 * POST /submissions — multipart form with photo file.
 * @param {object} params
 * @param {string} params.student_id
 * @param {string} params.school_id
 * @param {string} params.action_type   - must be the backend key (use BACKEND_ACTION_TYPE map)
 * @param {string} params.context       - 'school' | 'home'
 * @param {number} params.latitude
 * @param {number} params.longitude
 * @param {string} params.captured_at   - ISO datetime string
 * @param {number} params.quantity
 * @param {File}   params.photo         - actual File object from <input type="file">
 */
export async function apiCreateSubmission(params) {
  const form = new FormData();
  form.append('student_id', params.student_id);
  form.append('school_id', params.school_id);
  form.append('action_type', params.action_type);
  form.append('context', params.context);
  form.append('latitude', String(params.latitude));
  form.append('longitude', String(params.longitude));
  form.append('captured_at', params.captured_at);
  form.append('quantity', String(params.quantity));
  form.append('photo', params.photo);

  return apiFetch('/submissions', { method: 'POST', body: form });
}

/** GET /my/submissions — student's own submissions */
export async function apiMySubmissions(limit = 50) {
  return apiFetch(`/my/submissions?limit=${limit}`);
}

/** GET /submissions — teacher/admin list (all school submissions) */
export async function apiAllSubmissions(school_id, status, limit = 100) {
  const params = new URLSearchParams();
  if (school_id) params.set('school_id', school_id);
  if (status) params.set('status', status);
  params.set('limit', String(limit));
  return apiFetch(`/submissions?${params.toString()}`);
}

/** GET /review/queue — teacher/admin review queue */
export async function apiReviewQueue() {
  return apiFetch('/review/queue');
}

/** POST /review/{id} — approve or reject a submission */
export async function apiReviewSubmission(submissionId, decision, reviewerName = '', note = '') {
  return apiFetch(`/review/${submissionId}`, {
    method: 'POST',
    body: JSON.stringify({ decision, reviewer: reviewerName, note }),
  });
}

// ── Student / Gamification endpoints ──────────────────────────────────────────

/** GET /students/{id}/summary — points, level, streak, badges, pending count */
export async function apiStudentSummary(studentId) {
  return apiFetch(`/students/${studentId}/summary`);
}

// ── School / Goal endpoints ────────────────────────────────────────────────────

/** GET /schools/{id}/goal — current goal with progress */
export async function apiSchoolGoal(schoolId) {
  return apiFetch(`/schools/${schoolId}/goal`);
}

/** GET /impact/school/{id} — total CO2 and breakdown by action type */
export async function apiSchoolImpact(schoolId) {
  return apiFetch(`/impact/school/${schoolId}`);
}

// ── React hooks (useState/useEffect imported at top of file) ────────────────────

/**
 * Fetches GET /students/{id}/summary and returns live gamification state.
 *
 * Returns:
 *  {
 *    loading, error,
 *    points, level, levelName, levelIcon, streakWeeks, progressPercent,
 *    pointsToNext, nextLevelName, co2_total, badges: string[],
 *    pendingCount
 *  }
 */
export function useStudentSummary(studentId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) { setLoading(false); return; }
    setLoading(true);
    apiStudentSummary(studentId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [studentId]);

  // Shape the raw backend response into the convenience fields the UI uses.
  // Backend shape (from gamification_agent.py):
  // { student_id, points, level, level_name, streak_weeks, co2_total,
  //   badges: ["first_tree", ...], pending_count }
  if (!data) return { loading, error, points: 0, level: 1, levelName: 'Seedling', levelIcon: '🌱', streakWeeks: 0, progressPercent: 0, pointsToNext: 50, nextLevelName: 'Sapling', co2_total: 0, badges: [], pendingCount: 0 };

  const LEVEL_ICONS = { 1: '🌱', 2: '🌿', 3: '🌳', 4: '🌲', 5: '🏞️' };
  const LEVEL_NAMES = { 1: 'Seedling', 2: 'Sapling', 3: 'Tree', 4: 'Grove', 5: 'Forest' };
  const LEVEL_THRESHOLDS = [0, 0, 51, 151, 351, 701];
  const levelNum = data.level || 1;
  const nextThreshold = LEVEL_THRESHOLDS[Math.min(levelNum + 1, 5)] || LEVEL_THRESHOLDS[5];
  const currentThreshold = LEVEL_THRESHOLDS[levelNum] || 0;
  const pts = data.points || 0;
  const progressPercent = levelNum >= 5 ? 100 : Math.min(100, Math.round(((pts - currentThreshold) / (nextThreshold - currentThreshold)) * 100));
  const pointsToNext = levelNum >= 5 ? 0 : Math.max(0, nextThreshold - pts);

  return {
    loading,
    error,
    points: pts,
    level: levelNum,
    levelName: data.level_name || LEVEL_NAMES[levelNum] || 'Seedling',
    levelIcon: LEVEL_ICONS[levelNum] || '🌱',
    streakWeeks: data.streak_weeks || 0,
    progressPercent,
    pointsToNext,
    nextLevelName: LEVEL_NAMES[Math.min(levelNum + 1, 5)] || 'Forest',
    co2_total: data.co2_total || 0,
    badges: Array.isArray(data.badges) ? data.badges : [],
    pendingCount: data.pending_count || 0,
  };
}

/**
 * Fetches GET /schools/{id}/goal and returns live goal progress.
 *
 * Returns: { loading, error, targetKg, currentKg, percent, title, description }
 */
export function useSchoolGoal(schoolId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!schoolId) { setLoading(false); return; }
    setLoading(true);
    apiSchoolGoal(schoolId)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [schoolId]);

  // Backend shape (from main.py GET /schools/{id}/goal):
  // { school_id, goal_kg, current_kg, percent, title, description }
  const targetKg  = data?.goal_kg    || data?.target_kg || 500;
  const currentKg = data?.current_kg || 0;
  return {
    loading,
    error,
    targetKg,
    currentKg: Number(currentKg.toFixed(1)),
    percent: data?.percent ?? Math.min(100, Math.round((currentKg / targetKg) * 100)),
    title: data?.title || 'Campus Rooftop Solar Panel #1',
    description: data?.description || '',
  };
}

// ── Leaderboard ───────────────────────────────────────────────────────────────

/**
 * GET /leaderboard/{school_id}
 * @param {string} schoolId
 * @param {'class'|'house'|'student'} group
 * @param {number} limit
 */
export async function apiLeaderboard(schoolId, group = 'class', limit = 20) {
  return apiFetch(`/leaderboard/${schoolId}?group=${group}&limit=${limit}`);
}

// ── Schools ───────────────────────────────────────────────────────────────────
export async function apiListSchools() {
  return apiFetch('/schools');
}
