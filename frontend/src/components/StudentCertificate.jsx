import React, { useRef } from 'react';
import { Award, Download, Share2, CheckCircle, ShieldCheck, Calendar, Sparkles, Building, GraduationCap, Printer } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useStudentSummary } from '../lib/api';

export default function StudentCertificate({ submissions = [] }) {
  const { user } = useAuth();
  const certRef = useRef(null);

  // Live backend summary for accurate CO2/points/level
  const summary = useStudentSummary(user?.student_id);

  const studentName = user?.name || user?.student_id || 'Student';
  const schoolName  = user?.school || 'Model Higher Secondary School';
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // GET /my/submissions already scoped — no extra filter needed
  const studentVerified = submissions.filter((s) => s.status === 'verified');

  // Prefer backend summary values; fall back to local sum
  const studentCO2    = summary.co2_total > 0 ? summary.co2_total : Number(studentVerified.reduce((acc, curr) => acc + (Number(curr.co2_saved) || 0), 0).toFixed(1));
  const studentPoints = summary.points    > 0 ? summary.points    : studentVerified.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);
  const level      = summary.level || (studentCO2 >= 100 ? 5 : studentCO2 >= 50 ? 4 : studentCO2 >= 20 ? 3 : studentCO2 >= 5 ? 2 : 1);
  const levelTitle = level >= 4 ? 'Campus Eco Pioneer' : level >= 3 ? 'Climate Guardian' : level >= 2 ? 'Active Steward' : 'Green Citizen';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="page-container gradient-mesh">
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: '9999px',
            backgroundColor: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#047857',
            fontSize: '0.85rem',
            fontWeight: 700,
            marginBottom: '12px',
          }}>
            <Award size={16} />
            <span>Official Youth Climate Credential</span>
          </div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '8px' }}>
            My School Climate Action Certificate
          </h1>
          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '780px', lineHeight: 1.6 }}>
            Your official, teacher-verified climate credentials recognized for academic credit, college portfolios, and community honors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handlePrint}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 22px' }}
          >
            <Printer size={18} />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Certificate Frame */}
      <div style={{ maxWidth: '940px', margin: '0 auto' }}>
        <div
          ref={certRef}
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            padding: '56px 64px',
            border: '8px double #10b981',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle watermark background */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.03,
            pointerEvents: 'none',
          }}>
            <svg width="450" height="450" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
              <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
            </svg>
          </div>

          {/* Certificate Header */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 20px',
              borderRadius: '9999px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              marginBottom: '16px',
            }}>
              <Sparkles size={18} style={{ color: '#059669' }} />
              <span style={{
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                fontWeight: 800,
                color: '#065f46',
                fontSize: '0.88rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                EcoMesh Certified Youth Climate Action
              </span>
            </div>

            <h2 style={{
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              fontSize: '2.5rem',
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.03em',
              marginBottom: '8px',
            }}>
              Certificate of Environmental Impact
            </h2>
            <p style={{ color: '#64748b', fontSize: '1.05rem', fontStyle: 'italic' }}>
              This certifies that
            </p>
          </div>

          {/* Student Recipient Name */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              fontSize: '2.3rem',
              fontWeight: 800,
              color: '#047857',
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              letterSpacing: '-0.02em',
              borderBottom: '2px solid #a7f3d0',
              display: 'inline-block',
              paddingBottom: '8px',
              minWidth: '340px',
            }}>
              {studentName}
            </div>
            <div style={{ marginTop: '10px', color: '#475569', fontSize: '1.05rem', fontWeight: 600 }}>
              Student at <strong>{schoolName}</strong>
            </div>
          </div>

          {/* Commendation Body */}
          <div style={{
            textAlign: 'center',
            maxWidth: '680px',
            margin: '0 auto 36px',
            color: '#334155',
            fontSize: '1.05rem',
            lineHeight: 1.7,
          }}>
            Has actively demonstrated exceptional commitment to school environmental sustainability by logging, verifying, and contributing to measurable greenhouse gas reductions aligned with <strong>United Nations SDG 13 (Climate Action)</strong> and <strong>SDG 4 (Quality Education)</strong>.
          </div>

          {/* Impact Metrics Badges */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '18px',
            maxWidth: '680px',
            margin: '0 auto 44px',
          }}>
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
                {studentCO2} <span style={{ fontSize: '0.9rem' }}>kg</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                Verified CO₂e Reduced
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#2563eb' }}>
                {studentPoints}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                EcoPoints Accrued
              </div>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '16px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706' }}>
                Level {level}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                {levelTitle}
              </div>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '28px',
            borderTop: '1px solid #e2e8f0',
          }}>
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontFamily: 'cursive',
                fontSize: '1.5rem',
                color: '#1e293b',
                marginBottom: '4px',
              }}>
                Dr. K. Narayanan
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
                Campus Sustainability Coordinator
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{schoolName}</div>
            </div>

            {/* Verification Seal Badge */}
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              border: '3px solid #ffffff',
            }}>
              <ShieldCheck size={26} />
              <span style={{ fontSize: '0.62rem', fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginTop: '2px' }}>
                VERIFIED
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>
                {currentDate}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 700 }}>
                Date of Issue
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                ID: EM-2026-{(user?.id || 'cert').substring(0, 8).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
