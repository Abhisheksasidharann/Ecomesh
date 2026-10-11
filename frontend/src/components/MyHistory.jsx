import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { EMISSION_FACTORS } from '../lib/constants';
import { Camera, CheckCircle2, Clock, XCircle, MapPin, Sparkles, Eye, Download } from 'lucide-react';

export default function MyHistory({ submissions = [], onNavigateUpload }) {
  const { user } = useAuth();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [filter, setFilter] = useState('all');

  const mySubmissions = submissions.filter(
    (s) => s.student_email === user?.email || s.user_id === user?.id
  );

  const filtered = mySubmissions.filter((sub) => {
    if (filter === 'all') return true;
    return sub.status === filter;
  });

  const verifiedCO2 = mySubmissions
    .filter((s) => s.status === 'verified')
    .reduce((acc, curr) => acc + (Number(curr.co2_saved) || 0), 0)
    .toFixed(1);

  return (
    <div className="page-container gradient-mesh">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
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
            <span>My Personal Action Proofs</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            My Activity History
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '4px' }}>
            Browse your logged green habits, uploaded photo proofs, and teacher confirmation statuses.
          </p>
        </div>

        <button onClick={onNavigateUpload} className="btn-primary">
          <Camera size={18} />
          Log New Green Action
        </button>
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
          { id: 'all', label: `All Proofs (${mySubmissions.length})` },
          { id: 'verified', label: `Verified (${mySubmissions.filter((s) => s.status === 'verified').length})` },
          { id: 'review', label: `In Review (${mySubmissions.filter((s) => s.status === 'review').length})` },
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
            No action photos found
          </h2>
          <p style={{ fontSize: '0.925rem', color: '#64748b', marginBottom: '24px', maxWidth: '420px', margin: '0 auto 24px' }}>
            You haven't logged any green actions in this category yet. Take photo proof of your next eco-habit!
          </p>
          <button onClick={onNavigateUpload} className="btn-primary">
            Log Your First Action
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {filtered.map((sub) => {
            const factor = EMISSION_FACTORS[sub.activity] || {};
            return (
              <div key={sub.id} className="stat-card" style={{ padding: '20px' }}>
                {/* Photo Header */}
                <div
                  onClick={() => sub.photo_url && setSelectedPhoto(sub.photo_url)}
                  style={{
                    height: '200px',
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
                        Click to view
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
                      Photo Evidence On File
                    </div>
                  )}

                  {/* Status Badge in Photo Top Left */}
                  <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
                    {sub.status === 'verified' && (
                      <span className="status-badge verified" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        <CheckCircle2 size={13} />
                        Verified
                      </span>
                    )}
                    {sub.status === 'review' && (
                      <span className="status-badge review" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        <Clock size={13} />
                        Waiting for Teacher
                      </span>
                    )}
                    {sub.status === 'rejected' && (
                      <span className="status-badge rejected" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        <XCircle size={13} />
                        Rejected
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                    {factor.name || sub.activity}
                  </h3>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {sub.quantity} {sub.unit}
                  </span>
                </div>

                {/* Impact Badges */}
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
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>CARBON SAVED</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669' }}>
                      {sub.co2_saved} kg CO₂
                    </div>
                  </div>
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>POINTS</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706' }}>
                      +{sub.points} pts
                    </div>
                  </div>
                </div>

                {/* Location & Time */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color="#0d9488" />
                    <span>{sub.location_type === 'school' ? 'At School Grounds' : 'At Home'}</span>
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
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
