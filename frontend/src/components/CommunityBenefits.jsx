import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import { REGISTERED_SCHOOL, SCHOOL_GOAL } from '../lib/constants';
import {
  Download,
  Sun,
  Award,
  Trees,
  CheckCircle,
  TrendingUp,
  Building2,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  FileCheck,
  ThumbsUp,
  RotateCcw,
  Info,
} from 'lucide-react';

export default function CommunityBenefits({
  totalCO2 = 0,
  totalActions = 0,
  onExportCSV,
}) {
  const { user } = useAuth();
  const isSponsor = user?.role === 'sponsor';

  const [activeTab, setActiveTab] = useState('proposals'); // 'proposals' | 'projects' | 'report'
  const [totalFund, setTotalFund] = useState(50000); // 50,000 INR CSR sponsorship baseline
  const [solarPercent, setSolarPercent] = useState(50);
  const [scholarshipPercent, setScholarshipPercent] = useState(30);
  const [projectPercent, setProjectPercent] = useState(20);

  const [proposalStatus, setProposalStatus] = useState('pending'); // 'pending' | 'approved' | 'rejected'
  const [candidateProjects, setCandidateProjects] = useState([
    {
      id: 'p1',
      name: 'Campus Rooftop Solar Panel #1 (1.5 kW)',
      category: 'Solar Energy',
      cost: 25000,
      annualCO2Avoided: '820 kg CO₂/yr',
      status: 'Ready for funding',
      desc: 'Powers 3 campus science classrooms with 100% clean solar generation.',
    },
    {
      id: 'p2',
      name: 'Youth Climate Champions Scholarship Fund',
      category: 'Stipends',
      cost: 15000,
      annualCO2Avoided: 'Incentivizes 300+ actions',
      status: 'Active',
      desc: 'Provides ₹5,000 sustainability bursaries to top verified student climate champions.',
    },
    {
      id: 'p3',
      name: 'Classroom Rainwater Harvesting Tank (2,000L)',
      category: 'Water Conservation',
      cost: 10000,
      annualCO2Avoided: '120 kg CO₂/yr',
      status: 'Proposed',
      desc: 'Recharges groundwater and irrigates campus biodiversity plantation.',
    },
  ]);

  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectCost, setNewProjectCost] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProjectName || !newProjectCost) return;
    setCandidateProjects([
      ...candidateProjects,
      {
        id: `p_${Date.now()}`,
        name: newProjectName,
        category: 'Campus Eco Project',
        cost: Number(newProjectCost),
        annualCO2Avoided: 'Estimated 200 kg CO₂/yr',
        status: 'Proposed',
        desc: 'Candidate sustainability infrastructure proposal added by school.',
      },
    ]);
    setNewProjectName('');
    setNewProjectCost('');
    setShowAddProject(false);
  };

  const solarAmount = Math.round((totalFund * solarPercent) / 100);
  const scholarshipAmount = Math.round((totalFund * scholarshipPercent) / 100);
  const projectAmount = Math.round((totalFund * projectPercent) / 100);

  const solarCapacityKW = (solarAmount / 45000).toFixed(1);
  const studentScholarshipsCount = Math.floor(scholarshipAmount / 5000);
  const rainwaterTankCount = Math.floor(projectAmount / 10000);

  return (
    <div className="page-container gradient-mesh">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
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
            <Building2 size={16} />
            <span>{isSponsor ? 'CSR Sponsor Transparency Hub' : 'School & Community Benefit Optimizer'}</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            {isSponsor ? 'Sponsor Verified Impact & Grant Report' : 'Community Benefits & CSR Allocator'}
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#64748b', marginTop: '4px' }}>
            {isSponsor
              ? 'Read-only audit report: verify that every CSR rupee translates directly into verified student carbon reductions and campus solar.'
              : 'Multi-Agent Benefit Optimization: translate verified student actions into rooftop solar, green scholarships, and school grants.'}
          </p>
        </div>

        <button onClick={onExportCSV} className="btn-primary">
          <Download size={18} />
          Download Sponsor Report (CSV)
        </button>
      </div>

      {/* School Impact Summary Card */}
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
          gap: '20px',
        }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#a7f3d0', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.05em' }}>
              CAMPUS SUSTAINABILITY PARTNERSHIP
            </span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
              {REGISTERED_SCHOOL.name}
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#d1fae5', marginTop: '2px' }}>
              {REGISTERED_SCHOOL.city} • Verified School Coordinates & Geofence
            </p>
          </div>

          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>TOTAL VERIFIED CO₂</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fde047' }}>
                {totalCO2} <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>kg</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>IPCC AR6 standard</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>VERIFIED STUDENT ACTIONS</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff' }}>
                {totalActions}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>Unique photo proofs</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>CSR MATCHING GRANT</div>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: '#6ee7b7' }}>
                ₹{totalFund.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#a7f3d0' }}>100% impact-backed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '28px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '14px',
      }}>
        <button
          onClick={() => setActiveTab('proposals')}
          style={{
            padding: '10px 20px',
            borderRadius: '9999px',
            border: activeTab === 'proposals' ? '2px solid #10b981' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'proposals' ? '#ecfdf5' : '#ffffff',
            color: activeTab === 'proposals' ? '#065f46' : '#64748b',
            fontWeight: activeTab === 'proposals' ? 800 : 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Sparkles size={16} />
          <span>Benefit Allocation Proposals (AI Agent)</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          style={{
            padding: '10px 20px',
            borderRadius: '9999px',
            border: activeTab === 'projects' ? '2px solid #10b981' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'projects' ? '#ecfdf5' : '#ffffff',
            color: activeTab === 'projects' ? '#065f46' : '#64748b',
            fontWeight: activeTab === 'projects' ? 800 : 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Building2 size={16} />
          <span>Candidate Projects & Funds ({candidateProjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('report')}
          style={{
            padding: '10px 20px',
            borderRadius: '9999px',
            border: activeTab === 'report' ? '2px solid #10b981' : '1px solid #e2e8f0',
            backgroundColor: activeTab === 'report' ? '#ecfdf5' : '#ffffff',
            color: activeTab === 'report' ? '#065f46' : '#64748b',
            fontWeight: activeTab === 'report' ? 800 : 600,
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileCheck size={16} />
          <span>Sponsor Impact Certificate</span>
        </button>
      </div>

      {/* TAB 1: BENEFIT ALLOCATION PROPOSALS */}
      {activeTab === 'proposals' && (
        <div className="cs-card" style={{ padding: '32px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '24px',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="status-badge verified" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                  Multi-Agent AI Recommendation
                </span>
                {proposalStatus === 'approved' && (
                  <span style={{ backgroundColor: '#ecfdf5', color: '#059669', fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', border: '1px solid #a7f3d0' }}>
                    ✅ Approved by School Admin
                  </span>
                )}
                {proposalStatus === 'rejected' && (
                  <span style={{ backgroundColor: '#fff1f2', color: '#e11d48', fontSize: '0.78rem', fontWeight: 800, padding: '3px 10px', borderRadius: '9999px', border: '1px solid #fecdd3' }}>
                    ❌ Returned for Revision
                  </span>
                )}
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                Community Benefit Allocation Proposal #2026-Q4
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '2px' }}>
                The Community Benefit Optimization Agent synthesizes verified student carbon reductions with CSR grant criteria to recommend the optimal capital allocation.
              </p>
            </div>

            {!isSponsor && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => setProposalStatus('approved')}
                  disabled={proposalStatus === 'approved'}
                  className="btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                >
                  <ThumbsUp size={16} />
                  Approve Proposal
                </button>
                <button
                  onClick={() => setProposalStatus('rejected')}
                  disabled={proposalStatus === 'rejected'}
                  className="btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem', color: '#e11d48' }}
                >
                  <RotateCcw size={16} />
                  Reject & Rebalance
                </button>
              </div>
            )}
          </div>

          {/* AI Rationale Box */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginBottom: '28px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669', fontWeight: 700, fontSize: '0.9rem', marginBottom: '6px' }}>
              <Sparkles size={16} />
              <span>Multi-Agent Algorithmic Rationale:</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
              "Based on {totalCO2} kg CO₂ verified across {totalActions} actions, students have focused strongly on Tree Plantation and Waste Segregation. Allocating 50% (₹{solarAmount.toLocaleString()}) to Rooftop Solar establishes permanent clean energy infrastructure for the campus, 30% (₹{scholarshipAmount.toLocaleString()}) to Green Scholarships rewards underprivileged student leaders, and 20% (₹{projectAmount.toLocaleString()}) funds rainwater infrastructure, creating a complete circular benefit cycle."
            </p>
          </div>

          {/* Allocation Distribution Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}>
            <div style={{
              padding: '24px',
              borderRadius: '14px',
              border: '1px solid #fed7aa',
              backgroundColor: '#fffaf5',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sun size={20} color="#ea580c" />
                <span style={{ fontWeight: 800, color: '#9a3412', fontSize: '1.05rem' }}>
                  Campus Solar Rooftop ({solarPercent}%)
                </span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#9a3412' }}>
                ₹{solarAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#c2410c', marginTop: '6px' }}>
                Funds <strong>{solarCapacityKW} kW solar capacity</strong> powering 3 science labs.
              </div>
            </div>

            <div style={{
              padding: '24px',
              borderRadius: '14px',
              border: '1px solid #bfdbfe',
              backgroundColor: '#f8faff',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Award size={20} color="#2563eb" />
                <span style={{ fontWeight: 800, color: '#1e40af', fontSize: '1.05rem' }}>
                  Youth Green Scholarships ({scholarshipPercent}%)
                </span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#1e40af' }}>
                ₹{scholarshipAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#1d4ed8', marginTop: '6px' }}>
                Supports <strong>{studentScholarshipsCount} student climate grants</strong> (₹5,000 each).
              </div>
            </div>

            <div style={{
              padding: '24px',
              borderRadius: '14px',
              border: '1px solid #bbf7d0',
              backgroundColor: '#f6fdf9',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Trees size={20} color="#059669" />
                <span style={{ fontWeight: 800, color: '#065f46', fontSize: '1.05rem' }}>
                  School Green Projects ({projectPercent}%)
                </span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#065f46' }}>
                ₹{projectAmount.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#047857', marginTop: '6px' }}>
                Funds <strong>{rainwaterTankCount} rainwater / composting units</strong> on campus.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CANDIDATE PROJECTS & FUNDS */}
      {activeTab === 'projects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>
                Campus Candidate Projects Queue
              </h2>
              <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                School infrastructure projects awaiting CSR sponsor funding allocation
              </p>
            </div>

            {!isSponsor && (
              <button onClick={() => setShowAddProject(!showAddProject)} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <PlusCircle size={16} />
                Add Candidate Project
              </button>
            )}
          </div>

          {showAddProject && (
            <form onSubmit={handleAddProject} className="cs-card" style={{ padding: '24px', marginBottom: '24px', border: '2px solid #10b981' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px' }}>
                Add New Candidate Project
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    required
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="form-input"
                    placeholder="e.g. Science Lab Energy Efficiency LED Retrofit"
                  />
                </div>
                <div>
                  <label className="form-label">Estimated Budget (₹ INR)</label>
                  <input
                    type="number"
                    required
                    min="1000"
                    value={newProjectCost}
                    onChange={(e) => setNewProjectCost(e.target.value)}
                    className="form-input"
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddProject(false)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ padding: '8px 18px' }}>
                  Save Project
                </button>
              </div>
            </form>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}>
            {candidateProjects.map((proj) => (
              <div key={proj.id} className="stat-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span className="status-badge verified" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                    {proj.category}
                  </span>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669' }}>
                    ₹{proj.cost.toLocaleString()}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
                  {proj.name}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>
                  {proj.desc}
                </p>
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.78rem',
                  color: '#475569',
                }}>
                  Impact: <strong>{proj.annualCO2Avoided}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SPONSOR IMPACT REPORT */}
      {activeTab === 'report' && (
        <div className="cs-card" style={{ padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '9999px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <ShieldCheck size={36} />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              Official CSR Verified Impact Certificate
            </h2>
            <p style={{ fontSize: '0.92rem', color: '#64748b', maxWidth: '520px', margin: '4px auto 0' }}>
              Compliant with Section 135 Schedule VII of the Indian Companies Act & IPCC AR6 Reporting Guidelines
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px',
            padding: '24px',
            borderRadius: '14px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            marginBottom: '28px',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>PARTNER INSTITUTION</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                {REGISTERED_SCHOOL.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ernakulam, Kerala</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>TOTAL CARBON AVOIDED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#059669', marginTop: '2px' }}>
                {totalCO2} kg CO₂e
              </div>
              <div style={{ fontSize: '0.75rem', color: '#059669' }}>Cryptographically verified</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>CSR GRANT ALLOCATED</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>
                ₹{totalFund.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Clean energy & student stipends</div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>VERIFICATION STANDARD</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                IPCC AR6 + CEA v19
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Multi-agent geofence check</div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button onClick={onExportCSV} className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.95rem' }}>
              <Download size={18} />
              Export Certified Sponsor Compliance Data (CSV)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
