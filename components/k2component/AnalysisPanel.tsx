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
  AlertCircle,
  Sparkles,
  Upload,
  Table,
  FileSpreadsheet,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { K2PlanetData } from './K2Visualizer';
import AWSCredentialsDialog from '@/components/ui/aws-credentials-dialog';
import { ResultDialog } from '@/components/ui/result-dialog';
import { toast } from 'sonner';

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

      // Show success toast
      toast.success('Claude AI Analysis Complete!', {
        description: `Classification: ${result.disposition}`,
        duration: 5000,
      });

      // Show result dialog
      setShowResultDialog(true);

    } catch (error) {
      console.error('Analysis failed:', error);
      onUpdate({ isAnalyzing: false });
      
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      
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
    
    // Retry the analysis with the provided credentials
    setTimeout(() => {
      handleAnalyze();
    }, 100);
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

      const response = await fetch('https://ml-backend-1zgp.onrender.com/predict/k2', {
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

      // Show success toast
      toast.success('ML Model Analysis Complete!', {
        description: `Classification: ${result.archive_disposition}`,
        duration: 5000,
      });

      // Show result dialog
      setShowResultDialog(true);

    } catch (error) {
      console.error('Flask analysis failed:', error);
      onUpdate({ isAnalyzing: false });
      
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      
      // Show error toast
      toast.error('Flask API Error', {
        description: errorMessage + '. Make sure Flask server is running on http://127.0.0.1:5000',
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
        <Badge variant="outline" className="border-blue-400/50 text-blue-400 bg-blue-400/10 animate-pulse">
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
            {/* Tabs for Manual / CSV Mode */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'manual' | 'csv')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/60">
                <TabsTrigger value="manual" className="data-[state=active]:bg-orange-600 text-white">
                  <Activity className="h-4 w-4 mr-2" />
                  Manual Input
                </TabsTrigger>
                <TabsTrigger value="csv" className="data-[state=active]:bg-orange-600 text-white">
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
                borderColor: isDragging ? 'rgb(234, 88, 12)' : 'rgb(75, 85, 99)',
                backgroundColor: isDragging ? 'rgba(234, 88, 12, 0.1)' : 'rgba(0, 0, 0, 0)',
                scale: isDragging ? 1.02 : 1,
              }}
              transition={{ duration: 0.2 }}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center overflow-hidden
                ${isDragging ? 'border-orange-500 bg-orange-500/10' : 'border-gray-600 hover:border-orange-500/50'}
                transition-all duration-300 cursor-pointer group`}
            >
              {/* Animated Background Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/5 via-transparent to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Upload Icon with Animation */}
              <motion.div
                animate={{
                  y: isDragging ? -10 : 0,
                  scale: isDragging ? 1.1 : 1,
                }}
                transition={{ duration: 0.3 }}
                className="relative z-10"
              >
                <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-orange-600/20 to-red-600/20 
                  flex items-center justify-center border border-orange-500/30 group-hover:border-orange-400/50 transition-colors">
                  <Upload className={`h-8 w-8 transition-colors duration-300 ${
                    isDragging ? 'text-orange-400' : 'text-orange-500 group-hover:text-orange-400'
                  }`} />
                </div>

                <Label htmlFor="csv-upload-k2" className="cursor-pointer relative z-10">
                  <div className="space-y-2">
                    <div className="text-base font-semibold text-white group-hover:text-orange-300 transition-colors">
                      {isDragging ? (
                        <span className="text-orange-400 flex items-center justify-center gap-2">
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
                          <span className="text-orange-400 hover:text-orange-300 font-medium underline underline-offset-2">
                            browse files
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 mt-3">
                          <Badge variant="outline" className="border-gray-600 text-gray-400 bg-gray-800/50 text-xs">
                            <FileSpreadsheet className="h-3 w-3 mr-1" />
                            .csv files only
                          </Badge>
                          <Badge variant="outline" className="border-orange-600/50 text-orange-400 bg-orange-600/10 text-xs">
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
                              pl_orbper, pl_trandep, pl_rade, st_teff, st_mass, and 11 more...
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Label>

                <Input
                  id="csv-upload-k2"
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="hidden"
                />
              </motion.div>

              {/* Decorative Corner Elements */}
              <div className="absolute top-2 left-2 w-6 h-6 border-l-2 border-t-2 border-orange-500/30 rounded-tl-lg" />
              <div className="absolute top-2 right-2 w-6 h-6 border-r-2 border-t-2 border-orange-500/30 rounded-tr-lg" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-l-2 border-b-2 border-orange-500/30 rounded-bl-lg" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-r-2 border-b-2 border-orange-500/30 rounded-br-lg" />
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
                    <Badge variant="outline" className="border-orange-400/50 text-orange-300 bg-orange-400/10">
                      <Table className="h-3 w-3 mr-1" />
                      {csvData.length} {csvData.length === 1 ? 'row' : 'rows'} loaded
                    </Badge>
                    <Badge variant="outline" className="border-red-400/50 text-red-300 bg-red-400/10">
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
                  <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-orange-600/50 scrollbar-track-gray-800/50">
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
                            transition-all duration-200 hover:bg-orange-600/10
                            ${isSelected ? 'bg-orange-600/20 border-orange-500/30' : ''}`}
                        >
                          {/* Row Number */}
                          <div className="col-span-1 text-center">
                            <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full 
                              ${isSelected ? 'bg-orange-600 text-white' : 'bg-gray-700/50 text-gray-400'}`}>
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
                                  ? 'bg-orange-600 hover:bg-orange-700 text-white border-orange-400'
                                  : matchPercentage === 100
                                  ? 'bg-gray-700/50 hover:bg-orange-600/20 text-gray-300 hover:text-orange-300 border-gray-600 hover:border-orange-500/50'
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

            {/* Analysis Actions */}
            <div className="space-y-3">
              <Button
                onClick={handleClaudeAnalyzeClick}
                disabled={planet.isAnalyzing || (activeTab === 'csv' && selectedCsvRow === null)}
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
                    <span>{activeTab === 'csv' && selectedCsvRow === null 
                      ? 'Select CSV Row to Analyze'
                      : 'Analyze with Claude AI'}</span>
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
                disabled={planet.isAnalyzing || (activeTab === 'csv' && selectedCsvRow === null)}
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
                    <span>{activeTab === 'csv' && selectedCsvRow === null 
                      ? 'Select CSV Row to Analyze'
                      : 'Analyze with ML Model'}</span>
                  </div>
                )}
              </Button>

              {(planet.claudeResponse || planet.flaskResponse) && (
                <Button
                  onClick={() => setShowResultDialog(true)}
                  variant="outline"
                  className="w-full mt-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 
                    hover:from-purple-600/30 hover:to-pink-600/30 
                    text-purple-300 h-10 font-medium shadow-lg shadow-purple-600/20 
                    transition-all duration-300
                    border border-purple-500/30 hover:border-purple-400/50"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  View Detailed Results
                </Button>
              )}
              
              {/* Info Text */}
              <div className="text-xs text-gray-500 text-center space-y-1 my-3">
                <p><strong>Claude AI:</strong> Advanced reasoning & scientific analysis</p>
                <p><strong>ML Model:</strong> Trained on K2 mission dataset patterns</p>
                <p className="flex "><AlertCircle className="h-3 w-3"/> AI models can make mistakes. Please review results carefully.</p>
              </div>

              {/* View Results Button - Show when there are results */}
              
            </div>

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