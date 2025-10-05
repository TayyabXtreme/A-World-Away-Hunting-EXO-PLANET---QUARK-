'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  ArrowRight, 
  BarChart3, 
  Filter, 
  Search,
  Globe,
  Eye,
  Layers,
  Zap,
  Star
} from 'lucide-react';

const features = [
  {
    icon: <Search className="h-6 w-6" />,
    title: 'Advanced Search',
    description: 'Filter by size, temperature, host star type, and orbital characteristics'
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: '3D Visualization',
    description: 'Interactive 3D galaxy view with thousands of exoplanets positioned accurately'
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Data Analytics',
    description: 'Comprehensive statistics and trends across multiple discovery missions'
  },
  {
    icon: <Layers className="h-6 w-6" />,
    title: 'Multi-Mission Data',
    description: 'Unified dataset from Kepler, K2, and TESS space telescope missions'
  }
];

const stats = [
  { label: 'Total Exoplanets', value: '1,500+', icon: <Database className="h-5 w-5" /> },
  { label: 'Confirmed Planets', value: '1,200+', icon: <Star className="h-5 w-5" /> },
  { label: 'Discovery Methods', value: '3', icon: <Search className="h-5 w-5" /> }
];

export default function DatasetSection() {
  const router = useRouter();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Dark Space-time Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-black to-slate-900"></div>
        
        {/* Flowing wave patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-blue-900/10 to-transparent transform -skew-y-12 translate-y-20"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-purple-900/10 to-transparent transform skew-y-6 -translate-y-10"></div>
        </div>
        
        {/* Cosmic dust effect */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => {
            // Use deterministic values based on index to avoid hydration issues
            const leftPos = (i * 13) % 100;
            const topPos = (i * 17) % 100;
            const width = 1 + ((i % 3) + 1);
            const height = 1 + ((i % 4) + 1);
            const duration = 5 + ((i % 10) + 1);
            const delay = (i % 5);
            
            return (
              <div
                key={i}
                className="absolute rounded-full bg-white opacity-10"
                style={{
                  left: `${leftPos}%`,
                  top: `${topPos}%`,
                  width: `${width}px`,
                  height: `${height}px`,
                  animation: `float ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
        
        {/* Subtle nebula glow */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4 bg-slate-900/60 text-slate-300 border-slate-700/50 backdrop-blur-sm">
            <Database className="h-4 w-4 mr-2" />
            Dataset Explorer
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Explore the Universe
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-6">
            Dive into our comprehensive exoplanet database. Visualize and analyze confirmed worlds beyond our solar system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-black/40 border-slate-800/50 text-center backdrop-blur-md hover:bg-black/50 transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 backdrop-blur-sm">
                    <span className="text-blue-400">{stat.icon}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Left: Features Grid */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-6">Platform Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="bg-black/30 border-slate-800/40 hover:border-slate-700/60 transition-all duration-300 backdrop-blur-lg">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-slate-900/50 rounded-lg border border-slate-700/50 flex-shrink-0">
                        <span className="text-slate-300">{feature.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1 text-sm">{feature.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: CTA Section */}
          <div className="text-center lg:text-left">
            <Card className="bg-black/30 border-slate-800/50 overflow-hidden backdrop-blur-lg hover:bg-black/40 transition-all duration-500">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-blue-500/15 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                    <Database className="h-7 w-7 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-white">
                      Interactive Explorer
                    </CardTitle>
                    <p className="text-blue-200 text-sm">3D visualization platform</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300 leading-relaxed text-sm">
                  Experience our 3D visualization platform with confirmed exoplanets. 
                  Filter by discovery method and planetary characteristics to uncover patterns across the galaxy.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Filter className="h-4 w-4 text-blue-400" />
                    Advanced filtering capabilities
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <Globe className="h-4 w-4 text-purple-400" />
                    Interactive 3D positioning
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-400">
                    <BarChart3 className="h-4 w-4 text-green-400" />
                    Data analytics and insights
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-4 text-base group shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
                  onClick={() => router.push('/dataSetVisualize')}
                >
                  Explore Dataset
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* CSS for floating animation */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
      `}</style>
    </section>
  );
}