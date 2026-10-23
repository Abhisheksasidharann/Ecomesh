# Emission factors: kg CO2e per unit of verified action.
# Each factor carries its basis and source so reports are auditable.
FACTORS = {
    "plantation": {
        "unit": "sapling",
        "factor": 12.0,
        "basis": "First-year CO2 uptake of a young tree, credited once per sapling "
                 "(conservative; typical range 10-40 kg/tree/yr)",
        "source": "Arbor Environmental Alliance young-tree estimate (~12 kg CO2/yr); range per EcoTree",
    },
    "waste_segregation": {
        "unit": "kg organic waste",
        "factor": 0.31,
        "basis": "Avoided emissions: best-case landfill (~470 kg CO2e/t) vs home composting (~160 kg CO2e/t)",
        "source": "Vergara et al. via The Naked Scientists; see Perez, Vergara & Silver (2023), Sci Rep 13:7608",
    },
    "sustainable_transport": {
        "unit": "km",
        "factor": 0.13,
        "basis": "Petrol car (2.232 kg CO2e/l at assumed 15 km/l = 0.149 kg/km) minus city bus (0.0152 kg/pax-km)",
        "source": "Smart Freight Centre India, India Default GHG Emission Values v1.0 (2025, AR6); "
                  "India GHG Program, India Specific Road Transport Emission Factors (2015)",
    },
    "solar_adoption": {
        "unit": "kWh",
        "factor": 0.727,
        "basis": "Solar kWh displaces grid electricity at the national weighted-average factor",
        "source": "CEA CO2 Baseline Database v20.0 (Dec 2024), FY2023-24 weighted average incl. RE",
    },
    "water_conservation": {
        "unit": "litre",
        "factor": 0.00029,
        "basis": "Energy avoided per litre saved: ~0.3 Wh/L supply + ~0.1 Wh/L wastewater treatment "
                 "(Indian cities) = 0.0004 kWh/L x 0.727 kg CO2/kWh grid factor",
        "source": "Indian urban water/wastewater end-use energy intensity study (Environmental Engineering, 2013); "
                  "CEA CO2 Baseline Database v20.0",
    },
}


def estimate(action_type, quantity):
    """Returns (kg_co2e, method_note)."""
    f = FACTORS.get(action_type)
    if f is None:
        return 0.0, "Unknown action type"
    kg = round(max(quantity, 0) * f["factor"], 3)
    note = f"{quantity} {f['unit']} x {f['factor']} kg CO2e/{f['unit']} ({f['source']})"
    return kg, note