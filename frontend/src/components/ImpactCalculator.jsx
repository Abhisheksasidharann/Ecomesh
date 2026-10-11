import React, { useState } from 'react';
import {
  Calculator,
  Leaf,
  Recycle,
  Bike,
  Sun,
  Droplets,
  ArrowRight,
  Sparkles,
  Info,
  Car,
  Lightbulb,
  TreePine,
  CheckCircle,
} from 'lucide-react';
import { EMISSION_FACTORS } from '../lib/constants';

export default function ImpactCalculator({ onNavigateUpload }) {
  const [trees, setTrees] = useState(2);
  const [wasteKg, setWasteKg] = useState(5);
  const [transitKm, setTransitKm] = useState(15);
  const [solarKwh, setSolarKwh] = useState(10);
  const [waterLiters, setWaterLiters] = useState(50);

  // Calculate CO2e using official IPCC AR6 emission factors
  const treeCO2 = trees * (EMISSION_FACTORS.plantation?.factor || 10.0);
  const wasteCO2 = wasteKg * (EMISSION_FACTORS.waste?.factor || 0.8);
  const transitCO2 = transitKm * (EMISSION_FACTORS.transport?.factor || 0.15);
  const solarCO2 = solarKwh * (EMISSION_FACTORS.solar?.factor || 0.82);
  const waterCO2 = waterLiters * (EMISSION_FACTORS.water?.factor || 0.0035);

  const totalSimulatedCO2 = Number((treeCO2 + wasteCO2 + transitCO2 + solarCO2 + waterCO2).toFixed(2));
  const estimatedPoints = Math.round(totalSimulatedCO2 * 2.5);

  // Equivalencies
  const carKmAvoided = Math.round(totalSimulatedCO2 * 4.1);
  const ledHoursSaved = Math.round(totalSimulatedCO2 * 65);
  const phoneCharges = Math.round(totalSimulatedCO2 * 122);

  return (
    <div className="page-container gradient-mesh">
      {/* Header Banner */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#047857',
          fontSize: '0.85rem',
          fontWeight: 700,
          marginBottom: '12px',
        }}>
          <Calculator size={16} />
          <span>IPCC AR6 Carbon Impact Simulator</span>
        </div>
        <h1 style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', marginBottom: '8px' }}>
          Interactive Carbon Impact Calculator
        </h1>
        <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '780px', lineHeight: 1.6 }}>
          Simulate how everyday climate actions add up. Move the sliders below to see your potential greenhouse gas savings calibrated to official scientific emission factors.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 1fr)',
        gap: '32px',
        alignItems: 'start',
      }}>
        {/* Left: Interactive Action Sliders */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* 1. Tree Plantation */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Leaf size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Native Tree Planting</h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>10.0 kg CO₂e saved per mature sapling</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#059669' }}>{trees} trees</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>+{treeCO2.toFixed(1)} kg CO₂</div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={trees}
              onChange={(e) => setTrees(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
          </div>

          {/* 2. Waste Segregation */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Recycle size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Waste Segregation & Recycling</h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>1.5 kg CO₂e diverted per kg recycled</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#d97706' }}>{wasteKg} kg</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>+{wasteCO2.toFixed(1)} kg CO₂</div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={wasteKg}
              onChange={(e) => setWasteKg(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
          </div>

          {/* 3. Sustainable Transit */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Bike size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Clean Commute (Bicycle / Walking)</h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>0.21 kg CO₂e avoided per km vs fossil bus</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#2563eb' }}>{transitKm} km</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>+{transitCO2.toFixed(1)} kg CO₂</div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={transitKm}
              onChange={(e) => setTransitKm(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#3b82f6', cursor: 'pointer' }}
            />
          </div>

          {/* 4. Solar Adoption */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#fff7ed',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Sun size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Solar Energy Generation</h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>0.82 kg CO₂e avoided per kWh (CEA India grid)</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#ea580c' }}>{solarKwh} kWh</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>+{solarCO2.toFixed(1)} kg CO₂</div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="2"
              value={solarKwh}
              onChange={(e) => setSolarKwh(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#f97316', cursor: 'pointer' }}
            />
          </div>

          {/* 5. Water Conservation */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: '#f5f3ff',
                  color: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Droplets size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>Water Conservation & Harvesting</h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>0.35 kg CO₂e saved per 100 liters conserved</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#7c3aed' }}>{waterLiters} L</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>+{waterCO2.toFixed(1)} kg CO₂</div>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="10"
              value={waterLiters}
              onChange={(e) => setWaterLiters(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* Right: Live Impact Projection Summary */}
        <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{
            background: 'linear-gradient(135deg, #064e3b 0%, #047857 60%, #0d9488 100%)',
            color: '#ffffff',
            padding: '36px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', opacity: 0.9 }}>
              <Sparkles size={18} />
              <span style={{ fontSize: '0.88rem', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Projected Impact Summary
              </span>
            </div>

            <div style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '6px' }}>
              {totalSimulatedCO2} <span style={{ fontSize: '1.4rem', fontWeight: 600 }}>kg CO₂e</span>
            </div>
            <div style={{ fontSize: '1rem', opacity: 0.9, marginBottom: '28px' }}>
              Potential Carbon Reduction • <strong style={{ color: '#a7f3d0' }}>+{estimatedPoints} EcoPoints</strong>
            </div>

            {/* Tangible Real-World Equivalents */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              padding: '20px',
              borderRadius: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(10px)',
              marginBottom: '28px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Car size={20} style={{ color: '#a7f3d0' }} />
                <span style={{ fontSize: '0.92rem' }}>
                  Equivalent to preventing <strong>{carKmAvoided} km</strong> of petrol car driving
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Lightbulb size={20} style={{ color: '#fde68a' }} />
                <span style={{ fontSize: '0.92rem' }}>
                  Powers an energy-saving LED bulb for <strong>{ledHoursSaved} hours</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <TreePine size={20} style={{ color: '#6ee7b7' }} />
                <span style={{ fontSize: '0.92rem' }}>
                  Absorptive power of <strong>{Math.max(1, Math.round(totalSimulatedCO2 / 10))}</strong> tree seedlings over one year
                </span>
              </div>
            </div>

            <button
              onClick={onNavigateUpload}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: '#ffffff',
                color: '#064e3b',
                fontWeight: 800,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>Log A Real Green Action Now</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Scientific Methodology Note */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', color: '#047857' }}>
              <Info size={18} />
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Scientific Foundation</h4>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              All carbon factors are derived from the <strong>IPCC Sixth Assessment Report (AR6)</strong> and the <strong>Central Electricity Authority (CEA India)</strong> CO₂ baseline database. Every verified upload on EcoMesh converts into auditable community impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
