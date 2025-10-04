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
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: 'Detailed Profiles',
    description: 'In-depth planet information including physical properties and habitability'
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Real-time Updates',
    description: 'Latest confirmed discoveries integrated from NASA Exoplanet Archive'
  }
];

const stats = [
  { label: 'Total Exoplanets', value: '5,000+', icon: <Database className="h-5 w-5" /> },
  { label: 'Confirmed Planets', value: '4,500+', icon: <Star className="h-5 w-5" /> },
  { label: 'Discovery Methods', value: '10+', icon: <Search className="h-5 w-5" /> },
  { label: 'Host Stars', value: '3,800+', icon: <Globe className="h-5 w-5" /> }
];

export default function DatasetSection() {
  const router = useRouter();

  return (
    <section className="py-24 bg-gradient-to-b from-slate-800 to-slate-900">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-6 bg-slate-800 text-slate-300 border-slate-700">
            <Database className="h-4 w-4 mr-2" />
            Comprehensive Dataset
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Explore the Universe
          </h2>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-8">
            Dive into the most comprehensive exoplanet database available. 
            Visualize, analyze, and discover patterns in thousands of confirmed worlds beyond our solar system.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-slate-900/50 border-slate-700 text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/30">
                    <span className="text-blue-400">{stat.icon}</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-slate-400">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features Grid */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-8">Platform Features</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="bg-slate-900/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-slate-800 rounded-lg border border-slate-600 flex-shrink-0">
                        <span className="text-slate-300">{feature.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">{feature.title}</h4>
                        <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right: CTA Section */}
          <div className="text-center lg:text-left">
            <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-blue-700/50 overflow-hidden">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <Database className="h-8 w-8 text-blue-400" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-white">
                      Interactive Dataset Explorer
                    </CardTitle>
                    <p className="text-blue-200">Full 3D visualization platform</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-slate-300 leading-relaxed">
                  Experience our advanced 3D visualization platform featuring thousands of confirmed exoplanets. 
                  Filter by discovery method, planetary characteristics, and host star properties to uncover patterns 
                  in exoplanet populations across the galaxy.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Filter className="h-4 w-4 text-blue-400" />
                    Advanced filtering and search capabilities
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <Globe className="h-4 w-4 text-purple-400" />
                    Interactive 3D galaxy positioning
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <BarChart3 className="h-4 w-4 text-green-400" />
                    Real-time data analytics and insights
                  </div>
                </div>

                <Button 
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg group shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => router.push('/dataSetVisualize')}
                >
                  Explore Dataset Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}