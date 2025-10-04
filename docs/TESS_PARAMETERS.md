# TESS Exoplanet Parameters

This document defines the exact parameters used for TESS (Transiting Exoplanet Survey Satellite) exoplanet analysis.

## TESS Selected Features
Based on the TESS mission specification, the following 13 parameters are used:

```javascript
const TESS_SELECTED_FEATURES = [
    "pl_orbper",    // Orbital Period (days)
    "pl_trandurh",  // Transit Duration (hours) 
    "pl_trandep",   // Transit Depth (fraction)
    "pl_rade",      // Planet Radius (Earth radii)
    "pl_insol",     // Incident Stellar Flux (Earth flux)
    "pl_eqt",       // Equilibrium Temperature (K)
    "st_teff",      // Stellar Temperature (K)
    "st_logg",      // Stellar Surface Gravity (log10 cm/s²)
    "st_rad",       // Stellar Radius (Solar radii)
    "st_tmag",      // TESS Magnitude
    "st_dist",      // System Distance (parsecs)
    "ra",           // Right Ascension (degrees)
    "dec"           // Declination (degrees)
];
```

## Parameter Ranges

| Feature | Unit | Range | Description |
|---------|------|-------|-------------|
| pl_orbper | Days | 0.5 to 100 | Orbital Period. TESS optimized for shorter periods |
| pl_trandurh | Hours | 0.5 to 12 | Transit Duration |
| pl_trandep | Fraction | 10⁻⁵ to 0.5 | Transit Depth |
| pl_rade | R⊕ | 0.5 to 20.0 | Planet Radius |
| pl_insol | Earth Flux | 0.1 to 10⁵ | Incident Stellar Flux |
| pl_eqt | K | 100 to 3000 | Equilibrium Temperature |
| st_teff | K | 3000 to 7000 | Star's Effective Temperature |
| st_logg | log₁₀(cm/s²) | 3.0 to 5.0 | Star's Surface Gravity |
| st_rad | R☉ | 0.3 to 10.0 | Star's Radius |
| st_tmag | mag | 4.0 to 18.0 | TESS Magnitude (brightness) |
| st_dist | pc | 1 to 500 | System Distance |
| ra | degrees | 0 to 360 | Right Ascension |
| dec | degrees | -90 to 90 | Declination |

## Implementation Status

✅ **TessVisualizer.tsx**: Interface updated to include only TESS parameters
✅ **AnalysisPanel.tsx**: API call sends only TESS parameters  
✅ **predict-tess API**: Expects and processes only TESS parameters
✅ **Parameters form**: UI displays all 13 TESS parameters with correct ranges

## Note on Removed Parameters

The following parameters were removed from the original implementation as they are not part of the TESS selected features:
- `st_mass` (stellar mass)
- `pl_dens` (planet density) 
- `pl_massj` (planet mass in Jupiter masses)
- `sy_dist` (system distance - replaced with `st_dist`)

This ensures the TESS implementation follows the exact specification and provides optimal analysis results from Claude AI.