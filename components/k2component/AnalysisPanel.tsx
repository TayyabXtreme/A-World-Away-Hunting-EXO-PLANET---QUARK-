"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Activity, 
  Globe, 
  Sun, 
  Thermometer, 
  Zap,
  Orbit,
  Gauge,
  CircleDot,
  Target,
  Weight,
  Compass,
  MapPin,
  Ruler,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { K2PlanetData } from './K2Visualizer';
import AWSCredentialsDialog from '@/components/ui/aws-credentials-dialog';

interface AnalysisPanelProps {
  planet: K2PlanetData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<K2PlanetData>) => void;
  onAnalyze: (planet: K2PlanetData) => void;
}

interface AWSCredentials {
  aws_region: string;
  aws_access_key_id: string;
  aws_secret_access_key: string;
}

interface ParameterConfig {
  key: keyof K2PlanetData;
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
    key: 'pl_orbper',
    label: 'Orbital Period',
    icon: <Orbit className="h-4 w-4" />,
    min: 0.2,
    max: 1000,
    step: 0.1,
    unit: 'days',
    description: 'Time to complete one orbit around the star'
  },
  {
    key: 'pl_trandep',
    label: 'Transit Depth',
    icon: <Activity className="h-4 w-4" />,
    min: 0.00001,
    max: 0.5,
    step: 0.000001,
    unit: 'fraction',
    description: 'Fraction of stellar flux blocked during transit'
  },
  {
    key: 'pl_trandur',
    label: 'Transit Duration',
    icon: <Gauge className="h-4 w-4" />,
    min: 0.5,
    max: 12,
    step: 0.1,
    unit: 'hours',
    description: 'Time planet takes to cross stellar disk'
  },
  {
    key: 'pl_imppar',
    label: 'Impact Parameter',
    icon: <Target className="h-4 w-4" />,
    min: 0.0,
    max: 1.5,
    step: 0.01,
    unit: '',
    description: 'Transit centrality (0 = central, >1.0 = grazing)'
  },
  {
    key: 'pl_rade',
    label: 'Planet Radius',
    icon: <Globe className="h-4 w-4" />,
    min: 0.5,
    max: 20.0,
    step: 0.1,
    unit: 'R⊕',
    description: 'Planet radius in Earth radii'
  },
  {
    key: 'pl_massj',
    label: 'Planet Mass',
    icon: <Weight className="h-4 w-4" />,
    min: 0.001,
    max: 20.0,
    step: 0.001,
    unit: 'MJ',
    description: 'Planet mass in Jupiter masses'
  },
  {
    key: 'pl_dens',
    label: 'Planet Density',
    icon: <CircleDot className="h-4 w-4" />,
    min: 0.1,
    max: 50.0,
    step: 0.1,
    unit: 'g/cm³',
    description: 'Planet bulk density'
  },
  {
    key: 'pl_insol',
    label: 'Insolation',
    icon: <Sun className="h-4 w-4" />,
    min: 0.1,
    max: 100000,
    step: 0.1,
    unit: 'S⊕',
    description: 'Incident stellar flux received by planet'
  },
  {
    key: 'pl_eqt',
    label: 'Equilibrium Temperature',
    icon: <Thermometer className="h-4 w-4" />,
    min: 100,
    max: 3000,
    step: 1,
    unit: 'K',
    description: 'Estimated equilibrium temperature'
  },
  {
    key: 'st_teff',
    label: 'Stellar Temperature',
    icon: <Thermometer className="h-4 w-4" />,
    min: 3000,
    max: 7000,
    step: 10,
    unit: 'K',
    description: 'Effective temperature of host star'
  },
  {
    key: 'st_rad',
    label: 'Stellar Radius',
    icon: <Sun className="h-4 w-4" />,
    min: 0.3,
    max: 10.0,
    step: 0.01,
    unit: 'R☉',
    description: 'Radius of host star in solar radii'
  },
  {
    key: 'st_mass',
    label: 'Stellar Mass',
    icon: <Weight className="h-4 w-4" />,
    min: 0.1,
    max: 2.0,
    step: 0.01,
    unit: 'M☉',
    description: 'Mass of host star in solar masses'
  },
  {
    key: 'st_logg',
    label: 'Stellar Gravity',
    icon: <Activity className="h-4 w-4" />,
    min: 3.0,
    max: 5.0,
    step: 0.01,
    unit: 'log(cm/s²)',
    description: 'Logarithm of stellar surface gravity'
  },
  {
    key: 'ra',
    label: 'Right Ascension',
    icon: <Compass className="h-4 w-4" />,
    min: 0,
    max: 360,
    step: 0.1,
    unit: 'degrees',
    description: 'Right ascension coordinate'
  },
  {
    key: 'dec',
    label: 'Declination',
    icon: <MapPin className="h-4 w-4" />,
    min: -90,
    max: 90,
    step: 0.1,
    unit: 'degrees',
    description: 'Declination coordinate'
  },
  {
    key: 'sy_dist',
    label: 'System Distance',
    icon: <Ruler className="h-4 w-4" />,
    min: 10,
    max: 5000,
    step: 1,
    unit: 'pc',
    description: 'Distance to the planetary system'
  }
];

export default function AnalysisPanel({ planet,  onClose, onUpdate }: AnalysisPanelProps) {
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

  const handleInputChange = (key: keyof K2PlanetData, value: number) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onUpdate({ [key]: value });
  };

  const handleAnalyze = async () => {
    try {
      onUpdate({ isAnalyzing: true });

      const payload = {
        pl_orbper: formData.pl_orbper,
        pl_trandep: formData.pl_trandep,
        pl_trandur: formData.pl_trandur,
        pl_imppar: formData.pl_imppar,
        pl_rade: formData.pl_rade,
        pl_massj: formData.pl_massj,
        pl_dens: formData.pl_dens,
        pl_insol: formData.pl_insol,
        pl_eqt: formData.pl_eqt,
        st_teff: formData.st_teff,
        st_rad: formData.st_rad,
        st_mass: formData.st_mass,
        st_logg: formData.st_logg,
        ra: formData.ra,
        dec: formData.dec,
        sy_dist: formData.sy_dist,
        // Include user credentials if available
        ...(userCredentials && {
          aws_region: userCredentials.aws_region,
          aws_access_key_id: userCredentials.aws_access_key_id,
          aws_secret_access_key: userCredentials.aws_secret_access_key,
        })
      };

      const response = await fetch('/api/predict-k2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP error! status: ${response.status}`;
        console.error('Claude API Error:', errorMessage);
        throw new Error(errorMessage);
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
          habitability_assessment: result.habitability_assessment,
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
    setShowCredentialsDialog(false);
    
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
          pl_orbper: formData.pl_orbper,
          pl_trandep: formData.pl_trandep,
          pl_trandur: formData.pl_trandur,
          pl_imppar: formData.pl_imppar,
          pl_rade: formData.pl_rade,
          pl_massj: formData.pl_massj,
          pl_dens: formData.pl_dens,
          pl_insol: formData.pl_insol,
          pl_eqt: formData.pl_eqt,
          st_teff: formData.st_teff,
          st_rad: formData.st_rad,
          st_mass: formData.st_mass,
          st_logg: formData.st_logg,
          ra: formData.ra,
          dec: formData.dec,
          sy_dist: formData.sy_dist,
        }
      };

      const response = await fetch('http://127.0.0.1:5000/predict/k2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'QzQBpd3vd1K4fBeRdPMBvH4rwphF7Nns4Y-T1cfj9PY'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Flask API Response:', result);
      
      let prediction: 'confirmed' | 'false-positive' | 'candidate';
      
      if (result.archive_disposition === 'CONFIRMED') {
        prediction = 'confirmed';
      } else if (result.archive_disposition === 'FALSE POSITIVE') {
        prediction = 'false-positive';
      } else if (result.archive_disposition === 'CANDIDATE') {
        prediction = 'candidate';
      } else {
        prediction = 'candidate';
      }

      onUpdate({ 
        isAnalyzing: false, 
        prediction: prediction,
        flaskResponse: {
          archive_disposition: result.archive_disposition,
          planet_type: result.planet_type,
          probability: result.probability,
          status: 'success',
          timestamp: new Date().toISOString(),
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
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30 animate-pulse">
          🔄 Analyzing...
        </Badge>
      );
    }

    if (planet.prediction === 'confirmed') {
      return (
        <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-400/30">
          ✅ Confirmed Exoplanet
        </Badge>
      );
    }

    if (planet.prediction === 'false-positive') {
      return (
        <Badge variant="secondary" className="bg-red-500/20 text-red-300 border-red-400/30">
          ❌ False Positive
        </Badge>
      );
    }

    if (planet.prediction === 'candidate') {
      return (
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
          🟡 Planet Candidate
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-gray-500/20 text-gray-300 border-gray-400/30">
        ⏳ Awaiting Analysis
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
                <div className="p-2 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg border border-orange-400/30">
                  <Globe className="h-5 w-5 text-orange-300" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-bold">
                    {planet.id}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    K2 Mission Analysis
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
                      <span className="text-orange-400">{param.icon}</span>
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
                        focus:border-orange-400 focus:ring-1 focus:ring-orange-400/20"
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

            {/* Analysis Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleClaudeAnalyzeClick}
                disabled={planet.isAnalyzing}
                className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 
                  text-white font-medium py-2.5 rounded-lg transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {planet.isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Analyzing with Claude AI...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Analyze with Claude AI</span>
                    {userCredentials && (
                      <Badge variant="outline" className="ml-2 border-green-400/50 text-green-400 bg-green-400/10 text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                )}
              </Button>

              <Button
                onClick={handleFlaskAnalyze}
                disabled={planet.isAnalyzing}
                variant="outline"
                className="w-full bg-white hover:bg-white border-orange-500 text-orange-300 
                  hover:border-orange-400 font-medium py-2.5 rounded-lg transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {planet.isAnalyzing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-300 rounded-full animate-spin" />
                    <span>Processing with ML Model...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Activity className="h-4 w-4" />
                    <span>Analyze with ML Model</span>
                  </div>
                )}
              </Button>
              
              {/* Info Text */}
              <div className="text-xs text-gray-500 text-center space-y-1 my-3">
                <p><strong>Claude AI:</strong> Advanced reasoning & scientific analysis</p>
                <p><strong>ML Model:</strong> Trained on K2 mission dataset patterns</p>
                <p className="flex "><AlertCircle className="h-3 w-3"/> AI models can make mistakes. Please review results carefully.</p>
              </div>
            </div>

          {/* Analysis Results */}
          {(planet.claudeResponse || planet.flaskResponse) && (
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-sm text-gray-300">Analysis Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {planet.claudeResponse && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">Claude AI Analysis</span>
                    </div>
                    <div className="pl-6 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Disposition:</span>
                        <span className="text-blue-300">{planet.claudeResponse.disposition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-blue-300">{planet.claudeResponse.confidence}%</span>
                      </div>
                      {planet.claudeResponse.planet_type && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Type:</span>
                          <span className="text-blue-300">{planet.claudeResponse.planet_type}</span>
                        </div>
                      )}
                      {planet.claudeResponse.reasoning && (
                        <div className="mt-2">
                          <span className="text-gray-400 text-xs">Reasoning:</span>
                          <p className="text-blue-200 text-xs mt-1 p-2 bg-blue-900/20 rounded border border-blue-800/30">
                            {planet.claudeResponse.reasoning}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {planet.flaskResponse && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-300">ML Model Analysis</span>
                    </div>
                    <div className="pl-6 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Disposition:</span>
                        <span className="text-green-300">{planet.flaskResponse.archive_disposition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Planet Type:</span>
                        <span className="text-green-300">{planet.flaskResponse.planet_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Probability:</span>
                        <span className="text-green-300">{(planet.flaskResponse.probability * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
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