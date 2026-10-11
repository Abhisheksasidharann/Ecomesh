import React, { useState } from 'react';
import { REGISTERED_SCHOOL } from '../lib/constants';
import { Download, Sun, Award, Trees, CheckCircle, TrendingUp, Building2 } from 'lucide-react';

export default function CommunityBenefits({
  totalCO2 = 0,
  totalActions = 0,
  onExportCSV,
}) {
  const [totalFund, setTotalFund] = useState(50000); // 50,000 INR baseline CSR sponsorship grant
  const [solarPercent, setSolarPercent] = useState(50);
  const [scholarshipPercent, setScholarshipPercent] = useState(30);
  const [projectPercent, setProjectPercent] = useState(20);

  // Rebalance sliders so total is always 100%
  const handleSolarChange = (val) => {
    const num = Number(val);
    setSolarPercent(num);
    const rem = 100 - num;
    setScholarshipPercent(Math.round(rem * 0.6));
    setProjectPercent(rem - Math.round(rem * 0.6));
  };

  const solarAmount = Math.round((totalFund * solarPercent) / 100);
  const scholarshipAmount = Math.round((totalFund * scholarshipPercent) / 100);
  const projectAmount = Math.round((totalFund * projectPercent) / 100);

  // Multiplier formulas based on verified CO2 saved
  const solarCapacityKW = (solarAmount / 45000).toFixed(1); // ~45,000 INR per 1 kW solar rooftop
  const studentScholarshipsCount = Math.floor(scholarshipAmount / 5000); // 5,000 INR green stipend per student
  const rainwaterTankCount = Math.floor(projectAmount / 15000); // 15,000 INR per rainwater conservation tank

  return (
    <div className="page-container">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
            School & Community Benefits
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '2px' }}>
            Turning verified student actions into school solar power, student scholarships, and green projects
          </p>
        </div>

        <button onClick={onExportCSV} className="btn-primary">
          <Download size={18} />
          Download Benefits Report (CSV)
        </button>
      </div>

      {/* School Impact Certificate Card */}
      <div className="cs-card" style={{
        marginBottom: '32px',
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e6fffa 100%)',
        border: '1px solid #a7f3d0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: '#059669',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Building2 size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#064e3b' }}>
              {REGISTERED_SCHOOL.name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#047857' }}>
              Campus: {REGISTERED_SCHOOL.city} • Verified School Grounds
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '20px',
          border: '1px solid #d1fae5',
        }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>School Total CO₂ Saved</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#059669' }}>
              {totalCO2.toLocaleString()} kg
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Official Climate Standard</div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Verified Student Actions</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0284c7' }}>
              {totalActions}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Unique Photo Verified</div>
          </div>

          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>UN Sustainable Goals</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
              <span className="status-badge verified" style={{ fontSize: '0.8rem' }}>
                SDG 13 (Climate Action)
              </span>
              <span className="status-badge verified" style={{ fontSize: '0.8rem' }}>
                SDG 4 (Quality Education)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Benefit Allocation Simulator */}
      <div className="cs-card">
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b' }}>
            Community Funding Allocator
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Distribute community sponsor funds across rooftop solar panels, student scholarships, and school eco-projects
          </p>
        </div>

        {/* Sponsor Fund Input */}
        <div style={{ maxWidth: '300px', marginBottom: '28px' }}>
          <label className="form-label">Available Sponsor Funding (₹ INR)</label>
          <input
            type="number"
            min="1000"
            step="1000"
            value={totalFund}
            onChange={(e) => setTotalFund(Number(e.target.value))}
            className="form-input"
          />
        </div>

        {/* Sliders Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}>
          {/* Solar Allocation */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #fed7aa',
            backgroundColor: '#fffaf5',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Sun size={20} color="#ea580c" />
              <span style={{ fontWeight: 600, color: '#9a3412', fontSize: '0.95rem' }}>
                Campus Solar Rooftop ({solarPercent}%)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={solarPercent}
              onChange={(e) => handleSolarChange(e.target.value)}
              style={{ width: '100%', accentColor: '#ea580c', cursor: 'pointer' }}
            />
            <div style={{ marginTop: '12px', fontSize: '1.3rem', fontWeight: 700, color: '#9a3412' }}>
              ₹{solarAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#c2410c', marginTop: '4px' }}>
              Estimated solar installation: <strong>{solarCapacityKW} kW capacity</strong>
            </div>
          </div>

          {/* Scholarship Allocation */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #bfdbfe',
            backgroundColor: '#f8faff',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Award size={20} color="#2563eb" />
              <span style={{ fontWeight: 600, color: '#1e40af', fontSize: '0.95rem' }}>
                Youth Green Scholarships ({scholarshipPercent}%)
              </span>
            </div>
            <div style={{ marginTop: '24px', fontSize: '1.3rem', fontWeight: 700, color: '#1e40af' }}>
              ₹{scholarshipAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#1d4ed8', marginTop: '4px' }}>
              Supports <strong>{studentScholarshipsCount} student sustainability grants</strong> (₹5,000 each)
            </div>
          </div>

          {/* Campus Projects */}
          <div style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid #bbf7d0',
            backgroundColor: '#f6fdf9',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Trees size={20} color="#059669" />
              <span style={{ fontWeight: 600, color: '#065f46', fontSize: '0.95rem' }}>
                School Green Projects ({projectPercent}%)
              </span>
            </div>
            <div style={{ marginTop: '24px', fontSize: '1.3rem', fontWeight: 700, color: '#065f46' }}>
              ₹{projectAmount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: '4px' }}>
              Funds <strong>{rainwaterTankCount} rainwater / composting units</strong>
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px 20px',
          borderRadius: '8px',
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ fontSize: '0.875rem', color: '#475569' }}>
            Every rupee is backed by real, verified student climate actions.
          </div>
          <button onClick={onExportCSV} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            <Download size={15} />
            Download Funding Report (CSV)
          </button>
        </div>
      </div>
    </div>
  );
}
