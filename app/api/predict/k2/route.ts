import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract K2 parameters from request
    const {
      pl_orbper,
      pl_trandep,
      pl_trandur,
      pl_imppar,
      pl_rade,
      pl_massj,
      pl_dens,
      pl_insol,
      pl_eqt,
      st_teff,
      st_rad,
      st_mass,
      st_logg,
      ra,
      dec,
      sy_dist
    } = body;

    // Validate required parameters
    const requiredParams = [
      pl_orbper, pl_trandep, pl_trandur, pl_imppar, pl_rade, pl_massj,
      pl_dens, pl_insol, pl_eqt, st_teff, st_rad, st_mass, st_logg,
      ra, dec, sy_dist
    ];

    if (requiredParams.some(param => param === undefined || param === null)) {
      return NextResponse.json(
        { error: 'Missing required K2 parameters' },
        { status: 400 }
      );
    }

    // Prepare data for Flask ML API (K2 endpoint)
    const flaskData = {
      pl_orbper,
      pl_trandep,
      pl_trandur,
      pl_imppar,
      pl_rade,
      pl_massj,
      pl_dens,
      pl_insol,
      pl_eqt,
      st_teff,
      st_rad,
      st_mass,
      st_logg,
      ra,
      dec,
      sy_dist
    };

    // Call Flask ML API for K2 predictions
    const flaskResponse = await fetch('http://localhost:5000/predict/k2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flaskData),
    });

    if (!flaskResponse.ok) {
      throw new Error(`Flask API error: ${flaskResponse.status}`);
    }

    const flaskResult = await flaskResponse.json();

    // Return the Flask prediction result with K2-specific formatting
    return NextResponse.json({
      prediction: flaskResult.prediction || 'Unknown',
      koi_pdisposition: flaskResult.koi_pdisposition || 'Unknown',
      probability: flaskResult.probability || 0,
      is_exoplanet: flaskResult.is_exoplanet || false,
      planet_type: flaskResult.planet_type || 'Unknown',
      status: 'success',
      timestamp: new Date().toISOString(),
      dataset: 'k2',
      parameters_used: {
        pl_orbper,
        pl_trandep,
        pl_trandur,
        pl_imppar,
        pl_rade,
        pl_massj,
        pl_dens,
        pl_insol,
        pl_eqt,
        st_teff,
        st_rad,
        st_mass,
        st_logg,
        ra,
        dec,
        sy_dist
      }
    });

  } catch (error) {
    console.error('K2 prediction error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to process K2 prediction',
        details: error instanceof Error ? error.message : 'Unknown error',
        status: 'error',
        timestamp: new Date().toISOString(),
        dataset: 'k2'
      },
      { status: 500 }
    );
  }
}