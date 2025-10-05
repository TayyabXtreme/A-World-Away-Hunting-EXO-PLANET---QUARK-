import { useState } from 'react';
import { askClaude } from '@/helper/claude_aws';

interface FormData {
  koi_score: string;
  koi_period: string;
  koi_time0bk: string;
  koi_impact: string;
  koi_duration: string;
  koi_depth: string;
  koi_prad: string;
  koi_teq: string;
  koi_insol: string;
  koi_steff: string;
  koi_slogg: string;
  koi_srad: string;
}

interface PredictionResult {
  disposition: string;
  confidence: number;
  reasoning: string;
}

interface PredictionHookReturn {
  loading: boolean;
  error: string | null;
  predictSingle: (data: FormData) => Promise<PredictionResult | null>;
  predictBatch: (dataArray: FormData[]) => Promise<PredictionResult[] | null>;
}

export const useClaudePrediction = (): PredictionHookReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPrompt = (data: FormData): string => {
    return `You are an expert exoplanet analyst. Analyze this Kepler Object of Interest (KOI) data and predict its disposition.

Data: KOI Score=${data.koi_score}, Period=${data.koi_period}d, Impact=${data.koi_impact}, Duration=${data.koi_duration}h, Depth=${data.koi_depth}ppm, Planet Radius=${data.koi_prad} Earth radii, Temperature=${data.koi_teq}K, Insolation=${data.koi_insol}, Star Temp=${data.koi_steff}K, Star Gravity=${data.koi_slogg}, Star Radius=${data.koi_srad}

Respond with ONLY one word: CONFIRMED, CANDIDATE, or FALSE POSITIVE

Your answer:`;
  };

  const predictSingle = async (data: FormData): Promise<PredictionResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const prompt = createPrompt(data);
      
   
      const responseText = await askClaude(prompt);
      
      if (!responseText) {
        throw new Error('No response from Claude');
      }

     
      const cleanResponse = responseText.trim().toUpperCase();
      
      let disposition = "CANDIDATE"; 
      if (cleanResponse.includes("CONFIRMED")) {
        disposition = "CONFIRMED";
      } else if (cleanResponse.includes("FALSE POSITIVE")) {
        disposition = "FALSE POSITIVE";
      } else if (cleanResponse.includes("CANDIDATE")) {
        disposition = "CANDIDATE";
      }

      return {
        disposition,
        confidence: 0.85, 
        reasoning: `AI prediction: ${disposition}`,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Prediction error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const predictBatch = async (dataArray: FormData[]): Promise<PredictionResult[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const results: PredictionResult[] = [];
      
      for (let i = 0; i < dataArray.length; i++) {
        const data = dataArray[i];
        
        try {
          
          setLoading(false);
          const result = await predictSingle(data);
          setLoading(true);
          
          if (result) {
            results.push(result);
          } else {
            results.push({
              disposition: "ERROR",
              confidence: 0,
              reasoning: "Failed to process this row",
            });
          }
        } catch (err) {
          results.push({
            disposition: "ERROR",
            confidence: 0,
            reasoning: "Error processing row",
          });
        }
        
      
        if (i < dataArray.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Batch prediction failed';
      setError(errorMessage);
      console.error('Batch prediction error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    predictSingle,
    predictBatch,
  };
};