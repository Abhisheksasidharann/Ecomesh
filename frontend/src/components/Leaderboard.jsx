import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Trophy, Shield, Sun, Users, Award, Sparkles, Building, ChevronRight } from 'lucide-react';
import { REGISTERED_SCHOOL, SCHOOL_HOUSES, SCHOOL_CLASSES, SCHOOL_GOAL } from '../lib/constants';

export default function Leaderboard({ submissions = [], totalCO2 = 0 }) {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('houses'); // 'houses' | 'classes' | 'my-class'

  // Filter only verified submissions
  const verified = submissions.filter((s) => s.status === 'verified');

  const userClass = user?.student_class || user?.class || 'Class 11-A';
  const userHouseId = (user?.student_house || user?.house || 'terra').toLowerCase();

  // Helper: Mask name for minor child safety (e.g. "Abhishek Sasidharan" -> "Abhishek S.")
  const formatSafeName = (fullName) => {
    if (!fullName) return 'Student';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  // 1. Calculate House Standings
  const houseData = SCHOOL_HOUSES.map((h) => {
    const houseSubs = verified.filter(
      (s) => (s.student_house || '').toLowerCase() === h.id || (s.house || '').toLowerCase() === h.id
    );
    const co2 = houseSubs.reduce((sum, s) => sum + (Number(s.co2_saved) || 0), 0);
    const points = houseSubs.reduce((sum, s) => sum + (Number(s.points) || 0), 0);
    const studentCount = new Set(houseSubs.map((s) => s.student_email || s.user_id)).size;

    return {
      ...h,
      co2: Number(co2.toFixed(1)),
      points,
      actionsCount: houseSubs.length,
      studentCount,
    };
  }).sort((a, b) => b.co2 - a.co2);

  // 2. Calculate Class Standings
  const classData = SCHOOL_CLASSES.map((cls) => {
    const classSubs = verified.filter(
      (s) => s.student_class === cls || s.class === cls
    );
    const co2 = classSubs.reduce((sum, s) => sum + (Number(s.co2_saved) || 0), 0);
    const points = classSubs.reduce((sum, s) => sum + (Number(s.points) || 0), 0);
    const studentCount = new Set(classSubs.map((s) => s.student_email || s.user_id)).size;

    return {
      name: cls,
      co2: Number(co2.toFixed(1)),
      points,
      actionsCount: classSubs.length,
      studentCount,
    };
  }).sort((a, b) => b.co2 - a.co2);

  // 3. Calculate Students in Current User's Class ONLY (Child Safety & Scoped Rank)
  const myClassSubs = verified.filter(
    (s) => s.student_class === userClass || s.class === userClass
  );

  const myClassStudentsMap = {};
  myClassSubs.forEach((s) => {
    const key = s.student_email || s.user_id;
    if (!myClassStudentsMap[key]) {
      myClassStudentsMap[key] = {
        name: s.student_name || 'Classmate',
        email: s.student_email,
        class: userClass,
        house: s.student_house || 'Terra',
        co2: 0,
        points: 0,
        actionsCount: 0,
      };
    }
    myClassStudentsMap[key].co2 += Number(s.co2_saved) || 0;
    myClassStudentsMap[key].points += Number(s.points) || 0;
    myClassStudentsMap[key].actionsCount += 1;
  });

  // Ensure current user is in their class list even if 0 actions yet
  if (user && !myClassStudentsMap[user.email]) {
    myClassStudentsMap[user.email] = {
      name: user.name || 'You',
      email: user.email,
      class: userClass,
      house: user?.student_house || 'Terra',
      co2: 0,
      points: 0,
      actionsCount: 0,
    };
  }

  const myClassRanked = Object.values(myClassStudentsMap)
    .sort((a, b) => b.co2 - a.co2)
    .map((st, idx) => ({
      ...st,
      rank: idx + 1,
      co2: Number(st.co2.toFixed(1)),
      safeName: formatSafeName(st.name),
    }));

  const myRankObj = myClassRanked.find((s) => s.email === user?.email);

  // School Goal Progress
  const progressPercent = Math.min(100, Math.round((totalCO2 / SCHOOL_GOAL.targetKg) * 100));

  return (
    <div className="page-container gradient-mesh">
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
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
          <span>Team-Based Campus Standings</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Campus Standings & Team Play
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '4px' }}>
          Compete collaboratively by House and Class. Personal ranks are scoped strictly within your own class to prevent gaming and safeguard student privacy.
        </p>
      </div>

      {/* Child Privacy Assurance Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        marginBottom: '28px',
        fontSize: '0.85rem',
        color: '#475569',
      }}>
        <Shield size={18} color="#059669" />
        <span>
          <strong>Child Safety Shield:</strong> Leaderboards show First Name + Class initial only. Action photos are never public and viewable only by certified school teachers.
        </span>
      </div>

      {/* School Solar Rooftop Centerpiece */}
      <div className="glass-card" style={{
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #0d9488 100%)',
        color: '#ffffff',
        border: 'none',
        padding: '30px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '18px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Sun size={24} color="#fde047" />
              <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Collective School Goal: {SCHOOL_GOAL.title}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#d1fae5', maxWidth: '640px' }}>
              {SCHOOL_GOAL.description}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fde047' }}>
              {totalCO2} / {SCHOOL_GOAL.targetKg} kg
            </div>
            <div style={{ fontSize: '0.82rem', color: '#a7f3d0' }}>
              {progressPercent}% Milestone Achieved
            </div>
          </div>
        </div>

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

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '28px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '14px',
      }}>
        <button
          onClick={() => setActiveView('houses')}
          style={{
            padding: '10px 20px',
            borderRadius: '9999px',
            border: activeView === 'houses' ? '2px solid #10b981' : '1px solid #e2e8f0',
            backgroundColor: activeView === 'houses' ? '#ecfdf5' : '#ffffff',
            color: activeView === 'houses' ? '#065f46' : '#64748b',
            fontWeight: activeView === 'houses' ? 800 : 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🏆 House Standings (4 Houses)</span>
        </button>

        <button
          onClick={() => setActiveView('classes')}
          style={{
            padding: '10px 20px',
            borderRadius: '9999px',
            border: activeView === 'classes' ? '2px solid #10b981' : '1px solid #e2e8f0',
            backgroundColor: activeView === 'classes' ? '#ecfdf5' : '#ffffff',
            color: activeView === 'classes' ? '#065f46' : '#64748b',
            fontWeight: activeView === 'classes' ? 800 : 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🏫 Class Standings</span>
        </button>

        <button
          onClick={() => setActiveView('my-class')}
          style={{
            padding: '10px 20px',
            borderRadius: '9999px',
            border: activeView === 'my-class' ? '2px solid #10b981' : '1px solid #e2e8f0',
            backgroundColor: activeView === 'my-class' ? '#ecfdf5' : '#ffffff',
            color: activeView === 'my-class' ? '#065f46' : '#64748b',
            fontWeight: activeView === 'my-class' ? 800 : 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>👤 My Class Standings ({userClass})</span>
          {myRankObj && (
            <span style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '9999px',
            }}>
              Rank #{myRankObj.rank}
            </span>
          )}
        </button>
      </div>

      {/* VIEW 1: HOUSE STANDINGS */}
      {activeView === 'houses' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}>
          {houseData.map((h, idx) => {
            const isUserHouse = h.id === userHouseId;
            return (
              <div
                key={h.id}
                className="stat-card"
                style={{
                  padding: '28px 24px',
                  border: isUserHouse ? '2px solid #10b981' : '1px solid #e2e8f0',
                  position: 'relative',
                  backgroundColor: '#ffffff',
                }}
              >
                {isUserHouse && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#ecfdf5',
                    color: '#059669',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    border: '1px solid #a7f3d0',
                  }}>
                    Your House
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: h.bg,
                    border: `1px solid ${h.color}30`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                  }}>
                    {h.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>
                      RANK #{idx + 1}
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                      {h.name}
                    </h3>
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px',
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>VERIFIED CO₂ REDUCTION</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 900, color: h.color }}>
                    {h.co2} <span style={{ fontSize: '1rem', fontWeight: 700 }}>kg</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>{h.actionsCount} verified actions</span>
                  <span>{h.studentCount} active students</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: CLASS STANDINGS */}
      {activeView === 'classes' && (
        <div className="cs-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
              Campus Classroom Standings
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
              Ranked by cumulative verified kilograms of CO₂ prevented by each homeroom
            </p>
          </div>

          <div className="cs-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="cs-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Class</th>
                  <th>Active Students</th>
                  <th>Verified Actions</th>
                  <th>Total CO₂ Saved</th>
                  <th>Collective Points</th>
                </tr>
              </thead>
              <tbody>
                {classData.map((cls, idx) => {
                  const isCurrent = cls.name === userClass;
                  return (
                    <tr
                      key={cls.name}
                      style={{
                        backgroundColor: isCurrent ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        fontWeight: isCurrent ? 700 : 'normal',
                      }}
                    >
                      <td>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : idx === 2 ? '#fff7ed' : '#f8fafc',
                          color: idx === 0 ? '#b45309' : idx === 1 ? '#475569' : idx === 2 ? '#c2410c' : '#64748b',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.85rem',
                        }}>
                          #{idx + 1}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#0f172a', fontWeight: 800, fontSize: '0.95rem' }}>
                          {cls.name} {isCurrent && <span style={{ color: '#059669', fontSize: '0.78rem' }}>(Your Class)</span>}
                        </div>
                      </td>
                      <td>{cls.studentCount} students</td>
                      <td>{cls.actionsCount} actions</td>
                      <td style={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>
                        {cls.co2} kg
                      </td>
                      <td style={{ fontWeight: 800, color: '#d97706', fontSize: '1.05rem' }}>
                        +{cls.points} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: MY CLASS STANDINGS (PERSONAL SCOPED RANK) */}
      {activeView === 'my-class' && (
        <div className="cs-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                {userClass} Internal Standings
              </h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                Safe classroom leaderboard (First Name + Last Initial). Shows individual rank within your own class only.
              </p>
            </div>

            {myRankObj && (
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
                Your Rank in {userClass}: #{myRankObj.rank} of {myClassRanked.length}
              </div>
            )}
          </div>

          <div className="cs-table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="cs-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Rank</th>
                  <th>Student (Protected Display)</th>
                  <th>House</th>
                  <th>Verified Actions</th>
                  <th>Verified CO₂</th>
                  <th>Verified Points</th>
                </tr>
              </thead>
              <tbody>
                {myClassRanked.map((st) => {
                  const isCurrent = st.email === user?.email;
                  return (
                    <tr
                      key={st.email}
                      style={{
                        backgroundColor: isCurrent ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        fontWeight: isCurrent ? 700 : 'normal',
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
                          fontSize: '0.85rem',
                        }}>
                          #{st.rank}
                        </div>
                      </td>
                      <td>
                        <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.95rem' }}>
                          {st.safeName} {isCurrent && <span style={{ color: '#059669', fontSize: '0.8rem' }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                          {userClass} • Verified Student
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>
                          {st.house}
                        </span>
                      </td>
                      <td>{st.actionsCount} actions</td>
                      <td style={{ fontWeight: 800, color: '#059669', fontSize: '1.05rem' }}>
                        {st.co2} kg
                      </td>
                      <td style={{ fontWeight: 800, color: '#d97706', fontSize: '1.05rem' }}>
                        +{st.points} pts
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
