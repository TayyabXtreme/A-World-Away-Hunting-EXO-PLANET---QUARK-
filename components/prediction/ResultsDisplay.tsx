"use client";

import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, AlertTriangle, Download, Eye } from "lucide-react";

interface PredictionResult {
  row?: number;
  prediction: string;
  data?: any;
  confidence?: number;
}

interface ResultsDisplayProps {
  result: PredictionResult | PredictionResult[] | null;
  isManual?: boolean;
}

const getPredictionColor = (prediction: string) => {
  switch (prediction.toUpperCase()) {
    case 'CONFIRMED':
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/60 shadow-emerald-400/20';
    case 'FALSE POSITIVE':
      return 'text-red-400 bg-red-400/10 border-red-400/60 shadow-red-400/20';
    case 'CANDIDATE':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/60 shadow-amber-400/20';
    default:
      return 'text-gray-400 bg-gray-400/10 border-gray-400/60 shadow-gray-400/20';
  }
};

const getPredictionIcon = (prediction: string) => {
  switch (prediction.toUpperCase()) {
    case 'CONFIRMED':
      return <CheckCircle className="h-4 w-4" />;
    case 'FALSE POSITIVE':
      return <XCircle className="h-4 w-4" />;
    case 'CANDIDATE':
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Eye className="h-4 w-4" />;
  }
};

const getPredictionDescription = (prediction: string) => {
  switch (prediction.toUpperCase()) {
    case 'CONFIRMED':
      return 'This object is very likely to be a genuine exoplanet based on the analysis of its characteristics.';
    case 'FALSE POSITIVE':
      return 'This signal is likely caused by instrumental noise, stellar activity, or other non-planetary phenomena.';
    case 'CANDIDATE':
      return 'This object shows promise as a potential exoplanet but requires further verification and analysis.';
    default:
      return 'The prediction model has analyzed the provided parameters.';
  }
};

export default function ResultsDisplay({ result, isManual = false }: ResultsDisplayProps) {
  if (!result) return null;

  const downloadResults = (results: PredictionResult[]) => {
    const headers = ['Row', 'Prediction', 'Confidence', ...Object.keys(results[0]?.data || {})];
    const csvContent = [
      headers.join(','),
      ...results.map(r => [
        r.row || '',
        r.prediction,
        r.confidence || '',
        ...Object.values(r.data || {})
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exoplanet_predictions.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Single result (manual input)
  if (isManual && !Array.isArray(result)) {
    const singleResult = result as PredictionResult;
    return (
      <div className="w-full animate-slide-in-result">
        <Card className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/90 border-gray-700/60 shadow-2xl backdrop-blur-md overflow-hidden group card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10" />
          
          <CardHeader className="relative pb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 rounded-lg blur-lg animate-pulse-glow" />
                <div className="relative p-3 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/40">
                  <div className="text-blue-300">
                    {getPredictionIcon(singleResult.prediction)}
                  </div>
                </div>
              </div>
              <div>
                <CardTitle className="text-xl text-white font-bold gradient-text">
                  Classification Result
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm font-medium">
                  AI analysis complete
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative">
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="absolute inset-0 blur-xl opacity-30">
                    <Badge 
                      variant="outline" 
                      className={`text-2xl py-4 px-8 font-bold ${getPredictionColor(singleResult.prediction)} shadow-xl`}
                    >
                      {singleResult.prediction}
                    </Badge>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`relative text-2xl py-4 px-8 font-bold ${getPredictionColor(singleResult.prediction)} shadow-xl animate-glow`}
                  >
                    {singleResult.prediction}
                  </Badge>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/80 rounded-xl p-5 border border-gray-700/60 backdrop-blur-sm">
                <p className="text-gray-300 text-sm leading-relaxed text-center">
                  {getPredictionDescription(singleResult.prediction)}
                </p>
              </div>
              
              {singleResult.confidence && (
                <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/80 rounded-xl p-5 border border-gray-700/60 backdrop-blur-sm">
                  <p className="text-xs text-gray-400 mb-3 font-medium text-center">Model Confidence</p>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-white gradient-text">
                      {(singleResult.confidence * 100).toFixed(1)}%
                    </div>
                    <div className="flex-1 bg-gray-700/60 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-purple-500 rounded-full transition-all duration-1000 shadow-lg"
                        style={{ width: `${singleResult.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Multiple results (CSV upload)
  if (Array.isArray(result)) {
    const results = result as PredictionResult[];
    const confirmedCount = results.filter(r => r.prediction.toUpperCase() === 'CONFIRMED').length;
    const candidateCount = results.filter(r => r.prediction.toUpperCase() === 'CANDIDATE').length;
    const falsePositiveCount = results.filter(r => r.prediction.toUpperCase() === 'FALSE POSITIVE').length;

    return (
      <div className="w-full animate-slide-in-result">
        <Card className="relative bg-gradient-to-br from-gray-900/95 to-gray-800/90 border-gray-700/60 shadow-2xl backdrop-blur-md overflow-hidden group card-hover">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10" />
          
          <CardHeader className="relative pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/30 rounded-lg blur-lg animate-pulse-glow" />
                  <div className="relative p-3 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-lg border border-emerald-400/40">
                    <CheckCircle className="h-5 w-5 text-emerald-300" />
                  </div>
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-bold gradient-text">
                    Batch Results
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm font-medium">
                    {results.length} objects analyzed
                  </CardDescription>
                </div>
              </div>
              <Button
                onClick={() => downloadResults(results)}
                variant="outline"
                size="sm"
                className="border-gray-600/60 text-gray-300 hover:bg-gray-800/80 hover:border-emerald-400/40 hover:text-emerald-300 h-9 text-xs transition-all duration-200 group/btn animate-glow"
              >
                <Download className="h-3 w-3 mr-2 group-hover/btn:animate-bounce" />
                Export
              </Button>
            </div>
          </CardHeader>

          <CardContent className="relative space-y-5">
            {/* Enhanced Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="relative group/stat">
                <div className="absolute inset-0 bg-emerald-400/10 rounded-lg blur-lg opacity-50 group-hover/stat:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-emerald-400/15 to-emerald-500/10 border border-emerald-400/30 rounded-lg p-3 text-center backdrop-blur-sm hover:scale-105 transition-transform duration-200">
                  <div className="text-xl font-bold text-emerald-400 mb-1">{confirmedCount}</div>
                  <div className="text-xs text-gray-400 font-medium">Confirmed</div>
                  <div className="text-xs text-emerald-300/60 mt-1">
                    {((confirmedCount / results.length) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="relative group/stat">
                <div className="absolute inset-0 bg-amber-400/10 rounded-lg blur-lg opacity-50 group-hover/stat:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-amber-400/15 to-amber-500/10 border border-amber-400/30 rounded-lg p-3 text-center backdrop-blur-sm hover:scale-105 transition-transform duration-200">
                  <div className="text-xl font-bold text-amber-400 mb-1">{candidateCount}</div>
                  <div className="text-xs text-gray-400 font-medium">Candidates</div>
                  <div className="text-xs text-amber-300/60 mt-1">
                    {((candidateCount / results.length) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="relative group/stat">
                <div className="absolute inset-0 bg-red-400/10 rounded-lg blur-lg opacity-50 group-hover/stat:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-gradient-to-br from-red-400/15 to-red-500/10 border border-red-400/30 rounded-lg p-3 text-center backdrop-blur-sm hover:scale-105 transition-transform duration-200">
                  <div className="text-xl font-bold text-red-400 mb-1">{falsePositiveCount}</div>
                  <div className="text-xs text-gray-400 font-medium">False Positive</div>
                  <div className="text-xs text-red-300/60 mt-1">
                    {((falsePositiveCount / results.length) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Results Table */}
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/70 rounded-lg overflow-hidden border border-gray-700/60 backdrop-blur-sm">
              <div className="max-h-80 overflow-y-auto scrollbar-thin">
                <table className="w-full text-xs">
                  <thead className="bg-gradient-to-r from-gray-800/95 to-gray-900/90 sticky top-0 backdrop-blur-sm">
                    <tr>
                      <th className="text-left py-3 px-3 text-gray-300 font-semibold border-b border-gray-700/50">Row</th>
                      <th className="text-left py-3 px-3 text-gray-300 font-semibold border-b border-gray-700/50">Classification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.slice(0, 50).map((result, index) => (
                      <tr key={index} className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors duration-150 group/row">
                        <td className="py-3 px-3 text-gray-400 font-medium">{result.row || index + 1}</td>
                        <td className="py-3 px-3">
                          <Badge 
                            variant="outline" 
                            className={`${getPredictionColor(result.prediction)} text-xs px-2 py-1 font-medium group-hover/row:scale-105 transition-transform duration-150`}
                          >
                            {result.prediction}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {results.length > 50 && (
                  <div className="p-3 text-center text-xs text-gray-500 bg-gray-800/40 border-t border-gray-700/30">
                    <span className="bg-gray-700/50 px-3 py-1 rounded-full">
                      Showing first 50 of {results.length} results
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}