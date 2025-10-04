'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Eye, 
  Brain, 
  Cpu, 
  Telescope, 
  TrendingUp, 
  Zap,
  Star,
  Database,
  Globe,
  BarChart3,
  Search,
  Target
} from 'lucide-react';

const features = [
  {
    icon: <Brain className="h-8 w-8" />,
    title: "AI-Powered Analysis",
    description: "Advanced machine learning models trained on thousands of confirmed exoplanets provide intelligent classification and habitability assessments.",
    color: "from-blue-500 to-cyan-500",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/10",
    badge: "Advanced AI",
    details: [
      "Claude AI integration for scientific analysis",
      "Confidence scoring for planet candidates", 
      "Automated habitability zone calculations"
    ]
  },
  {
    icon: <Database className="h-8 w-8" />,
    title: "Multi-Mission Data Fusion",
    description: "Comprehensive dataset combining observations from Kepler, K2, and TESS missions into a unified exploration platform.",
    color: "from-green-500 to-emerald-500",
    borderColor: "border-green-500/30",
    bgColor: "bg-green-500/10",
    badge: "Data Integration",
    details: [
      "10,000+ exoplanet candidates",
      "Unified data format and standards",
      "Cross-mission comparative analysis"
    ]
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Interactive 3D Visualization",
    description: "Immersive 3D galaxy environment with accurate stellar positions and real-time filtering capabilities for comprehensive exploration.",
    color: "from-purple-500 to-pink-500",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/10",
    badge: "3D Graphics",
    details: [
      "WebGL-powered rendering engine",
      "Real-time planet positioning",
      "Interactive camera controls"
    ]
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Advanced Analytics",
    description: "Statistical analysis tools revealing patterns in exoplanet populations, discovery trends, and stellar system characteristics.",
    color: "from-orange-500 to-red-500",
    borderColor: "border-orange-500/30",
    bgColor: "bg-orange-500/10",
    badge: "Analytics",
    details: [
      "Population distribution analysis",
      "Discovery timeline tracking",
      "Correlation pattern recognition"
    ]
  },
  {
    icon: <Search className="h-8 w-8" />,
    title: "Smart Search & Filtering",
    description: "Powerful search engine with advanced filtering options for planet size, orbital period, host star properties, and discovery method.",
    color: "from-indigo-500 to-purple-500",
    borderColor: "border-indigo-500/30",
    bgColor: "bg-indigo-500/10",
    badge: "Search Engine",
    details: [
      "Multi-parameter filtering system",
      "Fuzzy search capabilities",
      "Saved search configurations"
    ]
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Real-time Performance",
    description: "Optimized rendering pipeline delivering smooth interactions with massive datasets through efficient data structures and caching.",
    color: "from-yellow-500 to-orange-500",
    borderColor: "border-yellow-500/30",
    bgColor: "bg-yellow-500/10",
    badge: "Performance",
    details: [
      "60fps visualization rendering",
      "Efficient memory management",
      "Progressive data loading"
    ]
  }
];

const capabilities = [
  { icon: <Target className="h-5 w-5" />, label: "Planet Detection", value: "99.2%" },
  { icon: <BarChart3 className="h-5 w-5" />, label: "Data Processing", value: "Real-time" },
  { icon: <Eye className="h-5 w-5" />, label: "Visualization", value: "3D Interactive" },
  { icon: <Cpu className="h-5 w-5" />, label: "AI Analysis", value: "Advanced" }
];

export default function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-black">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-slate-800 text-slate-300 border-slate-700">
            <Telescope className="h-4 w-4 mr-2" />
            Platform Capabilities
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Advanced Technology Stack
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Powered by cutting-edge AI and visualization technologies to deliver 
            the most comprehensive exoplanet exploration experience available.
          </p>
        </div>

        {/* Capabilities Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {capabilities.map((capability, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 text-center">
              <CardContent className="pt-4 pb-4">
                <div className="flex justify-center mb-2">
                  <span className="text-slate-400">{capability.icon}</span>
                </div>
                <div className="text-lg font-bold text-white mb-1">{capability.value}</div>
                <div className="text-xs text-slate-400">{capability.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-all duration-300 overflow-hidden"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${feature.bgColor} border ${feature.borderColor}`}>
                    <span className="text-white">{feature.icon}</span>
                  </div>
                  <Badge variant="secondary" className="bg-slate-800 text-slate-300">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </CardTitle>
                <p className="text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </CardHeader>
              
              <CardContent className="pt-0">
                <Separator className="bg-slate-700 mb-4" />
                <div className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center gap-3 text-sm text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-500 flex-shrink-0"></div>
                      {detail}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 text-center">
          <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700 max-w-4xl mx-auto">
            <CardContent className="pt-8 pb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">10,000+</div>
                  <div className="text-slate-400 text-sm">Exoplanets Tracked</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">3</div>
                  <div className="text-slate-400 text-sm">Space Missions</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">60 FPS</div>
                  <div className="text-slate-400 text-sm">Smooth Rendering</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">Real-time</div>
                  <div className="text-slate-400 text-sm">Data Updates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}