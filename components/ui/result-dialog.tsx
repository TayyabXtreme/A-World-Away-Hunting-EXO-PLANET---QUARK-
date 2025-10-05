"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, XCircle, AlertCircle, Brain, FlaskConical, Zap, Globe, TrendingUp } from "lucide-react";

interface ClaudeResponse {
  disposition: string;
  confidence: number;
  reasoning: string;
  is_exoplanet?: boolean;  // Optional for K2 data
  planet_type?: string;
  habitability_assessment?: string;  // K2 specific
}

interface FlaskResponse {
  is_exoplanet?: boolean;  // Optional for K2 data
  koi_pdisposition?: string;  // Kepler specific
  archive_disposition?: string;  // K2 specific
  tfopwg_disp?: string;  // TESS specific
  tfopwg_disp_explanation?: string;  // TESS specific
  planet_type?: string;  // K2 and TESS specific
  probability: number;
  status: string;
  timestamp: string;
}

interface ResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  claudeResponse?: ClaudeResponse;
  flaskResponse?: FlaskResponse;
  prediction?: 'confirmed' | 'false-positive' | 'candidate' | null;
  planetName?: string;
}

export function ResultDialog({
  open,
  onOpenChange,
  claudeResponse,
  flaskResponse,
  prediction,
  planetName = "Unknown Planet"
}: ResultDialogProps) {
  
  const getPredictionIcon = () => {
    if (prediction === 'confirmed') return <CheckCircle2 className="h-7 w-7 text-green-400" />;
    if (prediction === 'false-positive') return <XCircle className="h-7 w-7 text-red-400" />;
    if (prediction === 'candidate') return <AlertCircle className="h-7 w-7 text-yellow-400" />;
    return <Globe className="h-7 w-7 text-gray-400" />;
  };

  const getPredictionBgColor = () => {
    if (prediction === 'confirmed') return 'bg-green-500/10 border-green-500/30';
    if (prediction === 'false-positive') return 'bg-red-500/10 border-red-500/30';
    if (prediction === 'candidate') return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-gray-500/10 border-gray-500/30';
  };

  const getPredictionText = () => {
    if (prediction === 'confirmed') return 'Confirmed Exoplanet';
    if (prediction === 'false-positive') return 'False Positive';
    if (prediction === 'candidate') return 'Candidate';
    return 'Unanalyzed';
  };

  const getAgreementStatus = () => {
    if (!claudeResponse || !flaskResponse) return null;

    // For Kepler data
    if (claudeResponse.is_exoplanet !== undefined && flaskResponse.is_exoplanet !== undefined) {
      const agree = claudeResponse.is_exoplanet === flaskResponse.is_exoplanet;
      return {
        agree,
        icon: agree ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-yellow-400" />,
        text: agree ? "Models agree" : "Models disagree",
        color: agree ? "text-green-400" : "text-yellow-400"
      };
    }
    
    // For K2 data - compare dispositions
    if (claudeResponse.disposition && (flaskResponse.archive_disposition || flaskResponse.koi_pdisposition || flaskResponse.tfopwg_disp)) {
      const flaskDisposition = flaskResponse.archive_disposition || flaskResponse.koi_pdisposition || flaskResponse.tfopwg_disp || '';
      const agree = claudeResponse.disposition.toLowerCase() === flaskDisposition.toLowerCase();
      return {
        agree,
        icon: agree ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <AlertCircle className="h-4 w-4 text-yellow-400" />,
        text: agree ? "Models agree" : "Models disagree",
        color: agree ? "text-green-400" : "text-yellow-400"
      };
    }
    
    return null;
  };

  const agreement = getAgreementStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] bg-[#0a0e1a] border border-gray-700 text-white p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-5 pt-4 pb-3 bg-[#0d1117] border-b border-gray-700">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Sparkles className="h-5 w-5 text-blue-400" />
            </motion.div>
            <span className="text-white">Analysis Results</span>
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm mt-0.5">
            Exoplanet classification for <span className="text-blue-400 font-semibold">{planetName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Main Content - Scrollable when both results present */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto dialog-scrollbar max-h-[calc(85vh-80px)]">
          
          {/* Main Prediction Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`${getPredictionBgColor()} rounded-lg p-4 border-2`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  {getPredictionIcon()}
                </motion.div>
                <div>
                  <h3 className="text-lg font-bold text-white">{getPredictionText()}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Classification based on AI analysis
                  </p>
                </div>
              </div>
              {agreement && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`flex items-center gap-2 ${agreement.color} bg-gray-900/50 px-3 py-1.5 rounded-md border border-gray-700`}
                >
                  {agreement.icon}
                  <span className="text-xs font-medium">{agreement.text}</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 gap-4">
            
            {/* Claude AI Column */}
            {claudeResponse && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-[#0d1117] rounded-lg p-4 border border-blue-500/20 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Brain className="h-4 w-4 text-blue-400" />
                  </div>
                  <h3 className="text-base font-bold text-blue-400">Claude AI</h3>
                </div>
                
                {/* Content */}
                <div className="space-y-2.5">
                  {/* Disposition */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Disposition</p>
                    <Badge className={`${
                      claudeResponse.disposition === 'CONFIRMED' 
                        ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                        : claudeResponse.disposition === 'FALSE POSITIVE'
                        ? 'bg-red-500/20 text-red-300 border-red-400/30'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                    } border font-semibold text-xs`}>
                      {claudeResponse.disposition}
                    </Badge>
                  </div>

                  {/* Confidence */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500">Confidence</p>
                      <span className="text-xs font-bold text-blue-400">
                        {(claudeResponse.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${claudeResponse.confidence * 100}%` }}
                        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                        className="h-full bg-blue-500"
                      />
                    </div>
                  </div>

                  {/* Planet Type */}
                  {claudeResponse.planet_type && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Planet Type</p>
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-xs font-medium text-white">{claudeResponse.planet_type}</span>
                      </div>
                    </div>
                  )}

                  {/* Is Exoplanet */}
                  {claudeResponse.is_exoplanet !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Classification</p>
                      <Badge variant="outline" className={`text-xs ${claudeResponse.is_exoplanet 
                        ? "border-green-400/50 text-green-300 bg-green-500/10" 
                        : "border-red-400/50 text-red-300 bg-red-500/10"}`}>
                        {claudeResponse.is_exoplanet ? '✓ Exoplanet' : '✗ Not Exoplanet'}
                      </Badge>
                    </div>
                  )}

                  {/* Habitability Assessment (K2 specific) */}
                  {claudeResponse.habitability_assessment && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Habitability</p>
                      <div className="bg-black/30 rounded-md p-2 border border-blue-900/20">
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {claudeResponse.habitability_assessment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reasoning - Compact */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">AI Reasoning</p>
                    <div className="bg-black/30 rounded-md p-2 border border-blue-900/20 max-h-[80px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                      <p className="text-xs text-gray-300 leading-relaxed">
                        {claudeResponse.reasoning}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Flask ML Column */}
            {flaskResponse && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#0d1117] rounded-lg p-4 border border-green-500/20 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center gap-2 pb-2 border-b border-gray-700">
                  <div className="p-1.5 bg-green-500/10 rounded-lg">
                    <FlaskConical className="h-4 w-4 text-green-400" />
                  </div>
                  <h3 className="text-base font-bold text-green-400">ML Model</h3>
                </div>
                
                {/* Content */}
                <div className="space-y-2.5 ">
                  {/* Disposition */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Disposition</p>
                    <Badge className={`${
                      (flaskResponse.koi_pdisposition || flaskResponse.archive_disposition || flaskResponse.tfopwg_disp) === 'CONFIRMED' || 
                      (flaskResponse.tfopwg_disp === 'CP' || flaskResponse.tfopwg_disp === 'KP')
                        ? 'bg-green-500/20 text-green-300 border-green-400/30' 
                        : (flaskResponse.koi_pdisposition || flaskResponse.archive_disposition) === 'FALSE POSITIVE' ||
                          (flaskResponse.tfopwg_disp === 'FP' || flaskResponse.tfopwg_disp === 'FA')
                        ? 'bg-red-500/20 text-red-300 border-red-400/30'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30'
                    } border font-semibold text-xs`}>
                      {flaskResponse.koi_pdisposition || flaskResponse.archive_disposition || flaskResponse.tfopwg_disp || 'UNKNOWN'}
                    </Badge>
                  </div>

                  {/* TESS Disposition Explanation */}
                  {flaskResponse.tfopwg_disp_explanation && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Explanation</p>
                      <div className="bg-black/30 rounded-md p-2 border border-green-900/20">
                        <p className="text-xs text-gray-300 leading-relaxed">
                          {flaskResponse.tfopwg_disp_explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Planet Type (K2 specific) */}
                  {flaskResponse.planet_type && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Planet Type</p>
                      <div className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5 text-purple-400" />
                        <span className="text-xs font-medium text-white">{flaskResponse.planet_type}</span>
                      </div>
                    </div>
                  )}

                  {/* Probability */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs text-gray-500">Probability</p>
                      <span className="text-xs font-bold text-green-400">
                        {(flaskResponse.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${flaskResponse.probability * 100}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="h-full bg-green-500"
                      />
                    </div>
                  </div>

                  {/* Is Exoplanet */}
                  {flaskResponse.is_exoplanet !== undefined && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Classification</p>
                      <Badge variant="outline" className={`text-xs ${flaskResponse.is_exoplanet 
                        ? "border-green-400/50 text-green-300 bg-green-500/10" 
                        : "border-red-400/50 text-red-300 bg-red-500/10"}`}>
                        {flaskResponse.is_exoplanet ? '✓ Exoplanet' : '✗ Not Exoplanet'}
                      </Badge>
                    </div>
                  )}

                  {/* Status */}
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <Badge variant="outline" className="border-green-400/50 text-green-300 bg-green-500/10 text-xs">
                      <Zap className="h-3 w-3 mr-1" />
                      {flaskResponse.status.toUpperCase()}
                    </Badge>
                  </div>

                  {/* Confidence Score Card */}
                  <div className="bg-black/30 rounded-md p-2.5 border border-green-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3.5 w-3.5 text-green-400" />
                        <span className="text-xs text-gray-400">Prediction Score</span>
                      </div>
                      <span className="text-base font-bold text-green-400">
                        {(flaskResponse.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Analysis Time</p>
                    <p className="text-xs text-gray-400">
                      {new Date(flaskResponse.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer Summary - Only if both models present */}
          {claudeResponse && flaskResponse && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#0d1117] rounded-lg p-3 border border-purple-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">Model Comparison</h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {agreement?.agree 
                        ? "Both models agree - High confidence result"
                        : "Models disagree - Manual review recommended"}
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-0.5">Avg. Confidence</p>
                  <p className="text-base font-bold text-purple-400">
                    {(((claudeResponse.confidence + flaskResponse.probability) / 2) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
