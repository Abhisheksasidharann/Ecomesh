import React, { useState } from 'react';
import { useAuth } from './lib/auth';
import { useSubmissions } from './lib/submissionsStore';
import Sidebar from './components/Sidebar';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import UploadAction from './components/UploadAction';
import HowItWorks from './components/HowItWorks';
import AdminReview from './components/AdminReview';
import CommunityBenefits from './components/CommunityBenefits';
import MissionsHub from './components/MissionsHub';
import CampusRegistry from './components/CampusRegistry';
import Leaderboard from './components/Leaderboard';
import MyHistory from './components/MyHistory';
import ImpactCalculator from './components/ImpactCalculator';
import StudentCertificate from './components/StudentCertificate';

export default function App() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const role = user?.role || 'student';

  const {
    submissions,
    verifiedOnly,
    reviewOnly,
    totalCO2,
    totalActions,
    totalPoints,
    totalPendingReviews,
    categoryData,
    addSubmission,
    reviewSubmission,
    exportComplianceCSV,
    refreshSubmissions,
  } = useSubmissions(role);

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '44px',
            height: '44px',
            border: '3px solid #e2e8f0',
            borderTopColor: '#10b981',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: 600 }}>
            Loading EcoMesh platform...
          </p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setActiveTab('dashboard')} />;
  }

  // role is declared above, near useSubmissions

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Strict Role-Based Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingReviewCount={totalPendingReviews}
        submissions={submissions}
      />

      {/* Main Fluid Content Canvas */}
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto', minHeight: '100vh' }}>
        {/* 1. Dashboard (Role-specific overview) */}
        {activeTab === 'dashboard' && (
          <Dashboard
            user={user}
            activeRole={role}
            submissions={submissions}
            totalCO2={totalCO2}
            totalActions={totalActions}
            totalPoints={totalPoints}
            totalPendingReviews={totalPendingReviews}
            categoryData={categoryData}
            onNavigateUpload={() => setActiveTab('upload')}
            onNavigateAdmin={() => setActiveTab('admin')}
            onNavigateBenefits={() => setActiveTab('benefits')}
            onExportCSV={exportComplianceCSV}
          />
        )}

        {/* 2. Log Action Studio (STUDENT ONLY) */}
        {activeTab === 'upload' && role === 'student' && (
          <UploadAction
            onSubmissionAdded={async (data) => {
              await addSubmission(data);
              setActiveTab('dashboard');
            }}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {/* 3. Badges & Missions Hub (STUDENT ONLY) */}
        {activeTab === 'badges' && role === 'student' && (
          <MissionsHub
            verifiedOnly={verifiedOnly}
            totalPoints={totalPoints}
            onNavigateUpload={() => setActiveTab('upload')}
          />
        )}

        {/* 4. Campus Leaderboard (STUDENT ONLY) */}
        {activeTab === 'leaderboard' && role === 'student' && (
          <Leaderboard
            totalCO2={totalCO2}
          />
        )}

        {/* 5. My Proof History (STUDENT ONLY) */}
        {activeTab === 'history' && role === 'student' && (
          <MyHistory
            submissions={submissions}
            onNavigateUpload={() => setActiveTab('upload')}
            onRefresh={refreshSubmissions}
          />
        )}

        {/* 6. School Action Feed (ALL ROLES) */}
        {activeTab === 'registry' && (
          <CampusRegistry
            submissions={submissions}
            onExportCSV={exportComplianceCSV}
          />
        )}

        {/* 7. IPCC Carbon Impact Simulator (STUDENT ONLY) */}
        {activeTab === 'calculator' && role === 'student' && (
          <ImpactCalculator
            onNavigateUpload={() => setActiveTab('upload')}
          />
        )}

        {/* 8. Student Climate Credential Certificate (STUDENT ONLY) */}
        {activeTab === 'certificate' && role === 'student' && (
          <StudentCertificate
            submissions={submissions}
          />
        )}

        {/* 9. How EcoMesh Works (ALL ROLES) */}
        {activeTab === 'how-it-works' && (
          <HowItWorks />
        )}

        {/* 8. Teacher Review Desk (TEACHER / ADMIN ONLY) */}
        {activeTab === 'admin' && (role === 'admin' || role === 'teacher') && (
          <AdminReview
            reviewOnly={reviewOnly}
            onReviewAction={reviewSubmission}
          />
        )}

        {/* 9. School & Community Benefits (TEACHER & SPONSOR ONLY) */}
        {activeTab === 'benefits' && (role === 'admin' || role === 'sponsor') && (
          <CommunityBenefits
            totalCO2={totalCO2}
            totalActions={totalActions}
            onExportCSV={exportComplianceCSV}
          />
        )}
      </main>
    </div>
  );
}
