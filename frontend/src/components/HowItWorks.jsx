import React, { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  Leaf,
  Award,
  Sun,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Heart,
  Sparkles,
} from 'lucide-react';

const STEPS = [
  {
    number: '1',
    title: 'Take Green Action',
    icon: <Leaf size={28} color="#059669" />,
    badge: 'You Act',
    description: 'Plant a tree, cycle to school, separate recyclables, or save water. Any real habit that protects our planet counts.',
    highlight: '5 Simple Activities: Tree Planting, Waste Sorting, Walking/Biking, Solar Energy, and Water Saving.',
  },
  {
    number: '2',
    title: 'Smart Photo & Location Check',
    icon: <Camera size={28} color="#0284c7" />,
    badge: 'We Verify',
    description: 'Snap a quick photo and let EcoMesh verify your location and time. It ensures every action is honest and no photo is reused.',
    highlight: 'Checks that actions happen inside school grounds or sends home activities for quick teacher confirmation.',
  },
  {
    number: '3',
    title: 'Measure Real Carbon Saved',
    icon: <Sparkles size={28} color="#7c3aed" />,
    badge: 'We Calculate',
    description: 'Your action is turned into exact kilograms of carbon dioxide prevented from entering our atmosphere, using official climate standards.',
    highlight: 'Example: Planting 10 saplings saves ~100 kg of CO₂ as they grow into healthy trees.',
  },
  {
    number: '4',
    title: 'Earn Points, Streaks & Badges',
    icon: <Award size={28} color="#d97706" />,
    badge: 'You Earn',
    description: 'Collect EcoPoints for every kilogram saved. Build daily habit streaks and unlock badges like "First Step", "3-Day Streak", and "50 kg Club".',
    highlight: 'Earn 10 points for every verified action, plus bonus points for higher environmental impact.',
  },
  {
    number: '5',
    title: 'Fund Real School Projects',
    icon: <Sun size={28} color="#ea580c" />,
    badge: 'Community Wins',
    description: 'Your school adds up all student actions to show evidence to community sponsors. Sponsors fund rooftop solar panels and student scholarships.',
    highlight: 'Turns student teamwork into clean electricity, scholarship grants, and campus composting gardens.',
  },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          borderRadius: '9999px',
          backgroundColor: '#ecfdf5',
          color: '#059669',
          fontSize: '0.8rem',
          fontWeight: 700,
          marginBottom: '12px',
        }}>
          <Sparkles size={14} />
          Simple 5-Step Impact Journey
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          How EcoMesh Works
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '4px', maxWidth: '850px' }}>
          From your daily green habits to real school solar panels — here is how student actions create real community change.
        </p>
      </div>

      {/* 5-Step Visual Stepper Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '36px',
      }}>
        {STEPS.map((step, idx) => {
          const isSelected = activeStep === idx;
          return (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              style={{
                padding: '24px 20px',
                borderRadius: '16px',
                backgroundColor: isSelected ? '#ecfdf5' : '#ffffff',
                border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: isSelected ? '0 8px 24px rgba(16, 185, 129, 0.18)' : '0 2px 8px rgba(0, 0, 0, 0.03)',
                transform: isSelected ? 'translateY(-3px)' : 'none',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '14px',
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? '#10b981' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.85rem',
                }}>
                  {step.number}
                </div>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isSelected ? '#047857' : '#94a3b8',
                }}>
                  {step.badge}
                </span>
              </div>

              <div style={{ marginBottom: '10px' }}>
                {step.icon}
              </div>

              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                {step.title}
              </h3>

              <p style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>
                {step.description.slice(0, 75)}...
              </p>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Active Step Spotlight Card */}
      <div className="cs-card" style={{
        padding: '36px',
        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
        border: '1px solid #a7f3d0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#ecfdf5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
          }}>
            {STEPS[activeStep].icon}
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
              Step {STEPS[activeStep].number} Spotlight
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a' }}>
              {STEPS[activeStep].title}
            </h2>
          </div>
        </div>

        <p style={{ fontSize: '1.05rem', color: '#334155', lineHeight: 1.6, marginBottom: '24px' }}>
          {STEPS[activeStep].description}
        </p>

        <div style={{
          padding: '18px 22px',
          borderRadius: '12px',
          backgroundColor: '#ffffff',
          border: '1px solid #d1fae5',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <CheckCircle2 size={22} color="#10b981" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.925rem', color: '#064e3b', fontWeight: 600 }}>
            {STEPS[activeStep].highlight}
          </div>
        </div>
      </div>
    </div>
  );
}
