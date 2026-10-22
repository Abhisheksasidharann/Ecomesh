import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../lib/auth';
import { apiMyMissions, apiClaimMission } from '../lib/api';
import {
  BADGE_DEFINITIONS_V2,
  getStudentLevel,
  EMISSION_FACTORS,
} from '../lib/constants';
import {
  Trophy,
  CheckCircle2,
  Target,
  Compass,
  AlertCircle,
  Loader2,
  Gift,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Local fallback missions shown when the backend returns no missions or
// the /my/missions endpoint is not yet implemented. Each item includes all
// fields the live API is also expected to return so the rendering path is
// identical for both cases.
// ---------------------------------------------------------------------------
function buildFallbackMissions({ untriedCategories, levelInfo, levelMultiplier, studentActions, studentCO2 }) {
  const nudgeCategoryKey = untriedCategories[0] || 'solar';
  const nudgeMeta = EMISSION_FACTORS[nudgeCategoryKey] || EMISSION_FACTORS.plantation;

  return [
    {
      id: 'mission_diversity_nudge',
      title: `Diversity Nudge: Try ${nudgeMeta.name}`,
      tag: 'Adaptive Recommendation',
      bonus_points: 25,
      description: `Expand your climate habits! You haven't logged ${nudgeMeta.name.toLowerCase()} yet. Earn bonus EcoPoints by trying it this week.`,
      target_label: `1 ${nudgeMeta.unit}`,
      icon: nudgeCategoryKey === 'plantation' ? '🌳' : nudgeCategoryKey === 'waste' ? '♻️' : nudgeCategoryKey === 'transport' ? '🚲' : nudgeCategoryKey === 'solar' ? '☀️' : '💧',
      isAdaptiveNudge: true,
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
    },
    {
      id: 'mission_weekly_habit',
      title: 'Active Weekly Habit Milestone',
      tag: 'Weekly Streak Quest',
      bonus_points: 30,
      description: 'Submit at least 2 verified green actions on campus grounds this week.',
      target_label: `${Math.min(2, studentActions.length)} / 2 actions completed`,
      icon: '🔥',
      isAdaptiveNudge: false,
      progress: Math.min(2, studentActions.length),
      target: 2,
      completed: studentActions.length >= 2,
      claimed: false,
    },
    {
      id: 'mission_level_scaling',
      title: `Level ${levelInfo.level} Climate Target`,
      tag: `Scaled for ${levelInfo.name}`,
      bonus_points: levelMultiplier * 15,
      description: `Target scaled to your verified experience: prevent ${levelMultiplier * 5} kg of verified carbon this term.`,
      target_label: `${Math.min(levelMultiplier * 5, Math.round(studentCO2))} / ${levelMultiplier * 5} kg CO₂`,
      icon: levelInfo.icon,
      isAdaptiveNudge: false,
      progress: Math.min(levelMultiplier * 5, Math.round(studentCO2)),
      target: levelMultiplier * 5,
      completed: Math.round(studentCO2) >= levelMultiplier * 5,
      claimed: false,
    },
    {
      id: 'mission_campus_steward',
      title: 'School Campus Steward',
      tag: 'Campus Impact',
      bonus_points: 20,
      description: 'Help the school achieve the 500 kg rooftop solar milestone with a campus-based action.',
      target_label: 'Campus grounds verified',
      icon: '🏫',
      isAdaptiveNudge: false,
      progress: 0,
      target: 1,
      completed: false,
      claimed: false,
    },
  ];
}

export default function MissionsHub({ verifiedOnly = [], totalPoints: _totalPoints = 0, token, onNavigateUpload }) {
  const { user } = useAuth();

  // Live mission state
  const [missions, setMissions] = useState([]);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [claimError, setClaimError] = useState('');

  // Derived values from local verified submissions (used for badges + fallback)
  const studentActions = verifiedOnly.filter(
    (s) => s.student_email === user?.email || s.user_id === user?.id,
  );
  const studentCO2 = studentActions.reduce((acc, curr) => acc + (Number(curr.co2_saved) || 0), 0);
  const studentVerifiedPoints = studentActions.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);
  const levelInfo = getStudentLevel(studentVerifiedPoints);
  const completedCategories = new Set(studentActions.map((s) => s.activity));
  const allCategories = ['plantation', 'waste', 'transport', 'solar', 'water'];
  const untriedCategories = allCategories.filter((cat) => !completedCategories.has(cat));
  const levelMultiplier = Math.max(1, levelInfo.level);

  // Badge unlock helper (unchanged from original)
  const getBadgeStatus = (badge) => {
    if (badge.type === 'category') {
      const count = studentActions.filter((s) => s.activity === badge.category).length;
      return { unlocked: count >= 1, current: count, target: 1, unit: 'action' };
    }
    if (badge.type === 'diversity') {
      const count = completedCategories.size;
      return { unlocked: count >= 5, current: count, target: 5, unit: 'categories' };
    }
    if (badge.type === 'streak') {
      const targetWeeks = badge.id === 'streak_2wk' ? 2 : 4;
      const currentWeeks = Math.min(
        targetWeeks,
        Math.floor(studentActions.length / 2) || (studentActions.length > 0 ? 1 : 0),
      );
      return { unlocked: currentWeeks >= targetWeeks, current: currentWeeks, target: targetWeeks, unit: 'weeks active' };
    }
    if (badge.type === 'co2') {
      const co2 = Math.round(studentCO2);
      return { unlocked: co2 >= badge.threshold, current: co2, target: badge.threshold, unit: 'kg CO₂' };
    }
    return { unlocked: false, current: 0, target: 1, unit: '' };
  };

  const unlockedCount = BADGE_DEFINITIONS_V2.filter((b) => getBadgeStatus(b).unlocked).length;

  // -------------------------------------------------------------------------
  // Fetch live missions from backend
  // -------------------------------------------------------------------------
  const fetchMissions = useCallback(async () => {
    if (!token) return;
    try {
      setMissionsLoading(true);
      const data = await apiMyMissions(token);
      if (Array.isArray(data) && data.length > 0) {
        setMissions(data);
      } else {
        // Backend returned empty or endpoint not yet implemented → local fallback
        setMissions(
          buildFallbackMissions({ untriedCategories, levelInfo, levelMultiplier, studentActions, studentCO2 }),
        );
      }
    } catch {
      // API not available → silently use local fallback missions
      setMissions(
        buildFallbackMissions({ untriedCategories, levelInfo, levelMultiplier, studentActions, studentCO2 }),
      );
    } finally {
      setMissionsLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  // -------------------------------------------------------------------------
  // Claim a completed, unclaimed mission
  // -------------------------------------------------------------------------
  const handleClaim = async (mission) => {
    setClaimingId(mission.id);
    setClaimError('');
    try {
      await apiClaimMission(mission.id, token);
      // Optimistically mark as claimed in local state
      setMissions((current) =>
        current.map((item) =>
          item.id === mission.id ? { ...item, claimed: true } : item,
        ),
      );
    } catch (err) {
      setClaimError(err.message || 'Could not claim this mission. Please try again.');
    } finally {
      setClaimingId(null);
    }
  };

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
          <span>Adaptive Gamification Engine v2</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Badges, Levels &amp; Quests
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '4px' }}>
          Level up from Seedling to Forest. Take personalized weekly missions and unlock verified IPCC milestone badges.
        </p>
      </div>

      {/* Level & Points Progression Spotlight Banner */}
      <div className="glass-card" style={{
        marginBottom: '36px',
        background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #0d9488 100%)',
        color: '#ffffff',
        border: 'none',
        padding: '32px 36px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
          marginBottom: '24px',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '2rem' }}>{levelInfo.icon}</span>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.06em' }}>
                  CURRENT LEVEL: {levelInfo.name.toUpperCase()} (TIER {levelInfo.level})
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.15 }}>
                  {user?.name || user?.email}
                </h2>
              </div>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#d1fae5' }}>
              {user?.student_class || 'Class 11-A'} • {user?.student_house || 'Terra'} House • {user?.school || 'Model Higher Secondary School'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>VERIFIED POINTS</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fde047', lineHeight: 1.1 }}>
                +{studentVerifiedPoints}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#6ee7b7' }}>Only verified actions count</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>VERIFIED CO₂</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.1 }}>
                {studentCO2.toFixed(1)} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>kg</span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>IPCC baseline standard</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>BADGES UNLOCKED</div>
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#6ee7b7', lineHeight: 1.1 }}>
                {unlockedCount} / {BADGE_DEFINITIONS_V2.length}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>Verified milestones</div>
            </div>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#d1fae5', marginBottom: '8px', fontWeight: 600 }}>
            <span>Progress toward {levelInfo.nextLevelName} ({levelInfo.pointsToNext > 0 ? `${levelInfo.pointsToNext} points needed` : 'Max Level achieved!'})</span>
            <span>{levelInfo.progressPercent}%</span>
          </div>
          <div style={{ height: '10px', borderRadius: '9999px', backgroundColor: 'rgba(255, 255, 255, 0.2)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              borderRadius: '9999px',
              background: 'linear-gradient(90deg, #34d399 0%, #fde047 100%)',
              width: `${levelInfo.progressPercent}%`,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      </div>

      {/* Adaptive Weekly Missions */}
      <div style={{ marginBottom: '44px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={20} color="#059669" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Adaptive Weekly Quests (Mission Planner)
              </h2>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }}>
              Dynamically adapted to your history: gives bonus points for untried action categories and scales targets with your level.
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '6px 14px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
            Weekly Cadence
          </span>
        </div>

        {/* Claim error banner */}
        {claimError && (
          <div className="cs-alert error" style={{ marginBottom: '16px' }}>
            <AlertCircle size={18} />
            <span>{claimError}</span>
          </div>
        )}

        {missionsLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '24px', color: '#64748b', fontSize: '0.95rem' }}>
            <Loader2 size={20} style={{ animation: 'spin 0.8s linear infinite' }} />
            <span>Loading your missions...</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}>
            {missions.map((quest) => {
              const isComplete = quest.completed === true;
              const isClaimed = quest.claimed === true;
              const isClaiming = claimingId === quest.id;
              const progressPercent = quest.target > 0
                ? Math.min(100, Math.round(((quest.progress ?? 0) / quest.target) * 100))
                : isComplete ? 100 : 0;

              return (
                <div
                  key={quest.id}
                  className="stat-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: quest.isAdaptiveNudge ? '2px solid #10b981' : isClaimed ? '2px solid #a7f3d0' : '1px solid #e2e8f0',
                    background: isClaimed
                      ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)'
                      : quest.isAdaptiveNudge
                        ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)'
                        : '#ffffff',
                    opacity: isClaimed ? 0.85 : 1,
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <span style={{ fontSize: '2rem' }}>{quest.icon}</span>
                      <span className="status-badge verified" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                        +{quest.bonus_points ?? quest.bonus} pts
                      </span>
                    </div>

                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: quest.isAdaptiveNudge ? '#059669' : '#64748b',
                      marginBottom: '4px',
                    }}>
                      {quest.tag}
                    </div>

                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                      {quest.title}
                    </h3>
                    <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.5, marginBottom: '10px' }}>
                      {quest.description}
                    </p>

                    {/* Progress bar */}
                    {quest.target > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>
                          <span>{quest.target_label ?? `${quest.progress ?? 0} / ${quest.target}`}</span>
                          <span>{progressPercent}%</span>
                        </div>
                        <div style={{ height: '7px', borderRadius: '9999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            borderRadius: '9999px',
                            backgroundColor: isComplete ? '#10b981' : '#0d9488',
                            width: `${progressPercent}%`,
                            transition: 'width 0.5s ease',
                          }} />
                        </div>
                      </div>
                    )}

                    {/* Completion/claimed status label */}
                    {isClaimed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#059669', fontWeight: 700, marginBottom: '8px' }}>
                        <CheckCircle2 size={15} />
                        Bonus claimed ✓
                      </div>
                    )}
                    {isComplete && !isClaimed && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#d97706', fontWeight: 700, marginBottom: '8px' }}>
                        <Gift size={15} />
                        Mission complete — claim your bonus!
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {/* Claim button — only when complete and not yet claimed */}
                    {isComplete && !isClaimed && (
                      <button
                        onClick={() => handleClaim(quest)}
                        disabled={isClaiming}
                        className="btn-primary"
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          fontSize: '0.88rem',
                          background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
                          opacity: isClaiming ? 0.7 : 1,
                          cursor: isClaiming ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        {isClaiming ? (
                          <>
                            <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} />
                            Claiming…
                          </>
                        ) : (
                          <>
                            <Gift size={14} />
                            Claim Bonus
                          </>
                        )}
                      </button>
                    )}

                    {/* Log Action button — always present unless claimed */}
                    {!isClaimed && (
                      <button
                        onClick={() => { if (onNavigateUpload) onNavigateUpload(); }}
                        className="btn-primary"
                        style={{
                          flex: 1,
                          padding: '10px 14px',
                          fontSize: '0.88rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                        }}
                      >
                        <Target size={15} />
                        Log Action
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Gamification v2 Milestone Achievement Badges */}
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Milestone Achievement Badges (Gamification v2)
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Unlocks automatically upon verified climate action. Includes category firsts, all-rounder diversity, weekly streaks, and carbon milestones.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
          gap: '20px',
        }}>
          {BADGE_DEFINITIONS_V2.map((badge) => {
            const status = getBadgeStatus(badge);
            const progress = Math.min(100, Math.round((status.current / status.target) * 100));

            return (
              <div
                key={badge.id}
                className="stat-card"
                style={{
                  padding: '24px',
                  backgroundColor: status.unlocked ? '#ffffff' : '#fafafa',
                  border: status.unlocked ? '2px solid #a7f3d0' : '1px solid #e2e8f0',
                  boxShadow: status.unlocked ? '0 8px 24px rgba(16, 185, 129, 0.12)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    backgroundColor: status.unlocked ? '#ecfdf5' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.8rem',
                    border: status.unlocked ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                  }}>
                    {badge.icon}
                  </div>
                  <div>
                    <span style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: status.unlocked ? '#059669' : '#94a3b8',
                      letterSpacing: '0.04em',
                    }}>
                      {status.unlocked ? 'UNLOCKED 🎖️' : 'LOCKED'}
                    </span>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                      {badge.name}
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.84rem', color: '#475569', lineHeight: 1.45, marginBottom: '16px' }}>
                  {badge.desc}
                </p>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
                    <span>{status.current} / {status.target} {status.unit}</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '9999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      borderRadius: '9999px',
                      backgroundColor: status.unlocked ? '#10b981' : '#0d9488',
                      width: `${progress}%`,
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
