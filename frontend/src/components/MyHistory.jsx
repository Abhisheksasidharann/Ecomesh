import React, { useState } from 'react';
import { EMISSION_FACTORS } from '../lib/constants';
import { Camera, CheckCircle2, Clock, XCircle, MapPin, Sparkles, Eye, Info, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';

export default function MyHistory({ submissions = [], onNavigateUpload, onRefresh }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // GET /my/submissions already returns only this student's data — no client-side filter needed
  const mySubmissions = submissions;

  const filtered = mySubmissions.filter((sub) => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const verifiedOnly = mySubmissions.filter((s) => s.status === 'verified');
  const reviewOnly = mySubmissions.filter((s) => s.status === 'review' || s.status === 'pending');

  const verifiedCO2 = verifiedOnly.reduce((acc, curr) => acc + (Number(curr.co2_saved) || 0), 0).toFixed(1);
  const verifiedPoints = verifiedOnly.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);
  const pendingPoints = reviewOnly.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);

  // Friendly human explanation for each verification state
  const getFriendlyStatus = (sub) => {
    if (sub.status === 'verified') {
      return {
        label: 'Verified on Campus',
        badgeClass: 'verified',
        icon: <CheckCircle2 size={14} />,
        friendlyText: sub.ai_reason || 'Verified on campus grounds by EcoMesh multi-signal geofence & image analysis.',
        color: '#059669',
        bg: '#ecfdf5',
        border: '#a7f3d0',
      };
    }
    if (sub.status === 'review') {
      return {
        label: 'Under Teacher Review',
        badgeClass: 'review',
        icon: <Clock size={14} />,
        friendlyText: sub.ai_reason || 'Under review: Submitted from home / off-campus bounds. Your school teacher will verify this shortly.',
        color: '#b45309',
        bg: '#fffbeb',
        border: '#fde68a',
      };
    }
    if (sub.status === 'rejected') {
      return {
        label: 'Action Rejected',
        badgeClass: 'rejected',
        icon: <XCircle size={14} />,
        friendlyText: sub.ai_reason || 'Rejected: Image evidence was unclear or detected outside allowable geographic parameters.',
        color: '#e11d48',
        bg: '#fff1f2',
        border: '#fecdd3',
      };
    }
    return {
      label: 'Verification Pending',
      badgeClass: 'review',
      icon: <Clock size={14} />,
      friendlyText: 'Verification pending: AI image authentication and duplicate hash check queued.',
      color: '#0284c7',
      bg: '#f0f9ff',
      border: '#bae6fd',
    };
  };

  return (
    <div className="page-container gradient-mesh">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            borderRadius: '9999px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
            border: '1px solid #a7f3d0',
          }}>
            <Camera size={16} />
            <span>My Verified Submissions</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            My Submissions & Status
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '4px' }}>
            Track the exact review status of every action you logged, with friendly AI explanations and points breakdown.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Refresh Status button — polls GET /my/submissions so pending items update */}
          <button
            onClick={async () => {
              if (!onRefresh) return;
              setIsRefreshing(true);
              try { await onRefresh(); } finally { setIsRefreshing(false); }
            }}
            className="btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', fontSize: '0.88rem' }}
            title="Check for status updates on pending submissions"
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }} />
            {isRefreshing ? 'Checking...' : 'Check Status'}
          </button>

          <button onClick={onNavigateUpload} className="btn-primary">
            <Camera size={18} />
            Submit Action
          </button>
        </div>
      </div>

      {/* Points & Verification Breakdown Banner */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '18px',
        marginBottom: '28px',
      }}>
        <div className="stat-card" style={{ padding: '20px', border: '1px solid #a7f3d0', backgroundColor: '#f0fdf4' }}>
          <div style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700, textTransform: 'uppercase' }}>VERIFIED ECOPOINTS</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', marginTop: '4px' }}>
            +{verifiedPoints} pts
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Credited directly to your profile
          </div>
        </div>

        <div className="stat-card" style={{ padding: '20px', border: '1px solid #fed7aa', backgroundColor: '#fff7ed' }}>
          <div style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 700, textTransform: 'uppercase' }}>PENDING POINTS</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ea580c', marginTop: '4px' }}>
            +{pendingPoints} pts
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Will unlock upon teacher confirmation
          </div>
        </div>

        <div className="stat-card" style={{ padding: '20px', border: '1px solid #bae6fd', backgroundColor: '#f0f9ff' }}>
          <div style={{ fontSize: '0.78rem', color: '#0369a1', fontWeight: 700, textTransform: 'uppercase' }}>VERIFIED CO₂ PREVENTED</div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#0284c7', marginTop: '4px' }}>
            {verifiedCO2} kg
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
            Based on official IPCC baseline
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '28px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '14px',
      }}>
        {[
          { id: 'all', label: `All Actions (${mySubmissions.length})` },
          { id: 'verified', label: `Verified (${verifiedOnly.length})` },
          { id: 'review', label: `Under Review (${reviewOnly.length})` },
          { id: 'rejected', label: `Rejected (${mySubmissions.filter((s) => s.status === 'rejected').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              border: filter === tab.id ? '2px solid #10b981' : '1px solid #e2e8f0',
              backgroundColor: filter === tab.id ? '#ecfdf5' : '#ffffff',
              color: filter === tab.id ? '#065f46' : '#64748b',
              fontWeight: filter === tab.id ? 700 : 500,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'all 0.18s ease',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid of Action Cards with Photos */}
      {filtered.length === 0 ? (
        <div className="cs-card" style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '9999px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Camera size={32} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
            No submissions in this filter
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#64748b', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
            You haven't logged any actions in this category yet. Submit photo proof to earn points and help your school goal!
          </p>
          <button onClick={onNavigateUpload} className="btn-primary">
            Submit Your Action
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))',
          gap: '24px',
        }}>
          {filtered.map((sub) => {
            const factor = EMISSION_FACTORS[sub.activity] || {};
            const friendly = getFriendlyStatus(sub);

            return (
              <div key={sub.id} className="stat-card" style={{ padding: '22px' }}>
                {/* Photo Preview */}
                <div
                  onClick={() => sub.photo_url && setSelectedPhoto(sub.photo_url)}
                  style={{
                    height: '190px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: '#0f172a',
                    marginBottom: '16px',
                    position: 'relative',
                    cursor: sub.photo_url ? 'pointer' : 'default',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  {sub.photo_url ? (
                    <>
                      <img
                        src={sub.photo_url}
                        alt="Evidence"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '10px',
                        right: '10px',
                        backgroundColor: 'rgba(0,0,0,0.65)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <Eye size={12} />
                        Enlarge photo
                      </div>
                    </>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: '#94a3b8',
                      fontSize: '0.9rem',
                    }}>
                      Photo Evidence on File
                    </div>
                  )}

                  {/* Top-Left Status Pill */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    <span className={`status-badge ${friendly.badgeClass}`} style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }}>
                      {friendly.icon}
                      {friendly.label}
                    </span>
                  </div>
                </div>

                {/* Title & Quantity */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                    {factor.name || sub.activity}
                  </h3>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                    {sub.quantity} {sub.unit}
                  </span>
                </div>

                {/* Friendly Reason Callout Box */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: friendly.bg,
                  border: `1px solid ${friendly.border}`,
                  color: friendly.color,
                  fontSize: '0.82rem',
                  lineHeight: 1.45,
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}>
                  <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Verification Reason:</strong> {friendly.friendlyText}
                  </div>
                </div>

                {/* Points & Carbon Impact */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '14px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>CO₂ PREVENTED</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#059669' }}>
                      {sub.co2_saved} kg
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>
                      {sub.status === 'verified' ? 'VERIFIED POINTS' : 'PENDING POINTS'}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: sub.status === 'verified' ? '#059669' : '#d97706' }}>
                      +{sub.points} pts
                    </div>
                  </div>
                </div>

                {/* Location & Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#0d9488" />
                    <span>{sub.location_type === 'school' ? 'At School Campus' : 'At Home'}</span>
                  </div>
                  <div>
                    {new Date(sub.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enlarged Photo Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.82)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '840px',
              maxHeight: '90vh',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <img
              src={selectedPhoto}
              alt="Enlarged action evidence"
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div style={{ padding: '16px 20px', textAlign: 'right', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
              <button onClick={() => setSelectedPhoto(null)} className="btn-secondary" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
                Close Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
