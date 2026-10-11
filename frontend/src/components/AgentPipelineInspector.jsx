import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  Calculator,
  Flame,
  Building2,
  Compass,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  FileCode,
} from 'lucide-react';
import { EMISSION_FACTORS } from '../lib/constants';

const AGENTS = [
  {
    id: 'verification',
    number: '01',
    name: 'Verification Agent',
    icon: <ShieldCheck size={24} color="#059669" />,
    role: 'Cryptographic & Spatial Authenticator',
    description: 'Authenticates student submissions through SHA-256 photo hash deduplication, GPS geofencing (300m school radius), and 24-hour timestamp freshness.',
    latency: '34 ms',
    signals: ['SHA-256 Unique Hash', 'Haversine Radius Check', 'Device Timestamp Freshness', 'School vs Home Trust Baseline'],
    output: 'Trust Score (0.00 to 1.00) & Conditional Routing (Auto-verify, Review Queue, or Rejection)',
  },
  {
    id: 'impact',
    number: '02',
    name: 'Impact Estimation Agent',
    icon: <Calculator size={24} color="#0284c7" />,
    role: 'Carbon Mitigation Quantifier',
    description: 'Converts authenticated activities into auditable carbon mitigation values calibrated against IPCC AR6 afforestation baselines and the CEA India Grid Electricity Baseline.',
    latency: '11 ms',
    signals: ['Activity Type', 'Quantity Multiplier', 'IPCC AR6 Emission Factor', 'CEA Baseline v19'],
    output: 'Auditable kg CO₂e saved per action and cumulative school offset',
  },
  {
    id: 'gamification',
    number: '03',
    name: 'Adaptive Gamification Agent',
    icon: <Flame size={24} color="#d97706" />,
    role: 'Youth Engagement Engine',
    description: 'Sustains participation by awarding EcoPoints (10 base + 1 per 5 kg CO₂ saved), tracking daily habit streaks, and unlocking milestone achievement badges.',
    latency: '16 ms',
    signals: ['Verified Action Count', 'Calculated CO₂ Impact', 'Active Habit Streaks', 'Milestone Criteria'],
    output: 'EcoPoints tally, badge unlocking events, and streak increments',
  },
  {
    id: 'community',
    number: '04',
    name: 'Community Benefit Optimization Agent',
    icon: <Building2 size={24} color="#7c3aed" />,
    role: 'Institutional Reinvestment Allocator',
    description: 'Models the reinvestment of incoming CSR sponsor grants across solar rooftops, student green scholarships, and campus sustainability infrastructure optimized by need, budget, and social ROI.',
    latency: '22 ms',
    signals: ['Total School Carbon Saved', 'Available CSR Funds', 'Rooftop Solar Need (kW)', 'Student Scholarship Need'],
    output: 'Optimized fund distribution breakdown and projected community return',
  },
  {
    id: 'mission',
    number: '05',
    name: 'Mission Planner Agent',
    icon: <Compass size={24} color="#ea580c" />,
    role: 'Personalized Challenge Recommender',
    description: 'Analyzes student activity history and school environmental goals to prescribe personalized daily and weekly sustainability missions.',
    latency: '18 ms',
    signals: ['Student Past Activities', 'School Target Goals', 'Seasonal Opportunities', 'Habit Gaps'],
    output: 'Targeted quest assignments with point multipliers',
  },
];

export default function AgentPipelineInspector() {
  const [selectedAgent, setSelectedAgent] = useState(AGENTS[0]);
  const [simulating, setSimulating] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const handleRunSimulation = () => {
    setSimulating(true);
    setActiveStep(0);
    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= AGENTS.length - 1) {
          clearInterval(interval);
          setSimulating(false);
          return AGENTS.length - 1;
        }
        return prev + 1;
      });
    }, 700);
  };

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
            LangGraph Multi-Agent Pipeline Inspector
          </h1>
          <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '4px' }}>
            Live orchestration of the 5 collaborating AI agents forming the closed-loop EcoMesh intelligence layer
          </p>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={simulating}
          className="btn-primary"
        >
          <Sparkles size={18} />
          {simulating ? `Executing Node ${activeStep + 1} of 5...` : 'Run Pipeline Simulation'}
        </button>
      </div>

      {/* Stepper Node Flow */}
      <div className="cs-card" style={{ marginBottom: '32px', padding: '28px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}>
          {AGENTS.map((agent, index) => {
            const isSelected = selectedAgent.id === agent.id;
            const isCurrentSim = simulating && activeStep === index;
            const isCompletedSim = simulating && activeStep > index;

            return (
              <div
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                style={{
                  padding: '18px 16px',
                  borderRadius: '14px',
                  border: isSelected ? '2px solid #10b981' : isCurrentSim ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                  backgroundColor: isSelected ? '#ecfdf5' : isCurrentSim ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isSelected ? '0 4px 14px rgba(16, 185, 129, 0.15)' : 'none',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    color: isSelected ? '#059669' : '#94a3b8',
                  }}>
                    STEP {agent.number}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>
                    {agent.latency}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {agent.icon}
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.2,
                  }}>
                    {agent.name}
                  </div>
                </div>

                {isCompletedSim && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    color: '#059669',
                  }}>
                    <CheckCircle2 size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Agent Deep-Dive Studio */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))',
        gap: '28px',
      }}>
        {/* Left Card: Agent Overview & Signals */}
        <div className="cs-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {selectedAgent.icon}
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedAgent.name}
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600 }}>
                {selectedAgent.role}
              </span>
            </div>
          </div>

          <p style={{ fontSize: '0.95rem', color: '#334155', lineHeight: 1.6, marginBottom: '24px' }}>
            {selectedAgent.description}
          </p>

          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.04em', marginBottom: '12px' }}>
            Decision Signals & Evidence Evaluated
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {selectedAgent.signals.map((sig, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#1e293b',
                }}
              >
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span>{sig}</span>
              </div>
            ))}
          </div>

          <div style={{
            padding: '16px 18px',
            borderRadius: '10px',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
          }}>
            <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              State Delta & Downstream Output
            </div>
            <div style={{ fontSize: '0.925rem', color: '#064e3b', fontWeight: 600 }}>
              {selectedAgent.output}
            </div>
          </div>
        </div>

        {/* Right Card: StateGraph Edge & Execution Log */}
        <div className="cs-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Layers size={20} color="#0d9488" />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
              LangGraph State Transitions
            </h2>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginBottom: '24px',
          }}>
            <div style={{
              padding: '16px 18px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Pipeline Edge Routing Rule:
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                Submissions pass conditionally from <strong>Verification Agent</strong> &rarr; <strong>Impact Agent</strong> only when Trust Score &ge; 0.70. Submissions scoring [0.30, 0.69] route to the <strong>Admin Review Queue</strong>. Submissions &lt; 0.30 or duplicate SHA-256 hashes terminate immediately.
              </p>
            </div>

            <div style={{
              padding: '16px 18px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
            }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                State Schema Persistence:
              </div>
              <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                Each agent writes immutable attributes to MongoDB Atlas & Supabase with transactional atomicity to prevent double-counting (HTTP 409).
              </p>
            </div>
          </div>

          {/* Simulated Node Trace Box */}
          <div style={{
            backgroundColor: '#0f172a',
            color: '#34d399',
            fontFamily: 'monospace',
            padding: '18px 20px',
            borderRadius: '12px',
            fontSize: '0.78rem',
            lineHeight: 1.6,
          }}>
            <div style={{ color: '#94a3b8', marginBottom: '6px' }}>// LangGraph Execution Trace</div>
            <div>&gt; Node entered: {selectedAgent.id}_agent</div>
            <div>&gt; Processing latency: {selectedAgent.latency}</div>
            <div>&gt; Status: 200 OK (State Verified)</div>
            <div>&gt; Dispatched event: ecomesh_agent_completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}
