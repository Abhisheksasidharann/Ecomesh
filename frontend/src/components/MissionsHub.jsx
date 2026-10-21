import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { BADGE_DEFINITIONS_V2, getStudentLevel, EMISSION_FACTORS } from '../lib/constants';
import { useStudentSummary, apiMyMissions, apiClaimMission } from '../lib/api';
import {
  Trophy, Flame, CheckCircle2, Target, Sparkles, ArrowRight, Zap, Leaf, Shield, Compass, Gift, RefreshCw, AlertCircle,
} from 'lucide-react';

export default function MissionsHub({ verifiedOnly = [], totalPoints = 0, onNavigateUpload }) {
  const { user } = useAuth();

  // ── Live backend summary ────────────────────────────────────────────────────
  const summary = useStudentSummary(user?.student_id);

  // ── Local submission data (fallback when summary still loading) ─────────
  // GET /my/submissions already scoped to this student — no filter needed
  const studentActions = verifiedOnly;

  const studentCO2 = summary.co2_total > 0
    ? summary.co2_total
    : studentActions.reduce((acc, curr) => acc + (Number(curr.co2_saved) || 0), 0);

  const studentVerifiedPoints = summary.points > 0
    ? summary.points
    : studentActions.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);

  // Student Level: backend wins, local fallback while loading
  const levelInfo = summary.loading
    ? getStudentLevel(studentVerifiedPoints)
    : {
        level:           summary.level,
        name:            summary.levelName,
        icon:            summary.levelIcon,
        progressPercent: summary.progressPercent,
        nextLevelName:   summary.nextLevelName,
        pointsToNext:    summary.pointsToNext,
      };

  // Streak from backend (real calendar weeks), not action count
  const realStreakWeeks = summary.streakWeeks;

  // Set of activity types completed (from local submissions)
  const completedCategories = new Set(studentActions.map((s) => s.activity));
  const allCategories = ['plantation', 'waste', 'transport', 'solar', 'water'];
  const untriedCategories = allCategories.filter((cat) => !completedCategories.has(cat));

  // Backend returns earned badge IDs in summary.badges (e.g. ["first_tree", "co2_10kg"])
  const earnedBadgeIds = new Set(summary.badges || []);

  // Determine Badge Unlocks: check backend list first, fall back to local logic
  const getBadgeStatus = (badge) => {
    // If backend says it's earned, trust it
    if (earnedBadgeIds.has(badge.id)) {
      return { unlocked: true, current: 1, target: 1, unit: '' };
    }
    // Otherwise compute locally
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
      // Prefer real backend streak weeks
      const currentWeeks = realStreakWeeks > 0
        ? Math.min(realStreakWeeks, targetWeeks)
        : Math.min(targetWeeks, Math.floor(studentActions.length / 2) || (studentActions.length > 0 ? 1 : 0));
      return { unlocked: currentWeeks >= targetWeeks, current: currentWeeks, target: targetWeeks, unit: 'weeks active' };
    }
    if (badge.type === 'co2') {
      const co2 = Math.round(studentCO2);
      return { unlocked: co2 >= badge.threshold, current: co2, target: badge.threshold, unit: 'kg CO₂' };
    }
    return { unlocked: false, current: 0, target: 1, unit: '' };
  };

  const unlockedCount = BADGE_DEFINITIONS_V2.filter((b) => getBadgeStatus(b).unlocked).length;

  // ── Live missions from backend ─────────────────────────────────────────────
  // GET /my/missions returns: { id, kind, action_type, target, bonus, title, reason, progress, complete, claimed }
  const [liveMissions, setLiveMissions] = useState([]);
  const [missionsLoading, setMissionsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);
  const [claimError, setClaimError] = useState(null);

  useEffect(() => {
    setMissionsLoading(true);
    apiMyMissions()
      .then(setLiveMissions)
      .catch(() => setLiveMissions([]))
      .finally(() => setMissionsLoading(false));
  }, []);

  const handleClaim = async (missionId) => {
    setClaimingId(missionId);
    setClaimError(null);
    try {
      const result = await apiClaimMission(missionId);
      // Mark claimed locally for instant UI feedback
      setLiveMissions((prev) =>
        prev.map((m) => m.id === missionId ? { ...m, claimed: true } : m)
      );
      // Trigger a full summary reload so points update in Sidebar/Dashboard
      // (the parent useStudentSummary will re-fetch on next render cycle)
    } catch (err) {
      setClaimError(err.message || 'Failed to claim bonus. Try again.');
    } finally {
      setClaimingId(null);
    }
  };

  // Kind → display metadata
  const KIND_META = {
    comeback:  { tag: 'Re-engagement Nudge',    icon: '🔄', isHighlight: false },
    diversity: { tag: 'Adaptive Recommendation', icon: '🌈', isHighlight: true  },
    challenge: { tag: 'Level Challenge',         icon: '⚡', isHighlight: false },
  };

  // Fallback local missions shown while backend loads
  const nudgeCategoryKey = untriedCategories[0] || 'solar';
  const nudgeMeta = EMISSION_FACTORS[nudgeCategoryKey] || EMISSION_FACTORS.plantation;
  const levelMultiplier = Math.max(1, levelInfo.level);
  const fallbackMissions = [
    {
      id: 'local_diversity_nudge', kind: 'diversity',
      title: `Try ${nudgeMeta.name}`,
      reason: "You haven't logged this action type yet",
      bonus: 25, target: 1, progress: 0, complete: false, claimed: false,
      action_type: nudgeCategoryKey,
    },
    {
      id: 'local_weekly_habit', kind: 'challenge',
      title: 'Active Weekly Habit Milestone',
      reason: 'Submit 2 verified green actions this week',
      bonus: 30, target: 2, progress: Math.min(2, studentActions.length), complete: studentActions.length >= 2, claimed: false,
      action_type: null,
    },
    {
      id: 'local_level_target', kind: 'challenge',
      title: `Level ${levelInfo.level} Climate Target`,
      reason: `Target scales with your ${levelInfo.name} level`,
      bonus: levelMultiplier * 15, target: levelMultiplier * 5, progress: Math.round(studentCO2), complete: studentCO2 >= levelMultiplier * 5, claimed: false,
      action_type: null,
    },
  ];

  const displayMissions = missionsLoading
    ? fallbackMissions
    : liveMissions.length > 0 ? liveMissions : fallbackMissions;

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
          Badges, Levels & Quests
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
          <div style={{
            height: '10px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            overflow: 'hidden',
          }}>
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

        {/* Claim error */}
        {claimError && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 16px', marginBottom: '16px',
            borderRadius: '10px', backgroundColor: '#fef2f2',
            border: '1px solid #fecaca', color: '#b91c1c', fontSize: '0.85rem',
          }}>
            <AlertCircle size={16} />
            <span>{claimError}</span>
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
        }}>
          {displayMissions.map((quest) => {
            const meta    = KIND_META[quest.kind] || KIND_META.challenge;
            const pct     = Math.min(100, Math.round((quest.progress / quest.target) * 100));
            const isClaiming = claimingId === quest.id;

            return (
              <div
                key={quest.id}
                className="stat-card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: meta.isHighlight ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: meta.isHighlight ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' : '#ffffff',
                  opacity: quest.claimed ? 0.72 : 1,
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontSize: '2rem' }}>{meta.icon}</span>
                    <span className={`status-badge ${quest.claimed ? 'review' : quest.complete ? 'verified' : 'pending'}`}
                      style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                      {quest.claimed ? '✓ Claimed' : quest.complete ? '🎉 Complete!' : `+${quest.bonus} pts`}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: meta.isHighlight ? '#059669' : '#64748b',
                    marginBottom: '4px',
                  }}>
                    {missionsLoading ? 'Loading...' : meta.tag}
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                    {quest.title}
                  </h3>
                  <p style={{ fontSize: '0.83rem', color: '#475569', lineHeight: 1.5, marginBottom: '14px' }}>
                    {quest.reason}
                  </p>

                  {/* Real progress bar from backend */}
                  <div style={{ marginBottom: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
                      <span>{quest.progress} / {quest.target} actions</span>
                      <span>{pct}%</span>
                    </div>
                    <div style={{ height: '8px', borderRadius: '9999px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        borderRadius: '9999px',
                        background: quest.complete
                          ? 'linear-gradient(90deg, #34d399, #10b981)'
                          : 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                        width: `${pct}%`,
                        transition: 'width 0.5s ease',
                      }} />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Claim Bonus button — only shown when complete and not claimed */}
                  {quest.complete && !quest.claimed && (
                    <button
                      onClick={() => handleClaim(quest.id)}
                      disabled={isClaiming}
                      className="btn-primary"
                      style={{ width: '100%', padding: '10px 14px', fontSize: '0.88rem',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        opacity: isClaiming ? 0.7 : 1,
                      }}
                    >
                      {isClaiming
                        ? <><RefreshCw size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Claiming...</>
                        : <><Gift size={14} /> Claim +{quest.bonus} Bonus Points!</>}
                    </button>
                  )}

                  {/* Log Action button — shown when not yet complete */}
                  {!quest.complete && (
                    <button
                      onClick={() => onNavigateUpload && onNavigateUpload()}
                      className="btn-primary"
                      style={{ width: '100%', padding: '10px 14px', fontSize: '0.88rem' }}
                    >
                      <Target size={15} />
                      Log Action for Quest
                    </button>
                  )}

                  {quest.claimed && (
                    <div style={{ textAlign: 'center', fontSize: '0.82rem', color: '#059669', fontWeight: 700 }}>
                      ✅ Bonus claimed — keep going!
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
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
                  <div style={{
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: '#e2e8f0',
                    overflow: 'hidden',
                  }}>
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
