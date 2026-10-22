/**
 * Shared API helper for the EcoMesh FastAPI backend.
 *
 * All network calls to the backend go through `apiRequest`.
 * Endpoint helpers below mirror the backend route structure exactly.
 * Do NOT hardcode secrets or expose them in runtime code.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Core fetch wrapper.
 * - Attaches Bearer token when provided.
 * - Sets Content-Type to application/json unless body is FormData.
 * - Throws an Error with the server message on non-2xx responses.
 * - Returns null on 204 No Content.
 */
export async function apiRequest(path, { token, ...options } = {}) {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_URL is not configured. Add it to your .env file.');
  }

  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && options.body != null) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message;
    try {
      const json = await response.json();
      // FastAPI returns { detail: "..." } for most error responses
      message = typeof json.detail === 'string' ? json.detail : JSON.stringify(json.detail);
    } catch {
      message = await response.text().catch(() => '');
    }
    throw new Error(message || `Request failed (${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

// ---------------------------------------------------------------------------
// Auth endpoints
// ---------------------------------------------------------------------------

/**
 * POST /auth/register
 * Body fields must match the backend UserCreate schema.
 */
export function apiRegister({ email, password, name, role, school, studentClass, studentHouse }) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      name,
      role,
      school,
      student_class: studentClass ?? null,
      student_house: studentHouse ?? null,
    }),
  });
}

/**
 * POST /auth/login  (OAuth2 password flow — form-encoded)
 * Returns { access_token, token_type }
 */
export function apiLogin(email, password) {
  const body = new URLSearchParams();
  body.append('username', email.toLowerCase().trim());
  body.append('password', password);

  return apiRequest('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
}

/**
 * GET /auth/me
 * Returns the current user profile from the backend.
 */
export function apiMe(token) {
  return apiRequest('/auth/me', { token });
}

// ---------------------------------------------------------------------------
// Submission endpoints
// ---------------------------------------------------------------------------

/**
 * GET /submissions
 * Returns all submissions (admin / school feed).
 */
export function apiGetSubmissions(token) {
  return apiRequest('/submissions', { token });
}

/**
 * POST /submissions  (multipart/form-data)
 * Passes the raw File object so the backend receives the binary.
 *
 * `fields` is a plain object with string-serialisable values.
 * Field names mirror the backend SubmissionCreate form schema.
 */
export function apiSubmitAction({ file, fields, token }) {
  const formData = new FormData();
  formData.append('file', file);
  for (const [key, value] of Object.entries(fields)) {
    if (value != null) formData.append(key, String(value));
  }
  return apiRequest('/submissions', {
    method: 'POST',
    token,
    body: formData,
  });
}

/**
 * PATCH /submissions/:id/review
 * Admin-only: approve or reject a submission.
 */
export function apiReviewSubmission(id, decision, reviewerName, token) {
  return apiRequest(`/submissions/${id}/review`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ decision, reviewer_name: reviewerName }),
  });
}

// ---------------------------------------------------------------------------
// Leaderboard & school impact endpoints
// ---------------------------------------------------------------------------

/**
 * GET /leaderboard/houses
 * Returns house standings array from live backend data.
 */
export function apiLeaderboardHouses(token) {
  return apiRequest('/leaderboard/houses', { token });
}

/**
 * GET /leaderboard/classes
 * Returns class standings array from live backend data.
 */
export function apiLeaderboardClasses(token) {
  return apiRequest('/leaderboard/classes', { token });
}

/**
 * GET /leaderboard/my-class
 * Returns scoped student standings for the current user's class only.
 */
export function apiLeaderboardMyClass(token) {
  return apiRequest('/leaderboard/my-class', { token });
}

/**
 * GET /school/impact
 * Returns overall school-level impact summary (totalCO2, totalActions, etc.)
 */
export function apiSchoolImpact(token) {
  return apiRequest('/school/impact', { token });
}

/**
 * GET /students/me/summary
 * Returns the current student's personal summary (points, co2, level, etc.)
 */
export function apiStudentSummary(token) {
  return apiRequest('/students/me/summary', { token });
}

// ---------------------------------------------------------------------------
// Missions endpoints
// ---------------------------------------------------------------------------

/**
 * GET /my/missions
 * Returns mission list for the current student with progress, completion, and claimed fields.
 */
export function apiMyMissions(token) {
  return apiRequest('/my/missions', { token });
}

/**
 * POST /my/missions/:missionId/claim
 * Claims the bonus for a completed, unclaimed mission.
 */
export function apiClaimMission(missionId, token) {
  return apiRequest(`/my/missions/${missionId}/claim`, {
    method: 'POST',
    token,
  });
}
