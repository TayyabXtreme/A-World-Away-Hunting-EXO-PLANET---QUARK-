"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Rocket, Sparkles, Brain } from "lucide-react";
import { useClaudePrediction } from "@/hooks/useClaudePrediction";

type FormData = {
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
};

const fieldLabels: Record<keyof FormData, string> = {
  koi_score: "KOI Score",
  koi_period: "Orbital Period (days)",
  koi_time0bk: "Transit Epoch (BJD)",
  koi_impact: "Impact Parameter",
  koi_duration: "Transit Duration (hours)",
  koi_depth: "Transit Depth (ppm)",
  koi_prad: "Planet Radius (Earth radii)",
  koi_teq: "Equilibrium Temperature (K)",
  koi_insol: "Insolation (Earth flux)",
  koi_steff: "Stellar Effective Temperature (K)",
  koi_slogg: "Stellar Surface Gravity (log10(cm/s²))",
  koi_srad: "Stellar Radius (Solar radii)",
};

const fieldDescriptions: Record<keyof FormData, string> = {
  koi_score: "Confidence score for the detection",
  koi_period: "Time for one complete orbit around the star",
  koi_time0bk: "Time of the first observed transit",
  koi_impact: "How centrally the planet crosses the star",
  koi_duration: "How long the transit lasts",
  koi_depth: "How much the star dims during transit",
  koi_prad: "Size of the planet compared to Earth",
  koi_teq: "Expected temperature of the planet",
  koi_insol: "Amount of stellar radiation received",
  koi_steff: "Surface temperature of the host star",
  koi_slogg: "Surface gravity of the host star",
  koi_srad: "Size of the host star compared to the Sun",
};

interface ManualInputProps {
  onPrediction: (prediction: string) => void;
}

export default function ManualInput({ onPrediction }: ManualInputProps) {
  const [formData, setFormData] = useState<FormData>({
    koi_score: "0.5",
    koi_period: "365.25",
    koi_time0bk: "131.5100",
    koi_impact: "0.2",
    koi_duration: "6.0",
    koi_depth: "500",
    koi_prad: "1.0",
    koi_teq: "288",
    koi_insol: "1.0",
    koi_steff: "5778",
    koi_slogg: "4.44",
    koi_srad: "1.0",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const { loading, error, predictSingle } = useClaudePrediction();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const value = formData[key as keyof FormData];
      if (!value.trim()) {
        newErrors[key as keyof FormData] = "This field is required";
        isValid = false;
      } else if (isNaN(Number(value))) {
        newErrors[key as keyof FormData] = "Must be a valid number";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await predictSingle(formData);
      
      if (result) {
        const predictionText = `${result.disposition} (${(result.confidence * 100).toFixed(1)}% confidence) - ${result.reasoning}`;
        onPrediction(predictionText);
      } else if (error) {
        onPrediction(`⚠️ Claude AI Error: ${error}`);
      } else {
        onPrediction("⚠️ No prediction received from Claude AI");
      }
    } catch (err) {
      console.error("Error:", err);
      onPrediction("⚠️ Error connecting to Claude AI");
    }
  };

  const handleReset = () => {
    setFormData({
      koi_score: "0.5",
      koi_period: "365.25",
      koi_time0bk: "131.5100",
      koi_impact: "0.2",
      koi_duration: "6.0",
      koi_depth: "500",
      koi_prad: "1.0",
      koi_teq: "288",
      koi_insol: "1.0",
      koi_steff: "5778",
      koi_slogg: "4.44",
      koi_srad: "1.0",
    });
    setErrors({});
  };

  const filledFields = Object.values(formData).filter(value => value.trim() !== "").length;
  const totalFields = Object.keys(formData).length;

  return (
    <div className="w-full animate-in fade-in-50 slide-in-from-right-4 duration-700">
      <Card className="relative bg-gradient-to-br from-gray-900/90 to-gray-800/80 border-gray-700/60 shadow-2xl backdrop-blur-md overflow-hidden group hover:shadow-3xl transition-all duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/8 via-transparent to-purple-500/8" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/30 rounded-lg blur-md opacity-50" />
                <div className="relative p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-400/40">
                  <Sparkles className="h-5 w-5 text-blue-300" />
                </div>
              </div>
              <div>
                <CardTitle className="text-lg text-white font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text">
                  Stellar Parameters
                </CardTitle>
                <CardDescription className="text-gray-400 text-sm font-medium">
                  Input exoplanet characteristics for AI analysis
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs text-gray-400">Completion</div>
                <div className="text-sm font-bold text-blue-400">{filledFields}/{totalFields}</div>
              </div>
              <div className="w-14 h-2.5 bg-gray-800/80 rounded-full overflow-hidden border border-gray-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-purple-500 rounded-full transition-all duration-700 ease-out shadow-lg shadow-blue-500/20" 
                  style={{ width: `${(filledFields / totalFields) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Form Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(formData).map(([key, value], index) => (
                <div 
                  key={key} 
                  className="group space-y-2 animate-in fade-in-50 slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Label 
                    htmlFor={key} 
                    className="text-xs font-semibold text-gray-300 group-hover:text-white transition-colors duration-300"
                  >
                    {fieldLabels[key as keyof FormData]}
                  </Label>
                  <div className="relative">
                    <Input
                      id={key}
                      name={key}
                      type="number"
                      step="any"
                      value={value}
                      onChange={handleChange}
                      placeholder="0.0"
                      className={`h-9 bg-gradient-to-br from-gray-800/70 to-gray-900/60 border-gray-600/50 text-white text-sm placeholder-gray-500 
                        focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300
                        hover:border-gray-500 hover:bg-gray-800/90 hover:shadow-lg hover:shadow-blue-500/10
                        ${errors[key as keyof FormData] ? "border-red-400/60 focus:border-red-400 focus:ring-red-400/20 animate-shake" : ""}
                        ${value.trim() ? "border-blue-400/50 bg-gray-800/90 shadow-lg shadow-blue-500/10" : ""}
                      `}
                    />
                    {value.trim() && !errors[key as keyof FormData] && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-in fade-in-50 zoom-in-75 duration-300">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-full shadow-lg shadow-blue-400/50" />
                      </div>
                    )}
                  </div>
                  {errors[key as keyof FormData] && (
                    <p className="text-xs text-red-400 animate-in fade-in-50 slide-in-from-left-2 duration-200">{errors[key as keyof FormData]}</p>
                  )}
                  <p className="text-xs text-gray-500 leading-tight line-clamp-2 group-hover:text-gray-400 transition-colors duration-300">
                    {fieldDescriptions[key as keyof FormData]}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-700/50">
              <Button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 hover:from-blue-700 hover:via-blue-800 hover:to-purple-800 
                  text-white flex-1 h-12 font-semibold shadow-2xl shadow-blue-600/30 transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]
                  border border-blue-500/30 hover:border-blue-400/50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="animate-pulse">Claude AI Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze with Claude AI
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={loading}
                className="border-gray-600/60 text-gray-300 hover:bg-gradient-to-br hover:from-gray-800/80 hover:to-gray-700/60 
                  hover:border-gray-500 hover:text-white h-12 px-8 transition-all duration-300 
                  hover:scale-[1.02] active:scale-[0.98] font-medium"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}