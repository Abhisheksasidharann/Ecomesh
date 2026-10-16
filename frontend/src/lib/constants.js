// IPCC AR6 & Central Electricity Authority (CEA) India Baseline Emission Factors
export const EMISSION_FACTORS = {
  plantation: {
    id: 'plantation',
    name: 'Tree Plantation',
    unit: 'saplings',
    factor: 10.0, // kg CO2e per sapling
    benchmark: 'IPCC AR6 Afforestation Factor',
    description: 'Each native tree sapling planted sequesters ~10 kg CO2 as it matures.',
    icon: 'Trees',
    color: '#059669',
  },
  waste: {
    id: 'waste',
    name: 'Waste Segregation',
    unit: 'kg',
    factor: 0.8, // kg CO2e per kg diverted
    benchmark: 'IPCC AR6 Solid Waste Mitigation',
    description: 'Diverting organic and recyclable waste avoids methane emissions from landfills.',
    icon: 'Trash2',
    color: '#0284c7',
  },
  transport: {
    id: 'transport',
    name: 'Sustainable Transport',
    unit: 'km',
    factor: 0.15, // kg CO2e per km replaced
    benchmark: 'Urban Mobility Emission Savings',
    description: 'Walking, cycling, or public bus transit replaces fossil-fuel private travel.',
    icon: 'Bike',
    color: '#d97706',
  },
  solar: {
    id: 'solar',
    name: 'Clean Solar Energy',
    unit: 'kWh',
    factor: 0.82, // kg CO2e per kWh generated
    benchmark: 'CEA India Grid Baseline Database v19',
    description: 'Rooftop solar generation displaces thermal coal electricity from the regional grid.',
    icon: 'Sun',
    color: '#ea580c',
  },
  water: {
    id: 'water',
    name: 'Water Conservation',
    unit: 'liters',
    factor: 0.0035, // kg CO2e per liter saved
    benchmark: 'Municipal Water Energy Intensity',
    description: 'Rainwater harvesting and tap conservation cuts energy used for pumping and treatment.',
    icon: 'Droplets',
    color: '#0891b2',
  },
};

// Registered Institution Information (Model Higher Secondary School, Ernakulam)
export const REGISTERED_SCHOOL = {
  id: 'sch_ernakulam_01',
  name: 'Model Higher Secondary School',
  city: 'Ernakulam, Kerala',
  latitude: 9.9816,
  longitude: 76.2999,
  radiusMeters: 300,
};

// Exact Haversine Distance Formula (Meters)
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Client-Side SHA-256 Hashing using Browser Web Crypto API
export async function calculateFileHash(file) {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Multi-Signal Trust Score Calculation (From PPT Slide 24)
export function evaluateTrustScore({ locationType, distanceMeters, hoursAgo }) {
  // Base Trust: School = 0.6, Home = 0.4
  const baseTrust = locationType === 'school' ? 0.6 : 0.4;
  
  // Time Freshness: Within 24 hours = +0.1, Older = -0.3
  const timeBonus = hoursAgo <= 24 ? 0.1 : -0.3;

  // Location Geofence: Inside 300m = +0.2, Outside = -0.4
  const isInsideGeofence = locationType === 'school' && distanceMeters <= REGISTERED_SCHOOL.radiusMeters;
  const locationBonus = locationType === 'school' ? (isInsideGeofence ? 0.2 : -0.4) : 0.0;

  let score = Number((baseTrust + timeBonus + locationBonus).toFixed(2));
  score = Math.max(0.0, Math.min(1.0, score));

  let status = 'review';
  if (score >= 0.7) status = 'verified';
  else if (score < 0.3) status = 'rejected';

  return {
    score,
    status,
    breakdown: {
      baseTrust,
      timeBonus,
      locationBonus,
      isInsideGeofence,
      distanceMeters,
    },
  };
}

// Carbon Savings Calculation (Quantity * Emission Factor)
export function calculateCarbonSavings(activityId, quantity) {
  const activity = EMISSION_FACTORS[activityId];
  if (!activity || !quantity) return 0;
  return Number((quantity * activity.factor).toFixed(2));
}

// Points Formula: 10 + Math.floor(CO2_saved / 5)
export function calculateEcoPoints(co2Saved) {
  return 10 + Math.floor(co2Saved / 5);
}

// Gamification v2 Levels (Seedling → Sapling → Tree → Grove → Forest)
export const STUDENT_LEVELS = [
  { level: 1, name: 'Seedling', minPoints: 0, maxPoints: 50, icon: '🌱', color: '#10b981' },
  { level: 2, name: 'Sapling', minPoints: 51, maxPoints: 150, icon: '🌿', color: '#059669' },
  { level: 3, name: 'Tree', minPoints: 151, maxPoints: 350, icon: '🌳', color: '#0d9488' },
  { level: 4, name: 'Grove', minPoints: 351, maxPoints: 700, icon: '🌲', color: '#0284c7' },
  { level: 5, name: 'Forest', minPoints: 701, maxPoints: Infinity, icon: '🏞️', color: '#7c3aed' },
];

export function getStudentLevel(points = 0) {
  for (let i = STUDENT_LEVELS.length - 1; i >= 0; i--) {
    if (points >= STUDENT_LEVELS[i].minPoints) {
      const nextLevel = STUDENT_LEVELS[i + 1] || null;
      const progressPercent = nextLevel
        ? Math.min(100, Math.round(((points - STUDENT_LEVELS[i].minPoints) / (nextLevel.minPoints - STUDENT_LEVELS[i].minPoints)) * 100))
        : 100;
      return {
        ...STUDENT_LEVELS[i],
        progressPercent,
        nextLevelName: nextLevel ? nextLevel.name : 'Max Level',
        pointsToNext: nextLevel ? Math.max(0, nextLevel.minPoints - points) : 0,
      };
    }
  }
  return { ...STUDENT_LEVELS[0], progressPercent: 0, nextLevelName: 'Sapling', pointsToNext: 50 };
}

// School Goal Milestone (Unique angle: connects youth action to real physical benefit)
export const SCHOOL_GOAL = {
  targetKg: 500,
  title: 'Campus Rooftop Solar Panel #1 (1.5 kW)',
  description: '500 kg CO₂e verified by students this term unlocks the solar project proposal funded by CSR partners.',
  solarCapacity: '1.5 kW Clean Energy System',
  outcome: 'Powers 3 campus science classrooms with 100% clean solar energy.',
};

// Participating Houses and Classes
export const SCHOOL_HOUSES = [
  { id: 'terra', name: 'Terra House', color: '#059669', bg: '#ecfdf5', icon: '🌍' },
  { id: 'solar', name: 'Solar House', color: '#ea580c', bg: '#fff7ed', icon: '☀️' },
  { id: 'aqua', name: 'Aqua House', color: '#0284c7', bg: '#f0f9ff', icon: '💧' },
  { id: 'flora', name: 'Flora House', color: '#10b981', bg: '#f0fdf4', icon: '🌸' },
];

export const SCHOOL_CLASSES = [
  'Class 11-A',
  'Class 11-B',
  'Class 10-A',
  'Class 10-B',
  'Class 12-A',
  'Class 12-B',
];

// Anti-Gaming Daily Caps per Category
export const DAILY_ACTION_CAPS = {
  plantation: { maxUnits: 5, unit: 'saplings' },
  waste: { maxUnits: 15, unit: 'kg' },
  transport: { maxUnits: 25, unit: 'km' },
  solar: { maxUnits: 20, unit: 'kWh' },
  water: { maxUnits: 200, unit: 'liters' },
};

// Gamification v2 Badges
export const BADGE_DEFINITIONS_V2 = [
  { id: 'first_tree', name: 'Tree Planter', type: 'category', category: 'plantation', icon: '🌳', color: '#059669', desc: 'First verified tree plantation' },
  { id: 'first_waste', name: 'Zero-Waste Starter', type: 'category', category: 'waste', icon: '♻️', color: '#0284c7', desc: 'First verified waste segregation' },
  { id: 'first_transport', name: 'Clean Commuter', type: 'category', category: 'transport', icon: '🚲', color: '#d97706', desc: 'First bicycle or walking commute' },
  { id: 'first_solar', name: 'Solar Adopter', type: 'category', category: 'solar', icon: '☀️', color: '#ea580c', desc: 'First clean solar generation' },
  { id: 'first_water', name: 'Water Saver', type: 'category', category: 'water', icon: '💧', color: '#0891b2', desc: 'First verified water conservation' },
  { id: 'all_rounder', name: 'All-Rounder', type: 'diversity', icon: '🌟', color: '#7c3aed', desc: 'Completed all 5 green action categories' },
  { id: 'streak_2wk', name: '2-Week Streak', type: 'streak', icon: '🔥', color: '#f59e0b', desc: 'Active 2 weeks in a row' },
  { id: 'streak_4wk', name: '4-Week Habit Master', type: 'streak', icon: '⚡', color: '#ea580c', desc: 'Active 4 consecutive weeks' },
  { id: 'co2_10kg', name: '10 kg Milestone', type: 'co2', threshold: 10, icon: '🌱', color: '#10b981', desc: '10 kg CO₂e verified' },
  { id: 'co2_50kg', name: '50 kg Carbon Club', type: 'co2', threshold: 50, icon: '🏆', color: '#0d9488', desc: '50 kg CO₂e verified' },
  { id: 'co2_100kg', name: 'Century Champion', type: 'co2', threshold: 100, icon: '👑', color: '#6366f1', desc: '100 kg CO₂e verified' },
];
