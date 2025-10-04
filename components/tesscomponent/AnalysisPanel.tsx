"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, Globe, Sun, Thermometer, Zap, Orbit, Satellite } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TessPlanetData } from './TessVisualizer';

interface AnalysisPanelProps {
  planet: TessPlanetData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<TessPlanetData>) => void;
  onAnalyze: (planet: TessPlanetData) => void;
}

interface ParameterConfig {
  key: keyof TessPlanetData;
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
    min: 0.5,
    max: 100,
    step: 0.1,
    unit: 'days',
    description: 'Orbital Period. TESS is optimized for shorter periods.'
  },
  {
    key: 'pl_trandurh',
    label: 'Transit Duration',
    icon: <Activity className="h-4 w-4" />,
    min: 0.5,
    max: 12,
    step: 0.1,
    unit: 'hours',
    description: 'Transit Duration in hours'
  },
  {
    key: 'pl_trandep',
    label: 'Transit Depth',
    icon: <Zap className="h-4 w-4" />,
    min: 0.00001,
    max: 0.5,
    step: 0.00001,
    unit: 'fraction',
    description: 'Transit Depth as fraction or ppm'
  },
  {
    key: 'pl_rade',
    label: 'Planet Radius',
    icon: <Globe className="h-4 w-4" />,
    min: 0.5,
    max: 20.0,
    step: 0.1,
    unit: 'R⊕',
    description: 'Planet Radius in Earth radii'
  },
  {
    key: 'pl_insol',
    label: 'Incident Stellar Flux',
    icon: <Sun className="h-4 w-4" />,
    min: 0.1,
    max: 100000,
    step: 0.1,
    unit: 'S⊕',
    description: 'Incident Stellar Flux received by planet'
  },
  {
    key: 'pl_eqt',
    label: 'Equilibrium Temperature',
    icon: <Thermometer className="h-4 w-4" />,
    min: 100,
    max: 3000,
    step: 1,
    unit: 'K',
    description: 'Planet Equilibrium Temperature'
  },
  {
    key: 'st_teff',
    label: 'Stellar Temperature',
    icon: <Thermometer className="h-4 w-4" />,
    min: 3000,
    max: 7000,
    step: 10,
    unit: 'K',
    description: 'Star\'s Effective Temperature'
  },
  {
    key: 'st_logg',
    label: 'Stellar Surface Gravity',
    icon: <Activity className="h-4 w-4" />,
    min: 3.0,
    max: 5.0,
    step: 0.01,
    unit: 'log₁₀(cm/s²)',
    description: 'Star\'s Surface Gravity (logarithmic)'
  },
  {
    key: 'st_rad',
    label: 'Stellar Radius',
    icon: <Sun className="h-4 w-4" />,
    min: 0.3,
    max: 10.0,
    step: 0.01,
    unit: 'R☉',
    description: 'Star\'s Radius in Solar radii'
  },
  {
    key: 'st_tmag',
    label: 'TESS Magnitude',
    icon: <Satellite className="h-4 w-4" />,
    min: 4.0,
    max: 18.0,
    step: 0.1,
    unit: 'mag',
    description: 'TESS Magnitude (brightness in TESS bandpass)'
  },
  {
    key: 'st_dist',
    label: 'System Distance',
    icon: <Satellite className="h-4 w-4" />,
    min: 1,
    max: 500,
    step: 0.1,
    unit: 'pc',
    description: 'Distance to star system in parsecs'
  },
  {
    key: 'ra',
    label: 'Right Ascension',
    icon: <Globe className="h-4 w-4" />,
    min: 0,
    max: 360,
    step: 0.1,
    unit: '°',
    description: 'Right Ascension coordinate'
  },
  {
    key: 'dec',
    label: 'Declination',
    icon: <Globe className="h-4 w-4" />,
    min: -90,
    max: 90,
    step: 0.1,
    unit: '°',
    description: 'Declination coordinate'
  }
];

export default function AnalysisPanel({ planet, isOpen, onClose, onUpdate, onAnalyze }: AnalysisPanelProps) {
  const [formData, setFormData] = useState(planet);

  useEffect(() => {
    setFormData(planet);
  }, [planet]);

  const handleInputChange = (key: keyof TessPlanetData, value: number) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onUpdate({ [key]: value });
  };

  const handleAnalyze = async () => {
    try {
      onUpdate({ isAnalyzing: true });

      const response = await fetch('/api/predict-tess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pl_orbper: formData.pl_orbper,
          pl_trandurh: formData.pl_trandurh,
          pl_trandep: formData.pl_trandep,
          pl_rade: formData.pl_rade,
          pl_insol: formData.pl_insol,
          pl_eqt: formData.pl_eqt,
          st_teff: formData.st_teff,
          st_logg: formData.st_logg,
          st_rad: formData.st_rad,
          st_tmag: formData.st_tmag,
          st_dist: formData.st_dist,
          ra: formData.ra,
          dec: formData.dec,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Map API response to our prediction format
      let prediction: 'confirmed' | 'false-positive' | 'candidate';
      if (result.disposition === 'CONFIRMED') {
        prediction = 'confirmed';
      } else if (result.disposition === 'FALSE POSITIVE') {
        prediction = 'false-positive';
      } else {
        prediction = 'candidate';
      }

      // Update planet with result
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
      
      // Show specific error message to user
      const errorMessage = error instanceof Error ? error.message : 'TESS analysis failed. Please check your AWS credentials and try again.';
      alert(`Claude AI Analysis Error: ${errorMessage}`);
    }
  };

  const handleFlaskAnalyze = async () => {
    try {
      // Set analyzing state for Flask analysis
      onUpdate({ isAnalyzing: true });

      const payload = {
        features: {
          pl_orbper: formData.pl_orbper,
          pl_trandurh: formData.pl_trandurh,
          pl_trandep: formData.pl_trandep,
          pl_rade: formData.pl_rade,
          pl_insol: formData.pl_insol,
          pl_eqt: formData.pl_eqt,
          st_teff: formData.st_teff,
          st_logg: formData.st_logg,
          st_rad: formData.st_rad,
          st_tmag: formData.st_tmag,
          st_dist: formData.st_dist,
          ra: formData.ra,
          dec: formData.dec,
        }
      };

      const response = await fetch('http://127.0.0.1:5000/predict/tess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': 'QzQBpd3vd1K4fBeRdPMBvH4rwphF7Nns4Y-T1cfj9PY'
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Flask API Error: ${response.status}`);
      }

      const result = await response.json();
      console.log('Flask API Response:', result);
      
      // Map Flask API response to our prediction format
      let prediction: 'confirmed' | 'false-positive' | 'candidate';
      
      // Map based on is_exoplanet and tess_disposition from Flask response
      if (result.is_exoplanet === true) {
        if (result.tess_disposition === 'CP' || result.tess_disposition === 'PC') {
          prediction = 'confirmed';
        } else {
          prediction = 'candidate';
        }
      } else {
        prediction = 'false-positive';
      }

      // Update planet with Flask result and store response data
      onUpdate({ 
        isAnalyzing: false, 
        prediction: prediction,
        flaskResponse: {
          tess_disposition: result.tess_disposition,
          prediction: result.planet_type || result.prediction,
          probability: result.probability,
          status: 'success',
          timestamp: new Date().toISOString(),
          is_exoplanet: result.is_exoplanet
        }
      });

    } catch (error) {
      console.error('Flask analysis failed:', error);
      onUpdate({ isAnalyzing: false });
      
      // Show error message to user
      alert(`Flask API Error: ${error instanceof Error ? error.message : 'Connection failed. Make sure Flask server is running on http://127.0.0.1:5000'}`);
    }
  };

  const getPredictionBadge = () => {
    if (planet.isAnalyzing) {
      return (
        <Badge variant="outline" className="bg-red-500/20 border-red-400 text-red-300 animate-pulse">
          🔄 Analyzing...
        </Badge>
      );
    }

    if (planet.prediction === 'confirmed') {
      return (
        <Badge variant="outline" className="bg-green-500/20 border-green-400 text-green-300">
          ✅ Confirmed Exoplanet
        </Badge>
      );
    }

    if (planet.prediction === 'false-positive') {
      return (
        <Badge variant="outline" className="bg-red-500/20 border-red-400 text-red-300">
          ❌ False Positive
        </Badge>
      );
    }

    if (planet.prediction === 'candidate') {
      return (
        <Badge variant="outline" className="bg-yellow-500/20 border-yellow-400 text-yellow-300">
          🟡 Planet Candidate
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-gray-500/20 border-gray-400 text-gray-300">
        🔍 Ready for Analysis
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
                <div className="p-2 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-lg border border-red-400/30">
                  <Satellite className="h-5 w-5 text-red-300" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-bold">
                    {planet.id}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    TESS Exoplanet Analysis Panel
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
                      <span className="text-red-400">{param.icon}</span>
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
                        focus:border-red-400 focus:ring-1 focus:ring-red-400/20"
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
                onClick={handleAnalyze}
                disabled={planet.isAnalyzing}
                className="w-full bg-gradient-to-r from-red-600 via-red-700 to-orange-700 
                  hover:from-red-700 hover:via-red-800 hover:to-orange-800 
                  text-white h-12 font-semibold shadow-2xl shadow-red-600/30 
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  border border-red-500/30 hover:border-red-400/50"
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
                  </>
                )}
              </Button>

              {/* Flask ML Model Button */}
              <Button
                onClick={handleFlaskAnalyze}
                disabled={planet.isAnalyzing}
                variant="outline"
                className="w-full bg-gradient-to-r from-orange-600 via-orange-700 to-yellow-700 
                  hover:from-orange-700 hover:via-orange-800 hover:to-yellow-800 
                  text-white h-12 font-semibold shadow-2xl shadow-orange-600/30 
                  transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                  border border-orange-500/30 hover:border-orange-400/50"
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
              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>🤖 <strong>Claude AI:</strong> Advanced reasoning & scientific analysis</p>
                <p>⚡ <strong>ML Model:</strong> Trained on TESS dataset patterns</p>
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
                  <div className="text-red-300 font-medium">
                    {formData.pl_eqt > 200 && formData.pl_eqt < 350 ? 'Potential' : 'Unlikely'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Size Class</div>
                  <div className="text-red-300 font-medium">
                    {formData.pl_rade < 1.25 ? 'Earth-like' : 
                     formData.pl_rade < 2 ? 'Super-Earth' : 'Gas Giant'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Orbit Type</div>
                  <div className="text-red-300 font-medium">
                    {formData.pl_orbper < 10 ? 'Ultra-Short' : 
                     formData.pl_orbper < 100 ? 'Short' : 'Long'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Transit Signal</div>
                  <div className="text-red-300 font-medium">
                    {formData.pl_trandep > 0.001 ? 'Strong' : 
                     formData.pl_trandep > 0.0001 ? 'Moderate' : 'Weak'}
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
                  <div className="bg-gradient-to-br from-red-900/40 to-orange-900/40 rounded-xl p-4 border border-red-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="h-4 w-4 text-red-400" />
                      <h4 className="text-sm font-semibold text-red-300">Claude AI Analysis</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Disposition:</span>
                        <span className="text-red-300 font-medium">{planet.claudeResponse.disposition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-red-300 font-medium">{(planet.claudeResponse.confidence * 100).toFixed(1)}%</span>
                      </div>
                      {planet.claudeResponse.planet_type && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Planet Type:</span>
                          <span className="text-red-300 font-medium">{planet.claudeResponse.planet_type}</span>
                        </div>
                      )}
                      {planet.claudeResponse.habitability_assessment && (
                        <div className="mt-2">
                          <span className="text-gray-400">Habitability:</span>
                          <p className="text-red-200 text-xs mt-1 leading-tight">{planet.claudeResponse.habitability_assessment}</p>
                        </div>
                      )}
                      {planet.claudeResponse.reasoning && (
                        <div className="mt-2">
                          <span className="text-gray-400">Analysis:</span>
                          <p className="text-red-200 text-xs mt-1 leading-tight">{planet.claudeResponse.reasoning}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Flask ML Results */}
                {planet.flaskResponse && (
                  <div className="bg-gradient-to-br from-orange-900/40 to-yellow-900/40 rounded-xl p-4 border border-orange-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-orange-400" />
                      <h4 className="text-sm font-semibold text-orange-300">ML Model Analysis</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Disposition:</span>
                        <span className="text-orange-300 font-medium">{planet.flaskResponse.tess_disposition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Probability:</span>
                        <span className="text-orange-300 font-medium">{(planet.flaskResponse.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Prediction:</span>
                        <span className="text-orange-300 font-medium">{planet.flaskResponse.prediction}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Is Exoplanet:</span>
                        <span className="text-orange-300 font-medium">{planet.flaskResponse.is_exoplanet ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Analyzed:</span>
                        <span className="text-orange-300 font-medium">{new Date(planet.flaskResponse.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}