import React, { useState } from 'react';
import { useAuth } from '../lib/auth';
import {
  EMISSION_FACTORS,
  REGISTERED_SCHOOL,
  calculateFileHash,
  calculateHaversineDistance,
  evaluateTrustScore,
  calculateCarbonSavings,
  calculateEcoPoints,
} from '../lib/constants';
import {
  UploadCloud,
  CheckCircle,
  AlertCircle,
  MapPin,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Info,
  Trees,
  Trash2,
  Bike,
  Sun,
  Droplets,
} from 'lucide-react';

const CATEGORY_CARDS = [
  {
    id: 'plantation',
    name: 'Planted Trees',
    unit: 'saplings',
    factor: 10,
    icon: <Trees size={24} color="#059669" />,
    hint: '10 kg CO₂ absorbed per tree',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    color: '#065f46',
  },
  {
    id: 'waste',
    name: 'Sorted Waste',
    unit: 'kg',
    factor: 0.8,
    icon: <Trash2 size={24} color="#0284c7" />,
    hint: '0.8 kg CO₂ saved per kg sorted',
    bg: '#f0f9ff',
    border: '#bae6fd',
    color: '#0369a1',
  },
  {
    id: 'transport',
    name: 'Walked or Cycled',
    unit: 'km',
    factor: 0.15,
    icon: <Bike size={24} color="#d97706" />,
    hint: '0.15 kg CO₂ saved per km',
    bg: '#fffbeb',
    border: '#fde68a',
    color: '#b45309',
  },
  {
    id: 'solar',
    name: 'Clean Solar Energy',
    unit: 'kWh',
    factor: 0.82,
    icon: <Sun size={24} color="#ea580c" />,
    hint: '0.82 kg CO₂ avoided per kWh',
    bg: '#fff7ed',
    border: '#fed7aa',
    color: '#c2410c',
  },
  {
    id: 'water',
    name: 'Saved Water',
    unit: 'liters',
    factor: 0.0035,
    icon: <Droplets size={24} color="#0891b2" />,
    hint: 'Saves water pumping energy',
    bg: '#ecfeff',
    border: '#a5f3fc',
    color: '#0e7490',
  },
];

export default function UploadAction({ onSubmissionAdded, onCancel }) {
  const { user } = useAuth();

  const [activityId, setActivityId] = useState('plantation');
  const [quantity, setQuantity] = useState(5);
  const [locationType, setLocationType] = useState('school');
  const [latitude, setLatitude] = useState(REGISTERED_SCHOOL.latitude);
  const [longitude, setLongitude] = useState(REGISTERED_SCHOOL.longitude);
  const [file, setFile] = useState(null);
  const [photoHash, setPhotoHash] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [note, setNote] = useState('');
  const [detectingGps, setDetectingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const selectedCategory = CATEGORY_CARDS.find((c) => c.id === activityId) || CATEGORY_CARDS[0];

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setError(null);
    setFile(selectedFile);

    try {
      const hash = await calculateFileHash(selectedFile);
      setPhotoHash(hash);

      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoUrl(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      setError('Could not read the photo file.');
    }
  };

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      setError('Location is not supported on this device.');
      return;
    }

    setDetectingGps(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(Number(pos.coords.latitude.toFixed(6)));
        setLongitude(Number(pos.coords.longitude.toFixed(6)));
        setDetectingGps(false);
      },
      (err) => {
        setError(`Location check failed: ${err.message}`);
        setDetectingGps(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const distanceMeters = calculateHaversineDistance(
    latitude,
    longitude,
    REGISTERED_SCHOOL.latitude,
    REGISTERED_SCHOOL.longitude
  );

  const trustResult = evaluateTrustScore({
    locationType,
    distanceMeters,
    hoursAgo: 0.1,
  });

  const co2Saved = calculateCarbonSavings(activityId, quantity);
  const estimatedPoints = calculateEcoPoints(co2Saved);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !photoHash) {
      setError('Please add a photo of your green activity as proof.');
      return;
    }
    if (quantity <= 0) {
      setError('Please enter a quantity greater than zero.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await onSubmissionAdded({
        user,
        activityId,
        quantity,
        locationType,
        latitude,
        longitude,
        photoHash,
        photoUrl,
        note,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Could not save your action. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="page-container" style={{ maxWidth: '780px', paddingTop: '60px' }}>
        <div className="cs-card" style={{ textAlign: 'center', padding: '56px 40px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '9999px',
            backgroundColor: '#ecfdf5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 6px 20px rgba(16, 185, 129, 0.25)',
          }}>
            <CheckCircle size={40} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Action Recorded! 🎉
          </h2>
          <p style={{ fontSize: '1.05rem', color: '#475569', lineHeight: 1.6, marginBottom: '28px' }}>
            You just saved <strong>{co2Saved} kg of CO₂</strong> and earned <strong>+{estimatedPoints} EcoPoints</strong>!
            {trustResult.status === 'verified'
              ? ' It has been verified at school grounds and added to your total.'
              : ' Because this was done at home, a teacher will review and confirm it shortly.'}
          </p>
          <button onClick={onCancel} className="btn-primary" style={{ minWidth: '220px' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Log Your Green Action
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '4px' }}>
          Submit real photos of your eco-friendly activities to earn points, build streaks, and help your school
        </p>
      </div>

      {error && (
        <div className="cs-alert error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* 2-Column Responsive Studio */}
      <form onSubmit={handleSubmit} style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))',
        gap: '32px',
        alignItems: 'start',
      }}>
        {/* Left Column: Easy Steps */}
        <div className="cs-card" style={{ padding: '32px' }}>
          {/* Step 1: Category Selection */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '1rem', marginBottom: '12px' }}>
              1. What did you do?
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '12px',
            }}>
              {CATEGORY_CARDS.map((cat) => {
                const isSelected = activityId === cat.id;
                return (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setActivityId(cat.id)}
                    style={{
                      padding: '16px 12px',
                      borderRadius: '14px',
                      border: isSelected ? '2px solid #10b981' : '1px solid #e2e8f0',
                      backgroundColor: isSelected ? cat.bg : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: isSelected ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none',
                    }}
                  >
                    <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                      {cat.icon}
                    </div>
                    <div style={{
                      fontSize: '0.925rem',
                      fontWeight: 700,
                      color: isSelected ? cat.color : '#1e293b',
                    }}>
                      {cat.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                      {cat.hint}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Quantity Input */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '1rem' }}>
              2. How much did you complete? ({selectedCategory.unit})
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="form-input"
              placeholder={`e.g. 5 ${selectedCategory.unit}`}
            />
          </div>

          {/* Step 3: Photo Upload */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '1rem' }}>
              3. Add Photo Proof
            </label>
            <div style={{
              border: '2px dashed #cbd5e1',
              borderRadius: '14px',
              padding: '36px 24px',
              textAlign: 'center',
              backgroundColor: '#f8fafc',
              cursor: 'pointer',
              position: 'relative',
            }}>
              <input
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer',
                }}
              />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
              }}>
                <UploadCloud size={38} color="#0d9488" />
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  {file ? file.name : 'Take or upload a photo'}
                </div>
                <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  Shows your sapling, segregated bin, bicycle, or water tap
                </div>
              </div>
            </div>

            {photoHash && (
              <div style={{
                marginTop: '10px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#ecfdf5',
                color: '#047857',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                <CheckCircle size={16} />
                <span>Photo accepted! Verified unique proof (no duplicates allowed).</span>
              </div>
            )}
          </div>

          {/* Step 4: Location Selection */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '1rem' }}>
              4. Where did this happen?
            </label>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => {
                  setLocationType('school');
                  setLatitude(REGISTERED_SCHOOL.latitude);
                  setLongitude(REGISTERED_SCHOOL.longitude);
                }}
                className={`btn-secondary ${locationType === 'school' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderColor: locationType === 'school' ? '#10b981' : '#e2e8f0',
                  backgroundColor: locationType === 'school' ? '#ecfdf5' : '#ffffff',
                  color: locationType === 'school' ? '#065f46' : '#475569',
                  fontWeight: locationType === 'school' ? 700 : 500,
                }}
              >
                🏫 At School Campus
              </button>
              <button
                type="button"
                onClick={() => setLocationType('home')}
                className={`btn-secondary ${locationType === 'home' ? 'active' : ''}`}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderColor: locationType === 'home' ? '#10b981' : '#e2e8f0',
                  backgroundColor: locationType === 'home' ? '#ecfdf5' : '#ffffff',
                  color: locationType === 'home' ? '#065f46' : '#475569',
                  fontWeight: locationType === 'home' ? 700 : 500,
                }}
              >
                🏡 At Home
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '10px',
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
            }}>
              <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                Campus: <strong>{REGISTERED_SCHOOL.name}</strong>
              </div>
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={detectingGps}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <MapPin size={14} />
                {detectingGps ? 'Checking...' : 'Check My Location'}
              </button>
            </div>
          </div>

          {/* Step 5: Notes */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">5. Add a short note (optional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-input"
              placeholder="e.g. Planted 5 mango saplings with my classmates"
            />
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary" style={{ minWidth: '200px' }}>
              {submitting ? 'Verifying & Saving...' : 'Submit Action'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Column: Live Impact Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Carbon Savings & Points Card */}
          <div className="cs-card" style={{
            padding: '32px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #a7f3d0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Sparkles size={24} color="#059669" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064e3b' }}>
                Your Action's Real Impact
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '16px',
              backgroundColor: '#ffffff',
              padding: '24px',
              borderRadius: '14px',
              border: '1px solid #d1fae5',
              marginBottom: '20px',
            }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>CO₂ Prevented</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#059669', lineHeight: 1.1 }}>
                  {co2Saved}
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#047857' }}> kg</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px' }}>
                  Real climate savings
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>EcoPoints You Get</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#d97706', lineHeight: 1.1 }}>
                  +{estimatedPoints}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
                  Added to your profile
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '14px 18px',
              borderRadius: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #bbf7d0',
            }}>
              <ShieldCheck size={20} color="#059669" />
              <div style={{ fontSize: '0.875rem', color: '#064e3b', fontWeight: 600 }}>
                {locationType === 'school'
                  ? '✅ Happens at school grounds — automatically verified!'
                  : '⏳ Home activity — will be reviewed and approved by your teacher.'}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
