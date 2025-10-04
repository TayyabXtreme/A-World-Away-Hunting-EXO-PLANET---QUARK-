import { NextRequest, NextResponse } from 'next/server';
import {
  BedrockRuntimeClient,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

// Configure the AWS Bedrock client
const client = new BedrockRuntimeClient({
   region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey:process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Use Claude model
const modelId = "us.anthropic.claude-3-5-sonnet-20241022-v2:0";

export async function POST(request: NextRequest) {
  console.log("Starting exoplanet analysis with Claude AI");
  try {
    const data = await request.json();
    
    // Extract the planet parameters
    const {
      koi_score,
      koi_period,
      koi_time0bk,
      koi_impact,
      koi_duration,
      koi_depth,
      koi_prad,
      koi_teq,
      koi_insol,
      koi_steff,
      koi_slogg,
      koi_srad,
      koi_model_snr,
      koi_srho
    } = data;

    // Create comprehensive prompt for Claude AI
    const prompt = `You are an expert exoplanet astronomer analyzing Kepler Objects of Interest (KOI) data. Please analyze the following exoplanet parameters and provide a scientific assessment.

EXOPLANET PARAMETERS:
- KOI Score (Detection Confidence): ${koi_score} (0.0 = False Positive, 1.0 = Confirmed)
- Orbital Period: ${koi_period} days
- Transit Epoch (BKJD): ${koi_time0bk} days
- Impact Parameter: ${koi_impact} (0 = central, >1.0 = grazing)
- Transit Duration: ${koi_duration} hours
- Transit Depth: ${koi_depth} ppm (parts per million)
- Planet Radius: ${koi_prad} Earth radii (>20 often indicates Eclipsing Binaries)
- Equilibrium Temperature: ${koi_teq} K
- Insolation: ${koi_insol} Earth flux
- Stellar Effective Temperature: ${koi_steff} K
- Stellar Surface Gravity: ${koi_slogg} log(cm/s²)
- Stellar Radius: ${koi_srad} Solar radii
- Model Signal-to-Noise Ratio: ${koi_model_snr} (<10 often too low for confidence)
- Stellar Density: ${koi_srho} Solar density

ANALYSIS CRITERIA:
1. Detection Quality: KOI Score > 0.7 indicates high confidence
2. Signal Strength: Model SNR > 10 indicates reliable detection
3. Orbital Characteristics: Period between 10-400 days suggests potentially habitable zone
4. Planet Size: 0.5-2.5 Earth radii indicates rocky to super-Earth planets (>20 suggests Eclipsing Binary)
5. Temperature: 200-350K suggests potential habitability
6. Transit Geometry: Impact parameter < 0.5 indicates favorable central transit
7. Host Star: 5000-6500K stellar temperature indicates Sun-like star
8. Physical Consistency: Stellar density should be consistent with transit parameters

REQUIRED OUTPUT FORMAT (respond with EXACTLY this JSON structure):
{
  "disposition": "CONFIRMED" | "CANDIDATE" | "FALSE POSITIVE",
  "confidence": [number between 0.0 and 1.0],
  "reasoning": "[brief scientific explanation]",
  "habitability_assessment": "[assessment of potential habitability]",
  "planet_type": "[classification: Earth-like, Super-Earth, Sub-Neptune, or Gas Giant]"
}

Based on the scientific analysis of these parameters, what is your assessment? Consider false positive scenarios like stellar activity, binary star contamination, or instrumental artifacts.`;

    console.log('Sending exoplanet data to Claude for analysis...');

    const command = new ConverseCommand({
      modelId: modelId,
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: {
        maxTokens: 1000,
        temperature: 0.1, // Low temperature for consistent scientific analysis
      },
    });

    const response = await client.send(command);
    const responseText = response.output?.message?.content?.[0]?.text;
    
    if (!responseText) {
      throw new Error('No response from Claude');
    }

    console.log('Claude AI Analysis:', responseText);

    try {
      // Parse Claude's JSON response
      const analysisResult = JSON.parse(responseText);
      
      // Validate the response structure
      if (!analysisResult.disposition || !analysisResult.confidence || !analysisResult.reasoning) {
        throw new Error('Invalid response format from Claude');
      }

      // Ensure disposition is in correct format
      const validDispositions = ['CONFIRMED', 'CANDIDATE', 'FALSE POSITIVE'];
      if (!validDispositions.includes(analysisResult.disposition)) {
        analysisResult.disposition = 'CANDIDATE'; // Default fallback
      }

      // Ensure confidence is within valid range
      analysisResult.confidence = Math.max(0.0, Math.min(1.0, analysisResult.confidence));

      return NextResponse.json({
        disposition: analysisResult.disposition,
        confidence: analysisResult.confidence,
        reasoning: analysisResult.reasoning,
        habitability_assessment: analysisResult.habitability_assessment || 'Not assessed',
        planet_type: analysisResult.planet_type || 'Unknown',
        ai_analysis: true,
        parameters_analyzed: {
          koi_score,
          koi_period,
          koi_time0bk,
          koi_impact,
          koi_duration,
          koi_depth,
          koi_prad,
          koi_teq,
          koi_insol,
          koi_steff,
          koi_slogg,
          koi_srad,
          koi_model_snr,
          koi_srho
        }
      });

    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      console.log('Raw Claude response:', responseText);
      
      // Fallback: Extract key information from text response
      const disposition = responseText.toLowerCase().includes('confirmed') ? 'CONFIRMED' :
                         responseText.toLowerCase().includes('false positive') ? 'FALSE POSITIVE' : 'CANDIDATE';
      
      return NextResponse.json({
        disposition,
        confidence: 0.5,
        reasoning: responseText,
        ai_analysis: true,
        parse_error: true,
        parameters_analyzed: {
          koi_score,
          koi_period,
          koi_time0bk,
          koi_impact,
          koi_duration,
          koi_depth,
          koi_prad,
          koi_teq,
          koi_insol,
          koi_steff,
          koi_slogg,
          koi_srad,
          koi_model_snr,
          koi_srho
        }
      });
    }

  } catch (error) {
    console.error('Error in exoplanet prediction API:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get prediction from Claude AI',
        success: false 
      },
      { status: 500 }
    );
  }
}