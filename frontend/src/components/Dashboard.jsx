import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  PlusCircle,
  CheckCircle,
  Clock,
  XCircle,
  ShieldCheck,
  Download,
  Award,
  Building2,
  Flame,
  Leaf,
  Car,
  Zap,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { EMISSION_FACTORS, REGISTERED_SCHOOL } from '../lib/constants';

const COLORS = ['#10b981', '#06b6d4', '#f59e0b', '#f97316', '#8b5cf6', '#ec4899'];

export default function Dashboard({
  user,
  activeRole = 'student',
  submissions = [],
  totalCO2 = 0,
  totalActions = 0,
  totalPoints = 0,
  totalPendingReviews = 0,
  categoryData = [],
  onNavigateUpload,
  onNavigateAdmin,
  onNavigateBenefits,
  onExportCSV,
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  // Student-specific metrics
  const mySubmissions = submissions.filter(
    (s) => s.student_email === user?.email || s.user_id === user?.id
  );
  const myVerified = mySubmissions.filter((s) => s.status === 'verified');
  const myCO2 = Number(
    myVerified
      .reduce((acc, curr) => acc + (Number(curr.co2_saved) || 0), 0)
      .toFixed(2)
  );
  const myPoints = myVerified.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);
  const myVerifiedActions = myVerified.length;

  // Real world equivalents calculated from real CO2
  const kmDrivingOffset = Math.round(myCO2 * 4.1);
  const treesEquiv = Math.max(1, Math.round(myCO2 / 10));
  const ledHoursEquiv = Math.round(myCO2 * 65);

  const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="page-container gradient-mesh">
      {/* 1. STUDENT HERO BANNER */}
      {activeRole === 'student' ? (
        <div className="glass-card" style={{
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #064e3b 0%, #047857 55%, #0d9488 100%)',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          padding: '36px 40px',
          boxShadow: '0 20px 45px rgba(6, 78, 59, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
        }}>
          {/* Subtle background glow effect */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '260px',
            height: '260px',
            borderRadius: '9999px',
            background: 'radial-gradient(circle, rgba(52, 211, 153, 0.3) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            position: 'relative',
            zIndex: 2,
          }}>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(255, 255, 255, 0.18)',
                backdropFilter: 'blur(8px)',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: '#d1fae5',
                marginBottom: '14px',
              }}>
                <Sparkles size={15} color="#fde047" />
                <span>Student Climate Champion • {user?.school || REGISTERED_SCHOOL.name}</span>
              </div>

              <h1 style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                color: '#ffffff',
                lineHeight: 1.15,
                marginBottom: '10px',
                letterSpacing: '-0.03em',
              }}>
                Welcome back, {user?.name || 'Abhishek'}! 🌿
              </h1>

              <p style={{ fontSize: '1.05rem', color: '#ecfdf5', maxWidth: '620px', lineHeight: 1.6, marginBottom: '22px' }}>
                You have prevented <strong style={{ color: '#fde047' }}>{myCO2} kg of CO₂</strong> from entering our air.
                Every verified habit helps fund solar power for our school!
              </p>

              {/* Real World Impact Equivalencies */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  fontWeight: 600,
                }}>
                  <Leaf size={16} color="#34d399" />
                  <span>Equal to ~{treesEquiv} saplings absorbing CO₂</span>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  fontWeight: 600,
                }}>
                  <Car size={16} color="#38bdf8" />
                  <span>Prevents ~{kmDrivingOffset} km of car driving</span>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  fontSize: '0.85rem',
                  color: '#ffffff',
                  fontWeight: 600,
                }}>
                  <Zap size={16} color="#fde047" />
                  <span>Saves ~{ledHoursEquiv} hrs of light</span>
                </div>
              </div>
            </div>

            {/* Habit Streak & Action Trigger */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(12px)',
              padding: '20px 24px',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)',
                }}>
                  <Flame size={22} />
                </div>
                <div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                    {myVerified.length > 0 ? `${Math.min(7, myVerified.length)}-Day Active Streak` : 'Start Your Streak'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#d1fae5' }}>
                    Log an action today to keep it burning!
                  </div>
                </div>
              </div>

              {/* 7-Day Dots */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {daysOfWeek.map((day, idx) => {
                  const streakLen = Math.min(7, myVerified.length);
                  const isActive = idx < (streakLen > 0 ? streakLen : 0);
                  return (
                    <div key={idx} style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '9999px',
                        backgroundColor: isActive ? '#fde047' : 'rgba(255, 255, 255, 0.2)',
                        color: isActive ? '#064e3b' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        marginBottom: '4px',
                      }}>
                        {isActive ? '🔥' : day}
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#a7f3d0' }}>{day}</span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={onNavigateUpload}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#ffffff',
                  color: '#064e3b',
                  fontFamily: 'var(--font-heading)',
                  fontSize: '0.925rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                  transition: 'all 0.2s ease',
                }}
              >
                <PlusCircle size={17} color="#059669" />
                <span>+ Log Green Action</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* TEACHER & SPONSOR HEADER */
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <div>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
              {activeRole === 'admin' && 'Teacher & School Overview'}
              {activeRole === 'sponsor' && 'Community Sponsor Portal'}
            </h1>
            <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '4px' }}>
              {activeRole === 'admin' && `${REGISTERED_SCHOOL.name} • Review student green actions and monitor campus carbon reductions`}
              {activeRole === 'sponsor' && 'Verified student climate impact and institutional CSR funding allocator'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {activeRole === 'admin' && (
              <button onClick={onNavigateAdmin} className="btn-primary">
                <ShieldCheck size={18} />
                Review Submissions ({totalPendingReviews})
              </button>
            )}

            {activeRole === 'sponsor' && (
              <button onClick={onExportCSV} className="btn-primary">
                <Download size={18} />
                Download Impact Report (CSV)
              </button>
            )}
          </div>
        </div>
      )}

      {/* 2. STAT CARDS GRID */}
      <div className="metrics-grid">
        {activeRole === 'student' ? (
          <>
            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div className="metric-title">My Verified CO₂ Saved</div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Leaf size={20} />
                </div>
              </div>
              <div className="metric-value" style={{ color: '#059669' }}>
                {myCO2} <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>kg</span>
              </div>
              <div className="metric-subtitle">
                Real carbon prevented by your actions
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div className="metric-title">My EcoPoints Balance</div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Award size={20} />
                </div>
              </div>
              <div className="metric-value" style={{ color: '#d97706' }}>
                +{myPoints}
              </div>
              <div className="metric-subtitle">
                Earned from verified actions & carbon bonus
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div className="metric-title">Verified Green Habits</div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#f0f9ff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <CheckCircle size={20} />
                </div>
              </div>
              <div className="metric-value" style={{ color: '#0284c7' }}>
                {myVerifiedActions}
              </div>
              <div className="metric-subtitle">
                Confirmed with photo & location check
              </div>
            </div>

            <div className="stat-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div className="metric-title">School Campus Total</div>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Building2 size={20} />
                </div>
              </div>
              <div className="metric-value" style={{ color: '#10b981' }}>
                {totalCO2} <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>kg</span>
              </div>
              <div className="metric-subtitle">
                Together with classmates at {REGISTERED_SCHOOL.name}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="metric-title">School Total CO₂ Saved</div>
              <div className="metric-value" style={{ color: '#059669' }}>
                {totalCO2.toLocaleString()} <span style={{ fontSize: '1.25rem', fontWeight: 600 }}>kg</span>
              </div>
              <div className="metric-subtitle">
                Official climate impact standards
              </div>
            </div>

            <div className="stat-card">
              <div className="metric-title">Verified Student Actions</div>
              <div className="metric-value" style={{ color: '#0284c7' }}>
                {totalActions}
              </div>
              <div className="metric-subtitle">
                Verified unique photo evidence
              </div>
            </div>

            <div className="stat-card">
              <div className="metric-title">
                {activeRole === 'admin' ? 'Actions Awaiting Review' : 'Total EcoPoints Distributed'}
              </div>
              <div className="metric-value" style={{ color: activeRole === 'admin' && totalPendingReviews > 0 ? '#ea580c' : '#7c3aed' }}>
                {activeRole === 'admin' ? totalPendingReviews : totalPoints.toLocaleString()}
              </div>
              <div className="metric-subtitle">
                {activeRole === 'admin' ? 'Actions waiting for teacher confirmation' : 'Points earned by students'}
              </div>
            </div>

            <div className="stat-card">
              <div className="metric-title">Global Climate Goals</div>
              <div className="metric-value" style={{ color: '#10b981' }}>
                SDG 13 & 4
              </div>
              <div className="metric-subtitle">
                Climate Action & Quality Education
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. CHARTS SECTION */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        gap: '24px',
        marginBottom: '36px',
      }}>
        {/* Pie Chart: CO2 by Category */}
        <div className="cs-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Carbon Prevented by Category
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
              {totalCO2} kg total
            </span>
          </div>

          {categoryData.length > 0 && totalCO2 > 0 ? (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="co2"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={55}
                    paddingAngle={4}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} kg CO₂`, 'Impact']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{
              height: '240px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No verified carbon data yet</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Log your first action to see category distribution</p>
            </div>
          )}
        </div>

        {/* Bar Chart: Actions Completed */}
        <div className="cs-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Verified Actions by Category
            </h2>
            <span style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 700 }}>
              {totalActions} actions completed
            </span>
          </div>

          {categoryData.length > 0 && totalActions > 0 ? (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(value) => [value, 'Verified Actions']} />
                  <Bar dataKey="count" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{
              height: '240px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>No action counts yet</p>
              <p style={{ fontSize: '0.85rem', marginTop: '4px' }}>Submissions will populate this breakdown</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. RECENT ACTIVITIES TABLE */}
      <div className="cs-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid #f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              {activeRole === 'student' ? 'My Recent Climate Activities' : 'School Green Activities Feed'}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              {activeRole === 'student'
                ? 'Your verified records and current teacher review statuses'
                : 'All student climate actions and confirmation statuses'}
            </p>
          </div>

          {activeRole === 'student' && (
            <button onClick={onNavigateUpload} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              <PlusCircle size={15} />
              Log New Action
            </button>
          )}
        </div>

        {submissions.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center', color: '#64748b' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              No actions registered yet
            </p>
            <p style={{ fontSize: '0.9rem', marginBottom: '22px' }}>
              Be the first to submit a verified climate action!
            </p>
            {activeRole === 'student' && (
              <button onClick={onNavigateUpload} className="btn-primary">
                <PlusCircle size={18} />
                Log Your First Action
              </button>
            )}
          </div>
        ) : (
          <div className="cs-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="cs-table">
              <thead>
                <tr>
                  <th>Action ID</th>
                  <th>Student</th>
                  <th>Activity</th>
                  <th>Quantity</th>
                  <th>CO₂ Saved</th>
                  <th>EcoPoints</th>
                  <th>Photo Proof</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {(activeRole === 'student' && mySubmissions.length > 0 ? mySubmissions : submissions).slice(0, 8).map((sub) => {
                  const factorInfo = EMISSION_FACTORS[sub.activity] || {};
                  return (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
                        {sub.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{sub.student_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {sub.location_type === 'school' ? '🏫 School Campus' : '🏡 Home'}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: factorInfo.color || '#334155' }}>
                          {factorInfo.name || sub.activity}
                        </span>
                      </td>
                      <td>
                        {sub.quantity} {sub.unit}
                      </td>
                      <td style={{ fontWeight: 800, color: '#059669', fontSize: '0.95rem' }}>
                        {sub.co2_saved} kg
                      </td>
                      <td style={{ fontWeight: 800, color: '#d97706', fontSize: '0.95rem' }}>
                        +{sub.points}
                      </td>
                      <td>
                        {sub.photo_url ? (
                          <div
                            onClick={() => setSelectedPhoto(sub.photo_url)}
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '1px solid #cbd5e1',
                            }}
                          >
                            <img
                              src={sub.photo_url}
                              alt="proof"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>On file</span>
                        )}
                      </td>
                      <td>
                        {sub.status === 'verified' && (
                          <span className="status-badge verified">
                            <CheckCircle size={13} />
                            Verified
                          </span>
                        )}
                        {sub.status === 'review' && (
                          <span className="status-badge review">
                            <Clock size={13} />
                            In Review
                          </span>
                        )}
                        {sub.status === 'rejected' && (
                          <span className="status-badge rejected">
                            <XCircle size={13} />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {new Date(sub.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              maxWidth: '800px',
              maxHeight: '90vh',
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <img
              src={selectedPhoto}
              alt="Enlarged evidence"
              style={{ width: '100%', height: 'auto', maxHeight: '80vh', objectFit: 'contain' }}
            />
            <div style={{ padding: '14px 20px', textAlign: 'right', backgroundColor: '#f8fafc' }}>
              <button onClick={() => setSelectedPhoto(null)} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '0.85rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
