import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Configure the AWS Bedrock client
const client = new BedrockRuntimeClient({
  region: process.env.NEXT_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.NEXT_AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.NEXT_AWS_SECRET_ACCESS_KEY || '',
  },
});

// Use Claude model
const modelId = "us.anthropic.claude-3-5-sonnet-20241022-v2:0";

// Check if AWS credentials are properly configured
function validateAWSCredentials(): boolean {
  return !!(
    process.env.NEXT_AWS_ACCESS_KEY_ID && 
    process.env.NEXT_AWS_SECRET_ACCESS_KEY && 
    process.env.NEXT_AWS_REGION
  );
}

// Generate mock responses for testing when AWS is not available
function generateMockResponse(dataset: string) {
  const responses = {
    k2: {
      disposition: "CANDIDATE",
      confidence: 78,
      reasoning: "This K2 candidate shows promising transit characteristics with a reasonable orbital period and planet radius. The stellar parameters are within expected ranges for hosting planets. However, further validation is needed to rule out false positive scenarios such as eclipsing binaries or background objects.",
      habitability_assessment: "The planet receives moderate stellar flux and has an equilibrium temperature that could potentially support liquid water, depending on atmospheric composition.",
      planet_type: "Super-Earth candidate"
    },
    tess: {
      disposition: "CANDIDATE", 
      confidence: 82,
      reasoning: "TESS data shows consistent transit signals with good photometric precision. The short orbital period is typical for TESS discoveries. Stellar parameters are well-constrained and support planetary interpretation.",
      habitability_assessment: "High stellar flux likely makes this planet too hot for conventional habitability.",
      planet_type: "Hot Jupiter candidate"
    },
    kepler: {
      disposition: "CANDIDATE",
      confidence: 85,
      reasoning: "Kepler photometry shows clear transit signals with good signal-to-noise ratio. Transit parameters are consistent with a planetary interpretation.",
      habitability_assessment: "Planet is in the habitable zone with potential for liquid water.",
      planet_type: "Earth-size candidate"
    }
  };
  
  return responses[dataset as keyof typeof responses] || responses.kepler;
}

// Generate K2-specific analysis prompt
function generateK2Prompt(data: any): string {
  return `You are an expert exoplanet researcher specializing in K2 mission data analysis. Analyze the following K2 planetary candidate parameters and provide a detailed assessment.

K2 Planetary Parameters:
- Orbital Period: ${data.pl_orbper} days
- Transit Depth: ${data.pl_trandep} (fraction)
- Transit Duration: ${data.pl_trandur} hours
- Impact Parameter: ${data.pl_imppar}
- Planet Radius: ${data.pl_rade} R⊕
- Planet Mass: ${data.pl_massj} MJ
- Planet Density: ${data.pl_dens} g/cm³
- Insolation: ${data.pl_insol} S⊕
- Equilibrium Temperature: ${data.pl_eqt} K

K2 Stellar Parameters:
- Stellar Temperature: ${data.st_teff} K
- Stellar Radius: ${data.st_rad} R☉
- Stellar Mass: ${data.st_mass} M☉
- Stellar Gravity: ${data.st_logg} log(cm/s²)

System Coordinates:
- Right Ascension: ${data.ra}°
- Declination: ${data.dec}°
- System Distance: ${data.sy_dist} pc

Based on these K2 mission parameters, provide your analysis in the following JSON format:
{
  "disposition": "CONFIRMED" | "CANDIDATE" | "FALSE POSITIVE",
  "confidence": <confidence_percentage>,
  "reasoning": "<detailed_explanation>",
  "habitability_assessment": "<habitability_analysis>",
  "planet_type": "<planet_classification>"
}

Consider K2-specific factors:
- K2's extended mission observing different star fields
- Shorter observation periods compared to original Kepler
- Focus on brighter stars and diverse stellar populations
- Typical K2 transit detection thresholds and signal quality`;
}

// Generate TESS-specific analysis prompt
function generateTessPrompt(data: any): string {
  return `You are an expert exoplanet researcher specializing in TESS mission data analysis. Analyze the following TESS planetary candidate parameters and provide a detailed assessment.

TESS Planetary Parameters:
- Orbital Period: ${data.pl_orbper} days
- Transit Duration: ${data.pl_trandurh} hours
- Transit Depth: ${data.pl_trandep} (fraction)
- Planet Radius: ${data.pl_rade} R⊕
- Insolation: ${data.pl_insol} S⊕
- Equilibrium Temperature: ${data.pl_eqt} K

TESS Stellar Parameters:
- Stellar Temperature: ${data.st_teff} K
- Stellar Surface Gravity: ${data.st_logg} log(cm/s²)
- Stellar Radius: ${data.st_rad} R☉
- TESS Magnitude: ${data.st_tmag} mag
- System Distance: ${data.st_dist} pc

System Coordinates:
- Right Ascension: ${data.ra}°
- Declination: ${data.dec}°

Based on these TESS mission parameters, provide your analysis in the following JSON format:
{
  "disposition": "CONFIRMED" | "CANDIDATE" | "FALSE POSITIVE",
  "confidence": <confidence_percentage>,
  "reasoning": "<detailed_explanation>",
  "habitability_assessment": "<habitability_analysis>",
  "planet_type": "<planet_classification>"
}

Consider TESS-specific factors:
- All-sky survey with 27-day observation periods
- Optimized for detecting short-period transiting planets
- Focus on nearby bright stars for follow-up observations
- TESS magnitude limits and photometric precision`;
}

// Generate Kepler-specific analysis prompt
function generateKeplerPrompt(data: any): string {
  return `You are an expert exoplanet researcher specializing in Kepler mission data analysis. Analyze the following Kepler Object of Interest (KOI) parameters and provide a detailed assessment.

Kepler Parameters:
- KOI Score: ${data.koi_score}
- Orbital Period: ${data.koi_period} days
- Transit Epoch: ${data.koi_time0bk} BKJD
- Impact Parameter: ${data.koi_impact}
- Transit Duration: ${data.koi_duration} hours
- Transit Depth: ${data.koi_depth} ppm
- Planet Radius: ${data.koi_prad} R⊕
- Equilibrium Temperature: ${data.koi_teq} K
- Insolation: ${data.koi_insol} S⊕
- Stellar Temperature: ${data.koi_steff} K
- Stellar Gravity: ${data.koi_slogg} log(cm/s²)
- Stellar Radius: ${data.koi_srad} R☉
- Model SNR: ${data.koi_model_snr}
- Stellar Density: ${data.koi_srho} ρ☉

Based on these Kepler mission parameters, provide your analysis in the following JSON format:
{
  "disposition": "CONFIRMED" | "CANDIDATE" | "FALSE POSITIVE",
  "confidence": <confidence_percentage>,
  "reasoning": "<detailed_explanation>",
  "habitability_assessment": "<habitability_analysis>",
  "planet_type": "<planet_classification>"
}

Consider Kepler-specific factors and detection criteria in your analysis.`;
}

export async function POST(request: NextRequest) {
  console.log("start")
  try {
    const body = await request.json();
    
    // Validate AWS credentials first
    if (!validateAWSCredentials()) {
      console.log('AWS credentials not found, providing mock response');
      
      // Generate mock response based on dataset
      const mockResponse = generateMockResponse(body.dataset || 'kepler');
      
      return NextResponse.json({
        ...mockResponse,
        success: true,
        note: 'Mock response - AWS credentials not configured'
      });
    }
    
    // Handle different dataset types
    let prompt: string;
    let dataset = body.dataset || 'kepler'; // Default to kepler for backward compatibility
    
    if (body.prompt) {
      // Legacy prompt-based request
      prompt = body.prompt;
    } else {
      // Generate dataset-specific prompts
      if (dataset === 'k2') {
        prompt = generateK2Prompt(body);
      } else if (dataset === 'tess') {
        prompt = generateTessPrompt(body);
      } else {
        // Default to Kepler
        prompt = generateKeplerPrompt(body);
      }
    }

    if (!prompt) {
      return NextResponse.json(
        { error: 'Unable to generate analysis prompt' },
        { status: 400 }
      );
    }

    console.log('Sending request to Claude for exoplanet prediction...');

    const command = new ConverseCommand({
      modelId: modelId,
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: {
        maxTokens: 1000,
        temperature: 0.3,
      },
    });

    const response = await client.send(command);
    const responseText = response.output?.message?.content?.[0]?.text;
    console.log(response.output?.message?.content?.[0])
    
    if (!responseText) {
      throw new Error('No response from Claude');
    }

    console.log('Claude Response:', responseText);

    // Try to parse JSON response
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedResponse = JSON.parse(jsonMatch[0]);
        
        return NextResponse.json({
          disposition: parsedResponse.disposition,
          confidence: parsedResponse.confidence,
          reasoning: parsedResponse.reasoning,
          habitability_assessment: parsedResponse.habitability_assessment,
          planet_type: parsedResponse.planet_type,
          success: true,
        });
      } else {
        // Fallback for non-JSON responses
        return NextResponse.json({
          prediction: responseText,
          success: true,
        });
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response as JSON:', parseError);
      // Return raw response if JSON parsing fails
      return NextResponse.json({
        prediction: responseText,
        success: true,
      });
    }

  } catch (error) {
    console.error('Error invoking Claude:', error);
    
    // Check if it's an AWS credentials error
    if (error instanceof Error && error.message.includes('credential')) {
      return NextResponse.json(
        { 
          error: 'AWS credentials error. Please check your AWS configuration.',
          success: false 
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get prediction from Claude',
        success: false 
      },
      { status: 500 }
    );
  }
}