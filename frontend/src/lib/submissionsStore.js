import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabaseClient';
import {
  EMISSION_FACTORS,
  REGISTERED_SCHOOL,
  calculateHaversineDistance,
  evaluateTrustScore,
  calculateCarbonSavings,
  calculateEcoPoints,
} from './constants';

export function useSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: fetchErr } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error loading submissions from Supabase:', err);
      setError(err.message || 'Failed to fetch verified submissions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();

    // Subscribe to live changes in submissions table
    const channel = supabase
      .channel('public:submissions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submissions' }, () => {
        fetchSubmissions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchSubmissions]);

  // Insert real student submission into Supabase
  const addSubmission = async ({
    user,
    activityId,
    quantity,
    locationType,
    latitude,
    longitude,
    photoHash,
    photoUrl = '',
    note = '',
  }) => {
    // 1. Cryptographic fraud detection: Check if this exact photo hash already exists in database
    const { data: existingHash, error: hashErr } = await supabase
      .from('submissions')
      .select('id')
      .eq('photo_hash', photoHash)
      .limit(1);

    if (hashErr) console.warn('Hash verification check warning:', hashErr);
    if (existingHash && existingHash.length > 0) {
      throw new Error('Duplicate photo detected. This exact image was already submitted in a previous climate action.');
    }

    // 2. Geofence distance calculation
    const distanceMeters = calculateHaversineDistance(
      latitude,
      longitude,
      REGISTERED_SCHOOL.latitude,
      REGISTERED_SCHOOL.longitude
    );

    // 3. Multi-signal trust score evaluation
    const trustEval = evaluateTrustScore({
      locationType,
      distanceMeters,
      hoursAgo: 0.2,
    });

    const numQuantity = Number(quantity);
    const co2Saved = calculateCarbonSavings(activityId, numQuantity);
    const points = calculateEcoPoints(co2Saved);
    const newId = `ACT-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const record = {
      id: newId,
      user_id: user?.id || null,
      student_name: user?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Youth Participant',
      student_email: user?.email || 'student@ecomesh.org',
      activity: activityId,
      quantity: numQuantity,
      unit: EMISSION_FACTORS[activityId]?.unit || 'units',
      co2_saved: co2Saved,
      points: points,
      location_type: locationType,
      latitude: Number(latitude),
      longitude: Number(longitude),
      distance_meters: distanceMeters,
      photo_url: photoUrl,
      photo_hash: photoHash,
      trust_score: trustEval.score,
      status: trustEval.status,
      reviewed_by: trustEval.status === 'verified' ? 'Automated Verification Pipeline' : null,
      reviewed_at: trustEval.status === 'verified' ? new Date().toISOString() : null,
      note: note || '',
      created_at: new Date().toISOString(),
    };

    const { data, error: insertErr } = await supabase
      .from('submissions')
      .insert([record])
      .select()
      .single();

    if (insertErr) throw insertErr;

    // Refresh state
    await fetchSubmissions();
    return data || record;
  };

  // Human-in-the-loop review action with double-count conflict prevention
  const reviewSubmission = async (id, decision, reviewerName = 'School Admin') => {
    // Check current status in database
    const { data: existing, error: checkErr } = await supabase
      .from('submissions')
      .select('status')
      .eq('id', id)
      .single();

    if (checkErr) throw checkErr;
    if (!existing) throw new Error('Submission not found in registry.');

    if (existing.status !== 'review') {
      const err = new Error('HTTP 409 Conflict: This submission was already finalized by another reviewer.');
      err.statusCode = 409;
      throw err;
    }

    const { data, error: updateErr } = await supabase
      .from('submissions')
      .update({
        status: decision === 'approve' ? 'verified' : 'rejected',
        reviewed_by: reviewerName,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    await fetchSubmissions();
    return data;
  };

  // Export official CSV compliance report from live database records
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

  // Live aggregated metrics computed from verified database rows
  const verifiedOnly = submissions.filter((s) => s.status === 'verified');
  const reviewOnly = submissions.filter((s) => s.status === 'review');

  const totalCO2 = Number(
    verifiedOnly.reduce((acc, curr) => acc + (Number(curr.co2_saved) || 0), 0).toFixed(2)
  );
  const totalActions = verifiedOnly.length;
  const totalPoints = verifiedOnly.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);
  const totalPendingReviews = reviewOnly.length;

  // Category distribution for Recharts
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
    .map((item) => ({
      ...item,
      co2: Number(item.co2.toFixed(2)),
    }))
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
