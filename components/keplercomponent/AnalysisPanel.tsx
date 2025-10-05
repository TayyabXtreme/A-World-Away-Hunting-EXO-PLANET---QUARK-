"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Activity, Globe, Thermometer, Sun, Orbit, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PlanetData } from './KeplerVisualizer';
import AWSCredentialsDialog from '@/components/ui/aws-credentials-dialog';

interface AnalysisPanelProps {
  planet: PlanetData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<PlanetData>) => void;
  onAnalyze: (planet: PlanetData) => void;
}

interface AWSCredentials {
  aws_region: string;
  aws_access_key_id: string;
  aws_secret_access_key: string;
}

interface ParameterConfig {
  key: keyof PlanetData;
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
}

const parameters: ParameterConfig[] = [
  {
    key: 'koi_score',
    label: 'KOI Score',
    icon: <Activity className="h-4 w-4" />,
    min: 0,
    max: 1,
    step: 0.01,
    unit: '',
    description: 'Detection confidence (0.0 = False Positive, 1.0 = Confirmed)'
  },
  {
    key: 'koi_period',
    label: 'Orbital Period',
    icon: <Orbit className="h-4 w-4" />,
    min: 0.2,
    max: 1000,
    step: 0.1,
    unit: 'days',
    description: 'Time to complete one orbit'
  },
  {
    key: 'koi_time0bk',
    label: 'Transit Epoch',
    icon: <Sun className="h-4 w-4" />,
    min: 110,
    max: 300,
    step: 0.1,
    unit: 'BKJD',
    description: 'Barycenter corrected Julian Date of first transit'
  },
  {
    key: 'koi_impact',
    label: 'Impact Parameter',
    icon: <Globe className="h-4 w-4" />,
    min: 0,
    max: 1.5,
    step: 0.01,
    unit: '',
    description: 'Transit centrality (0 = central, >1.0 = grazing)'
  },
  {
    key: 'koi_duration',
    label: 'Transit Duration',
    icon: <Activity className="h-4 w-4" />,
    min: 0.5,
    max: 12,
    step: 0.1,
    unit: 'hours',
    description: 'Time planet is transiting the star'
  },
  {
    key: 'koi_depth',
    label: 'Transit Depth',
    icon: <Zap className="h-4 w-4" />,
    min: 10,
    max: 100000,
    step: 10,
    unit: 'ppm',
    description: 'Fractional drop in stellar flux'
  },
  {
    key: 'koi_prad',
    label: 'Planet Radius',
    icon: <Globe className="h-4 w-4" />,
    min: 0.1,
    max: 30,
    step: 0.1,
    unit: 'R⊕',
    description: 'Planet radius (>20 often indicates Eclipsing Binaries)'
  },
  {
    key: 'koi_teq',
    label: 'Equilibrium Temperature',
    icon: <Thermometer className="h-4 w-4" />,
    min: 100,
    max: 3000,
    step: 1,
    unit: 'K',
    description: 'Estimated equilibrium temperature of planet'
  },
  {
    key: 'koi_insol',
    label: 'Insolation',
    icon: <Sun className="h-4 w-4" />,
    min: 0.01,
    max: 1000000,
    step: 0.01,
    unit: 'S⊕',
    description: 'Incident stellar flux received by planet'
  },
  {
    key: 'koi_steff',
    label: 'Stellar Temperature',
    icon: <Thermometer className="h-4 w-4" />,
    min: 3000,
    max: 7000,
    step: 10,
    unit: 'K',
    description: 'Effective temperature of host star'
  },
  {
    key: 'koi_slogg',
    label: 'Stellar Gravity',
    icon: <Activity className="h-4 w-4" />,
    min: 3,
    max: 5,
    step: 0.01,
    unit: 'log(cm/s²)',
    description: 'Logarithm of star surface gravity'
  },
  {
    key: 'koi_srad',
    label: 'Stellar Radius',
    icon: <Sun className="h-4 w-4" />,
    min: 0.3,
    max: 10,
    step: 0.01,
    unit: 'R☉',
    description: 'Radius of host star'
  },
  {
    key: 'koi_model_snr',
    label: 'Model SNR',
    icon: <Activity className="h-4 w-4" />,
    min: 5,
    max: 1000,
    step: 0.1,
    unit: '',
    description: 'Signal-to-Noise Ratio (<10 often too low for confidence)'
  },
  {
    key: 'koi_srho',
    label: 'Stellar Density',
    icon: <Activity className="h-4 w-4" />,
    min: 0.01,
    max: 10,
    step: 0.01,
    unit: 'ρ☉',
    description: 'Stellar density (checks transit parameter consistency)'
  }
];

export default function AnalysisPanel({ planet,  onClose, onUpdate}: AnalysisPanelProps) {
  const [formData, setFormData] = useState(planet);
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [userCredentials, setUserCredentials] = useState<AWSCredentials | null>(null);
  const [hasEnvCredentials, setHasEnvCredentials] = useState(false);

  useEffect(() => {
    setFormData(planet);
  }, [planet]);

  useEffect(() => {
    // Check if environment variables are available
    const checkEnvironmentCredentials = async () => {
      try {
        const response = await fetch('/api/check-env');
        const data = await response.json();
        setHasEnvCredentials(data.hasEnvironmentCredentials);
      } catch (error) {
        console.error('Failed to check environment credentials:', error);
        setHasEnvCredentials(false);
      }
    };

    checkEnvironmentCredentials();
  }, []);

  const handleInputChange = (key: keyof PlanetData, value: number) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onUpdate({ [key]: value });
  };

  const handleAnalyze = async () => {
    try {
      onUpdate({ isAnalyzing: true });

      const payload = {
        koi_score: formData.koi_score,
        koi_period: formData.koi_period,
        koi_time0bk: formData.koi_time0bk,
        koi_impact: formData.koi_impact,
        koi_duration: formData.koi_duration,
        koi_depth: formData.koi_depth,
        koi_prad: formData.koi_prad,
        koi_teq: formData.koi_teq,
        koi_insol: formData.koi_insol,
        koi_steff: formData.koi_steff,
        koi_slogg: formData.koi_slogg,
        koi_srad: formData.koi_srad,
        koi_model_snr: formData.koi_model_snr,
        koi_srho: formData.koi_srho,
        // Include user credentials if available
        ...(userCredentials && {
          aws_region: userCredentials.aws_region,
          aws_access_key_id: userCredentials.aws_access_key_id,
          aws_secret_access_key: userCredentials.aws_secret_access_key,
        })
      };

      const response = await fetch('/api/predict-keppler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Don't automatically reopen dialog - let user manually retry
        throw new Error(errorData.error || 'Prediction request failed');
      }

      const result = await response.json();
      
      let prediction: 'confirmed' | 'false-positive' | 'candidate';
      if (result.disposition === 'CONFIRMED') {
        prediction = 'confirmed';
      } else if (result.disposition === 'FALSE POSITIVE') {
        prediction = 'false-positive';
      } else {
        prediction = 'candidate';
      }

      onUpdate({ 
        isAnalyzing: false, 
        prediction: prediction,
        claudeResponse: {
          disposition: result.disposition,
          confidence: result.confidence,
          reasoning: result.reasoning,
          is_exoplanet: result.is_exoplanet,
          planet_type: result.planet_type
        }
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      onUpdate({ isAnalyzing: false });
      
      // Show user-friendly error message without auto-reopening dialog
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      if (errorMessage.includes('credential') || errorMessage.includes('auth')) {
        alert(`Claude AI Analysis Error: ${errorMessage}\n\nPlease click "Analyze with Claude AI" again to configure credentials.`);
      } else {
        alert(`Claude AI Analysis Error: ${errorMessage}`);
      }
    }
  };

  const handleCredentialsSubmit = (credentials: AWSCredentials) => {
    setUserCredentials(credentials);
    setShowCredentialsDialog(false); // Close dialog immediately after submission
    
    // Retry the analysis with the provided credentials
    setTimeout(() => {
      handleAnalyze();
    }, 100);
  };

  const handleClaudeAnalyzeClick = () => {
    if (!hasEnvCredentials && !userCredentials) {
      // No environment variables and no user credentials - must provide credentials
      setShowCredentialsDialog(true);
    } else if (hasEnvCredentials && !userCredentials) {
      // Environment variables available - show dialog but allow skip
      setShowCredentialsDialog(true);
    } else {
      // User credentials already provided - proceed with analysis
      handleAnalyze();
    }
  };

  const handleCredentialsSkip = () => {
    setShowCredentialsDialog(false);
    // Proceed with environment variables
    setTimeout(() => {
      handleAnalyze();
    }, 100);
  };

  const handleCredentialsClose = () => {
    setShowCredentialsDialog(false);
  };

  const handleFlaskAnalyze = async () => {
    try {
      onUpdate({ isAnalyzing: true });

      const payload = {
        features: {
          koi_score: formData.koi_score,
          koi_period: formData.koi_period,
          koi_time0bk: formData.koi_time0bk,
          koi_impact: formData.koi_impact,
          koi_duration: formData.koi_duration,
          koi_depth: formData.koi_depth,
          koi_prad: formData.koi_prad,
          koi_teq: formData.koi_teq,
          koi_insol: formData.koi_insol,
          koi_steff: formData.koi_steff,
          koi_slogg: formData.koi_slogg,
          koi_srad: formData.koi_srad,
          koi_model_snr: formData.koi_model_snr,
          koi_srho: formData.koi_srho,
        }
      };

      const response = await fetch('http://127.0.0.1:5000/predict/kepler', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'QzQBpd3vd1K4fBeRdPMBvH4rwphF7Nns4Y-T1cfj9PY'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Flask API request failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Flask API Response:', result);
      
      let prediction: 'confirmed' | 'false-positive' | 'candidate';
      
      // Determine prediction based on Flask response
      if (result.is_exoplanet === true) {
        if (result.koi_pdisposition === 'CONFIRMED') {
          prediction = 'confirmed';
        } else {
          prediction = 'candidate';
        }
      } else {
        prediction = 'false-positive';
      }

     
      onUpdate({ 
        isAnalyzing: false, 
        prediction: prediction,
        flaskResponse: {
          is_exoplanet: result.is_exoplanet,
          koi_pdisposition: result.koi_pdisposition,
          probability: result.probability,
          status: 'success',
          timestamp: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Flask analysis failed:', error);
      onUpdate({ isAnalyzing: false });
      
     
      alert(`Flask API Error: ${error instanceof Error ? error.message : 'Connection failed. Make sure Flask server is running on http://127.0.0.1:5000'}`);
    }
  };

  const getPredictionBadge = () => {
    if (planet.isAnalyzing) {
      return (
        <Badge variant="outline" className="border-blue-400/50 text-blue-400 bg-blue-400/10 animate-pulse">
          🔄 Analyzing...
        </Badge>
      );
    }

    if (planet.prediction === 'confirmed') {
      return (
        <Badge variant="outline" className="border-green-400/50 text-green-400 bg-green-400/10">
          🟢 Confirmed Exoplanet
        </Badge>
      );
    }

    if (planet.prediction === 'false-positive') {
      return (
        <Badge variant="outline" className="border-red-400/50 text-red-400 bg-red-400/10">
          🔴 False Positive
        </Badge>
      );
    }

    if (planet.prediction === 'candidate') {
      return (
        <Badge variant="outline" className="border-yellow-400/50 text-yellow-400 bg-yellow-400/10">
          🟡 Candidate
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-gray-400/50 text-gray-400 bg-gray-400/10">
        ⚪ Unanalyzed
      </Badge>
    );
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        opacity: { duration: 0.2 }
      }}
      className="fixed right-0 top-0 h-full w-96 z-50 bg-black/40 backdrop-blur-xl border-l border-gray-700/50 shadow-2xl"
    >
      <div className="h-full overflow-y-auto scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
        <Card className="h-full bg-transparent border-0 rounded-none">
          <CardHeader className="relative pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30">
                  <Globe className="h-5 w-5 text-blue-300" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-bold">
                    {planet.id}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    Exoplanet Analysis Panel
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-800/60 h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-4">
              {getPredictionBadge()}
              
              {/* Credential Status */}
              <div className="mt-2 flex items-center gap-2">
                {userCredentials ? (
                  <Badge variant="outline" className="border-green-400/50 text-green-400 bg-green-400/10 text-xs">
                    🔐 Custom Credentials Set
                  </Badge>
                ) : hasEnvCredentials ? (
                  <Badge variant="outline" className="border-blue-400/50 text-blue-400 bg-blue-400/10 text-xs">
                    ⚡ Environment Variables Available
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-yellow-400/50 text-yellow-400 bg-yellow-400/10 text-xs">
                    ⚠️ Credentials Required
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Parameters Grid */}
            <div className="space-y-4">
              {parameters.map((param, index) => (
                <motion.div
                  key={param.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Label 
                      htmlFor={param.key} 
                      className="text-sm font-medium text-gray-300 flex items-center gap-2 group-hover:text-white transition-colors"
                    >
                      <span className="text-blue-400">{param.icon}</span>
                      {param.label}
                    </Label>
                    <div className="text-xs text-gray-400 font-mono">
                      {(formData[param.key] as number).toFixed(param.step < 0.1 ? 2 : 1)} {param.unit}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Slider
                      value={[(formData[param.key] as number)]}
                      onValueChange={([value]) => handleInputChange(param.key, value)}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="w-full"
                    />
                    
                    <Input
                      id={param.key}
                      type="number"
                      value={(formData[param.key] as number)}
                      onChange={(e) => handleInputChange(param.key, parseFloat(e.target.value) || 0)}
                      min={param.min}
                      max={param.max}
                      step={param.step}
                      className="h-8 bg-gray-800/60 border-gray-600/50 text-white text-xs
                        focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-1 leading-tight">
                    {param.description}
                  </p>

                  {index < parameters.length - 1 && (
                    <Separator className="mt-4 bg-gray-700/50" />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Analysis Buttons */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="pt-4 border-t border-gray-700/50 space-y-3"
            >
              {/* Claude AI Analysis Button */}
              <Button
                onClick={handleClaudeAnalyzeClick}
                disabled={planet.isAnalyzing}
                className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 
                  hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 
                  text-white h-12 font-semibold shadow-2xl shadow-blue-600/30 
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  border border-blue-500/30 hover:border-blue-400/50"
              >
                {planet.isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    <span className="animate-pulse">Claude AI Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Analyze with Claude AI
                    {userCredentials && (
                      <Badge variant="outline" className="ml-2 border-green-400/50 text-green-400 bg-green-400/10 text-xs">
                        ✓
                      </Badge>
                    )}
                  </>
                )}
              </Button>

              {/* Flask ML Model Button */}
              <Button
                onClick={handleFlaskAnalyze}
                disabled={planet.isAnalyzing}
                variant="outline"
                className="w-full bg-gradient-to-r from-green-600 via-green-700 to-emerald-700 
                  hover:from-green-700 hover:via-green-800 hover:to-emerald-800 
                  text-white h-12 font-semibold shadow-2xl shadow-green-600/30 
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  border border-green-500/30 hover:border-green-400/50"
              >
                {planet.isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    <span className="animate-pulse">ML Model Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Activity className="h-4 w-4 mr-2" />
                    Analyze with ML Model
                  </>
                )}
              </Button>

              {/* Info Text */}
              <div className="text-xs text-gray-500 text-center space-y-1 my-3">
                             <p><strong>Claude AI:</strong> Advanced reasoning & scientific analysis</p>
                             <p><strong>ML Model:</strong> Trained on K2 mission dataset patterns</p>
                             <p className="flex "><AlertCircle className="h-3 w-3"/> AI models can make mistakes. Please review results carefully.</p>
                           </div>
            </motion.div>

            {/* Planet Stats Summary */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-br from-gray-800/60 to-gray-900/40 rounded-xl p-4 border border-gray-700/50"
            >
              <h4 className="text-sm font-semibold text-white mb-3">Quick Stats</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-gray-400">Habitability</div>
                  <div className="text-blue-300 font-medium">
                    {formData.koi_teq > 200 && formData.koi_teq < 350 ? 'Potential' : 'Unlikely'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Size Class</div>
                  <div className="text-blue-300 font-medium">
                    {formData.koi_prad < 1.25 ? 'Earth-like' : 
                     formData.koi_prad < 2 ? 'Super-Earth' : 'Gas Giant'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Orbit Type</div>
                  <div className="text-blue-300 font-medium">
                    {formData.koi_period < 100 ? 'Hot' : 
                     formData.koi_period < 500 ? 'Warm' : 'Cold'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Detection</div>
                  <div className="text-blue-300 font-medium">
                    {formData.koi_score > 0.8 ? 'Strong' : 
                     formData.koi_score > 0.5 ? 'Moderate' : 'Weak'}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Analysis Results */}
            {(planet.claudeResponse || planet.flaskResponse) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="space-y-4"
              >
                {/* Claude AI Results */}
                {planet.claudeResponse && (
                  <div className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 rounded-xl p-4 border border-blue-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-blue-300">Claude AI Analysis</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Is Exoplanet:</span>
                        <span className={`font-medium ${planet.claudeResponse.is_exoplanet ? 'text-green-300' : 'text-red-300'}`}>
                          {planet.claudeResponse.is_exoplanet ? '✅ Yes' : '❌ No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Disposition:</span>
                        <span className="text-blue-300 font-medium">{planet.claudeResponse.disposition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-blue-300 font-medium">{(planet.claudeResponse.confidence * 100).toFixed(1)}%</span>
                      </div>
                      {planet.claudeResponse.planet_type && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Planet Type:</span>
                          <span className="text-blue-300 font-medium">{planet.claudeResponse.planet_type}</span>
                        </div>
                      )}
                      {planet.claudeResponse.reasoning && (
                        <div className="mt-2 pt-2 border-t border-blue-700/30">
                          <div className="text-gray-400 mb-1">Analysis:</div>
                          <div className="text-blue-200 text-xs leading-relaxed">{planet.claudeResponse.reasoning}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flask ML Model Results */}
                {planet.flaskResponse && (
                  <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-4 border border-green-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-green-400" />
                      <h4 className="text-sm font-semibold text-green-300">ML Model Analysis</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Is Exoplanet:</span>
                        <span className={`font-medium ${planet.flaskResponse.is_exoplanet ? 'text-green-300' : 'text-red-300'}`}>
                          {planet.flaskResponse.is_exoplanet ? '✅ Yes' : '❌ No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">KOI Disposition:</span>
                        <span className="text-green-300 font-medium">{planet.flaskResponse.koi_pdisposition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Probability:</span>
                        <span className="text-green-300 font-medium">{(planet.flaskResponse.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Analyzed:</span>
                        <span className="text-green-300 font-medium text-xs">
                          {new Date(planet.flaskResponse.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Comparison Summary */}
                {planet.claudeResponse && planet.flaskResponse && (
                  <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-4 border border-gray-600/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Globe className="h-4 w-4 text-yellow-400" />
                      <h4 className="text-sm font-semibold text-yellow-300">Analysis Comparison</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-gray-400">Claude AI</div>
                        <div className={`font-medium ${planet.claudeResponse.is_exoplanet ? 'text-green-300' : 'text-red-300'}`}>
                          {planet.claudeResponse.is_exoplanet ? '✅ Exoplanet' : '❌ Not Exoplanet'}
                        </div>
                        <div className="text-blue-300 text-xs mt-1">
                          {planet.claudeResponse.disposition} ({(planet.claudeResponse.confidence * 100).toFixed(0)}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">ML Model</div>
                        <div className={`font-medium ${planet.flaskResponse.is_exoplanet ? 'text-green-300' : 'text-red-300'}`}>
                          {planet.flaskResponse.is_exoplanet ? '✅ Exoplanet' : '❌ Not Exoplanet'}
                        </div>
                        <div className="text-green-300 text-xs mt-1">
                          {planet.flaskResponse.koi_pdisposition} ({(planet.flaskResponse.probability * 100).toFixed(0)}%)
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 text-center">
                      {planet.claudeResponse.is_exoplanet === planet.flaskResponse.is_exoplanet 
                        ? '✅ Both models agree on exoplanet status' 
                        : '⚠️ Models disagree - further analysis recommended'}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AWS Credentials Dialog */}
      <AWSCredentialsDialog
        open={showCredentialsDialog}
        onClose={handleCredentialsClose}
        onSubmit={handleCredentialsSubmit}
        onSkip={handleCredentialsSkip}
        canSkip={hasEnvCredentials}
        isLoading={planet.isAnalyzing}
      />
    </motion.div>
  );
}