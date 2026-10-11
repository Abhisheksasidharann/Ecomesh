import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import {
  Mail,
  Lock,
  User,
  Building,
  AlertCircle,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Building2,
  HeartHandshake,
} from 'lucide-react';

// Leaf icon matching CartSage
const LeafIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const SLIDES = [
  {
    titleLine1: 'Start Your',
    titleLine2: 'Eco-Journey',
    subtitle: 'Join students and educators turning everyday environmental habits into certified campus impact.',
    features: [
      'Track grocery and campus carbon footprint',
      'Verify actions with photo proof & GPS radius',
      'Earn EcoPoints, habit streaks & milestone badges',
      'Fund school rooftop solar panels and green grants',
    ],
  },
  {
    titleLine1: 'Verified Action,',
    titleLine2: 'Real Science',
    subtitle: 'Every submission is calculated against official IPCC AR6 greenhouse gas standards.',
    features: [
      'Multi-signal checks for photos, time & location',
      'Instant duplicate detection prevents double claims',
      'Teacher review desk ensures complete integrity',
      'Export auditable carbon reports for school sponsors',
    ],
  },
  {
    titleLine1: 'Empower Your',
    titleLine2: 'Whole Campus',
    subtitle: 'Collective youth actions unlock real institutional funding from community CSR sponsors.',
    features: [
      'Collective school goal for 1.5 kW rooftop solar',
      'CSR grant matching based on verified school impact',
      'Official climate certificates for student portfolios',
      'Direct contribution to United Nations SDG 13',
    ],
  },
];

export default function AuthPage({ onAuthSuccess }) {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState('student');
  const [signupSchool, setSignupSchool] = useState('Model Higher Secondary School');
  const [signupClass, setSignupClass] = useState('Class 11-A');
  const [signupHouse, setSignupHouse] = useState('Terra House');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Left side slide rotation
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const handleSignIn = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signIn(loginEmail, loginPassword);
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!signupName.trim()) throw new Error('Please enter your full name.');
      await signUp({
        email: signupEmail,
        password: signupPassword,
        name: signupName,
        role: signupRole,
        school: signupSchool,
        studentClass: signupRole === 'student' ? signupClass : null,
        studentHouse: signupRole === 'student' ? signupHouse : null,
      });
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const activeSlideData = SLIDES[currentSlide];

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      backgroundColor: '#ffffff',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    }}>
      {/* LEFT SIDE - CartSage Exact Full-Height Gradient Panel with Slide Transitions */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          flex: '1 1 50%',
          minHeight: '100vh',
          background: 'linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%)',
          padding: '64px 72px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderRight: '1px solid #e2e8f0',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '520px', width: '100%', margin: '0 auto' }}>
          {/* CartSage Icon Box */}
          <div style={{
            width: '96px',
            height: '96px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            marginBottom: '40px',
            boxShadow: '0 12px 40px rgba(16, 185, 129, 0.4)',
          }}>
            <LeafIcon />
          </div>

          {/* CartSage Animated Slide Container */}
          <div style={{ minHeight: '380px' }}>
            <h1 className="gradient-text" style={{
              fontSize: '3.6rem',
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: '-0.035em',
              marginBottom: '20px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {activeSlideData.titleLine1}
              <br />
              {activeSlideData.titleLine2}
            </h1>

            <p style={{
              color: '#4b5563',
              fontSize: '1.15rem',
              lineHeight: 1.75,
              marginBottom: '36px',
              fontWeight: 400,
            }}>
              {activeSlideData.subtitle}
            </p>

            {/* CartSage Feature Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '40px' }}>
              {activeSlideData.features.map((feature, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                  }}>
                    <Check size={16} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: '1.05rem', color: '#1f2937', fontWeight: 600 }}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Slide Indicator Dots + Switch Controls */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '24px',
            borderTop: '1px solid rgba(16, 185, 129, 0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  style={{
                    width: currentSlide === idx ? '32px' : '8px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: currentSlide === idx ? '#10b981' : '#a7f3d0',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1fae5',
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d1fae5',
                  color: '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                }}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - CartSage Exact Clean White Form */}
      <div style={{
        flex: '1 1 50%',
        minHeight: '100vh',
        padding: '64px 72px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
      }}>
        <div style={{ maxWidth: '480px', width: '100%', margin: '0 auto' }}>
          {/* Segmented Mode Switcher */}
          <div className="auth-switch-container">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError(null);
              }}
              className={`auth-switch-tab ${!isSignUp ? 'active' : ''}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError(null);
              }}
              className={`auth-switch-tab ${isSignUp ? 'active' : ''}`}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div className="cs-alert error" style={{ marginBottom: '24px' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {!isSignUp ? (
            <div>
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.025em',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginBottom: '8px',
                }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#64748b' }}>
                  Sign in to continue your eco-journey
                </p>
              </div>

              <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="form-input"
                      style={{ paddingLeft: '48px', height: '56px', fontSize: '1rem', borderRadius: '14px' }}
                    />
                    <Mail size={19} style={{ position: 'absolute', left: '16px', top: '18px', color: '#94a3b8' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      style={{ paddingLeft: '48px', height: '56px', fontSize: '1rem', borderRadius: '14px' }}
                    />
                    <Lock size={19} style={{ position: 'absolute', left: '16px', top: '18px', color: '#94a3b8' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="gradient-btn"
                  style={{
                    width: '100%',
                    height: '56px',
                    borderRadius: '14px',
                    fontSize: '1.08rem',
                    fontWeight: 700,
                    marginTop: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <span>{loading ? 'Signing in...' : 'Sign In to EcoMesh'}</span>
                  <ArrowRight size={19} />
                </button>
              </form>

              <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.95rem', color: '#64748b' }}>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0d9488',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: 'inherit',
                  }}
                >
                  Create free account
                </button>
              </div>
            </div>
          ) : (
            /* CREATE ACCOUNT FORM */
            <div>
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{
                  fontSize: '2.2rem',
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.025em',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginBottom: '8px',
                }}>
                  Join EcoMesh
                </h2>
                <p style={{ fontSize: '1.05rem', color: '#64748b' }}>
                  Create your account to start making verified climate impact
                </p>
              </div>

              <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      placeholder="Your full name"
                      className="form-input"
                      style={{ paddingLeft: '48px', height: '54px', borderRadius: '14px' }}
                    />
                    <User size={19} style={{ position: 'absolute', left: '16px', top: '17px', color: '#94a3b8' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Account Role</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'student', label: 'Student', icon: <GraduationCap size={15} /> },
                      { id: 'admin', label: 'Teacher', icon: <Building2 size={15} /> },
                      { id: 'sponsor', label: 'Sponsor', icon: <HeartHandshake size={15} /> },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSignupRole(r.id)}
                        style={{
                          padding: '11px 8px',
                          borderRadius: '12px',
                          border: signupRole === r.id ? '2px solid #10b981' : '1px solid #e2e8f0',
                          backgroundColor: signupRole === r.id ? '#ecfdf5' : '#ffffff',
                          color: signupRole === r.id ? '#047857' : '#64748b',
                          fontSize: '0.86rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {r.icon}
                        <span>{r.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Student Class and House selectors as requested */}
                {signupRole === 'student' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Grade / Class</label>
                      <select
                        value={signupClass}
                        onChange={(e) => setSignupClass(e.target.value)}
                        className="form-input"
                        style={{ height: '54px', borderRadius: '14px', paddingLeft: '16px' }}
                      >
                        <option value="Class 11-A">Class 11-A</option>
                        <option value="Class 11-B">Class 11-B</option>
                        <option value="Class 10-A">Class 10-A</option>
                        <option value="Class 10-B">Class 10-B</option>
                        <option value="Class 12-A">Class 12-A</option>
                        <option value="Class 12-B">Class 12-B</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">School House</label>
                      <select
                        value={signupHouse}
                        onChange={(e) => setSignupHouse(e.target.value)}
                        className="form-input"
                        style={{ height: '54px', borderRadius: '14px', paddingLeft: '16px' }}
                      >
                        <option value="Terra House">🌍 Terra House</option>
                        <option value="Solar House">☀️ Solar House</option>
                        <option value="Aqua House">💧 Aqua House</option>
                        <option value="Flora House">🌸 Flora House</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">School / Organization</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={signupSchool}
                      onChange={(e) => setSignupSchool(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '48px', height: '54px', borderRadius: '14px' }}
                    />
                    <Building size={19} style={{ position: 'absolute', left: '16px', top: '17px', color: '#94a3b8' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="form-input"
                      style={{ paddingLeft: '48px', height: '54px', borderRadius: '14px' }}
                    />
                    <Mail size={19} style={{ position: 'absolute', left: '16px', top: '17px', color: '#94a3b8' }} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      style={{ paddingLeft: '48px', height: '54px', borderRadius: '14px' }}
                    />
                    <Lock size={19} style={{ position: 'absolute', left: '16px', top: '17px', color: '#94a3b8' }} />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="gradient-btn"
                  style={{
                    width: '100%',
                    height: '56px',
                    borderRadius: '14px',
                    fontSize: '1.08rem',
                    fontWeight: 700,
                    marginTop: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    background: 'linear-gradient(135deg, #0d9488 0%, #10b981 100%)',
                    color: '#ffffff',
                    border: 'none',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <span>{loading ? 'Creating Account...' : 'Complete Sign Up'}</span>
                  <ArrowRight size={19} />
                </button>
              </form>

              <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.95rem', color: '#64748b' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0d9488',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: 'inherit',
                  }}
                >
                  Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
