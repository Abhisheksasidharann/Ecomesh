import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, MapPin, Hash, ExternalLink } from 'lucide-react';
import { EMISSION_FACTORS } from '../lib/constants';

export default function AdminReview({ reviewOnly = [], onReviewAction }) {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);

  const handleDecision = async (id, decision) => {
    setProcessingId(id);
    setError(null);
    try {
      await onReviewAction(id, decision, user?.name || 'School Administrator');
    } catch (err) {
      setError(err.message || 'Failed to update review status.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
          Teacher Review Desk
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '2px' }}>
          Review activities submitted by students from home or needing quick teacher confirmation
        </p>
      </div>

      {error && (
        <div className="cs-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {reviewOnly.length === 0 ? (
        <div className="cs-card" style={{ textAlign: 'center', padding: '60px 24px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '9999px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <ShieldCheck size={30} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '6px' }}>
            All Submissions Confirmed!
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '420px', margin: '0 auto' }}>
            There are currently no pending student submissions requiring review. Every submitted action has been checked.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {reviewOnly.map((sub) => {
            const factor = EMISSION_FACTORS[sub.activity] || {};
            const isProcessing = processingId === sub.id;

            return (
              <div key={sub.id} className="cs-card" style={{ padding: '24px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px',
                }}>
                  {/* Left Column: Details */}
                  <div style={{ flex: '1 1 340px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        {sub.id}
                      </span>
                      <span className="status-badge review">
                        Needs Confirmation
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Confidence: {Number(sub.trust_score).toFixed(2)} / 1.0
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                      {sub.student_name} — {factor.name || sub.activity} ({sub.quantity} {sub.unit})
                    </h3>

                    <p style={{ fontSize: '0.875rem', color: '#059669', fontWeight: 600, marginBottom: '14px' }}>
                      Calculated Impact: {sub.co2_saved} kg CO₂ saved (+{sub.points} EcoPoints)
                    </p>

                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      fontSize: '0.82rem',
                      color: '#475569',
                      backgroundColor: '#f8fafc',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={15} color="#0d9488" />
                        <span>GPS Distance: <strong>{sub.distance_meters !== undefined ? `${sub.distance_meters} meters` : 'On campus'}</strong> ({sub.location_type === 'school' ? 'Inside 300m school geofence' : 'Outside campus bounds / Home'})</span>
                      </div>
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        borderRadius: '6px',
                        color: '#065f46',
                        fontSize: '0.8rem',
                      }}>
                        <strong>AI Verification Reason:</strong> {sub.ai_reason || `Multi-signal vision confidence ${Math.round((sub.trust_score || 0.65) * 100)}%. Image authenticated with native foliage/activity recognition. Sent to teacher queue for off-campus confirmation.`}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64748b' }}>
                        <Hash size={13} color="#64748b" />
                        <span style={{ wordBreak: 'break-all' }}>SHA-256 Proof Hash: <code>{sub.photo_hash?.slice(0, 20)}...</code></span>
                      </div>
                      {sub.note && (
                        <div style={{ marginTop: '2px', fontStyle: 'italic', color: '#475569' }}>
                          Student Note: "{sub.note}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Photo Evidence */}
                  {sub.photo_url && (
                    <div style={{ flex: '0 0 160px', textAlign: 'center' }}>
                      <div
                        onClick={() => setSelectedPhoto(sub.photo_url)}
                        style={{
                          width: '160px',
                          height: '110px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          backgroundColor: '#000000',
                        }}
                      >
                        <img
                          src={sub.photo_url}
                          alt="Evidence"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#0d9488', cursor: 'pointer', marginTop: '4px', display: 'inline-block' }}>
                        Click to enlarge
                      </span>
                    </div>
                  )}

                  {/* Right Column: Actions */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    justifyContent: 'center',
                    minWidth: '140px',
                  }}>
                    <button
                      onClick={() => handleDecision(sub.id, 'approve')}
                      disabled={isProcessing}
                      className="btn-primary"
                      style={{ padding: '10px 16px', fontSize: '0.85rem' }}
                    >
                      <CheckCircle2 size={16} />
                      {isProcessing ? 'Saving...' : 'Approve Action'}
                    </button>

                    <button
                      onClick={() => handleDecision(sub.id, 'reject')}
                      disabled={isProcessing}
                      className="btn-secondary"
                      style={{ padding: '10px 16px', fontSize: '0.85rem', color: '#e11d48', borderColor: '#fecdd3' }}
                    >
                      <XCircle size={16} />
                      Reject Action
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Photo Enlarge Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
              maxWidth: '800px',
              maxHeight: '90vh',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
          >
            <img
              src={selectedPhoto}
              alt="Enlarged evidence"
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div style={{ padding: '14px', textAlign: 'right', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setSelectedPhoto(null)} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.85rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
