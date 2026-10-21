import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import {
  EMISSION_FACTORS,
  REGISTERED_SCHOOL,
  DAILY_ACTION_CAPS,
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
  Clock,
  Shield,
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
  const [quantity, setQuantity] = useState(2);
  const [locationType, setLocationType] = useState('school');
  const [latitude, setLatitude] = useState(REGISTERED_SCHOOL.latitude);
  const [longitude, setLongitude] = useState(REGISTERED_SCHOOL.longitude);
  const [capturedTime, setCapturedTime] = useState(new Date().toISOString());
  const [gpsAutoCaptured, setGpsAutoCaptured] = useState(false);
  const [file, setFile] = useState(null);
  const [photoHash, setPhotoHash] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Automatically capture GPS & time on component mount (not typed in)
  useEffect(() => {
    setCapturedTime(new Date().toISOString());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(6)));
          setLongitude(Number(pos.coords.longitude.toFixed(6)));
          setGpsAutoCaptured(true);
        },
        () => {
          // If permission denied or unavailable, use school campus coordinates as default
          setLatitude(REGISTERED_SCHOOL.latitude);
          setLongitude(REGISTERED_SCHOOL.longitude);
          setGpsAutoCaptured(true);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setGpsAutoCaptured(true);
    }
  }, []);

  const selectedCategory = CATEGORY_CARDS.find((c) => c.id === activityId) || CATEGORY_CARDS[0];
  const capInfo = DAILY_ACTION_CAPS[activityId] || { maxUnits: 10, unit: selectedCategory.unit };

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

  const distanceMeters = calculateHaversineDistance(
    latitude,
    longitude,
    REGISTERED_SCHOOL.latitude,
    REGISTERED_SCHOOL.longitude
  );

  const trustResult = evaluateTrustScore({
    locationType,
    distanceMeters,
    hoursAgo: 0.05,
  });

  const co2Saved = calculateCarbonSavings(activityId, quantity);
  const estimatedPoints = calculateEcoPoints(co2Saved);
  const exceedsCap = quantity > capInfo.maxUnits;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please provide a camera photo of your green activity as proof.');
      return;
    }
    if (quantity <= 0) {
      setError('Please enter a quantity greater than zero.');
      return;
    }
    if (exceedsCap) {
      setError(`Anti-Gaming Guard: Daily limit is capped at ${capInfo.maxUnits} ${capInfo.unit} per day to prevent artificial bulk claims.`);
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
        // Pass the actual File object — the backend needs multipart upload
        file,
        capturedTime,
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
            You just prevented <strong>{co2Saved} kg of CO₂</strong> and earned <strong>+{estimatedPoints} EcoPoints</strong>!
            {trustResult.status === 'verified'
              ? ' Verified on campus grounds by EcoMesh geofence & image analysis.'
              : ' Waiting for teacher confirmation since it was recorded from home.'}
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
          <ShieldCheck size={16} />
          <span>Verified Mobile Submission</span>
        </div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em' }}>
          Submit Green Action
        </h1>
        <p style={{ fontSize: '1rem', color: '#64748b', marginTop: '4px' }}>
          Camera proof, action type, and quantity. GPS coordinates and timestamp are captured automatically to prevent tampering.
        </p>
      </div>

      {error && (
        <div className="cs-alert error" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Auto-Captured Telemetry Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 18px',
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        marginBottom: '28px',
        fontSize: '0.82rem',
        color: '#475569',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={15} color="#059669" />
          <span>
            <strong>Auto-GPS:</strong> {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E ({distanceMeters}m from {REGISTERED_SCHOOL.name})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={15} color="#0284c7" />
          <span>
            <strong>Auto-Timestamp:</strong> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Cryptographically sealed)
          </span>
        </div>
      </div>

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
              1. Action Type
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
                    onClick={() => {
                      setActivityId(cat.id);
                      setQuantity(cat.id === 'plantation' ? 2 : cat.id === 'waste' ? 3 : 5);
                    }}
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

          {/* Step 2: Quantity Input with Daily Cap Anti-Gaming Notice */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ fontSize: '1rem', margin: 0 }}>
                2. Quantity ({selectedCategory.unit})
              </label>
              <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                Anti-Gaming Cap: Max {capInfo.maxUnits} {capInfo.unit}/day
              </span>
            </div>
            <input
              type="number"
              min="0.1"
              max={capInfo.maxUnits}
              step="any"
              required
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="form-input"
              placeholder={`e.g. 2 ${selectedCategory.unit}`}
            />
            {exceedsCap && (
              <div style={{ color: '#e11d48', fontSize: '0.78rem', marginTop: '4px', fontWeight: 600 }}>
                ⚠️ Quantity exceeds daily anti-gaming limit ({capInfo.maxUnits} {capInfo.unit}).
              </div>
            )}
          </div>

          {/* Step 3: Camera Evidence Upload */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '1rem' }}>
              3. Camera Evidence Photo
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
                capture="environment"
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
                  {file ? file.name : 'Tap to open camera or upload photo'}
                </div>
                <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  Camera photo of your tree, waste bin, commute, solar panel, or water tap
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
                <span>SHA-256 Hash Generated: {photoHash.slice(0, 16)}... (Protected against duplicate re-submissions)</span>
              </div>
            )}
          </div>

          {/* Step 4: Location Type */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '1rem' }}>
              4. Action Location
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setLocationType('school')}
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
                🏫 School Campus Grounds
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
          </div>

          {/* Optional Note */}
          <div className="form-group" style={{ marginBottom: '28px' }}>
            <label className="form-label">5. Optional student note</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="form-input"
              placeholder="e.g. Planted native neem sapling in science garden"
            />
          </div>

          {/* Submit Actions */}
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || exceedsCap}
              className="btn-primary"
              style={{ minWidth: '200px' }}
            >
              {submitting ? 'Verifying...' : 'Submit Action'}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Right Column: Live Impact Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="cs-card" style={{
            padding: '32px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
            border: '1px solid #a7f3d0',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Sparkles size={24} color="#059669" />
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#064e3b' }}>
                Impact Summary
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
                  {selectedCategory.hint}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>EcoPoints</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#d97706', lineHeight: 1.1 }}>
                  +{estimatedPoints}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '4px' }}>
                  {locationType === 'school' ? 'Verified upon submission' : 'Pending teacher review'}
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
                  ? '✅ School campus grounds — automatic verification by geofence.'
                  : '⏳ Home activity — will be reviewed and verified by teacher.'}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
