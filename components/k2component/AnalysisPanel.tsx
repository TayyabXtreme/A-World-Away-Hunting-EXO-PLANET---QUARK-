"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Activity, Globe, Thermometer, Sun, Orbit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { K2PlanetData } from './K2Visualizer';

interface AnalysisPanelProps {
  planet: K2PlanetData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<K2PlanetData>) => void;
  onAnalyze: (planet: K2PlanetData) => void;
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
    min: 0.1,
    max: 1000,
    step: 0.1,
    unit: 'days',
    description: 'Time for one complete orbit around the host star'
  },
  {
    key: 'pl_trandep',
    label: 'Transit Depth',
    icon: <Activity className="h-4 w-4" />,
    min: 0.00001,
    max: 0.1,
    step: 0.00001,
    unit: 'fraction',
    description: 'Fraction of starlight blocked during transit'
  },
  {
    key: 'pl_trandur',
    label: 'Transit Duration',
    icon: <Activity className="h-4 w-4" />,
    min: 0.1,
    max: 12,
    step: 0.1,
    unit: 'hours',
    description: 'Duration of planet transit across star'
  },
  {
    key: 'pl_imppar',
    label: 'Impact Parameter',
    icon: <Activity className="h-4 w-4" />,
    min: 0,
    max: 1.5,
    step: 0.01,
    unit: '',
    description: 'Distance from star center during transit'
  },
  {
    key: 'pl_rade',
    label: 'Planet Radius',
    icon: <Globe className="h-4 w-4" />,
    min: 0.1,
    max: 25,
    step: 0.01,
    unit: 'R⊕',
    description: 'Planet radius (>20 often indicates Eclipsing Binaries)'
  },
  {
    key: 'pl_massj',
    label: 'Planet Mass',
    icon: <Globe className="h-4 w-4" />,
    min: 0.001,
    max: 10,
    step: 0.001,
    unit: 'MJ',
    description: 'Mass relative to Jupiter'
  },
  {
    key: 'pl_dens',
    label: 'Planet Density',
    icon: <Activity className="h-4 w-4" />,
    min: 0.1,
    max: 20,
    step: 0.1,
    unit: 'g/cm³',
    description: 'Average density of the planet'
  },
  {
    key: 'pl_insol',
    label: 'Incident Stellar Flux',
    icon: <Sun className="h-4 w-4" />,
    min: 0.01,
    max: 1000,
    step: 0.01,
    unit: 'S⊕',
    description: 'Incident stellar flux received by planet'
  },
  {
    key: 'pl_eqt',
    label: 'Equilibrium Temperature',
    icon: <Thermometer className="h-4 w-4" />,
    min: 50,
    max: 3000,
    step: 1,
    unit: 'K',
    description: 'Estimated equilibrium temperature of planet'
  },
  {
    key: 'st_teff',
    label: 'Stellar Temperature',
    icon: <Thermometer className="h-4 w-4" />,
    min: 2500,
    max: 10000,
    step: 10,
    unit: 'K',
    description: 'Effective temperature of host star'
  },
  {
    key: 'st_rad',
    label: 'Stellar Radius',
    icon: <Sun className="h-4 w-4" />,
    min: 0.1,
    max: 20,
    step: 0.01,
    unit: 'R☉',
    description: 'Radius of host star'
  },
  {
    key: 'st_mass',
    label: 'Stellar Mass',
    icon: <Sun className="h-4 w-4" />,
    min: 0.1,
    max: 5,
    step: 0.01,
    unit: 'M☉',
    description: 'Mass of host star relative to Sun'
  },
  {
    key: 'st_logg',
    label: 'Stellar Gravity',
    icon: <Activity className="h-4 w-4" />,
    min: 3.0,
    max: 5.5,
    step: 0.01,
    unit: 'log(cm/s²)',
    description: 'Logarithm of star surface gravity'
  },
  {
    key: 'ra',
    label: 'Right Ascension',
    icon: <Activity className="h-4 w-4" />,
    min: 0,
    max: 360,
    step: 0.1,
    unit: 'deg',
    description: 'Celestial coordinate (longitude)'
  },
  {
    key: 'dec',
    label: 'Declination',
    icon: <Activity className="h-4 w-4" />,
    min: -90,
    max: 90,
    step: 0.1,
    unit: 'deg',
    description: 'Celestial coordinate (latitude)'
  },
  {
    key: 'sy_dist',
    label: 'System Distance',
    icon: <Activity className="h-4 w-4" />,
    min: 1,
    max: 2000,
    step: 0.1,
    unit: 'pc',
    description: 'Distance to planetary system'
  }
];

export default function AnalysisPanel({ planet, isOpen, onClose, onUpdate, onAnalyze }: AnalysisPanelProps) {
  const [formData, setFormData] = useState(planet);

  useEffect(() => {
    setFormData(planet);
  }, [planet]);

  const handleInputChange = (key: keyof K2PlanetData, value: number) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onUpdate({ [key]: value });
  };

  const handleAnalyze = async () => {
    try {
      const response = await fetch('/api/claude-predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // K2 parameters for Claude analysis
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
          dataset: 'k2'
        }),
      });

      if (!response.ok) {
        throw new Error('Prediction request failed');
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
    }
  };

  const handleFlaskAnalyze = async () => {
    try {
      // Set analyzing state for Flask analysis
      onUpdate({ isAnalyzing: true });

      const payload = {
        // K2 parameters for Flask ML model
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
        sy_dist: formData.sy_dist
      };

      const response = await fetch('/api/predict/k2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Flask API request failed: ${response.status}`);
      }

      const result = await response.json();
      console.log('Flask API Response:', result);
      
      // Map Flask API response to our prediction format
      let prediction: 'confirmed' | 'false-positive' | 'candidate';
      
      // Map based on is_exoplanet and koi_pdisposition from Flask response
      if (result.is_exoplanet === true) {
        if (result.koi_pdisposition === 'CONFIRMED') {
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
          koi_pdisposition: result.koi_pdisposition,
          prediction: result.planet_type, // Use planet_type as prediction
          probability: result.probability,
          status: 'success', // Default status since not provided
          timestamp: new Date().toISOString(), // Generate timestamp since not provided
          is_exoplanet: result.is_exoplanet
        }
      });

    } catch (error) {
      console.error('Flask analysis failed:', error);
      onUpdate({ isAnalyzing: false });
      
      // Show error message to user
      alert(`Flask API Error: ${error instanceof Error ? error.message : 'Connection failed. Make sure Flask server is running.'}`);
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
                    K2 Exoplanet Analysis Panel
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
                onClick={handleAnalyze}
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
              <div className="text-xs text-gray-500 text-center space-y-1">
                <p>🤖 <strong>Claude AI:</strong> Advanced reasoning & scientific analysis</p>
                <p>⚡ <strong>ML Model:</strong> Trained on K2 dataset patterns</p>
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
                    {formData.pl_eqt > 200 && formData.pl_eqt < 350 ? 'Potential' : 'Unlikely'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Size Class</div>
                  <div className="text-blue-300 font-medium">
                    {formData.pl_rade < 1.25 ? 'Earth-like' : 
                     formData.pl_rade < 2 ? 'Super-Earth' : 'Gas Giant'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Orbit Type</div>
                  <div className="text-blue-300 font-medium">
                    {formData.pl_orbper < 100 ? 'Hot' : 
                     formData.pl_orbper < 500 ? 'Warm' : 'Cold'}
                  </div>
                </div>
                <div>
                  <div className="text-gray-400">Detection</div>
                  <div className="text-blue-300 font-medium">
                    {formData.pl_dens > 3 ? 'Strong' : 
                     formData.pl_dens > 1 ? 'Moderate' : 'Weak'}
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
                        <span className="text-gray-400">Disposition:</span>
                        <span className="text-blue-300 font-medium">{planet.claudeResponse.disposition}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Confidence:</span>
                        <span className="text-blue-300 font-medium">{planet.claudeResponse.confidence}%</span>
                      </div>
                      {planet.claudeResponse.planet_type && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Planet Type:</span>
                          <span className="text-blue-300 font-medium">{planet.claudeResponse.planet_type}</span>
                        </div>
                      )}
                      {planet.claudeResponse.habitability_assessment && (
                        <div className="mt-2">
                          <span className="text-gray-400 text-xs">Habitability:</span>
                          <p className="text-blue-300 text-xs mt-1 leading-relaxed">
                            {planet.claudeResponse.habitability_assessment}
                          </p>
                        </div>
                      )}
                      <div className="mt-2">
                        <span className="text-gray-400 text-xs">Reasoning:</span>
                        <p className="text-blue-300 text-xs mt-1 leading-relaxed">
                          {planet.claudeResponse.reasoning}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Flask ML Results */}
                {planet.flaskResponse && (
                  <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-xl p-4 border border-green-700/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-green-400" />
                      <h4 className="text-sm font-semibold text-green-300">ML Model Results</h4>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Prediction:</span>
                        <span className="text-green-300 font-medium">{planet.flaskResponse.prediction}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Probability:</span>
                        <span className="text-green-300 font-medium">{(planet.flaskResponse.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">KOI Disposition:</span>
                        <span className="text-green-300 font-medium">{planet.flaskResponse.koi_pdisposition}</span>
                      </div>
                      {planet.flaskResponse.is_exoplanet !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Is Exoplanet:</span>
                          <span className="text-green-300 font-medium">{planet.flaskResponse.is_exoplanet ? 'Yes' : 'No'}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Timestamp:</span>
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
                        <div className="text-blue-300 font-medium">
                          {planet.claudeResponse.disposition} ({planet.claudeResponse.confidence}%)
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">ML Model</div>
                        <div className="text-green-300 font-medium">
                          {planet.flaskResponse.koi_pdisposition} ({(planet.flaskResponse.probability * 100).toFixed(0)}%)
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-400 text-center">
                      {planet.claudeResponse.disposition.toLowerCase() === planet.flaskResponse.koi_pdisposition.toLowerCase() 
                        ? '✅ Both models agree' 
                        : '⚠️ Models disagree - further analysis recommended'}
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