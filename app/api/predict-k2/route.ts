import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";


const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || process.env.NEXT_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.NEXT_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.NEXT_AWS_SECRET_ACCESS_KEY || '',
  },
});


function validateAWSCredentials(): boolean {
  return !!(
    (process.env.AWS_ACCESS_KEY_ID || process.env.NEXT_AWS_ACCESS_KEY_ID) && 
    (process.env.AWS_SECRET_ACCESS_KEY || process.env.NEXT_AWS_SECRET_ACCESS_KEY) && 
    (process.env.AWS_REGION || process.env.NEXT_AWS_REGION)
  );
}


const modelId = "us.anthropic.claude-3-5-sonnet-20241022-v2:0";

export async function POST(request: NextRequest) {
  console.log("Starting K2 exoplanet analysis with Claude AI");
  try {
    const data = await request.json();
    
   
    if (!validateAWSCredentials()) {
      console.log('AWS credentials not configured');
      return NextResponse.json(
        { 
          error: 'AWS credentials not configured. Please set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION environment variables.',
          success: false 
        },
        { status: 500 }
      );
    }
    
    
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
    } = data;


    const prompt = `You are an expert exoplanet astronomer analyzing K2 mission data. The K2 mission was the extended mission of the Kepler Space Telescope, observing different star fields for shorter periods. Please analyze the following K2 exoplanet parameters and provide a scientific assessment.

K2 EXOPLANET PARAMETERS:
- Orbital Period: ${pl_orbper} days
- Transit Depth: ${pl_trandep} (fraction of stellar flux blocked)
- Transit Duration: ${pl_trandur} hours
- Impact Parameter: ${pl_imppar} (0 = central transit, >1.0 = grazing)
- Planet Radius: ${pl_rade} Earth radii
- Planet Mass: ${pl_massj} Jupiter masses
- Planet Density: ${pl_dens} g/cm³
- Insolation: ${pl_insol} Earth flux units
- Equilibrium Temperature: ${pl_eqt} K
- Stellar Effective Temperature: ${st_teff} K
- Stellar Radius: ${st_rad} Solar radii
- Stellar Mass: ${st_mass} Solar masses
- Stellar Surface Gravity: ${st_logg} log(cm/s²)
- Right Ascension: ${ra} degrees
- Declination: ${dec} degrees
- System Distance: ${sy_dist} parsecs

K2 MISSION CONTEXT:
- K2 observed different star fields for ~80 days each
- Shorter observation periods compared to original Kepler mission
- Focus on brighter stars and diverse stellar populations
- Less precise photometry due to spacecraft pointing issues
- Transit signals need higher confidence thresholds

ANALYSIS CRITERIA FOR K2:
1. Transit Quality: Depth > 0.0001 and Duration 1-12 hours indicates genuine transit
2. Planetary Size: 0.5-4.0 Earth radii suggests rocky to sub-Neptune planets (>20 R⊕ indicates stellar contamination)
3. Physical Consistency: Density 0.5-15 g/cm³ indicates realistic planetary composition
4. Orbital Stability: Period 0.5-500 days for stable orbits around main sequence stars
5. Temperature Range: 100-2000K covers full range from frozen to ultra-hot planets
6. Stellar Properties: Host star parameters should be consistent with main sequence evolution
7. Signal Geometry: Impact parameter < 1.2 indicates observable transit geometry
8. System Distance: <1000 pc indicates reliable stellar parameter measurements

HABITABILITY ASSESSMENT:
- Potentially Habitable: 200-350K equilibrium temperature, 0.8-1.5 Earth radii, rocky composition
- Temperate Zone: 150-400K with consideration for atmospheric greenhouse effects
- Hot Zone: >400K, likely too hot for liquid water
- Cold Zone: <150K, likely frozen without substantial atmosphere

PLANET TYPE CLASSIFICATION:
- Earth-like: 0.8-1.25 R⊕, 0.5-2.0 M⊕, rocky composition
- Super-Earth: 1.25-2.0 R⊕, 2.0-10.0 M⊕, likely rocky with thick atmosphere
- Sub-Neptune: 2.0-4.0 R⊕, 5.0-20.0 M⊕, substantial H/He envelope
- Gas Giant: >4.0 R⊕, >20.0 M⊕, dominated by gas envelope

REQUIRED OUTPUT FORMAT (respond with EXACTLY this JSON structure):
{
  "disposition": "CONFIRMED" | "CANDIDATE" | "FALSE POSITIVE",
  "confidence": [number between 0.0 and 1.0],
  "reasoning": "[detailed scientific explanation of the analysis]",
  "habitability_assessment": "[assessment of potential for liquid water and habitability]",
  "planet_type": "[classification: Earth-like, Super-Earth, Sub-Neptune, or Gas Giant]"
}

Consider K2-specific challenges such as:
- Shorter observation baseline requiring higher transit significance
- Systematic noise from spacecraft pointing drift
- Need for follow-up observations for mass measurements
- Potential false positives from stellar activity or instrumental artifacts
- Background eclipsing binaries in the larger photometric apertures

Based on your scientific analysis of these K2 mission parameters, what is your assessment?`;

    console.log('Sending K2 exoplanet data to Claude for analysis...');

    const command = new ConverseCommand({
      modelId: modelId,
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: {
        maxTokens: 1000,
        temperature: 0.1, 
      },
    });

    const response = await client.send(command);
    const responseText = response.output?.message?.content?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response from Claude');
    }

    console.log('Claude AI K2 Analysis:', responseText);

    try {
     
      const analysisResult = JSON.parse(responseText);
      
   
      if (!analysisResult.disposition || !analysisResult.confidence || !analysisResult.reasoning) {
        throw new Error('Invalid response format from Claude');
      }

      
      const validDispositions = ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'];
      if (!validDispositions.includes(analysisResult.disposition)) {
        analysisResult.disposition = 'CANDIDATE'; 
      }

      
      analysisResult.confidence = Math.max(0.0, Math.min(1.0, analysisResult.confidence));

      return NextResponse.json({
        disposition: analysisResult.disposition,
        confidence: analysisResult.confidence,
        reasoning: analysisResult.reasoning,
        habitability_assessment: analysisResult.habitability_assessment || 'Not assessed',
        planet_type: analysisResult.planet_type || 'Unknown',
        mission: 'K2',
        ai_analysis: true,
        parameters_analyzed: {
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

    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.log('Raw Claude response:', responseText);
      
  
      const disposition = responseText.toLowerCase().includes('confirmed') ? 'CONFIRMED' :
                         responseText.toLowerCase().includes('false positive') ? 'FALSE POSITIVE' : 'CANDIDATE';
      
      return NextResponse.json({
        disposition,
        confidence: 0.5,
        reasoning: responseText,
        mission: 'K2',
        ai_analysis: true,
        parse_error: true,
        parameters_analyzed: {
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
    }

  } catch (error) {
    console.error('Error in K2 exoplanet prediction API:', error);
    
    
    if (error instanceof Error && error.message.includes('credential')) {
      return NextResponse.json(
        { 
          error: 'AWS credentials error. Please check your AWS configuration.',
          success: false 
        },
        { status: 401 }
      );
    }
    
    
    if (error instanceof Error && error.message.includes('access')) {
      return NextResponse.json(
        { 
          error: 'Claude model access denied. Please check your AWS Bedrock permissions.',
          success: false 
        },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get K2 prediction from Claude AI',
        success: false 
      },
      { status: 500 }
    );
  }
}