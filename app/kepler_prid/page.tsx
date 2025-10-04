"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Upload, Telescope, ChevronRight, BarChart3 } from "lucide-react";

import ManualInput from "@/components/prediction/ManualInput";
import CSVUpload from "@/components/prediction/CSVUpload";
import ResultsDisplay from "@/components/prediction/ResultsDisplay";

interface PredictionResult {
  row?: number;
  prediction: string;
  data?: any;
  confidence?: number;
}

export default function ExoplanetPredictor() {
  const [manualResult, setManualResult] = useState<string | null>(null);
  const [csvResults, setCsvResults] = useState<Array<{ row: number; prediction: string; data: any }> | null>(null);
  const [activeTab, setActiveTab] = useState("manual");
  const [showResults, setShowResults] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleManualPrediction = (prediction: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setManualResult(prediction);
      setShowResults(true);
      setIsAnalyzing(false);
    }, 1500);
  };

  const handleCSVPredictions = (predictions: Array<{ row: number; prediction: string; data: any }>) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setCsvResults(predictions);
      setShowResults(true);
      setIsAnalyzing(false);
    }, 2000);
  };

  const resetResults = () => {
    setShowResults(false);
    setManualResult(null);
    setCsvResults(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 overflow-hidden">
      {/* Compact Modern Header */}
      <div className="relative border-b border-gray-800/30 bg-black/40 backdrop-blur-xl top-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        <div className="relative max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500 rounded-lg blur-md opacity-20" />
                <div className="relative p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/30">
                  <Telescope className="h-5 w-5 text-blue-300" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-300 via-white to-purple-300 bg-clip-text text-transparent">
                  ExoquarkAI
                </h1>
                <p className="text-gray-400 text-xs font-medium">
                  AI-Powered Exoplanet Classification
                </p>
              </div>
            </div>
            
            {/* Header Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value); resetResults(); }} className="flex-1 max-w-md">
              <TabsList className="grid grid-cols-2 bg-gray-900/60 border border-gray-700/50 p-1 rounded-lg backdrop-blur-sm w-full">
                <TabsTrigger 
                  value="manual" 
                  className="data-[state=active]:bg-blue-600 data-[state=active]:text-white 
                    data-[state=active]:shadow-lg text-gray-300 transition-all duration-300 
                    hover:text-white hover:bg-gray-700/50 px-4 py-2 rounded-md font-medium text-sm"
                >
                  <Sparkles className="h-3 w-3 mr-2" />
                  Parameters
                </TabsTrigger>
                <TabsTrigger 
                  value="csv" 
                  className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white 
                    data-[state=active]:shadow-lg text-gray-300 transition-all duration-300 
                    hover:text-white hover:bg-gray-700/50 px-4 py-2 rounded-md font-medium text-sm"
                >
                  <Upload className="h-3 w-3 mr-2" />
                  Batch
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Claude AI Ready</span>
              </div>
              {showResults && (
                <button 
                  onClick={resetResults}
                  className="text-xs text-gray-400 hover:text-white transition-colors duration-200 
                    bg-gray-800/60 hover:bg-gray-700/60 px-3 py-1 rounded-md border border-gray-700/50"
                >
                  New Analysis
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Split Layout Main Content */}
      <div className="flex h-[calc(100vh-80px)] max-w-7xl mx-auto">
        {/* Results Panel - Left Side */}
        <div className={`transition-all duration-700 ease-in-out overflow-hidden border-r border-gray-800/30 bg-gradient-to-br from-gray-900/80 to-gray-950/60 backdrop-blur-sm
          ${showResults ? 'w-1/2 opacity-100' : 'w-0 opacity-0'}`}>
          <div className="h-full overflow-y-auto p-6">
            <div className={`transition-all duration-500 delay-300 ${showResults ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              {showResults && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-lg border border-emerald-400/30">
                      <BarChart3 className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Analysis Results</h2>
                      <p className="text-gray-400 text-sm">AI Classification Complete</p>
                    </div>
                  </div>
                  
                  {activeTab === "manual" && manualResult && (
                    <ResultsDisplay 
                      result={{ prediction: manualResult }} 
                      isManual={true} 
                    />
                  )}
                  
                  {activeTab === "csv" && csvResults && (
                    <ResultsDisplay 
                      result={csvResults} 
                      isManual={false} 
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Form Panel - Right Side */}
        <div className={`transition-all duration-700 ease-in-out overflow-y-auto
          ${showResults ? 'w-1/2' : 'w-full'}`}>
          <div className="p-6 h-full">
            {/* Analysis Status Overlay */}
            {isAnalyzing && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/80 border border-gray-700/60 rounded-2xl p-8 text-center max-w-md mx-auto shadow-2xl">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 mx-auto">
                      <div className="absolute inset-0 bg-blue-500/30 rounded-full animate-ping" />
                      <div className="relative w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Telescope className="h-8 w-8 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Claude AI Analyzing...</h3>
                  <p className="text-gray-400 text-sm mb-4">Processing stellar parameters and generating predictions</p>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full animate-pulse w-3/4" />
                  </div>
                </div>
              </div>
            )}

            <div className={`transition-all duration-500 h-full flex flex-col justify-center 
              ${showResults ? 'scale-95' : 'scale-100'}`}>
              
              {/* Welcome Message */}
              {!showResults && (
                <div className="text-center mb-8 animate-in fade-in-50 slide-in-from-bottom-4 duration-700">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur-xl opacity-20" />
                    <div className="relative p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-400/20">
                      <Sparkles className="h-10 w-10 text-blue-300 mx-auto" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                    Discover Exoplanets
                  </h2>
                  <p className="text-gray-400 text-lg max-w-lg mx-auto leading-relaxed">
                    Use advanced AI to classify celestial objects and identify potential exoplanets
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-500">
                    <span>Powered by Claude AI</span>
                    <ChevronRight className="h-4 w-4" />
                    <span>Machine Learning</span>
                  </div>
                </div>
              )}

              {/* Tab Content */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsContent value="manual" className="space-y-6 animate-in fade-in-50 duration-500">
                  <ManualInput onPrediction={handleManualPrediction} />
                </TabsContent>

                <TabsContent value="csv" className="space-y-6 animate-in fade-in-50 duration-500">
                  <CSVUpload onPredictions={handleCSVPredictions} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
