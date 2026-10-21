import { useState, useEffect, useCallback } from 'react';
import {
  apiCreateSubmission,
  apiMySubmissions,
  apiReviewQueue,
  apiReviewSubmission,
} from './api';
import {
  EMISSION_FACTORS,
  FRONTEND_ACTION_TYPE,
  BACKEND_ACTION_TYPE,
} from './constants';

// ── Normalise a raw backend submission doc ────────────────────────────────────
// The backend returns action_type, impact_kg_co2e, points_awarded, status, etc.
// We map them to the field names the UI components were built with so we don't
// have to touch every JSX file for data-field renames.
function normalise(s) {
  // Map backend action_type key → frontend short key (e.g. "waste_segregation" → "waste")
  const activityFe = FRONTEND_ACTION_TYPE[s.action_type] || s.action_type;
  const factor = EMISSION_FACTORS[activityFe] || {};

  // Backend photo_url is a relative path like "/uploads/<file>" — prefix the API base
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const photoUrl = s.photo_url
    ? s.photo_url.startsWith('http') ? s.photo_url : `${API_BASE}${s.photo_url}`
    : '';

  // Friendly status: backend uses "needs_review"; the UI was built with "review"
  const status =
    s.status === 'needs_review' ? 'review' :
    s.status === 'verified'     ? 'verified' :
    s.status === 'rejected'     ? 'rejected' :
    'pending';

  // AI reason text from verification pipeline
  const ai_reason =
    Array.isArray(s.verification_reasons) ? s.verification_reasons.join('. ') : '';

  return {
    // ── Identity ──
    id: s.id || String(s._id),
    student_id: s.student_id,
    // Aliases used in various components
    user_id: s.student_id,
    student_email: s.student_id,
    student_name: s.student_name || s.student_id,

    // ── Action metadata ──
    activity: activityFe,           // short frontend key
    action_type: s.action_type,     // original backend key
    quantity: s.quantity ?? 1,
    unit: factor.unit || 'units',

    // ── Impact ──
    co2_saved: s.impact_kg_co2e ?? 0,
    impact_kg_co2e: s.impact_kg_co2e ?? 0,
    points: s.points_awarded ?? 0,
    points_awarded: s.points_awarded ?? 0,

    // ── Location ──
    location_type: s.context || 'school',
    latitude: s.location?.lat ?? 0,
    longitude: s.location?.lng ?? 0,
    distance_meters: null,          // not returned from backend

    // ── Media ──
    photo_url: photoUrl,
    photo_hash: s.photo_hash || '',

    // ── Verification ──
    status,
    trust_score: s.trust_score ?? null,
    reviewed_by: s.reviewed_by || null,
    reviewed_at: s.reviewed_at || null,
    ai_reason,
    verification_reasons: s.verification_reasons || [],

    // ── Timestamps ──
    created_at: s.created_at || new Date().toISOString(),

    // ── Class / house (embedded in notes for legacy; backend stores on student profile) ──
    student_class: s.student_class || '',
    student_house: s.student_house || '',
  };
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useSubmissions(role = 'student') {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Students fetch their own; teachers/admins fetch the review queue
  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let raw;
      if (role === 'student') {
        raw = await apiMySubmissions(100);
      } else {
        // teacher / admin: pull review queue + (if the backend ever adds GET /submissions) fall back
        raw = await apiReviewQueue();
      }

      setSubmissions((raw || []).map(normalise));
    } catch (err) {
      console.error('Error loading submissions from backend:', err);
      setError(err.message || 'Failed to fetch submissions');
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // ── Add a new submission ────────────────────────────────────────────────────
  /**
   * @param {object} opts
   * @param {object} opts.user          - from useAuth()
   * @param {string} opts.activityId    - frontend short key e.g. 'waste'
   * @param {number} opts.quantity
   * @param {string} opts.locationType  - 'school' | 'home'
   * @param {number} opts.latitude
   * @param {number} opts.longitude
   * @param {string} opts.capturedTime  - ISO string
   * @param {File}   opts.file          - actual File object from <input>
   */
  const addSubmission = async ({
    user,
    activityId,
    quantity,
    locationType,
    latitude,
    longitude,
    capturedTime,
    file,
  }) => {
    if (!file) throw new Error('A photo file is required to submit an action.');

    const backendActionType = BACKEND_ACTION_TYPE[activityId];
    if (!backendActionType) throw new Error(`Unknown action type: ${activityId}`);

    const result = await apiCreateSubmission({
      student_id: user.student_id || user.id,
      school_id: user.school_id,
      action_type: backendActionType,
      context: locationType,
      latitude,
      longitude,
      captured_at: capturedTime || new Date().toISOString(),
      quantity,
      photo: file,
    });

    // Refresh the list after a successful submission
    await fetchSubmissions();
    return result; // { id, status: "pending" }
  };

  // ── Review a submission (teacher/admin) ────────────────────────────────────
  const reviewSubmission = async (submissionId, decision, reviewerName = 'School Admin') => {
    const result = await apiReviewSubmission(
      submissionId,
      decision === 'approve' ? 'approve' : 'reject',
      reviewerName,
    );
    await fetchSubmissions();
    return result;
  };

  // ── Export CSV from current in-memory list ─────────────────────────────────
  const exportComplianceCSV = () => {
    if (!submissions || submissions.length === 0) {
      alert('No recorded submissions available to export yet.');
      return;
    }

    const headers = [
      'Action ID',
      'Student ID',
      'Activity',
      'Quantity',
      'Unit',
      'CO2 Saved (kg)',
      'EcoPoints',
      'Location Type',
      'Latitude',
      'Longitude',
      'Confidence Score',
      'Verification Status',
      'Reviewer',
      'Recorded Timestamp',
    ];

    const rows = submissions.map((sub) => [
      sub.id,
      sub.student_id,
      sub.action_type,
      sub.quantity,
      sub.unit,
      sub.co2_saved,
      sub.points,
      sub.location_type,
      sub.latitude,
      sub.longitude,
      sub.trust_score ?? '',
      sub.status,
      `"${sub.reviewed_by || 'Pending Review'}"`,
      sub.created_at,
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EcoMesh_Ledger_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const verifiedOnly = submissions.filter((s) => s.status === 'verified');
  const reviewOnly   = submissions.filter((s) => s.status === 'review');
  const pendingOnly  = submissions.filter((s) => s.status === 'pending');

  const totalCO2 = Number(
    verifiedOnly.reduce((acc, s) => acc + (s.co2_saved || 0), 0).toFixed(2)
  );
  const totalActions = verifiedOnly.length;
  const totalPoints  = verifiedOnly.reduce((acc, s) => acc + (s.points || 0), 0);
  const totalPendingReviews = reviewOnly.length + pendingOnly.length;

  // Category breakdown for charts
  const categoryMap = {};
  Object.keys(EMISSION_FACTORS).forEach((cat) => {
    categoryMap[cat] = {
      category: EMISSION_FACTORS[cat].name,
      co2: 0,
      count: 0,
      color: EMISSION_FACTORS[cat].color,
    };
  });
  verifiedOnly.forEach((s) => {
    if (categoryMap[s.activity]) {
      categoryMap[s.activity].co2 += s.co2_saved || 0;
      categoryMap[s.activity].count += 1;
    }
  });
  const categoryData = Object.values(categoryMap)
    .map((item) => ({ ...item, co2: Number(item.co2.toFixed(2)) }))
    .filter((item) => item.count > 0 || totalActions === 0);

  return {
    submissions,
    verifiedOnly,
    reviewOnly,
    loading,
    error,
    totalCO2,
    totalActions,
    totalPoints,
    totalPendingReviews,
    categoryData,
    addSubmission,
    reviewSubmission,
    exportComplianceCSV,
    refreshSubmissions: fetchSubmissions,
  };
}
