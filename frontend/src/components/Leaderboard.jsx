import React from 'react';
import { useAuth } from '../lib/auth';
import { Trophy, Medal, Sparkles, TrendingUp, Flame, Sun, Target } from 'lucide-react';
import { REGISTERED_SCHOOL } from '../lib/constants';

export default function Leaderboard({ submissions = [], totalCO2 = 0 }) {
  const { user } = useAuth();

  // Aggregate verified impact by student
  const verified = submissions.filter((s) => s.status === 'verified');

  const studentMap = {};
  verified.forEach((s) => {
    const key = s.student_email || s.user_id;
    if (!studentMap[key]) {
      studentMap[key] = {
        name: s.student_name,
        email: s.student_email,
        co2: 0,
        points: 0,
        actionsCount: 0,
      };
    }
    studentMap[key].co2 += Number(s.co2_saved) || 0;
    studentMap[key].points += Number(s.points) || 0;
    studentMap[key].actionsCount += 1;
  });

  // Ensure current user appears even if 0 actions yet
  if (user && !studentMap[user.email]) {
    studentMap[user.email] = {
      name: user.name || 'You',
      email: user.email,
      co2: 0,
      points: 0,
      actionsCount: 0,
    };
  }

  const sortedStudents = Object.values(studentMap)
    .sort((a, b) => b.co2 - a.co2)
    .map((st, idx) => ({ ...st, rank: idx + 1, co2: Number(st.co2.toFixed(1)) }));

  const top3 = sortedStudents.slice(0, 3);
  const userRankObj = sortedStudents.find((s) => s.email === user?.email);

  // School Solar Rooftop Goal (e.g. 500 kg threshold)
  const schoolGoalKg = 500;
  const progressPercent = Math.min(100, Math.round((totalCO2 / schoolGoalKg) * 100));

  return (
    <div className="page-container gradient-mesh">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
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
          <Trophy size={16} />
          <span>School Climate Action Standings</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Campus Leaderboard
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '4px' }}>
          See top student climate champions at {REGISTERED_SCHOOL.name} and track our collective school goal.
        </p>
      </div>

      {/* School Solar Rooftop Community Goal Meter */}
      <div className="glass-card" style={{
        marginBottom: '36px',
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #0d9488 100%)',
        color: '#ffffff',
        border: 'none',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sun size={24} color="#fde047" />
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Next Milestone: Campus Rooftop Solar (1.5 kW Unit)
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#d1fae5', maxWidth: '640px' }}>
              Student collective actions directly fund rooftop solar for our science lab through our CSR sponsor partner.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fde047' }}>
              {totalCO2} / {schoolGoalKg} kg
            </div>
            <div style={{ fontSize: '0.82rem', color: '#a7f3d0' }}>
              {progressPercent}% Goal Achieved
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{
          height: '14px',
          borderRadius: '9999px',
          backgroundColor: 'rgba(255, 255, 255, 0.2)',
          overflow: 'hidden',
          padding: '2px',
        }}>
          <div style={{
            height: '100%',
            borderRadius: '9999px',
            background: 'linear-gradient(90deg, #34d399 0%, #fde047 100%)',
            width: `${progressPercent}%`,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {top3.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '40px',
        }}>
          {top3.map((champ, idx) => {
            const isFirst = idx === 0;
            const isSecond = idx === 1;
            const medalColor = isFirst ? '#f59e0b' : isSecond ? '#94a3b8' : '#cd7f32';
            const medalBg = isFirst ? '#fef3c7' : isSecond ? '#f1f5f9' : '#fff7ed';
            const medalBorder = isFirst ? '#fde68a' : isSecond ? '#e2e8f0' : '#fed7aa';

            return (
              <div
                key={champ.email}
                className="stat-card"
                style={{
                  textAlign: 'center',
                  padding: '32px 24px',
                  border: `2px solid ${medalBorder}`,
                  background: isFirst ? 'linear-gradient(180deg, #fffbeb 0%, #ffffff 100%)' : '#ffffff',
                }}
              >
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '9999px',
                  backgroundColor: medalBg,
                  color: medalColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontWeight: 900,
                  fontSize: '1.4rem',
                  border: `2px solid ${medalBorder}`,
                }}>
                  {isFirst ? '🥇' : isSecond ? '🥈' : '🥉'}
                </div>

                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                  {champ.name}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '18px' }}>
                  {champ.actionsCount} verified actions
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '20px',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>CO₂ PREVENTED</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#059669' }}>
                      {champ.co2} kg
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>ECOPOINTS</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#d97706' }}>
                      +{champ.points}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full Leaderboard Table */}
      <div className="cs-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              Full Student Standings
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
              Ranked by verified kilograms of carbon dioxide prevented
            </p>
          </div>

          {userRankObj && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: '#ecfdf5',
              border: '1px solid #a7f3d0',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: '#065f46',
            }}>
              <Sparkles size={16} />
              Your Current Rank: #{userRankObj.rank}
            </div>
          )}
        </div>

        <div className="cs-table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table className="cs-table">
            <thead>
              <tr>
                <th style={{ width: '80px' }}>Rank</th>
                <th>Student</th>
                <th>Verified Actions</th>
                <th>Total CO₂ Saved</th>
                <th>EcoPoints</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedStudents.map((st) => {
                const isCurrentUser = st.email === user?.email;
                return (
                  <tr
                    key={st.email}
                    style={{
                      backgroundColor: isCurrentUser ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                      fontWeight: isCurrentUser ? 700 : 'normal',
                    }}
                  >
                    <td>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor: st.rank === 1 ? '#fef3c7' : st.rank === 2 ? '#f1f5f9' : st.rank === 3 ? '#fff7ed' : '#f8fafc',
                        color: st.rank === 1 ? '#b45309' : st.rank === 2 ? '#475569' : st.rank === 3 ? '#c2410c' : '#64748b',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                      }}>
                        #{st.rank}
                      </div>
                    </td>
                    <td>
                      <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>
                        {st.name} {isCurrentUser && <span style={{ color: '#059669', fontSize: '0.8rem' }}>(You)</span>}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {st.email}
                      </div>
                    </td>
                    <td>
                      {st.actionsCount} actions
                    </td>
                    <td style={{ fontWeight: 800, color: '#059669', fontSize: '1rem' }}>
                      {st.co2} kg
                    </td>
                    <td style={{ fontWeight: 800, color: '#d97706', fontSize: '1rem' }}>
                      +{st.points}
                    </td>
                    <td>
                      <span className="status-badge verified">
                        Active Champion
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
