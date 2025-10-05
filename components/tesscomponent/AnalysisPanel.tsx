"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Activity, Globe, Sun, Thermometer, Zap, Orbit, Satellite, AlertCircle, Sparkles, Upload, Table, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TessPlanetData } from './TessVisualizer';
import AWSCredentialsDialog from '@/components/ui/aws-credentials-dialog';
import { ResultDialog } from '@/components/ui/result-dialog';
import { toast } from 'sonner';

interface AnalysisPanelProps {
  planet: TessPlanetData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<TessPlanetData>) => void;
  onAnalyze: (planet: TessPlanetData) => void;
}

interface AWSCredentials {
  aws_region: string;
  aws_access_key_id: string;
  aws_secret_access_key: string;
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
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);
  const [userCredentials, setUserCredentials] = useState<AWSCredentials | null>(null);
  const [hasEnvCredentials, setHasEnvCredentials] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  
  // CSV Upload States
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedCsvRow, setSelectedCsvRow] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'manual' | 'csv'>('manual');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setFormData(planet);
  }, [planet]);

  useEffect(() => {
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

  const handleInputChange = (key: keyof TessPlanetData, value: number) => {
    const newData = { ...formData, [key]: value };
    setFormData(newData);
    onUpdate({ [key]: value });
  };

  const getTessDispositionName = (disposition: string) => {
    switch (disposition) {
      case 'PC': return 'PC (Planetary Candidate)';
      case 'CP': return 'CP (Confirmed Planet)';
      case 'FP': return 'FP (False Positive)';
      case 'APC': return 'APC (Ambiguous Planetary Candidate)';
      case 'KP': return 'KP (Known Planet)';
      default: return disposition;
    }
  };

  const handleAnalyze = async () => {
    try {
      onUpdate({ isAnalyzing: true });

      const payload = {
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
        ...(userCredentials && {
          aws_region: userCredentials.aws_region,
          aws_access_key_id: userCredentials.aws_access_key_id,
          aws_secret_access_key: userCredentials.aws_secret_access_key,
        })
      };

      const response = await fetch('/api/predict-tess', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      let prediction: 'confirmed' | 'false-positive' | 'candidate';
      if (result.disposition === 'CP' || result.disposition === 'KP') {
        prediction = 'confirmed';
      } else if (result.disposition === 'FP') {
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

      // Show success toast
      toast.success('Claude AI Analysis Complete!', {
        description: `Classification: ${getTessDispositionName(result.disposition)}`,
        duration: 5000,
      });

      // Show result dialog
      setShowResultDialog(true);

    } catch (error) {
      console.error('Analysis failed:', error);
      onUpdate({ isAnalyzing: false });
      
      const errorMessage = error instanceof Error ? error.message : 'TESS analysis failed. Please check your AWS credentials and try again.';
      
      // Show error toast
      if (errorMessage.includes('credential') || errorMessage.includes('auth')) {
        toast.error('Authentication Error', {
          description: 'Please configure your AWS credentials and try again.',
          duration: 6000,
        });
      } else {
        toast.error('Claude AI Analysis Failed', {
          description: errorMessage,
          duration: 5000,
        });
      }
    }
  };

  const handleCredentialsSubmit = (credentials: AWSCredentials) => {
    setUserCredentials(credentials);
    setShowCredentialsDialog(false);
    
    // Show success toast
    toast.success('AWS Credentials Configured', {
      description: 'Starting Claude AI analysis...',
      duration: 3000,
    });
    
    setTimeout(() => handleAnalyze(), 100);
  };

  const handleClaudeAnalyzeClick = () => {
    // Validation: If on CSV tab, must have a row selected
    if (activeTab === 'csv' && selectedCsvRow === null) {
      toast.error('No CSV Row Selected', {
        description: 'Please select a row from the CSV table before analyzing.',
        duration: 4000,
      });
      return;
    }
    
    // Validation: If on CSV tab with selected row, ensure all parameters are present
    if (activeTab === 'csv' && selectedCsvRow !== null) {
      const row = csvData[selectedCsvRow];
      const paramCheck = checkCsvParameters(row);
      if (paramCheck.found !== paramCheck.total) {
        toast.error('Incomplete Parameters', {
          description: `Selected row is missing ${paramCheck.total - paramCheck.found} parameter(s). Cannot proceed with analysis.`,
          duration: 5000,
        });
        return;
      }
    }
    
    if (!hasEnvCredentials && !userCredentials) {
      setShowCredentialsDialog(true);
    } else if (hasEnvCredentials && !userCredentials) {
      setShowCredentialsDialog(true);
    } else {
      handleAnalyze();
    }
  };

  const handleCredentialsSkip = () => {
    setShowCredentialsDialog(false);
    setTimeout(() => handleAnalyze(), 100);
  };

  const handleCredentialsClose = () => {
    setShowCredentialsDialog(false);
  };

  const handleFlaskAnalyze = async () => {
    // Validation: If on CSV tab, must have a row selected
    if (activeTab === 'csv' && selectedCsvRow === null) {
      toast.error('No CSV Row Selected', {
        description: 'Please select a row from the CSV table before analyzing.',
        duration: 4000,
      });
      return;
    }
    
    // Validation: If on CSV tab with selected row, ensure all parameters are present
    if (activeTab === 'csv' && selectedCsvRow !== null) {
      const row = csvData[selectedCsvRow];
      const paramCheck = checkCsvParameters(row);
      if (paramCheck.found !== paramCheck.total) {
        toast.error('Incomplete Parameters', {
          description: `Selected row is missing ${paramCheck.total - paramCheck.found} parameter(s). Cannot proceed with analysis.`,
          duration: 5000,
        });
        return;
      }
    }
    
    try {
     
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
      
    
      let prediction: 'confirmed' | 'false-positive' | 'candidate';
      
      // Determine prediction based on tfopwg_disp
      // CP (Confirmed Planet), KP (Known Planet) -> confirmed
      // FP (False Positive), FA (False Alarm) -> false-positive
      // PC (Planetary Candidate), APC (Ambiguous Planetary Candidate) -> candidate
      if (result.tfopwg_disp === 'CP' || result.tfopwg_disp === 'KP') {
        prediction = 'confirmed';
      } else if (result.tfopwg_disp === 'FP' || result.tfopwg_disp === 'FA') {
        prediction = 'false-positive';
      } else {
        // PC, APC, or other
        prediction = 'candidate';
      }

   
      onUpdate({ 
        isAnalyzing: false, 
        prediction: prediction,
        flaskResponse: {
          tfopwg_disp: result.tfopwg_disp,
          tfopwg_disp_explanation: result.tfopwg_disp_explanation,
          planet_type: result.planet_type,
          probability: result.probability,
          status: 'success',
          timestamp: new Date().toISOString()
        }
      });

      // Show success toast
      toast.success('ML Model Analysis Complete!', {
        description: `Classification: ${result.tfopwg_disp}`,
        duration: 5000,
      });

      // Show result dialog
      setShowResultDialog(true);

    } catch (error) {
      console.error('Flask analysis failed:', error);
      onUpdate({ isAnalyzing: false });
      
      const errorMessage = error instanceof Error ? error.message : 'Connection failed. Make sure Flask server is running on http://127.0.0.1:5000';
      
      // Show error toast
      toast.error('Flask API Error', {
        description: errorMessage,
        duration: 6000,
      });
    }
  };

  // CSV Upload Handler
  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
      toast.error('Empty CSV file');
      return;
    }

    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      return row;
    });

    setCsvHeaders(headers);
    setCsvData(rows);
    setActiveTab('csv');
    toast.success(`CSV loaded: ${rows.length} rows found`);
  };

  const handleSelectCsvRow = (index: number) => {
    const row = csvData[index];
    const paramCheck = checkCsvParameters(row);
    
    // Validate that ALL parameters are present
    if (paramCheck.found !== paramCheck.total) {
      toast.error('Incomplete Parameters', {
        description: `This row is missing ${paramCheck.total - paramCheck.found} required parameter(s). Please select a row with all ${paramCheck.total} parameters.`,
        duration: 5000,
      });
      return;
    }
    
    setSelectedCsvRow(index);
    
    // Map CSV data to form data
    const mappedData: Record<string, number> = {};
    parameters.forEach(param => {
      const value = parseFloat(row[param.key] || row[param.label] || '0');
      if (!isNaN(value)) {
        mappedData[param.key] = value;
      }
    });

    // Update form data
    setFormData(prev => ({ ...prev, ...mappedData }));
    onUpdate(mappedData);
    
    toast.success(`Row ${index + 1} Selected`, {
      description: `All ${paramCheck.total} parameters loaded successfully!`,
      duration: 3000,
    });
  };

  const getRequiredParameters = () => {
    return parameters.map(p => p.key);
  };

  const checkCsvParameters = (row: Record<string, string>) => {
    const required = getRequiredParameters();
    const found = required.filter(key => 
      row[key] !== undefined || row[parameters.find(p => p.key === key)?.label || ''] !== undefined
    );
    return { found: found.length, total: required.length };
  };

  // Drag and Drop Handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          parseCSV(text);
        };
        reader.readAsText(file);
      } else {
        toast.error('Invalid file type', {
          description: 'Please upload a CSV file',
          duration: 3000,
        });
      }
    }
  };

  const getPredictionBadge = () => {
    if (planet.isAnalyzing) {
      return (
        <Badge variant="outline" className="border-red-400/50 text-red-400 bg-red-400/10 animate-pulse">
          🔄 Analyzing...
        </Badge>
      );
    }

    if (planet.prediction === 'confirmed') {
      return (
        <Badge variant="outline" className="border-green-400/50 text-green-400 bg-green-400/10">
          ✅ Confirmed Exoplanet
        </Badge>
      );
    }

    if (planet.prediction === 'false-positive') {
      return (
        <Badge variant="outline" className="border-red-400/50 text-red-400 bg-red-400/10">
          ❌ False Positive
        </Badge>
      );
    }

    if (planet.prediction === 'candidate') {
      return (
        <Badge variant="outline" className="border-yellow-400/50 text-yellow-400 bg-yellow-400/10">
          🟡 Planet Candidate
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="border-gray-400/50 text-gray-400 bg-gray-400/10">
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
            {/* Tabs for Manual / CSV Mode */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'csv')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/60">
                <TabsTrigger value="manual" className="data-[state=active]:bg-red-600">
                  <Activity className="h-4 w-4 mr-2" />
                  Manual Input
                </TabsTrigger>
                <TabsTrigger value="csv" className="data-[state=active]:bg-red-600">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  CSV Upload
                </TabsTrigger>
              </TabsList>

              {/* Manual Input Tab */}
              <TabsContent value="manual" className="space-y-4 mt-4">
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
          </TabsContent>

          {/* CSV Upload Tab */}
          <TabsContent value="csv" className="space-y-4 mt-4">
            {/* CSV Upload Section */}
            <motion.div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              animate={{
                borderColor: isDragging ? 'rgb(220, 38, 38)' : 'rgb(75, 85, 99)',
                backgroundColor: isDragging ? 'rgba(220, 38, 38, 0.1)' : 'rgba(0, 0, 0, 0)',
                scale: isDragging ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center overflow-hidden
                ${isDragging ? 'border-red-500 bg-red-500/10' : 'border-gray-600 hover:border-red-500/50'}
                transition-all duration-300 cursor-pointer group`}
            >
              {/* Animated Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-transparent to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Upload Icon with Animation */}
              <motion.div
                animate={{
                  y: isDragging ? -10 : 0,
                  scale: isDragging ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-red-600/20 to-orange-600/20 
                  flex items-center justify-center border border-red-500/30 group-hover:border-red-400/50 transition-colors">
                  <Upload className={`h-8 w-8 transition-colors duration-300 ${
                    isDragging ? 'text-red-400' : 'text-red-500 group-hover:text-red-400'
                  }`} />
                </div>

                <Label htmlFor="csv-upload-tess" className="cursor-pointer relative z-10">
                  <div className="space-y-2">
                    <div className="text-base font-semibold text-white group-hover:text-red-300 transition-colors">
                      {isDragging ? (
                        <span className="text-red-400 flex items-center justify-center gap-2">
                          <FileSpreadsheet className="h-5 w-5" />
                          Drop your CSV file here
                        </span>
                      ) : (
                        <>
                          Drag & Drop CSV File
                        </>
                      )}
                    </div>
                    
                    {!isDragging && (
                      <>
                        <div className="text-sm text-gray-400">
                          or{' '}
                          <span className="text-red-400 hover:text-red-300 font-medium underline underline-offset-2">
                            browse files
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <Badge variant="outline" className="border-gray-600 text-gray-400 bg-gray-800/50 text-xs">
                            <FileSpreadsheet className="h-3 w-3 mr-1" />
                            .csv files only
                          </Badge>
                          <Badge variant="outline" className="border-red-600/50 text-red-400 bg-red-600/10 text-xs">
                            <Activity className="h-3 w-3 mr-1" />
                            {getRequiredParameters().length} parameters
                          </Badge>
                        </div>

                        <div className="text-xs text-gray-500 mt-4 max-w-xs mx-auto">
                          <div className="bg-gray-800/40 rounded-lg p-3 border border-gray-700/50">
                            <div className="font-medium text-gray-400 mb-1 flex items-center justify-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Required Parameters
                            </div>
                            <div className="text-gray-500 leading-relaxed">
                              pl_orbper, pl_trandurh, pl_rade, st_teff, st_tmag, and 8 more...
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Label>

                <Input
                  id="csv-upload-tess"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </motion.div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-red-500/30 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-red-500/30 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-red-500/30 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-red-500/30 rounded-br-lg" />
            </motion.div>

            {/* CSV Data Table */}
            {csvData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                {/* Header Stats */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-red-400/50 text-red-300 bg-red-400/10">
                      <Table className="h-3 w-3 mr-1" />
                      {csvData.length} {csvData.length === 1 ? 'row' : 'rows'} loaded
                    </Badge>
                    <Badge variant="outline" className="border-orange-400/50 text-orange-300 bg-orange-400/10">
                      <FileSpreadsheet className="h-3 w-3 mr-1" />
                      {csvHeaders.length} columns
                    </Badge>
                  </div>
                  
                  {selectedCsvRow !== null && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                    >
                      <Badge variant="outline" className="border-green-400/50 text-green-300 bg-green-400/10">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Row {selectedCsvRow + 1} selected
                      </Badge>
                    </motion.div>
                  )}
                </div>

                {/* Data Table */}
                <div className="relative rounded-lg border border-gray-700/50 bg-gray-900/30 backdrop-blur-sm overflow-hidden">
                  {/* Table Header - Sticky */}
                  <div className="bg-gradient-to-r from-gray-800/90 to-gray-800/70 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-10">
                    <div className="grid grid-cols-12 gap-2 px-3 py-3 text-xs font-semibold text-gray-300">
                      <div className="col-span-1 text-center">#</div>
                      <div className="col-span-5">Parameters Preview</div>
                      <div className="col-span-3 text-center">Match Status</div>
                      <div className="col-span-3 text-center">Action</div>
                    </div>
                  </div>

                  {/* Table Body - Scrollable */}
                  <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-600/50 scrollbar-track-gray-800/50">
                    {csvData.map((row, index) => {
                      const paramCheck = checkCsvParameters(row);
                      const matchPercentage = Math.round((paramCheck.found / paramCheck.total) * 100);
                      const isSelected = selectedCsvRow === index;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`grid grid-cols-12 gap-2 px-3 py-3 text-xs border-t border-gray-700/30 
                            transition-all duration-200 hover:bg-red-600/10
                            ${isSelected ? 'bg-red-600/20 border-red-500/30' : ''}`}
                        >
                          {/* Row Number */}
                          <div className="col-span-1 text-center">
                            <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full 
                              ${isSelected ? 'bg-red-600 text-white' : 'bg-gray-700/50 text-gray-400'}`}>
                              {index + 1}
                            </div>
                          </div>

                          {/* Parameters Preview */}
                          <div className="col-span-5 text-gray-300">
                            <div className="space-y-1">
                              {Object.entries(row).slice(0, 2).map(([key, value], i) => (
                                <div key={i} className="flex items-center gap-1 truncate">
                                  <span className="text-gray-500 text-[10px]">{key}:</span>
                                  <span className="text-gray-300 font-mono text-[10px]">{String(value)}</span>
                                </div>
                              ))}
                              {Object.keys(row).length > 2 && (
                                <span className="text-gray-500 text-[10px]">+{Object.keys(row).length - 2} more...</span>
                              )}
                            </div>
                          </div>

                          {/* Match Status */}
                          <div className="col-span-3 flex items-center justify-center">
                            <div className="space-y-1 text-center">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  matchPercentage === 100
                                    ? 'border-green-400/50 text-green-300 bg-green-400/10'
                                    : matchPercentage >= 70
                                    ? 'border-yellow-400/50 text-yellow-300 bg-yellow-400/10'
                                    : 'border-red-400/50 text-red-300 bg-red-400/10'
                                }`}
                              >
                                {paramCheck.found}/{paramCheck.total}
                              </Badge>
                              <div className="text-[10px] text-gray-500">
                                {matchPercentage}% match
                              </div>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="col-span-3 flex items-center justify-center">
                            <Button
                              size="sm"
                              onClick={() => handleSelectCsvRow(index)}
                              disabled={matchPercentage !== 100}
                              className={`h-7 text-xs transition-all duration-200 ${
                                isSelected
                                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-400'
                                  : matchPercentage === 100
                                  ? 'bg-gray-700/50 hover:bg-red-600/20 text-gray-300 hover:text-red-300 border-gray-600 hover:border-red-500/50'
                                  : 'bg-gray-800/50 text-gray-500 border-gray-700 cursor-not-allowed opacity-50'
                              }`}
                            >
                              {isSelected ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Selected
                                </>
                              ) : matchPercentage === 100 ? (
                                <>
                                  <Activity className="h-3 w-3 mr-1" />
                                  Select
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                  Incomplete
                                </>
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                {/* Clear CSV Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setCsvData([]);
                    setCsvHeaders([]);
                    setSelectedCsvRow(null);
                    toast.success('CSV data cleared');
                  }}
                  className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-400 border-red-600/30 hover:border-red-500/50"
                >
                  <X className="h-3 w-3 mr-2" />
                  Clear CSV Data
                </Button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>

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
                disabled={planet.isAnalyzing || (activeTab === 'csv' && selectedCsvRow === null)}
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
                    {activeTab === 'csv' && selectedCsvRow === null 
                      ? 'Select CSV Row to Analyze'
                      : 'Analyze with Claude AI'}
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
                disabled={planet.isAnalyzing || (activeTab === 'csv' && selectedCsvRow === null)}
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
                    {activeTab === 'csv' && selectedCsvRow === null 
                      ? 'Select CSV Row to Analyze'
                      : 'Analyze with ML Model'}
                  </>
                )}
              </Button>

              {/* Info Text */}
              <div className="text-xs text-gray-500 text-center space-y-1 my-3">
                <p><strong>Claude AI:</strong> Advanced reasoning & scientific analysis</p>
                <p><strong>ML Model:</strong> Trained on TESS mission dataset patterns</p>
                <p className="flex "><AlertCircle className="h-3 w-3"/> AI models can make mistakes. Please review results carefully.</p>
              </div>

              {/* View Results Button - Show when there are results */}
              {(planet.claudeResponse || planet.flaskResponse) && (
                <Button
                  onClick={() => setShowResultDialog(true)}
                  variant="outline"
                  className="w-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 
                    hover:from-purple-600/30 hover:to-pink-600/30 
                    text-purple-300 h-10 font-medium shadow-lg shadow-purple-600/20 
                    transition-all duration-300
                    border border-purple-500/30 hover:border-purple-400/50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  View Detailed Results
                </Button>
              )}
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

      {/* Result Dialog */}
      <ResultDialog
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
        claudeResponse={planet.claudeResponse}
        flaskResponse={planet.flaskResponse}
        prediction={planet.prediction}
        planetName={planet.id}
      />
    </motion.div>
  );
}