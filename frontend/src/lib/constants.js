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

// Official Milestones & Badges
export const BADGE_DEFINITIONS = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Logged and verified your first climate action.',
    color: '#059669',
  },
  {
    id: 'three_day_streak',
    name: '3-Day Streak',
    description: 'Completed actions on 3 consecutive days.',
    color: '#d97706',
  },
  {
    id: 'fifty_kg_club',
    name: '50 kg Club',
    description: 'Mitigated 50 or more kilograms of CO2 emissions.',
    color: '#2563eb',
  },
  {
    id: 'solar_pioneer',
    name: 'Solar Pioneer',
    description: 'Contributed verified clean solar energy generation.',
    color: '#ea580c',
  },
];
