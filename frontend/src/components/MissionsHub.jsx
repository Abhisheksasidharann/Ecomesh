import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { Award, Flame, CheckCircle2, Target, Sparkles, Trophy, ArrowRight, Zap, Leaf } from 'lucide-react';

const EXTENDED_BADGES = [
  {
    id: 'first_step',
    name: 'First Green Step',
    description: 'Submit your first verified green action on campus or at home.',
    color: '#10b981',
    icon: '🌱',
    target: 1,
    unit: 'action',
  },
  {
    id: 'three_day_streak',
    name: '3-Day Habit Streak',
    description: 'Keep a consistent climate habit across 3 verified submissions.',
    color: '#ea580c',
    icon: '🔥',
    target: 3,
    unit: 'actions',
  },
  {
    id: 'fifty_kg_club',
    name: '50 kg Carbon Club',
    description: 'Achieve 50 kg of verified carbon dioxide prevented.',
    color: '#0d9488',
    icon: '🌍',
    target: 50,
    unit: 'kg CO₂',
  },
  {
    id: 'solar_pioneer',
    name: 'Solar Energy Pioneer',
    description: 'Contribute verified clean solar electricity generation.',
    color: '#f59e0b',
    icon: '☀️',
    target: 1,
    unit: 'solar action',
  },
  {
    id: 'waste_champion',
    name: 'Zero-Waste Champion',
    description: 'Segregate recyclables and divert 10 kg of waste from landfills.',
    color: '#0284c7',
    icon: '♻️',
    target: 10,
    unit: 'kg waste',
  },
  {
    id: 'water_guardian',
    name: 'Water Conservationist',
    description: 'Report and save water usage around campus gardens or taps.',
    color: '#06b6d4',
    icon: '💧',
    target: 1,
    unit: 'water action',
  },
];

export default function MissionsHub({ verifiedOnly = [], onNavigateUpload }) {
  const { user } = useAuth();
  const [claimedQuests, setClaimedQuests] = useState({});

  // User-specific stats
  const userActions = verifiedOnly.filter(
    (s) => s.student_email === user?.email || s.user_id === user?.id
  );
  const userCO2 = userActions.reduce((acc, curr) => acc + (Number(curr.co2_saved) || 0), 0);
  const userPoints = userActions.reduce((acc, curr) => acc + (Number(curr.points) || 0), 0);
  const wasteSorted = userActions.filter(s => s.activity === 'waste').reduce((acc, curr) => acc + (Number(curr.quantity) || 0), 0);

  // Dynamic Badge Unlocks based on actual verified records
  const getBadgeProgress = (badgeId) => {
    if (badgeId === 'first_step') return { current: userActions.length, target: 1, unlocked: userActions.length >= 1 };
    if (badgeId === 'three_day_streak') return { current: userActions.length, target: 3, unlocked: userActions.length >= 3 };
    if (badgeId === 'fifty_kg_club') return { current: Math.round(userCO2), target: 50, unlocked: userCO2 >= 50 };
    if (badgeId === 'solar_pioneer') {
      const hasSolar = userActions.some((s) => s.activity === 'solar');
      return { current: hasSolar ? 1 : 0, target: 1, unlocked: hasSolar };
    }
    if (badgeId === 'waste_champion') return { current: Math.round(wasteSorted), target: 10, unlocked: wasteSorted >= 10 };
    if (badgeId === 'water_guardian') {
      const hasWater = userActions.some((s) => s.activity === 'water');
      return { current: hasWater ? 1 : 0, target: 1, unlocked: hasWater };
    }
    return { current: 0, target: 1, unlocked: false };
  };

  const unlockedCount = EXTENDED_BADGES.filter(b => getBadgeProgress(b.id).unlocked).length;

  const quests = [
    { id: 'q1', title: 'Plant a Native Sapling', reward: '+30 EcoPoints', target: 'School biology garden', hint: 'Takes ~10 kg CO₂ out of atmosphere', icon: '🌳' },
    { id: 'q2', title: 'Zero-Emission Commute', reward: '+15 EcoPoints', target: 'Bicycle or walk to school', hint: 'Prevents tailpipe emissions', icon: '🚲' },
    { id: 'q3', title: 'Classroom Energy Check', reward: '+20 EcoPoints', target: 'Ensure fans and lights are off', hint: 'Saves campus grid electricity', icon: '💡' },
    { id: 'q4', title: 'Sort Lunch Recyclables', reward: '+15 EcoPoints', target: 'School green bin station', hint: 'Segregates compost and plastics', icon: '🍱' },
  ];

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
          <span>Gamified Student Rewards</span>
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Badges & Daily Missions
        </h1>
        <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '4px' }}>
          Complete daily climate quests, build your streak, and unlock milestone achievement badges.
        </p>
      </div>

      {/* Gamification Progress Summary Card */}
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
          gap: '20px',
        }}>
          <div>
            <span style={{ fontSize: '0.85rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              Student Level: Eco Advocate 🌿
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              {user?.name || user?.email}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#d1fae5', marginTop: '2px' }}>
              {user?.school || 'Model Higher Secondary School'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>ECOPOINTS</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fde047' }}>
                +{userPoints}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>VERIFIED CO₂</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                {userCO2.toFixed(1)} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>kg</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>BADGES UNLOCKED</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#6ee7b7' }}>
                {unlockedCount} / {EXTENDED_BADGES.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quests Section */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
              Today's Daily Quests
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
              Complete these daily sustainability missions to earn bonus EcoPoints
            </p>
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', backgroundColor: '#ecfdf5', padding: '5px 12px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
            Resets at Midnight
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '18px',
        }}>
          {quests.map((quest) => {
            const isClaimed = claimedQuests[quest.id];
            return (
              <div
                key={quest.id}
                className="stat-card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  backgroundColor: isClaimed ? '#f0fdf4' : '#ffffff',
                  borderColor: isClaimed ? '#a7f3d0' : '#e2e8f0',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ fontSize: '2rem' }}>{quest.icon}</span>
                    <span className="status-badge verified" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                      {quest.reward}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
                    {quest.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#059669', fontWeight: 600, marginBottom: '8px' }}>
                    Target: {quest.target}
                  </p>
                  <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {quest.hint}
                  </p>
                </div>

                <div style={{ marginTop: '20px' }}>
                  {isClaimed ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#059669',
                      fontWeight: 700,
                      fontSize: '0.88rem',
                    }}>
                      <CheckCircle2 size={18} />
                      Quest Completed!
                    </div>
                  ) : (
                    <button
                      onClick={() => onNavigateUpload ? onNavigateUpload() : setClaimedQuests({ ...claimedQuests, [quest.id]: true })}
                      className="btn-primary"
                      style={{ width: '100%', padding: '10px 14px', fontSize: '0.88rem' }}
                    >
                      <Target size={15} />
                      Log This Action
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges Showcase Grid */}
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
            Milestone Achievement Badges
          </h2>
          <p style={{ fontSize: '0.88rem', color: '#64748b' }}>
            Earn badges as your verified climate impact reaches real thresholds
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '22px',
        }}>
          {EXTENDED_BADGES.map((badge) => {
            const { current, target, unlocked } = getBadgeProgress(badge.id);
            const progress = Math.min(100, Math.round((current / target) * 100));

            return (
              <div
                key={badge.id}
                className="stat-card"
                style={{
                  padding: '26px',
                  backgroundColor: unlocked ? 'linear-gradient(180deg, #f0fdf4 0%, #ffffff 100%)' : '#ffffff',
                  border: unlocked ? '2px solid #a7f3d0' : '1px solid #e2e8f0',
                  boxShadow: unlocked ? '0 10px 30px rgba(16, 185, 129, 0.12)' : '0 4px 14px rgba(0, 0, 0, 0.02)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '16px',
                    backgroundColor: unlocked ? '#ecfdf5' : '#f1f5f9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    boxShadow: unlocked ? '0 6px 18px rgba(16, 185, 129, 0.25)' : 'none',
                    border: unlocked ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                  }}>
                    {badge.icon}
                  </div>
                  <div>
                    <span style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      color: unlocked ? '#059669' : '#94a3b8',
                      letterSpacing: '0.04em',
                    }}>
                      {unlocked ? 'Unlocked 🎖️' : 'Locked'}
                    </span>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>
                      {badge.name}
                    </h3>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, marginBottom: '18px' }}>
                  {badge.description}
                </p>

                {/* Progress bar towards unlock */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b', marginBottom: '6px', fontWeight: 600 }}>
                    <span>Progress: {current} / {target} {badge.unit}</span>
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
                      backgroundColor: unlocked ? '#10b981' : '#0d9488',
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
