/**
 * useSubmissions — fetches submissions from the FastAPI backend and provides
 * helpers for adding, reviewing, and exporting them.
 *
 * Replaces the previous Supabase-based implementation.
 * The data shapes returned by the backend are expected to match the field
 * names already used throughout the app (id, student_name, student_email,
 * activity, quantity, unit, co2_saved, points, location_type, latitude,
 * longitude, distance_meters, photo_hash, trust_score, status, reviewed_by,
 * reviewed_at, note, created_at, student_class, student_house).
 */

import { useState, useEffect, useCallback } from 'react';
import {
  apiGetSubmissions,
  apiSubmitAction,
  apiReviewSubmission,
} from './api';
import {
  EMISSION_FACTORS,
  REGISTERED_SCHOOL,
  calculateHaversineDistance,
  evaluateTrustScore,
  calculateCarbonSavings,
  calculateEcoPoints,
} from './constants';

export function useSubmissions(token) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    if (!token) {
      setSubmissions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await apiGetSubmissions(token);
      // Normalise class/house if they arrive embedded in a note string
      const enriched = (data || []).map((s) => {
        let student_class = s.student_class || 'Class 11-A';
        let student_house = s.student_house || 'Terra';
        if (s.note && s.note.includes('[Class:')) {
          const classMatch = s.note.match(/\[Class:\s*([^|\]]+)/);
          const houseMatch = s.note.match(/House:\s*([^\]]+)/);
          if (classMatch) student_class = classMatch[1].trim();
          if (houseMatch) student_house = houseMatch[1].trim().replace(' House', '');
        }
        return { ...s, student_class, student_house };
      });
      setSubmissions(enriched);
    } catch (err) {
      console.error('Error loading submissions:', err);
      setError(err.message || 'Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  /**
   * Add a new student submission.
   *
   * `file` MUST be the original File object from the <input type="file"> element
   * so the backend can receive the image binary over multipart/form-data.
   *
   * Client-side trust scoring and carbon calculations still run before sending
   * so the success screen can show instant feedback.
   */
  const addSubmission = async ({
    user,
    activityId,
    quantity,
    locationType,
    latitude,
    longitude,
    file,           // raw File object — required for multipart upload
    photoHash,
    note = '',
    capturedTime,
  }) => {
    const numQuantity = Number(quantity);
    const distanceMeters = calculateHaversineDistance(
      latitude,
      longitude,
      REGISTERED_SCHOOL.latitude,
      REGISTERED_SCHOOL.longitude,
    );
    const trustEval = evaluateTrustScore({
      locationType,
      distanceMeters,
      hoursAgo: 0.2,
    });
    const co2Saved = calculateCarbonSavings(activityId, numQuantity);
    const points = calculateEcoPoints(co2Saved);

    const fields = {
      activity: activityId,
      quantity: numQuantity,
      unit: EMISSION_FACTORS[activityId]?.unit || 'units',
      co2_saved: co2Saved,
      points,
      location_type: locationType,
      latitude: Number(latitude),
      longitude: Number(longitude),
      distance_meters: distanceMeters,
      photo_hash: photoHash,
      trust_score: trustEval.score,
      status: trustEval.status,
      note: note
        ? `${note} [Class: ${user?.studentClass || user?.student_class || 'Class 11-A'} | House: ${user?.studentHouse || user?.student_house || 'Terra'}]`
        : `[Class: ${user?.studentClass || user?.student_class || 'Class 11-A'} | House: ${user?.studentHouse || user?.student_house || 'Terra'}]`,
      captured_at: capturedTime || new Date().toISOString(),
    };

    const result = await apiSubmitAction({ file, fields, token });
    await fetchSubmissions();
    return result;
  };

  /**
   * Admin/teacher review action.
   * decision: 'approve' | 'reject'
   */
  const reviewSubmission = async (id, decision, reviewerName = 'School Admin') => {
    const result = await apiReviewSubmission(id, decision, reviewerName, token);
    await fetchSubmissions();
    return result;
  };

  // Export CSV compliance report from in-memory submissions
  const exportComplianceCSV = () => {
    if (!submissions || submissions.length === 0) {
      alert('No recorded submissions available to export yet.');
      return;
    }

    const headers = [
      'Action ID',
      'Student Name',
      'Student Email',
      'Activity',
      'Quantity',
      'Unit',
      'CO2 Saved (kg)',
      'EcoPoints',
      'Location Type',
      'Latitude',
      'Longitude',
      'Distance to School (m)',
      'Photo Evidence ID',
      'Confidence Score (0-1)',
      'Verification Status',
      'Reviewer',
      'Recorded Timestamp',
    ];

    const rows = submissions.map((sub) => [
      sub.id,
      `"${sub.student_name}"`,
      sub.student_email,
      sub.activity,
      sub.quantity,
      sub.unit,
      sub.co2_saved,
      sub.points,
      sub.location_type,
      sub.latitude,
      sub.longitude,
      sub.distance_meters,
      sub.photo_hash,
      sub.trust_score,
      sub.status,
      `"${sub.reviewed_by || 'Pending Review'}"`,
      sub.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `EcoMesh_Verified_Carbon_Ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Derived aggregates computed from in-memory data (same as before)
  const verifiedOnly = submissions.filter((s) => s.status === 'verified');
  const reviewOnly = submissions.filter((s) => s.status === 'review');

  const totalCO2 = Number(
    verifiedOnly.reduce((acc, curr) => acc + (Number(curr.co2_saved) || 0), 0).toFixed(2),
  );
  const totalActions = verifiedOnly.length;
  const totalPoints = verifiedOnly.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);
  const totalPendingReviews = reviewOnly.length;

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
      categoryMap[s.activity].co2 += Number(s.co2_saved) || 0;
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
