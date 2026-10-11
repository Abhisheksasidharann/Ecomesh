import React from 'react';
import { useAuth } from '../lib/auth';
import {
  LayoutDashboard,
  PlusCircle,
  ShieldCheck,
  Building2,
  Award,
  LogOut,
  User,
  GraduationCap,
  Building,
  HeartHandshake,
  Lightbulb,
  FileSpreadsheet,
  Trophy,
  Camera,
  Calculator,
  Flame,
  Sparkles,
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  currentRole,
  onSwitchRole,
  pendingReviewCount = 0,
  submissions = [],
}) {
  const { user, signOut } = useAuth();
  const role = currentRole || user?.role || 'student';

  // Calculate live student level and badge progress
  const myVerified = submissions.filter(
    (s) => (s.student_email === user?.email || s.user_id === user?.id) && s.status === 'verified'
  );
  const myCO2 = myVerified.reduce((acc, curr) => acc + (Number(curr.co2_saved) || 0), 0);
  const myActions = myVerified.length;
  const streakDays = Math.min(7, myActions);
  const level = myCO2 >= 100 ? 5 : myCO2 >= 50 ? 4 : myCO2 >= 20 ? 3 : myCO2 >= 5 ? 2 : 1;
  const targetNext = myCO2 < 50 ? 50 : 100;
  const nextBadgeName = myCO2 < 50 ? '50 kg Carbon Club' : 'Century 100kg Champion';
  const progressPercent = Math.min(100, Math.round((myCO2 / targetNext) * 100));

  const getRoleBadge = () => {
    if (role === 'admin') {
      return {
        label: 'Teacher / School Admin',
        icon: <Building size={14} />,
        bg: '#fef3c7',
        color: '#b45309',
        border: '#fde68a',
      };
    }
    if (role === 'sponsor') {
      return {
        label: 'Community Sponsor',
        icon: <HeartHandshake size={14} />,
        bg: '#eff6ff',
        color: '#1d4ed8',
        border: '#bfdbfe',
      };
    }
    return {
      label: 'Student Citizen',
      icon: <GraduationCap size={14} />,
      bg: '#ecfdf5',
      color: '#047857',
      border: '#a7f3d0',
    };
  };

  const badge = getRoleBadge();

  return (
    <aside style={{
      width: '290px',
      minWidth: '290px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e2e8f0',
      height: '100vh',
      position: 'sticky',
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      zIndex: 40,
      boxShadow: '2px 0 12px rgba(0, 0, 0, 0.03)',
    }}>
      {/* Top Section with Scrollable Menu */}
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: '16px' }}>
        {/* Brand Header */}
        <div style={{
          padding: '24px 20px 20px',
          borderBottom: '1px solid #f1f5f9',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)',
              flexShrink: 0,
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
            </div>
            <div>
              <div style={{
                fontSize: '1.45rem',
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                lineHeight: 1.15,
              }}>
                EcoMesh
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                Youth Climate Platform
              </div>
            </div>
          </div>

          {/* User's Role Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 14px',
            borderRadius: '10px',
            backgroundColor: badge.bg,
            color: badge.color,
            border: `1px solid ${badge.border}`,
            fontSize: '0.82rem',
            fontWeight: 700,
            width: '100%',
          }}>
            {badge.icon}
            <span>{badge.label}</span>
          </div>

          <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '8px', paddingLeft: '4px', fontWeight: 500 }}>
            {user?.school || 'Model Higher Secondary School'}
          </div>
        </div>

        {/* Navigation Section */}
        <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* GROUP 1: CORE ACTIONS */}
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94a3b8',
              padding: '0 10px 8px',
            }}>
              {role === 'student' ? 'Actions & Tracking' : 'Overview & Control'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
              >
                <LayoutDashboard size={19} />
                <span>
                  {role === 'admin' ? 'Teacher Overview' : role === 'sponsor' ? 'Sponsor Overview' : 'My Dashboard'}
                </span>
              </button>

              {role === 'student' && (
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`sidebar-nav-item ${activeTab === 'upload' ? 'active' : ''}`}
                >
                  <PlusCircle size={19} />
                  <span>Log Green Action</span>
                  <span style={{
                    marginLeft: 'auto',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    borderRadius: '6px',
                    padding: '2px 6px',
                  }}>
                    + NEW
                  </span>
                </button>
              )}

              {role === 'student' && (
                <button
                  onClick={() => setActiveTab('history')}
                  className={`sidebar-nav-item ${activeTab === 'history' ? 'active' : ''}`}
                >
                  <Camera size={19} />
                  <span>My Action Proofs</span>
                </button>
              )}

              {role === 'admin' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`sidebar-nav-item ${activeTab === 'admin' ? 'active' : ''}`}
                  style={{ position: 'relative' }}
                >
                  <ShieldCheck size={19} />
                  <span>Review Submissions</span>
                  {pendingReviewCount > 0 && (
                    <span style={{
                      marginLeft: 'auto',
                      backgroundColor: '#ea580c',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      borderRadius: '9999px',
                      padding: '2px 8px',
                    }}>
                      {pendingReviewCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* GROUP 2: GAMIFICATION & COMMUNITY */}
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94a3b8',
              padding: '0 10px 8px',
            }}>
              {role === 'student' ? 'Gamification & Campus' : 'Community Benefits'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {role === 'student' && (
                <>
                  <button
                    onClick={() => setActiveTab('badges')}
                    className={`sidebar-nav-item ${activeTab === 'badges' ? 'active' : ''}`}
                  >
                    <Award size={19} />
                    <span>Badges & Missions</span>
                    <span style={{
                      marginLeft: 'auto',
                      backgroundColor: '#ecfdf5',
                      color: '#059669',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      padding: '2px 6px',
                    }}>
                      Quests
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`sidebar-nav-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
                  >
                    <Trophy size={19} />
                    <span>Campus Leaderboard</span>
                  </button>
                </>
              )}

              {(role === 'admin' || role === 'sponsor') && (
                <button
                  onClick={() => setActiveTab('benefits')}
                  className={`sidebar-nav-item ${activeTab === 'benefits' ? 'active' : ''}`}
                >
                  <Building2 size={19} />
                  <span>CSR Grant Allocator</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('registry')}
                className={`sidebar-nav-item ${activeTab === 'registry' ? 'active' : ''}`}
              >
                <FileSpreadsheet size={19} />
                <span>School Action Feed</span>
              </button>
            </div>
          </div>

          {/* GROUP 3: TOOLS, CERTIFICATES & LEARNING */}
          <div>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94a3b8',
              padding: '0 10px 8px',
            }}>
              {role === 'student' ? 'Simulator & Credentials' : 'Information'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {role === 'student' && (
                <>
                  <button
                    onClick={() => setActiveTab('calculator')}
                    className={`sidebar-nav-item ${activeTab === 'calculator' ? 'active' : ''}`}
                  >
                    <Calculator size={19} />
                    <span>Impact Simulator</span>
                    <span style={{
                      marginLeft: 'auto',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      borderRadius: '6px',
                      padding: '2px 6px',
                    }}>
                      IPCC
                    </span>
                  </button>

                  <button
                    onClick={() => setActiveTab('certificate')}
                    className={`sidebar-nav-item ${activeTab === 'certificate' ? 'active' : ''}`}
                  >
                    <GraduationCap size={19} />
                    <span>Climate Certificate</span>
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab('how-it-works')}
                className={`sidebar-nav-item ${activeTab === 'how-it-works' ? 'active' : ''}`}
              >
                <Lightbulb size={19} />
                <span>How EcoMesh Works</span>
              </button>
            </div>
          </div>

          {/* In-Sidebar Student Mini-Progress Widget (Fills space with active gamification) */}
          {role === 'student' && (
            <div style={{
              marginTop: '8px',
              padding: '16px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '1px solid #bbf7d0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={16} style={{ color: '#ea580c' }} />
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0f172a' }}>
                    Active Streak: {streakDays > 0 ? `${streakDays} Days` : 'Day 1'}
                  </span>
                </div>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#047857',
                  backgroundColor: '#d1fae5',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}>
                  Lvl {level}
                </span>
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', marginBottom: '8px' }}>
                Next Badge: <strong>{nextBadgeName}</strong> ({progressPercent}% done)
              </div>
              <div style={{
                height: '6px',
                width: '100%',
                backgroundColor: '#d1fae5',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPercent}%`,
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  borderRadius: '9999px',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: User Profile & Sign Out */}
      <div style={{
        padding: '18px 20px',
        borderTop: '1px solid #f1f5f9',
        backgroundColor: '#fafbfc',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '9999px',
              backgroundColor: '#ecfdf5',
              border: '2px solid #a7f3d0',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1rem',
              flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || <User size={18} />}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{
                fontSize: '0.9rem',
                fontWeight: 700,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.name}
              </div>
              <div style={{
                fontSize: '0.76rem',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {user?.email}
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            title="Sign Out"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#e11d48';
              e.currentTarget.style.backgroundColor = '#ffe4e6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut size={19} />
          </button>
        </div>
      </div>
    </aside>
  );
}
